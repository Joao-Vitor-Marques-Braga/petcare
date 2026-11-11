import { AsyncLocalStorage } from 'node:async_hooks';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export interface TenantStore {
  companyId: string;
  companyName: string;
  userId?: string;
  email?: string;
  role?: 'SUPER_ADMIN' | 'PETSHOP_ADMIN';
}

export interface AuthTokenPayload {
  userId: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'PETSHOP_ADMIN';
  companyId: string;
  companyName: string;
  exp: number;
}

const tenantStorage = new AsyncLocalStorage<TenantStore>();
const AUTH_SECRET = process.env.JWT_SECRET || 'petcare-saas-super-secret-key-2026';

export function getTenantStore(): TenantStore {
  return (
    tenantStorage.getStore() || {
      companyId: 'default',
      companyName: 'PetCare Agendamentos',
    }
  );
}

export function getCurrentCompanyId(): string {
  return getTenantStore().companyId || 'default';
}

export function getCurrentCompanyName(): string {
  return getTenantStore().companyName || 'PetCare Agendamentos';
}

export function runWithTenant<T>(store: TenantStore, fn: () => T): T {
  return tenantStorage.run(store, fn);
}

// ==========================================
// Senhas seguras usando Node crypto nativo
// ==========================================
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

// ==========================================
// Token JWT Stateless (HMAC-SHA256 nativo)
// ==========================================
export function signAuthToken(
  payload: Omit<AuthTokenPayload, 'exp'>,
  expiresInHours = 168 // 7 dias
): string {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Date.now() + expiresInHours * 3600 * 1000,
  };
  const dataB64 = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', AUTH_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return null;
    const expectedSig = createHmac('sha256', AUTH_SECRET).update(dataB64).digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(
      Buffer.from(dataB64, 'base64url').toString('utf8')
    ) as AuthTokenPayload;

    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ==========================================
// Middleware Multi-Tenant para Express
// ==========================================
export function tenantMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let store: TenantStore = {
    companyId: 'default',
    companyName: 'PetCare Agendamentos',
  };

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const verified = verifyAuthToken(token);
    if (verified) {
      store = {
        companyId: verified.companyId || 'default',
        companyName: verified.companyName || 'PetCare Agendamentos',
        userId: verified.userId,
        email: verified.email,
        role: verified.role,
      };

      // Permite que o Super Admin alterne entre lojas pelo cabeçalho x-company-id
      const overrideCompanyId = req.headers['x-company-id'];
      const overrideCompanyName = req.headers['x-company-name'];
      if (verified.role === 'SUPER_ADMIN' && typeof overrideCompanyId === 'string' && overrideCompanyId.trim()) {
        store.companyId = overrideCompanyId.trim();
        if (typeof overrideCompanyName === 'string' && overrideCompanyName.trim()) {
          store.companyName = decodeURIComponent(overrideCompanyName.trim());
        }
      }
    }
  } else {
    // Fallback para cabeçalho direto em modo demonstração local
    const headerCompanyId = req.headers['x-company-id'];
    const headerCompanyName = req.headers['x-company-name'];
    if (typeof headerCompanyId === 'string' && headerCompanyId.trim()) {
      store.companyId = headerCompanyId.trim();
    }
    if (typeof headerCompanyName === 'string' && headerCompanyName.trim()) {
      store.companyName = decodeURIComponent(headerCompanyName.trim());
    }
  }

  tenantStorage.run(store, () => {
    next();
  });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantStore = getTenantStore;
exports.getCurrentCompanyId = getCurrentCompanyId;
exports.getCurrentCompanyName = getCurrentCompanyName;
exports.runWithTenant = runWithTenant;
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.signAuthToken = signAuthToken;
exports.verifyAuthToken = verifyAuthToken;
exports.tenantMiddleware = tenantMiddleware;
const node_async_hooks_1 = require("node:async_hooks");
const node_crypto_1 = require("node:crypto");
const tenantStorage = new node_async_hooks_1.AsyncLocalStorage();
const AUTH_SECRET = process.env.JWT_SECRET || 'petcare-saas-super-secret-key-2026';
function getTenantStore() {
    return (tenantStorage.getStore() || {
        companyId: 'default',
        companyName: 'PetCare Agendamentos',
    });
}
function getCurrentCompanyId() {
    return getTenantStore().companyId || 'default';
}
function getCurrentCompanyName() {
    return getTenantStore().companyName || 'PetCare Agendamentos';
}
function runWithTenant(store, fn) {
    return tenantStorage.run(store, fn);
}
// ==========================================
// Senhas seguras usando Node crypto nativo
// ==========================================
function hashPassword(password) {
    const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
    const derived = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
}
function verifyPassword(password, storedHash) {
    try {
        const [salt, key] = storedHash.split(':');
        if (!salt || !key)
            return false;
        const keyBuffer = Buffer.from(key, 'hex');
        const derivedBuffer = (0, node_crypto_1.scryptSync)(password, salt, 64);
        return (0, node_crypto_1.timingSafeEqual)(keyBuffer, derivedBuffer);
    }
    catch {
        return false;
    }
}
// ==========================================
// Token JWT Stateless (HMAC-SHA256 nativo)
// ==========================================
function signAuthToken(payload, expiresInHours = 168 // 7 dias
) {
    const fullPayload = {
        ...payload,
        exp: Date.now() + expiresInHours * 3600 * 1000,
    };
    const dataB64 = Buffer.from(JSON.stringify(fullPayload), 'utf8').toString('base64url');
    const signature = (0, node_crypto_1.createHmac)('sha256', AUTH_SECRET).update(dataB64).digest('base64url');
    return `${dataB64}.${signature}`;
}
function verifyAuthToken(token) {
    try {
        const [dataB64, signature] = token.split('.');
        if (!dataB64 || !signature)
            return null;
        const expectedSig = (0, node_crypto_1.createHmac)('sha256', AUTH_SECRET).update(dataB64).digest('base64url');
        if (signature !== expectedSig)
            return null;
        const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
        if (!payload.exp || Date.now() > payload.exp) {
            return null;
        }
        return payload;
    }
    catch {
        return null;
    }
}
// ==========================================
// Middleware Multi-Tenant para Express
// ==========================================
function tenantMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    let store = {
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
    }
    else {
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

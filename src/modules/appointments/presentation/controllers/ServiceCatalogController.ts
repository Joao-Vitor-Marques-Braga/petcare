import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { ValidationError, NotFoundError } from '../../../../shared/errors/AppError.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

const createServiceSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2, 'O nome do serviço deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'O valor não pode ser negativo'),
  durationMinutes: z.number().int().min(5, 'A duração mínima é de 5 minutos').optional().default(60),
  category: z.string().optional().default('Estética'),
  active: z.boolean().optional().default(true),
});

const updateServiceSchema = z.object({
  name: z.string().min(2, 'O nome do serviço deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0, 'O valor não pode ser negativo').optional(),
  durationMinutes: z.number().int().min(5).optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
});

function slugifyCode(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base || `SERVICO_${Date.now()}`;
}

export class ServiceCatalogController {
  constructor(private prisma: PrismaClient) {}

  listServices = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = getCurrentCompanyId();
      const services = await this.prisma.serviceCatalog.findMany({
        where: { companyId },
        orderBy: [{ active: 'desc' }, { name: 'asc' }],
      });
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  };

  createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = getCurrentCompanyId();
      const parsed = createServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        throw new ValidationError('Dados inválidos para criação de serviço', errors);
      }

      const data = parsed.data;
      let code = data.code?.trim() ? slugifyCode(data.code) : slugifyCode(data.name);

      const existing = await this.prisma.serviceCatalog.findFirst({
        where: { companyId, code },
      });
      if (existing) {
        code = `${code}_${Math.floor(100 + Math.random() * 900)}`;
      }

      const created = await this.prisma.serviceCatalog.create({
        data: {
          companyId,
          code,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          price: data.price,
          durationMinutes: data.durationMinutes ?? 60,
          category: data.category?.trim() || 'Estética',
          active: data.active ?? true,
        },
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      next(error);
    }
  };

  updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const parsed = updateServiceSchema.safeParse(req.body);
      if (!parsed.success) {
        const errors = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        throw new ValidationError('Dados inválidos para atualização de serviço', errors);
      }

      const existing = await this.prisma.serviceCatalog.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Serviço', id);
      }

      const updated = await this.prisma.serviceCatalog.update({
        where: { id },
        data: {
          name: parsed.data.name !== undefined ? parsed.data.name.trim() : undefined,
          description:
            parsed.data.description !== undefined
              ? parsed.data.description?.trim() || null
              : undefined,
          price: parsed.data.price,
          durationMinutes: parsed.data.durationMinutes,
          category: parsed.data.category?.trim(),
          active: parsed.data.active,
        },
      });

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const existing = await this.prisma.serviceCatalog.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Serviço', id);
      }

      await this.prisma.serviceCatalog.delete({ where: { id } });
      res.status(200).json({
        success: true,
        message: 'Serviço removido com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  };
}

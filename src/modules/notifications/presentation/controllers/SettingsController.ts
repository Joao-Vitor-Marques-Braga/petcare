import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { GetWhatsAppConfigUseCase } from '../../application/use-cases/GetWhatsAppConfigUseCase.js';
import { UpdateWhatsAppConfigUseCase } from '../../application/use-cases/UpdateWhatsAppConfigUseCase.js';
import { CheckWhatsAppStatusUseCase } from '../../application/use-cases/CheckWhatsAppStatusUseCase.js';
import { SendTestWhatsAppMessageUseCase } from '../../application/use-cases/SendTestWhatsAppMessageUseCase.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';
import { z } from 'zod';

const updateWhatsAppConfigSchema = z.object({
  apiUrl: z.string().url('URL inválida. Ex: http://localhost:8080'),
  apiKey: z.string().default(''),
  instanceName: z.string().min(1, 'Nome da instância é obrigatório'),
  senderPhone: z.string().optional().nullable(),
  isMockMode: z.boolean().default(true),
});

const sendTestMessageSchema = z.object({
  phone: z.string().min(10, 'Número de WhatsApp inválido'),
  message: z.string().optional(),
});

export class SettingsController {
  constructor(
    private getConfigUseCase: GetWhatsAppConfigUseCase,
    private updateConfigUseCase: UpdateWhatsAppConfigUseCase,
    private getStatusUseCase: CheckWhatsAppStatusUseCase,
    private sendTestMessageUseCase: SendTestWhatsAppMessageUseCase,
    private prisma?: PrismaClient
  ) {}

  getConfig = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.getConfigUseCase.execute();
      return res.status(200).json(config);
    } catch (err) {
      next(err);
    }
  };

  updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = updateWhatsAppConfigSchema.parse(req.body);
      const updated = await this.updateConfigUseCase.execute(validated);
      return res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  getStatus = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await this.getStatusUseCase.execute();
      return res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  };

  sendTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = sendTestMessageSchema.parse(req.body);
      const result = await this.sendTestMessageUseCase.execute(validated);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getQrCode = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const config = await this.getConfigUseCase.execute();
      const base =
        process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080')
          ? process.env.EVOLUTION_API_URL
          : config.apiUrl || 'http://evolution-api:8080';

      const globalKey =
        process.env.EVOLUTION_GLOBAL_KEY ||
        config.apiKey ||
        '429644463e69881710e69a3ac169490340';
      const instanceName = config.instanceName || `petshop_${getCurrentCompanyId().slice(0, 6)}`;
      const instanceEncoded = encodeURIComponent(instanceName);

      // 1. Tenta conectar / buscar QR Code da instância existente
      let connectRes = await fetch(`${base.replace(/\/$/, '')}/instance/connect/${instanceEncoded}`, {
        headers: { apikey: globalKey },
      });

      // 2. Se a instância ainda não existir na Evolution API (404), cria automaticamente com QR Code!
      if (!connectRes.ok) {
        const createRes = await fetch(`${base.replace(/\/$/, '')}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: globalKey,
          },
          body: JSON.stringify({
            instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          }),
        });

        const createJson = (await createRes.json().catch(() => ({}))) as any;
        const createdHash = createJson?.hash?.apikey || createJson?.hash || globalKey;

        if (this.prisma && typeof createdHash === 'string' && createdHash) {
          await this.prisma.whatsAppConfig.update({
            where: { id: config.id },
            data: { apiKey: createdHash, isMockMode: false },
          });
        }

        if (createJson?.qrcode?.base64) {
          return res.status(200).json({
            instanceName,
            base64: createJson.qrcode.base64,
            pairingCode: createJson.qrcode.pairingCode || null,
          });
        }

        connectRes = await fetch(`${base.replace(/\/$/, '')}/instance/connect/${instanceEncoded}`, {
          headers: { apikey: globalKey },
        });
      }

      const connectJson = (await connectRes.json().catch(() => ({}))) as any;
      return res.status(200).json({
        instanceName,
        base64: connectJson?.base64 || connectJson?.qrcode?.base64 || null,
        pairingCode: connectJson?.pairingCode || null,
        state: connectJson?.instance?.state || null,
      });
    } catch (err) {
      next(err);
    }
  };
}

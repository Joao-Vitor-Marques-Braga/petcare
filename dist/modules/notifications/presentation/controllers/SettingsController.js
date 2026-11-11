"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
const zod_1 = require("zod");
const updateWhatsAppConfigSchema = zod_1.z.object({
    apiUrl: zod_1.z.string().url('URL inválida. Ex: http://localhost:8080'),
    apiKey: zod_1.z.string().default(''),
    instanceName: zod_1.z.string().min(1, 'Nome da instância é obrigatório'),
    senderPhone: zod_1.z.string().optional().nullable(),
    isMockMode: zod_1.z.boolean().default(true),
});
const sendTestMessageSchema = zod_1.z.object({
    phone: zod_1.z.string().min(10, 'Número de WhatsApp inválido'),
    message: zod_1.z.string().optional(),
});
class SettingsController {
    getConfigUseCase;
    updateConfigUseCase;
    getStatusUseCase;
    sendTestMessageUseCase;
    prisma;
    constructor(getConfigUseCase, updateConfigUseCase, getStatusUseCase, sendTestMessageUseCase, prisma) {
        this.getConfigUseCase = getConfigUseCase;
        this.updateConfigUseCase = updateConfigUseCase;
        this.getStatusUseCase = getStatusUseCase;
        this.sendTestMessageUseCase = sendTestMessageUseCase;
        this.prisma = prisma;
    }
    getConfig = async (_req, res, next) => {
        try {
            const config = await this.getConfigUseCase.execute();
            return res.status(200).json(config);
        }
        catch (err) {
            next(err);
        }
    };
    updateConfig = async (req, res, next) => {
        try {
            const validated = updateWhatsAppConfigSchema.parse(req.body);
            const updated = await this.updateConfigUseCase.execute(validated);
            return res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    };
    getStatus = async (_req, res, next) => {
        try {
            const status = await this.getStatusUseCase.execute();
            return res.status(200).json(status);
        }
        catch (err) {
            next(err);
        }
    };
    sendTest = async (req, res, next) => {
        try {
            const validated = sendTestMessageSchema.parse(req.body);
            const result = await this.sendTestMessageUseCase.execute(validated);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getQrCode = async (_req, res, next) => {
        try {
            const config = await this.getConfigUseCase.execute();
            const base = process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080')
                ? process.env.EVOLUTION_API_URL
                : config.apiUrl || 'http://evolution-api:8080';
            const globalKey = process.env.EVOLUTION_GLOBAL_KEY ||
                config.apiKey ||
                '429644463e69881710e69a3ac169490340';
            const instanceName = config.instanceName || `petshop_${(0, TenantContext_js_1.getCurrentCompanyId)().slice(0, 6)}`;
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
                const createJson = (await createRes.json().catch(() => ({})));
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
            const connectJson = (await connectRes.json().catch(() => ({})));
            return res.status(200).json({
                instanceName,
                base64: connectJson?.base64 || connectJson?.qrcode?.base64 || null,
                pairingCode: connectJson?.pairingCode || null,
                state: connectJson?.instance?.state || null,
            });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.SettingsController = SettingsController;

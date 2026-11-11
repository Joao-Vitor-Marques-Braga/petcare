"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckWhatsAppStatusUseCase = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class CheckWhatsAppStatusUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute() {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const config = await this.prisma.whatsAppConfig.findUnique({
            where: { id: companyId },
        });
        if (!config || config.isMockMode) {
            return {
                connected: true,
                state: 'open',
                mode: 'MOCK',
                senderPhone: config?.senderPhone || '5511999998888',
                instanceName: config?.instanceName || 'petshop_bot',
                apiUrl: config?.apiUrl || 'http://localhost:8080',
                message: 'Modo Simulação Seguro Ativo (Mock Gateway)',
            };
        }
        // Consulta status real na Evolution API
        try {
            const base = (process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080'))
                ? process.env.EVOLUTION_API_URL
                : config.apiUrl;
            const instance = encodeURIComponent(config.instanceName);
            const endpoint = `${base.replace(/\/$/, '')}/instance/connectionState/${instance}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            const response = await fetch(endpoint, {
                headers: {
                    apikey: config.apiKey,
                },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                return {
                    connected: false,
                    state: 'error',
                    mode: 'EVOLUTION_API',
                    instanceName: config.instanceName,
                    senderPhone: config.senderPhone,
                    apiUrl: config.apiUrl,
                    message: `Evolution API respondeu com status ${response.status}`,
                };
            }
            const json = await response.json();
            const state = json?.instance?.state || 'unknown';
            if (state === 'open') {
                try {
                    await fetch(`${base.replace(/\/$/, '')}/webhook/set/${instance}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            apikey: config.apiKey,
                        },
                        body: JSON.stringify({
                            webhook: {
                                enabled: true,
                                url: 'http://backend:3333/api/webhooks/whatsapp',
                                byEvents: false,
                                base64: false,
                                events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE'],
                            },
                        }),
                    });
                }
                catch {
                    // Ignora falha silenciosamente
                }
            }
            return {
                connected: state === 'open',
                state,
                mode: 'EVOLUTION_API',
                instanceName: config.instanceName,
                senderPhone: config.senderPhone,
                apiUrl: config.apiUrl,
                message: state === 'open'
                    ? 'Instância conectada ao WhatsApp e pronta para envios!'
                    : `Instância em estado: ${state}. Faça o pareamento via QR Code na Evolution API.`,
            };
        }
        catch (err) {
            return {
                connected: false,
                state: 'unreachable',
                mode: 'EVOLUTION_API',
                instanceName: config.instanceName,
                senderPhone: config.senderPhone,
                apiUrl: config.apiUrl,
                message: `Não foi possível conectar à Evolution API em ${config.apiUrl}. Verifique se o serviço está ativo.`,
            };
        }
    }
}
exports.CheckWhatsAppStatusUseCase = CheckWhatsAppStatusUseCase;

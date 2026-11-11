"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateWhatsAppConfigUseCase = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class UpdateWhatsAppConfigUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(input) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const updated = await this.prisma.whatsAppConfig.upsert({
            where: { id: companyId },
            create: {
                id: companyId,
                apiUrl: input.apiUrl.trim(),
                apiKey: input.apiKey.trim(),
                instanceName: input.instanceName.trim(),
                senderPhone: input.senderPhone?.trim() || null,
                isMockMode: input.isMockMode,
            },
            update: {
                apiUrl: input.apiUrl.trim(),
                apiKey: input.apiKey.trim(),
                instanceName: input.instanceName.trim(),
                senderPhone: input.senderPhone?.trim() || null,
                isMockMode: input.isMockMode,
            },
        });
        // Se não estiver em modo mock, registra automaticamente o webhook na Evolution API
        // para receber respostas de texto (MESSAGES_UPSERT) e cliques em enquetes Sim/Não (MESSAGES_UPDATE)
        if (!updated.isMockMode && updated.apiKey && updated.instanceName) {
            try {
                const base = process.env.EVOLUTION_API_URL && updated.apiUrl.includes('localhost:8080')
                    ? process.env.EVOLUTION_API_URL
                    : updated.apiUrl;
                const instance = encodeURIComponent(updated.instanceName);
                const webhookEndpoint = `${base.replace(/\/$/, '')}/webhook/set/${instance}`;
                await fetch(webhookEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: updated.apiKey,
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
            catch (err) {
                console.warn('[UpdateWhatsAppConfigUseCase] Não foi possível configurar webhook automático:', err);
            }
        }
        return updated;
    }
}
exports.UpdateWhatsAppConfigUseCase = UpdateWhatsAppConfigUseCase;

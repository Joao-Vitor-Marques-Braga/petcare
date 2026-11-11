"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendTestWhatsAppMessageUseCase = void 0;
const EvolutionApiWhatsAppGateway_js_1 = require("../../infrastructure/gateways/EvolutionApiWhatsAppGateway.js");
const MockWhatsAppGateway_js_1 = require("../../infrastructure/gateways/MockWhatsAppGateway.js");
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class SendTestWhatsAppMessageUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute(input) {
        const cleanedPhone = input.phone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
            throw new AppError_js_1.ValidationError('Informe um número de telefone válido com DDD.');
        }
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const companyName = (0, TenantContext_js_1.getCurrentCompanyName)();
        const config = await this.prisma.whatsAppConfig.findUnique({
            where: { id: companyId },
        });
        const isMock = !config || config.isMockMode || !config.apiKey;
        const gateway = isMock
            ? new MockWhatsAppGateway_js_1.MockWhatsAppGateway()
            : new EvolutionApiWhatsAppGateway_js_1.EvolutionApiWhatsAppGateway({
                apiUrl: config.apiUrl,
                apiKey: config.apiKey,
                instanceName: config.instanceName,
            });
        const testMessage = input.message ||
            `🐾 *${companyName} - Teste de Confirmação* 🐾\n\n` +
                `Olá! Passando para testar o disparo da instância *${config?.instanceName || 'petshop_bot'}*.\n\n` +
                `*Você confirma a presença?*\n` +
                `Responda esta mensagem com:\n` +
                `✅ *SIM* — Para confirmar presença\n` +
                `❌ *NÃO* — Caso precise reagendar`;
        const result = await gateway.sendMessage({
            phone: cleanedPhone,
            message: testMessage,
        });
        return {
            success: result.success,
            mode: isMock ? 'MOCK' : 'EVOLUTION_API',
            messageId: result.messageId,
            error: result.error,
            phone: cleanedPhone,
            instanceName: config?.instanceName,
        };
    }
}
exports.SendTestWhatsAppMessageUseCase = SendTestWhatsAppMessageUseCase;

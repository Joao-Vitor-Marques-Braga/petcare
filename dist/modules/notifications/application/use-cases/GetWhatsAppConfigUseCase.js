"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWhatsAppConfigUseCase = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class GetWhatsAppConfigUseCase {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async execute() {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        let config = await this.prisma.whatsAppConfig.findUnique({
            where: { id: companyId },
        });
        if (!config) {
            const comp = await this.prisma.company.findUnique({ where: { id: companyId } }).catch(() => null);
            config = await this.prisma.whatsAppConfig.create({
                data: {
                    id: companyId,
                    apiUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
                    apiKey: process.env.EVOLUTION_API_KEY || '',
                    instanceName: comp?.slug || process.env.EVOLUTION_INSTANCE_NAME || 'petshop_bot',
                    senderPhone: comp?.phone || process.env.SENDER_WHATSAPP_PHONE || '5511999998888',
                    isMockMode: process.env.MOCK_WHATSAPP_GATEWAY === 'true',
                },
            });
        }
        return config;
    }
}
exports.GetWhatsAppConfigUseCase = GetWhatsAppConfigUseCase;

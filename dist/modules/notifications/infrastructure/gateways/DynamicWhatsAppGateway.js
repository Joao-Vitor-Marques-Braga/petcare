"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicWhatsAppGateway = void 0;
const MockWhatsAppGateway_js_1 = require("./MockWhatsAppGateway.js");
const EvolutionApiWhatsAppGateway_js_1 = require("./EvolutionApiWhatsAppGateway.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class DynamicWhatsAppGateway {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendMessage(data) {
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        const config = await this.prisma.whatsAppConfig.findUnique({
            where: { id: companyId },
        });
        const isMock = !config || config.isMockMode || !config.apiKey;
        const delegate = isMock
            ? new MockWhatsAppGateway_js_1.MockWhatsAppGateway()
            : new EvolutionApiWhatsAppGateway_js_1.EvolutionApiWhatsAppGateway({
                apiUrl: config.apiUrl,
                apiKey: config.apiKey,
                instanceName: config.instanceName,
            });
        return await delegate.sendMessage(data);
    }
}
exports.DynamicWhatsAppGateway = DynamicWhatsAppGateway;

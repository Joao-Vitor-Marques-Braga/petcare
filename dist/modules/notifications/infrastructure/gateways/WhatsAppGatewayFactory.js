"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppGatewayFactory = void 0;
const MockWhatsAppGateway_js_1 = require("./MockWhatsAppGateway.js");
const EvolutionApiWhatsAppGateway_js_1 = require("./EvolutionApiWhatsAppGateway.js");
class WhatsAppGatewayFactory {
    static create() {
        const isMock = process.env.MOCK_WHATSAPP_GATEWAY === 'true' ||
            !process.env.EVOLUTION_API_KEY ||
            process.env.EVOLUTION_API_KEY === 'seu_token_aqui';
        if (isMock) {
            return new MockWhatsAppGateway_js_1.MockWhatsAppGateway();
        }
        return new EvolutionApiWhatsAppGateway_js_1.EvolutionApiWhatsAppGateway();
    }
}
exports.WhatsAppGatewayFactory = WhatsAppGatewayFactory;

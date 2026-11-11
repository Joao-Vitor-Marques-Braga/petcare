"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWhatsAppGateway = void 0;
class MockWhatsAppGateway {
    async sendMessage(data) {
        console.log('\n======================================================');
        console.log('🤖 [MOCK WHATSAPP GATEWAY] Mensagem disparada com sucesso!');
        console.log(`📱 Destinatário: ${data.phone}`);
        console.log('💬 Mensagem:\n' + data.message);
        console.log('======================================================\n');
        // Simula delay de rede realista
        await new Promise((resolve) => setTimeout(resolve, 300));
        return {
            success: true,
            messageId: `mock-msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            rawResponse: { status: 'SENT', simulated: true },
        };
    }
}
exports.MockWhatsAppGateway = MockWhatsAppGateway;

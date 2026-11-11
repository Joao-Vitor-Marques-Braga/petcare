"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionApiWhatsAppGateway = void 0;
class EvolutionApiWhatsAppGateway {
    apiUrl;
    apiKey;
    instanceName;
    n8nWebhookUrl;
    constructor(config) {
        this.apiUrl = config?.apiUrl || process.env.EVOLUTION_API_URL || 'http://localhost:8080';
        this.apiKey = config?.apiKey || process.env.EVOLUTION_API_KEY || '';
        this.instanceName = config?.instanceName || process.env.EVOLUTION_INSTANCE_NAME || 'petshop_bot';
        this.n8nWebhookUrl = config?.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL;
    }
    async ensureWebhookRegistered(base, instance) {
        try {
            const webhookEndpoint = `${base.replace(/\/$/, '')}/webhook/set/${instance}`;
            await fetch(webhookEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: this.apiKey,
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
            // Silencioso para não bloquear o envio caso falhe
        }
    }
    async sendMessage(data) {
        try {
            if (this.n8nWebhookUrl) {
                return await this.sendViaN8N(data);
            }
            const base = process.env.EVOLUTION_API_URL && this.apiUrl.includes('localhost:8080')
                ? process.env.EVOLUTION_API_URL
                : this.apiUrl;
            const instance = encodeURIComponent(this.instanceName);
            // Registra/atualiza o webhook em background sem atrasar o disparo
            void this.ensureWebhookRegistered(base, instance);
            // Envio via /message/sendText com opções clicáveis de 1 clique (wa.me)
            // Garante 100% de entrega imediata em conexões QR Code (Baileys)
            const endpoint = `${base.replace(/\/$/, '')}/message/sendText/${instance}`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    apikey: this.apiKey,
                },
                body: JSON.stringify({
                    number: data.phone,
                    text: data.message,
                    delay: 500,
                    linkPreview: false,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                return {
                    success: false,
                    error: `Evolution API erro ${response.status}: ${errorText}`,
                };
            }
            const json = await response.json();
            return {
                success: true,
                messageId: json?.key
                    ? json?.key?.id
                    : undefined,
                rawResponse: json,
            };
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido ao chamar Evolution API';
            console.error('[EvolutionApiWhatsAppGateway] Erro ao enviar mensagem:', errorMsg);
            return {
                success: false,
                error: errorMsg,
            };
        }
    }
    async sendViaN8N(data) {
        try {
            const response = await fetch(this.n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phone: data.phone,
                    message: data.message,
                    timestamp: new Date().toISOString(),
                }),
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `n8n webhook respondeu com status ${response.status}`,
                };
            }
            const json = await response.json();
            return {
                success: true,
                rawResponse: json,
            };
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao chamar webhook n8n';
            return {
                success: false,
                error: errorMsg,
            };
        }
    }
}
exports.EvolutionApiWhatsAppGateway = EvolutionApiWhatsAppGateway;

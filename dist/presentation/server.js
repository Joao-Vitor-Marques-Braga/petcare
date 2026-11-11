"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_js_1 = require("./routes.js");
const errorHandler_js_1 = require("./middlewares/errorHandler.js");
const TenantContext_js_1 = require("../shared/context/TenantContext.js");
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT || 3333;
// Middlewares
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'apikey',
        'x-webhook-secret',
        'x-company-id',
        'x-company-name',
    ],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(TenantContext_js_1.tenantMiddleware);
// Log simples de requisições em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
        next();
    });
}
// Rotas da API
app.use('/api', (0, routes_js_1.configureRoutes)());
// Middleware Global de Erros
app.use(errorHandler_js_1.errorHandler);
const autoSeed_js_1 = require("../shared/database/autoSeed.js");
const prisma_js_1 = require("../shared/database/prisma.js");
async function autoRegisterEvolutionWebhook() {
    try {
        const config = await prisma_js_1.prisma.whatsAppConfig.findUnique({ where: { id: 'default' } });
        if (config && !config.isMockMode && config.apiKey && config.instanceName) {
            const base = process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080')
                ? process.env.EVOLUTION_API_URL
                : config.apiUrl;
            const instance = encodeURIComponent(config.instanceName);
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
            console.log(`✅ Webhook registrado automaticamente na instância "${config.instanceName}"`);
        }
    }
    catch (err) {
        console.warn('⚠️ Aviso: não foi possível registrar webhook no boot:', err);
    }
}
// Inicialização
async function startServer() {
    await (0, autoSeed_js_1.autoSeed)();
    await autoRegisterEvolutionWebhook();
    app.listen(port, () => {
        console.log(`🚀 Servidor Anti-Furo Pet Shop rodando em: http://localhost:${port}`);
        console.log(`📡 Endpoints disponíveis em http://localhost:${port}/api`);
        console.log(`🔔 Webhook Evolution/n8n em: http://localhost:${port}/api/webhooks/whatsapp`);
    });
}
startServer();

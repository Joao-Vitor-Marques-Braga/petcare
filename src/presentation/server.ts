import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { configureRoutes } from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { tenantMiddleware } from '../shared/context/TenantContext.js';

const app = express();
const port = process.env.PORT || 3333;

// Middlewares
app.use(
  cors({
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
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(tenantMiddleware);

// Log simples de requisições em ambiente de desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Rotas da API
app.use('/api', configureRoutes());

// Middleware Global de Erros
app.use(errorHandler);

import { autoSeed } from '../shared/database/autoSeed.js';
import { prisma } from '../shared/database/prisma.js';

async function autoRegisterEvolutionWebhook() {
  try {
    const config = await prisma.whatsAppConfig.findUnique({ where: { id: 'default' } });
    if (config && !config.isMockMode && config.apiKey && config.instanceName) {
      const base =
        process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080')
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
  } catch (err) {
    console.warn('⚠️ Aviso: não foi possível registrar webhook no boot:', err);
  }
}

// Inicialização
async function startServer() {
  await autoSeed();
  await autoRegisterEvolutionWebhook();

  app.listen(port, () => {
    console.log(`🚀 Servidor Anti-Furo Pet Shop rodando em: http://localhost:${port}`);
    console.log(`📡 Endpoints disponíveis em http://localhost:${port}/api`);
    console.log(`🔔 Webhook Evolution/n8n em: http://localhost:${port}/api/webhooks/whatsapp`);
  });
}

startServer();

export { app };

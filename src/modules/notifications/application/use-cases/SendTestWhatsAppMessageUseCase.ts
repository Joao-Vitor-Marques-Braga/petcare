import { PrismaClient } from '@prisma/client';
import { IWhatsAppGateway } from '../../domain/ports/IWhatsAppGateway.js';
import { EvolutionApiWhatsAppGateway } from '../../infrastructure/gateways/EvolutionApiWhatsAppGateway.js';
import { MockWhatsAppGateway } from '../../infrastructure/gateways/MockWhatsAppGateway.js';
import { ValidationError } from '../../../../shared/errors/AppError.js';
import { getCurrentCompanyId, getCurrentCompanyName } from '../../../../shared/context/TenantContext.js';

export interface SendTestWhatsAppMessageInput {
  phone: string;
  message?: string;
}

export class SendTestWhatsAppMessageUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(input: SendTestWhatsAppMessageInput) {
    const cleanedPhone = input.phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      throw new ValidationError('Informe um número de telefone válido com DDD.');
    }

    const companyId = getCurrentCompanyId();
    const companyName = getCurrentCompanyName();
    const config = await this.prisma.whatsAppConfig.findUnique({
      where: { id: companyId },
    });

    const isMock = !config || config.isMockMode || !config.apiKey;

    const gateway: IWhatsAppGateway = isMock
      ? new MockWhatsAppGateway()
      : new EvolutionApiWhatsAppGateway({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          instanceName: config.instanceName,
        });

    const testMessage =
      input.message ||
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

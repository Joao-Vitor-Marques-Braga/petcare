import { PrismaClient } from '@prisma/client';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export class GetWhatsAppConfigUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute() {
    const companyId = getCurrentCompanyId();
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

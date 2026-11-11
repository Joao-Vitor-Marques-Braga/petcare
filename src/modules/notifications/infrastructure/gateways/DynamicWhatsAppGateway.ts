import { PrismaClient } from '@prisma/client';
import {
  IWhatsAppGateway,
  SendWhatsAppMessageDTO,
  WhatsAppSendResult,
} from '../../domain/ports/IWhatsAppGateway.js';
import { MockWhatsAppGateway } from './MockWhatsAppGateway.js';
import { EvolutionApiWhatsAppGateway } from './EvolutionApiWhatsAppGateway.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export class DynamicWhatsAppGateway implements IWhatsAppGateway {
  constructor(private prisma: PrismaClient) {}

  async sendMessage(data: SendWhatsAppMessageDTO): Promise<WhatsAppSendResult> {
    const companyId = getCurrentCompanyId();
    const config = await this.prisma.whatsAppConfig.findUnique({
      where: { id: companyId },
    });

    const isMock = !config || config.isMockMode || !config.apiKey;

    const delegate: IWhatsAppGateway = isMock
      ? new MockWhatsAppGateway()
      : new EvolutionApiWhatsAppGateway({
          apiUrl: config.apiUrl,
          apiKey: config.apiKey,
          instanceName: config.instanceName,
        });

    return await delegate.sendMessage(data);
  }
}

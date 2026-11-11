import { IWhatsAppGateway } from '../../domain/ports/IWhatsAppGateway.js';
import { MockWhatsAppGateway } from './MockWhatsAppGateway.js';
import { EvolutionApiWhatsAppGateway } from './EvolutionApiWhatsAppGateway.js';

export class WhatsAppGatewayFactory {
  static create(): IWhatsAppGateway {
    const isMock =
      process.env.MOCK_WHATSAPP_GATEWAY === 'true' ||
      !process.env.EVOLUTION_API_KEY ||
      process.env.EVOLUTION_API_KEY === 'seu_token_aqui';

    if (isMock) {
      return new MockWhatsAppGateway();
    }

    return new EvolutionApiWhatsAppGateway();
  }
}

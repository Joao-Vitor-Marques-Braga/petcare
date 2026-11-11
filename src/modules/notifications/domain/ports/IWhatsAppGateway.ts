export interface WhatsAppReplyButton {
  type: 'reply';
  displayText: string;
  id: string;
}

export interface SendWhatsAppMessageDTO {
  phone: string; // E.164 (ex: 5511999998888)
  message: string;
  title?: string;
  footer?: string;
  buttons?: WhatsAppReplyButton[];
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: unknown;
}

export interface IWhatsAppGateway {
  sendMessage(data: SendWhatsAppMessageDTO): Promise<WhatsAppSendResult>;
}

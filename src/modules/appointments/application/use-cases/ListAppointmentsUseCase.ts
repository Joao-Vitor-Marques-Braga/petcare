import { PrismaClient } from '@prisma/client';
import {
  AppointmentFilter,
  IAppointmentRepository,
} from '../../domain/repositories/IAppointmentRepository.js';
import { ProcessWebhookReplyUseCase } from '../../../webhooks/application/use-cases/ProcessWebhookReplyUseCase.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export interface ListAppointmentsInput {
  preset?: 'today' | 'tomorrow' | 'all';
  date?: string;
  status?: string;
  customerId?: string;
}

export class ListAppointmentsUseCase {
  private lastSyncAt = 0;

  constructor(
    private appointmentRepo: IAppointmentRepository,
    private prisma?: PrismaClient,
    private processWebhookReplyUseCase?: ProcessWebhookReplyUseCase
  ) {}

  private async syncRecentWhatsAppReplies(): Promise<boolean> {
    if (!this.prisma || !this.processWebhookReplyUseCase) return false;

    const now = Date.now();
    if (now - this.lastSyncAt < 2500) {
      return false;
    }
    this.lastSyncAt = now;

    try {
      const companyId = getCurrentCompanyId();
      const config = await this.prisma.whatsAppConfig.findUnique({
        where: { id: companyId },
      });
      if (!config || config.isMockMode || !config.apiUrl || !config.apiKey || !config.instanceName) {
        return false;
      }

      const base =
        process.env.EVOLUTION_API_URL && config.apiUrl.includes('localhost:8080')
          ? process.env.EVOLUTION_API_URL
          : config.apiUrl;
      const instance = encodeURIComponent(config.instanceName);
      const endpoint = `${base.replace(/\/$/, '')}/chat/findMessages/${instance}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.apiKey,
        },
        body: JSON.stringify({ page: 1, offset: 10 }),
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (!res.ok) return false;

      const data = (await res.json()) as any;
      const records: any[] = data?.messages?.records || (Array.isArray(data) ? data : []);
      if (!Array.isArray(records) || records.length === 0) return false;

      // Filtra apenas mensagens recebidas de clientes (fromMe === false) nos últimos 30 minutos
      const recentCutoffSec = Math.floor(Date.now() / 1000) - 1800;
      const incoming = records
        .filter(
          (r) =>
            r?.key?.fromMe === false &&
            Number(r?.messageTimestamp || 0) >= recentCutoffSec
        )
        .sort((a, b) => Number(a.messageTimestamp || 0) - Number(b.messageTimestamp || 0));

      let anyUpdated = false;
      for (const msgRecord of incoming) {
        const msgTimeMs = Number(msgRecord.messageTimestamp || 0) * 1000;
        const extracted = this.processWebhookReplyUseCase.extractDataFromPayload({
          data: msgRecord,
        });
        if (extracted.intent === 'UNKNOWN' || !extracted.phone) continue;

        const targetAppt = await this.appointmentRepo.findLatestAwaitingByCustomerPhone(
          extracted.phone
        );
        if (!targetAppt || targetAppt.status !== 'MENSAGEM_ENVIADA') continue;

        const reminderSentMs = targetAppt.lastReminderSent
          ? targetAppt.lastReminderSent.getTime()
          : 0;

        // Só aplica a resposta se ela foi enviada pelo cliente APÓS o disparo do lembrete
        if (reminderSentMs > 0 && msgTimeMs + 15000 < reminderSentMs) {
          continue;
        }

        const result = await this.processWebhookReplyUseCase.execute({
          rawPayload: { data: msgRecord },
        });
        if (result.processed) {
          anyUpdated = true;
        }
      }

      return anyUpdated;
    } catch {
      return false;
    }
  }

  async execute(input: ListAppointmentsInput = {}) {
    const filters: AppointmentFilter = {};

    if (input.preset === 'today') {
      filters.date = new Date();
    } else if (input.preset === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.date = tomorrow;
    } else if (input.date) {
      filters.date = new Date(input.date);
    }

    if (input.status && input.status !== 'ALL') {
      filters.status = input.status;
    }

    if (input.customerId) {
      filters.customerId = input.customerId;
    }

    let appointments = await this.appointmentRepo.findByFilters(filters);

    const hasAwaiting = appointments.some((a) => a.status === 'MENSAGEM_ENVIADA');
    if (hasAwaiting) {
      const updated = await this.syncRecentWhatsAppReplies();
      if (updated) {
        appointments = await this.appointmentRepo.findByFilters(filters);
      }
    }

    return appointments.map((a) => a.toJSON());
  }
}

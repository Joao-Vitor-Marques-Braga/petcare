import { IAppointmentRepository } from '../../../appointments/domain/repositories/IAppointmentRepository.js';
import { IWhatsAppGateway } from '../../domain/ports/IWhatsAppGateway.js';
import { PrismaClient } from '@prisma/client';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export interface TriggerBatchRemindersInput {
  targetDate?: string; // YYYY-MM-DD ou ISO
  preset?: 'today' | 'tomorrow';
}

export class TriggerBatchRemindersUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private whatsAppGateway: IWhatsAppGateway,
    private prisma: PrismaClient
  ) {}

  async execute(input: TriggerBatchRemindersInput = {}) {
    let date = new Date();

    if (input.preset === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (input.targetDate) {
      date = new Date(input.targetDate);
    }

    const appointments = await this.appointmentRepo.findPendingRemindersForDate(date);

    const results = {
      targetDate: date.toISOString().split('T')[0],
      totalFound: appointments.length,
      sentSuccess: 0,
      sentFailed: 0,
      details: [] as Array<{
        appointmentId: string;
        customerName: string;
        phone: string;
        status: 'SUCCESS' | 'FAILED';
        error?: string;
      }>,
    };

    const companyId = getCurrentCompanyId();
    for (const appointment of appointments) {
      if (!appointment.customer || !appointment.customer.phone) {
        results.sentFailed++;
        results.details.push({
          appointmentId: appointment.id!,
          customerName: appointment.customer?.name || 'Desconhecido',
          phone: '',
          status: 'FAILED',
          error: 'Telefone ausente',
        });
        continue;
      }

      const config = await this.prisma.whatsAppConfig.findUnique({
        where: { id: companyId },
      });
      const message = appointment.buildWhatsAppMessage(config?.senderPhone);
      const buttons = appointment.getWhatsAppButtons();
      const phone = appointment.customer.phone;

      try {
        const sendResult = await this.whatsAppGateway.sendMessage({
          phone,
          message,
          buttons,
        });

        if (sendResult.success) {
          appointment.markReminderSent();
          await this.appointmentRepo.update(appointment);

          await this.prisma.notificationLog.create({
            data: {
              appointmentId: appointment.id!,
              channel: 'WHATSAPP',
              direction: 'OUTBOUND',
              status: 'SUCCESS',
              payload: JSON.stringify({
                batch: true,
                messageId: sendResult.messageId,
              }),
            },
          });

          results.sentSuccess++;
          results.details.push({
            appointmentId: appointment.id!,
            customerName: appointment.customer.name,
            phone,
            status: 'SUCCESS',
          });
        } else {
          await this.prisma.notificationLog.create({
            data: {
              appointmentId: appointment.id!,
              channel: 'WHATSAPP',
              direction: 'OUTBOUND',
              status: 'FAILED',
              payload: JSON.stringify({ error: sendResult.error }),
            },
          });

          results.sentFailed++;
          results.details.push({
            appointmentId: appointment.id!,
            customerName: appointment.customer.name,
            phone,
            status: 'FAILED',
            error: sendResult.error,
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Erro no envio';
        results.sentFailed++;
        results.details.push({
          appointmentId: appointment.id!,
          customerName: appointment.customer.name,
          phone,
          status: 'FAILED',
          error: errorMsg,
        });
      }
    }

    return results;
  }
}

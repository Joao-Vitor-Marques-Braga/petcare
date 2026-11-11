import { IAppointmentRepository } from '../../../appointments/domain/repositories/IAppointmentRepository.js';
import { IWhatsAppGateway } from '../../domain/ports/IWhatsAppGateway.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, BusinessRuleError } from '../../../../shared/errors/AppError.js';
import { getCurrentCompanyId } from '../../../../shared/context/TenantContext.js';

export class TriggerWhatsAppReminderUseCase {
  constructor(
    private appointmentRepo: IAppointmentRepository,
    private whatsAppGateway: IWhatsAppGateway,
    private prisma: PrismaClient
  ) {}

  async execute(appointmentId: string) {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento', appointmentId);
    }

    if (!appointment.customer) {
      throw new BusinessRuleError('Agendamento não possui tutor vinculado.');
    }

    const companyId = getCurrentCompanyId();
    const config = await this.prisma.whatsAppConfig.findUnique({
      where: { id: companyId },
    });

    const message = appointment.buildWhatsAppMessage(config?.senderPhone);
    const buttons = appointment.getWhatsAppButtons();
    const phone = appointment.customer.phone;

    const result = await this.whatsAppGateway.sendMessage({
      phone,
      message,
      buttons,
    });

    if (!result.success) {
      // Registra a falha no log
      await this.prisma.notificationLog.create({
        data: {
          appointmentId: appointment.id!,
          channel: 'WHATSAPP',
          direction: 'OUTBOUND',
          status: 'FAILED',
          payload: JSON.stringify({ error: result.error, phone }),
        },
      });

      throw new BusinessRuleError(`Falha ao disparar WhatsApp: ${result.error || 'Erro desconhecido'}`);
    }

    // Sucesso: marca como MENSAGEM_ENVIADA e atualiza timestamp
    appointment.markReminderSent();
    await this.appointmentRepo.update(appointment);

    // Registra auditoria de sucesso
    await this.prisma.notificationLog.create({
      data: {
        appointmentId: appointment.id!,
        channel: 'WHATSAPP',
        direction: 'OUTBOUND',
        status: 'SUCCESS',
        payload: JSON.stringify({
          messageId: result.messageId,
          phone,
          sentAt: new Date().toISOString(),
        }),
      },
    });

    return {
      success: true,
      appointmentId: appointment.id,
      status: appointment.status,
      messageId: result.messageId,
      sentAt: appointment.lastReminderSent,
    };
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerWhatsAppReminderUseCase = void 0;
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class TriggerWhatsAppReminderUseCase {
    appointmentRepo;
    whatsAppGateway;
    prisma;
    constructor(appointmentRepo, whatsAppGateway, prisma) {
        this.appointmentRepo = appointmentRepo;
        this.whatsAppGateway = whatsAppGateway;
        this.prisma = prisma;
    }
    async execute(appointmentId) {
        const appointment = await this.appointmentRepo.findById(appointmentId);
        if (!appointment) {
            throw new AppError_js_1.NotFoundError('Agendamento', appointmentId);
        }
        if (!appointment.customer) {
            throw new AppError_js_1.BusinessRuleError('Agendamento não possui tutor vinculado.');
        }
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
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
                    appointmentId: appointment.id,
                    channel: 'WHATSAPP',
                    direction: 'OUTBOUND',
                    status: 'FAILED',
                    payload: JSON.stringify({ error: result.error, phone }),
                },
            });
            throw new AppError_js_1.BusinessRuleError(`Falha ao disparar WhatsApp: ${result.error || 'Erro desconhecido'}`);
        }
        // Sucesso: marca como MENSAGEM_ENVIADA e atualiza timestamp
        appointment.markReminderSent();
        await this.appointmentRepo.update(appointment);
        // Registra auditoria de sucesso
        await this.prisma.notificationLog.create({
            data: {
                appointmentId: appointment.id,
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
exports.TriggerWhatsAppReminderUseCase = TriggerWhatsAppReminderUseCase;

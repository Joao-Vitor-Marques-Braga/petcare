"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerBatchRemindersUseCase = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class TriggerBatchRemindersUseCase {
    appointmentRepo;
    whatsAppGateway;
    prisma;
    constructor(appointmentRepo, whatsAppGateway, prisma) {
        this.appointmentRepo = appointmentRepo;
        this.whatsAppGateway = whatsAppGateway;
        this.prisma = prisma;
    }
    async execute(input = {}) {
        let date = new Date();
        if (input.preset === 'tomorrow') {
            date.setDate(date.getDate() + 1);
        }
        else if (input.targetDate) {
            date = new Date(input.targetDate);
        }
        const appointments = await this.appointmentRepo.findPendingRemindersForDate(date);
        const results = {
            targetDate: date.toISOString().split('T')[0],
            totalFound: appointments.length,
            sentSuccess: 0,
            sentFailed: 0,
            details: [],
        };
        const companyId = (0, TenantContext_js_1.getCurrentCompanyId)();
        for (const appointment of appointments) {
            if (!appointment.customer || !appointment.customer.phone) {
                results.sentFailed++;
                results.details.push({
                    appointmentId: appointment.id,
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
                            appointmentId: appointment.id,
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
                        appointmentId: appointment.id,
                        customerName: appointment.customer.name,
                        phone,
                        status: 'SUCCESS',
                    });
                }
                else {
                    await this.prisma.notificationLog.create({
                        data: {
                            appointmentId: appointment.id,
                            channel: 'WHATSAPP',
                            direction: 'OUTBOUND',
                            status: 'FAILED',
                            payload: JSON.stringify({ error: sendResult.error }),
                        },
                    });
                    results.sentFailed++;
                    results.details.push({
                        appointmentId: appointment.id,
                        customerName: appointment.customer.name,
                        phone,
                        status: 'FAILED',
                        error: sendResult.error,
                    });
                }
            }
            catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Erro no envio';
                results.sentFailed++;
                results.details.push({
                    appointmentId: appointment.id,
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
exports.TriggerBatchRemindersUseCase = TriggerBatchRemindersUseCase;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Appointment = void 0;
const TenantContext_js_1 = require("../../../../shared/context/TenantContext.js");
class Appointment {
    props;
    constructor(props) {
        this.props = {
            ...props,
            status: props.status ?? 'PENDENTE',
            createdAt: props.createdAt ?? new Date(),
            updatedAt: props.updatedAt ?? new Date(),
        };
    }
    get id() {
        return this.props.id;
    }
    get scheduledAt() {
        return this.props.scheduledAt;
    }
    get service() {
        return this.props.service;
    }
    get serviceName() {
        return this.props.serviceName;
    }
    get servicePrice() {
        return this.props.servicePrice;
    }
    get status() {
        return this.props.status ?? 'PENDENTE';
    }
    get notes() {
        return this.props.notes;
    }
    get customerId() {
        return this.props.customerId;
    }
    get petId() {
        return this.props.petId;
    }
    get customer() {
        return this.props.customer;
    }
    get pet() {
        return this.props.pet;
    }
    get lastReminderSent() {
        return this.props.lastReminderSent;
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get updatedAt() {
        return this.props.updatedAt;
    }
    markReminderSent() {
        this.props.status = 'MENSAGEM_ENVIADA';
        this.props.lastReminderSent = new Date();
        this.props.updatedAt = new Date();
    }
    confirm() {
        this.props.status = 'CONFIRMADO';
        this.props.updatedAt = new Date();
    }
    cancelOrReschedule() {
        this.props.status = 'CANCELADO_REAGENDAR';
        this.props.updatedAt = new Date();
    }
    updateStatus(status) {
        this.props.status = status;
        this.props.updatedAt = new Date();
    }
    getServiceLabel() {
        if (this.props.serviceName && this.props.serviceName.trim()) {
            return this.props.serviceName;
        }
        switch (this.props.service) {
            case 'BANHO':
                return 'Banho';
            case 'TOSA_HIGIENICA':
                return 'Tosa Higiênica';
            case 'TOSA_COMPLETA':
                return 'Tosa Completa';
            case 'BANHO_E_TOSA':
                return 'Banho e Tosa';
            default:
                return this.props.service;
        }
    }
    buildWhatsAppMessage(_senderPhone) {
        const companyName = (0, TenantContext_js_1.getCurrentCompanyName)();
        const customerName = this.props.customer?.name ?? 'Cliente';
        const petName = this.props.pet?.name ?? 'seu pet';
        const serviceLabel = this.getServiceLabel();
        const priceFormatted = typeof this.props.servicePrice === 'number' && this.props.servicePrice > 0
            ? ` (R$ ${this.props.servicePrice.toFixed(2).replace('.', ',')})`
            : '';
        const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }).format(this.props.scheduledAt);
        const timeFormatted = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            hour: '2-digit',
            minute: '2-digit',
        }).format(this.props.scheduledAt);
        return (`🐾 *${companyName}* 🐾\n\n` +
            `Olá, *${customerName}*! Tudo bem?\n` +
            `Passando para confirmar o atendimento do(a) *${petName}*:\n\n` +
            `📅 *Data:* ${dateFormatted} às ${timeFormatted}\n` +
            `✂️ *Serviço:* ${serviceLabel}${priceFormatted}\n\n` +
            `*Você confirma a presença?*\n` +
            `Responda esta mensagem com:\n` +
            `✅ *SIM* — Para confirmar presença\n` +
            `❌ *NÃO* — Caso precise reagendar`);
    }
    getWhatsAppButtons() {
        return [
            {
                type: 'reply',
                displayText: 'Sim, confirmar presença',
                id: 'confirmar_1',
            },
            {
                type: 'reply',
                displayText: 'Não, preciso reagendar',
                id: 'reagendar_2',
            },
        ];
    }
    toJSON() {
        return {
            id: this.props.id,
            scheduledAt: this.props.scheduledAt.toISOString(),
            service: this.props.service,
            serviceLabel: this.getServiceLabel(),
            serviceName: this.props.serviceName ?? this.getServiceLabel(),
            servicePrice: this.props.servicePrice ?? null,
            status: this.props.status,
            notes: this.props.notes,
            customerId: this.props.customerId,
            petId: this.props.petId,
            customer: this.props.customer ? this.props.customer.toJSON() : undefined,
            pet: this.props.pet ? this.props.pet.toJSON() : undefined,
            lastReminderSent: this.props.lastReminderSent?.toISOString() ?? null,
            createdAt: this.props.createdAt?.toISOString(),
            updatedAt: this.props.updatedAt?.toISOString(),
        };
    }
}
exports.Appointment = Appointment;

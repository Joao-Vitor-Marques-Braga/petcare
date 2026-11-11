import { Customer } from '../../../customers/domain/entities/Customer.js';
import { Pet } from '../../../customers/domain/entities/Pet.js';
import { BusinessRuleError } from '../../../../shared/errors/AppError.js';
import { getCurrentCompanyName } from '../../../../shared/context/TenantContext.js';

export type AppointmentStatus =
  | 'PENDENTE'
  | 'MENSAGEM_ENVIADA'
  | 'CONFIRMADO'
  | 'CANCELADO_REAGENDAR';

export type AppointmentService =
  | 'BANHO'
  | 'TOSA_HIGIENICA'
  | 'TOSA_COMPLETA'
  | 'BANHO_E_TOSA'
  | string;

export interface AppointmentProps {
  id?: string;
  scheduledAt: Date;
  service: AppointmentService;
  serviceName?: string | null;
  servicePrice?: number | null;
  status?: AppointmentStatus;
  notes?: string | null;
  customerId: string;
  petId: string;
  customer?: Customer;
  pet?: Pet;
  lastReminderSent?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Appointment {
  private props: AppointmentProps;

  constructor(props: AppointmentProps) {
    this.props = {
      ...props,
      status: props.status ?? 'PENDENTE',
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get scheduledAt(): Date {
    return this.props.scheduledAt;
  }

  get service(): AppointmentService {
    return this.props.service;
  }

  get serviceName(): string | null | undefined {
    return this.props.serviceName;
  }

  get servicePrice(): number | null | undefined {
    return this.props.servicePrice;
  }

  get status(): AppointmentStatus {
    return this.props.status ?? 'PENDENTE';
  }

  get notes(): string | null | undefined {
    return this.props.notes;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get petId(): string {
    return this.props.petId;
  }

  get customer(): Customer | undefined {
    return this.props.customer;
  }

  get pet(): Pet | undefined {
    return this.props.pet;
  }

  get lastReminderSent(): Date | null | undefined {
    return this.props.lastReminderSent;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public markReminderSent(): void {
    this.props.status = 'MENSAGEM_ENVIADA';
    this.props.lastReminderSent = new Date();
    this.props.updatedAt = new Date();
  }

  public confirm(): void {
    this.props.status = 'CONFIRMADO';
    this.props.updatedAt = new Date();
  }

  public cancelOrReschedule(): void {
    this.props.status = 'CANCELADO_REAGENDAR';
    this.props.updatedAt = new Date();
  }

  public updateStatus(status: AppointmentStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  public getServiceLabel(): string {
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

  public buildWhatsAppMessage(_senderPhone?: string | null): string {
    const companyName = getCurrentCompanyName();
    const customerName = this.props.customer?.name ?? 'Cliente';
    const petName = this.props.pet?.name ?? 'seu pet';
    const serviceLabel = this.getServiceLabel();
    const priceFormatted =
      typeof this.props.servicePrice === 'number' && this.props.servicePrice > 0
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

    return (
      `🐾 *${companyName}* 🐾\n\n` +
      `Olá, *${customerName}*! Tudo bem?\n` +
      `Passando para confirmar o atendimento do(a) *${petName}*:\n\n` +
      `📅 *Data:* ${dateFormatted} às ${timeFormatted}\n` +
      `✂️ *Serviço:* ${serviceLabel}${priceFormatted}\n\n` +
      `*Você confirma a presença?*\n` +
      `Responda esta mensagem com:\n` +
      `✅ *SIM* — Para confirmar presença\n` +
      `❌ *NÃO* — Caso precise reagendar`
    );
  }

  public getWhatsAppButtons() {
    return [
      {
        type: 'reply' as const,
        displayText: 'Sim, confirmar presença',
        id: 'confirmar_1',
      },
      {
        type: 'reply' as const,
        displayText: 'Não, preciso reagendar',
        id: 'reagendar_2',
      },
    ];
  }

  public toJSON() {
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

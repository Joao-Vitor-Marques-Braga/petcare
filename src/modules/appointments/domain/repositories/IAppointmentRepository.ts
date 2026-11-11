import { Appointment } from '../entities/Appointment.js';

export interface AppointmentFilter {
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  customerId?: string;
}

export interface AppointmentMetrics {
  total: number;
  pending: number;
  sent: number;
  confirmed: number;
  cancelled: number;
}

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByFilters(filters: AppointmentFilter): Promise<Appointment[]>;
  findPendingRemindersForDate(date: Date): Promise<Appointment[]>;
  findLatestAwaitingByCustomerPhone(phone: string): Promise<Appointment | null>;
  findAll(): Promise<Appointment[]>;
  create(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
  getMetrics(date?: Date): Promise<AppointmentMetrics>;
}

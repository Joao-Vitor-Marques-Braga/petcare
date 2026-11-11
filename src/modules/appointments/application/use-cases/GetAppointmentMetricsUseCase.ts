import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';

export interface GetAppointmentMetricsInput {
  date?: string;
  preset?: 'today' | 'tomorrow' | 'all';
}

export class GetAppointmentMetricsUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(input: GetAppointmentMetricsInput = {}) {
    let targetDate: Date | undefined;

    if (input.preset === 'today') {
      targetDate = new Date();
    } else if (input.preset === 'tomorrow') {
      targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 1);
    } else if (input.date) {
      targetDate = new Date(input.date);
    }

    return await this.appointmentRepo.getMetrics(targetDate);
  }
}

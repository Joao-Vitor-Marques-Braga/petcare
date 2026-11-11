import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { NotFoundError } from '../../../../shared/errors/AppError.js';

export class DeleteAppointmentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(id: string) {
    const existing = await this.appointmentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Agendamento', id);
    }

    await this.appointmentRepo.delete(id);
  }
}

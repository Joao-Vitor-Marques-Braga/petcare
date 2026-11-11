import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository.js';
import { AppointmentStatus } from '../../domain/entities/Appointment.js';
import { NotFoundError } from '../../../../shared/errors/AppError.js';

export interface UpdateAppointmentStatusInput {
  appointmentId: string;
  status: AppointmentStatus;
}

export class UpdateAppointmentStatusUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(input: UpdateAppointmentStatusInput) {
    const appointment = await this.appointmentRepo.findById(input.appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento', input.appointmentId);
    }

    appointment.updateStatus(input.status);
    const updated = await this.appointmentRepo.update(appointment);
    return updated.toJSON();
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAppointmentStatusUseCase = void 0;
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
class UpdateAppointmentStatusUseCase {
    appointmentRepo;
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async execute(input) {
        const appointment = await this.appointmentRepo.findById(input.appointmentId);
        if (!appointment) {
            throw new AppError_js_1.NotFoundError('Agendamento', input.appointmentId);
        }
        appointment.updateStatus(input.status);
        const updated = await this.appointmentRepo.update(appointment);
        return updated.toJSON();
    }
}
exports.UpdateAppointmentStatusUseCase = UpdateAppointmentStatusUseCase;

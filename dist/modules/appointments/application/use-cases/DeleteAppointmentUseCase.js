"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAppointmentUseCase = void 0;
const AppError_js_1 = require("../../../../shared/errors/AppError.js");
class DeleteAppointmentUseCase {
    appointmentRepo;
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async execute(id) {
        const existing = await this.appointmentRepo.findById(id);
        if (!existing) {
            throw new AppError_js_1.NotFoundError('Agendamento', id);
        }
        await this.appointmentRepo.delete(id);
    }
}
exports.DeleteAppointmentUseCase = DeleteAppointmentUseCase;

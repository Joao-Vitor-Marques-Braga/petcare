"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAppointmentMetricsUseCase = void 0;
class GetAppointmentMetricsUseCase {
    appointmentRepo;
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async execute(input = {}) {
        let targetDate;
        if (input.preset === 'today') {
            targetDate = new Date();
        }
        else if (input.preset === 'tomorrow') {
            targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 1);
        }
        else if (input.date) {
            targetDate = new Date(input.date);
        }
        return await this.appointmentRepo.getMetrics(targetDate);
    }
}
exports.GetAppointmentMetricsUseCase = GetAppointmentMetricsUseCase;

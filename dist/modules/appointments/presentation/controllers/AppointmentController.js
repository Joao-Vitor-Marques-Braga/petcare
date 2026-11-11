"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_schemas_js_1 = require("../schemas/appointment.schemas.js");
class AppointmentController {
    createAppointmentUseCase;
    listAppointmentsUseCase;
    updateAppointmentStatusUseCase;
    getAppointmentMetricsUseCase;
    deleteAppointmentUseCase;
    constructor(createAppointmentUseCase, listAppointmentsUseCase, updateAppointmentStatusUseCase, getAppointmentMetricsUseCase, deleteAppointmentUseCase) {
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.listAppointmentsUseCase = listAppointmentsUseCase;
        this.updateAppointmentStatusUseCase = updateAppointmentStatusUseCase;
        this.getAppointmentMetricsUseCase = getAppointmentMetricsUseCase;
        this.deleteAppointmentUseCase = deleteAppointmentUseCase;
    }
    createAppointment = async (req, res, next) => {
        try {
            const validatedData = appointment_schemas_js_1.createAppointmentSchema.parse(req.body);
            const result = await this.createAppointmentUseCase.execute(validatedData);
            return res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    listAppointments = async (req, res, next) => {
        try {
            const query = appointment_schemas_js_1.listAppointmentsQuerySchema.parse(req.query);
            const result = await this.listAppointmentsUseCase.execute(query);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const id = req.params.id;
            const { status } = appointment_schemas_js_1.updateAppointmentStatusSchema.parse(req.body);
            const result = await this.updateAppointmentStatusUseCase.execute({
                appointmentId: id,
                status,
            });
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    getMetrics = async (req, res, next) => {
        try {
            const { date, preset } = req.query;
            const result = await this.getAppointmentMetricsUseCase.execute({ date, preset });
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    deleteAppointment = async (req, res, next) => {
        try {
            const id = req.params.id;
            await this.deleteAppointmentUseCase.execute(id);
            return res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AppointmentController = AppointmentController;

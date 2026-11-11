import { Request, Response, NextFunction } from 'express';
import { CreateAppointmentUseCase } from '../../application/use-cases/CreateAppointmentUseCase.js';
import { ListAppointmentsUseCase } from '../../application/use-cases/ListAppointmentsUseCase.js';
import { UpdateAppointmentStatusUseCase } from '../../application/use-cases/UpdateAppointmentStatusUseCase.js';
import { GetAppointmentMetricsUseCase } from '../../application/use-cases/GetAppointmentMetricsUseCase.js';
import { DeleteAppointmentUseCase } from '../../application/use-cases/DeleteAppointmentUseCase.js';
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  listAppointmentsQuerySchema,
} from '../schemas/appointment.schemas.js';

export class AppointmentController {
  constructor(
    private createAppointmentUseCase: CreateAppointmentUseCase,
    private listAppointmentsUseCase: ListAppointmentsUseCase,
    private updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase,
    private getAppointmentMetricsUseCase: GetAppointmentMetricsUseCase,
    private deleteAppointmentUseCase: DeleteAppointmentUseCase
  ) {}

  createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createAppointmentSchema.parse(req.body);
      const result = await this.createAppointmentUseCase.execute(validatedData);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listAppointments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listAppointmentsQuerySchema.parse(req.query);
      const result = await this.listAppointmentsUseCase.execute(query);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { status } = updateAppointmentStatusSchema.parse(req.body);
      const result = await this.updateAppointmentStatusUseCase.execute({
        appointmentId: id,
        status,
      });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  getMetrics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, preset } = req.query as { date?: string; preset?: 'today' | 'tomorrow' | 'all' };
      const result = await this.getAppointmentMetricsUseCase.execute({ date, preset });
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await this.deleteAppointmentUseCase.execute(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

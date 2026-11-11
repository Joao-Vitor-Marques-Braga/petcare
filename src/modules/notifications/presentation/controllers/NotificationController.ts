import { Request, Response, NextFunction } from 'express';
import { TriggerWhatsAppReminderUseCase } from '../../application/use-cases/TriggerWhatsAppReminderUseCase.js';
import { TriggerBatchRemindersUseCase } from '../../application/use-cases/TriggerBatchRemindersUseCase.js';
import { z } from 'zod';

const batchTriggerSchema = z.object({
  targetDate: z.string().optional(),
  preset: z.enum(['today', 'tomorrow']).optional().default('tomorrow'),
});

export class NotificationController {
  constructor(
    private triggerSingleUseCase: TriggerWhatsAppReminderUseCase,
    private triggerBatchUseCase: TriggerBatchRemindersUseCase
  ) {}

  sendSingleReminder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const result = await this.triggerSingleUseCase.execute(id);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  sendBatchReminders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = batchTriggerSchema.parse(req.body || {});
      const result = await this.triggerBatchUseCase.execute(body);
      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

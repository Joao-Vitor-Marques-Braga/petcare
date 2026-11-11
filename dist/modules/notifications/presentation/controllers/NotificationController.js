"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const zod_1 = require("zod");
const batchTriggerSchema = zod_1.z.object({
    targetDate: zod_1.z.string().optional(),
    preset: zod_1.z.enum(['today', 'tomorrow']).optional().default('tomorrow'),
});
class NotificationController {
    triggerSingleUseCase;
    triggerBatchUseCase;
    constructor(triggerSingleUseCase, triggerBatchUseCase) {
        this.triggerSingleUseCase = triggerSingleUseCase;
        this.triggerBatchUseCase = triggerBatchUseCase;
    }
    sendSingleReminder = async (req, res, next) => {
        try {
            const id = req.params.id;
            const result = await this.triggerSingleUseCase.execute(id);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    sendBatchReminders = async (req, res, next) => {
        try {
            const body = batchTriggerSchema.parse(req.body || {});
            const result = await this.triggerBatchUseCase.execute(body);
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.NotificationController = NotificationController;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
class WebhookController {
    processWebhookUseCase;
    constructor(processWebhookUseCase) {
        this.processWebhookUseCase = processWebhookUseCase;
    }
    handleIncomingWebhook = async (req, res, next) => {
        try {
            console.log('\n📥 [WEBHOOK RECEBIDO]', req.originalUrl);
            const result = await this.processWebhookUseCase.execute({
                rawPayload: req.body,
            });
            return res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
}
exports.WebhookController = WebhookController;

import { Request, Response, NextFunction } from 'express';
import { ProcessWebhookReplyUseCase } from '../../application/use-cases/ProcessWebhookReplyUseCase.js';

export class WebhookController {
  constructor(private processWebhookUseCase: ProcessWebhookReplyUseCase) {}

  handleIncomingWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('\n📥 [WEBHOOK RECEBIDO]', req.originalUrl);

      const result = await this.processWebhookUseCase.execute({
        rawPayload: req.body,
      });

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}

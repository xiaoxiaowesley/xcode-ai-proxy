import { Request, Response } from 'express';
import { ConfigManager } from '../config';
import { ChatCompletionRequest } from '../types';
export declare abstract class BaseHandler {
    protected config: ConfigManager;
    abstract handle(req: Request, res: Response): Promise<void>;
    protected validateRequest(req: Request): ChatCompletionRequest;
    protected sendError(res: Response, status: number, message: string, type?: string): void;
    protected logModelRequest(model: string, isStream?: boolean): void;
}
//# sourceMappingURL=base.d.ts.map
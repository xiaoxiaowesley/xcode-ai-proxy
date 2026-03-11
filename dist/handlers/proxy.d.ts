import { Request, Response } from 'express';
import { BaseHandler } from './base';
export declare class ProxyHandler extends BaseHandler {
    private apiHandler;
    handle(req: Request, res: Response): Promise<void>;
    handleModels(req: Request, res: Response): void;
    handleHealth(req: Request, res: Response): void;
}
//# sourceMappingURL=proxy.d.ts.map
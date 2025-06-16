import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggingService } from "../logging/logging.service";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    constructor(private readonly loggingService: LoggingService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();

        // Log the incoming request
        const requestBody = req.body ? JSON.parse(JSON.stringify(req.body)) : {};

        // Hide sensitive data in logs
        if (requestBody.password) {
            requestBody.password = "***";
        }
        if (requestBody.refreshToken) {
            requestBody.refreshToken = "***";
        }

        res.on("finish", () => {
            const duration = Date.now() - startTime;
            const logMessage = `${req.method} ${req.originalUrl} - Query: ${JSON.stringify(req.query)} - Body: ${JSON.stringify(requestBody)} - Status: ${res.statusCode} - ${duration}ms`;
            this.loggingService.log(logMessage, "HTTP");
        });

        next();
    }
}

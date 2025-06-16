import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { LoggingService } from "../logging/logging.service";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(private readonly loggingService: LoggingService) {}

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error";

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === "string"
                    ? exceptionResponse
                    : (exceptionResponse as any).message || exception.message;
        }

        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
        };

        // Log the error
        const errorMessage = `${request.method} ${request.url} - ${status} - ${message}`;
        if (exception instanceof Error) {
            this.loggingService.error(errorMessage, exception.stack, "ExceptionFilter");
        } else {
            this.loggingService.error(errorMessage, String(exception), "ExceptionFilter");
        }

        response.status(status).json(errorResponse);
    }
}

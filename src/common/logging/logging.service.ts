import { Injectable, LogLevel } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

// Using NestJS LogLevel values
export enum NestLogLevel {
  ERROR = 0,
  WARN = 1,
  LOG = 2,
  DEBUG = 3,
  VERBOSE = 4,
}

@Injectable()
export class LoggingService {
    private readonly logLevel: number;
    private readonly maxFileSize: number;
    private readonly logsDir = "logs";
    private readonly logFile = path.join(this.logsDir, "app.log");
    private readonly errorLogFile = path.join(this.logsDir, "error.log");

    constructor(private configService: ConfigService) {
        this.logLevel = parseInt(this.configService.get("LOG_LEVEL", "2"));
        this.maxFileSize = parseInt(this.configService.get("LOG_MAX_FILE_SIZE", "1024")) * 1024; // Convert KB to bytes
        this.ensureLogsDirectory();
    }

    private ensureLogsDirectory() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    private shouldLog(level: NestLogLevel): boolean {
        return level <= this.logLevel;
    }

    private formatMessage(level: string, message: string, context?: string): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` [${context}]` : "";
        return `[${timestamp}] [${level}]${contextStr} ${message}\n`;
    }

    private async writeToFile(filePath: string, message: string) {
        try {
            await this.rotateLogIfNeeded(filePath);
            fs.appendFileSync(filePath, message);
        } catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }

    private async rotateLogIfNeeded(filePath: string) {
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size >= this.maxFileSize) {
                const timestamp = new Date().toISOString().replace(/:/g, "-").split(".")[0];
                const rotatedFile = filePath.replace(".log", `_${timestamp}.log`);
                fs.renameSync(filePath, rotatedFile);
            }
        }
    }

    private logToConsoleAndFile(level: string, message: string, context?: string) {
        const formattedMessage = this.formatMessage(level, message, context);

        // Always log to console
        process.stdout.write(formattedMessage);

        // Write to log file
        this.writeToFile(this.logFile, formattedMessage);
    }

    error(message: string, trace?: string, context?: string) {
        if (this.shouldLog(NestLogLevel.ERROR)) {
            const errorMessage = trace ? `${message}\nTrace: ${trace}` : message;
            const formattedMessage = this.formatMessage("ERROR", errorMessage, context);

            // Log to console
            process.stdout.write(formattedMessage);

            // Write to both general log and error log
            this.writeToFile(this.logFile, formattedMessage);
            this.writeToFile(this.errorLogFile, formattedMessage);
        }
    }

    warn(message: string, context?: string) {
        if (this.shouldLog(CustomLogLevel.WARN)) {
            this.logToConsoleAndFile("WARN", message, context);
        }
    }

    log(message: string, context?: string) {
        if (this.shouldLog(CustomLogLevel.LOG)) {
            this.logToConsoleAndFile("LOG", message, context);
        }
    }

    debug(message: string, context?: string) {
        if (this.shouldLog(CustomLogLevel.DEBUG)) {
            this.logToConsoleAndFile("DEBUG", message, context);
        }
    }

    verbose(message: string, context?: string) {
        if (this.shouldLog(CustomLogLevel.VERBOSE)) {
            this.logToConsoleAndFile("VERBOSE", message, context);
        }
    }

    logRequest(method: string, url: string, query: any, body: any, statusCode: number) {
        const message = `${method} ${url} - Query: ${JSON.stringify(query)} - Body: ${JSON.stringify(body)} - Status: ${statusCode}`;
        this.log(message, "HTTP");
    }
}

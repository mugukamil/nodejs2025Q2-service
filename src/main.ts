import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter";
import { LoggingService } from "./common/logging/logging.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggingService = app.get(LoggingService);

  // Global validation pipe
  app.useGlobalPipes(
      new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
      }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter(loggingService));

  // Setup uncaught exception handler
  process.on("uncaughtException", (error: Error) => {
      loggingService.error(
          `Uncaught Exception: ${error.message}`,
          error.stack,
          "UncaughtException",
      );
      process.exit(1);
  });

  // Setup unhandled rejection handler
  process.on("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
      loggingService.error(
          `Unhandled Rejection at: ${promise}, reason: ${reason}`,
          String(reason),
          "UnhandledRejection",
      );
  });

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  loggingService.log(`Server is running on port ${port}`, "Bootstrap");
}

bootstrap().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});

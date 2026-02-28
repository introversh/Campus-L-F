import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as { message?: unknown };
        const resMessage = resObj.message;
        if (typeof resMessage === 'string') {
          message = resMessage;
        } else if (Array.isArray(resMessage)) {
          errors = resMessage.filter((m): m is string => typeof m === 'string');
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      // Bug #20 fix: do NOT expose raw error messages to clients in production
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    this.logger.error(
      `${request.method} ${request.url} → ${status}: ${
        exception instanceof Error ? exception.message : String(exception)
      }`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {

    const { httpAdapter } = this.httpAdapterHost;

    const response = host.switchToHttp().getResponse();
    let responseBody, responseStatus;

    /* 400번대면 custom 매세지를 이외에는 표시되는 매세지로 */
    if (exception instanceof HttpException) {
      response.status(exception.getStatus())
      responseBody = {
        status: exception.getStatus(),
        message: exception['response']['message']
      }
    } else {
      response.status(500)
      responseBody = {
        status: 500,
        message: exception['message']
      }
    }
    httpAdapter.reply(response, responseBody);
  }
}
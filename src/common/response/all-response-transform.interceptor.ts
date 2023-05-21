import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from './response.interface';

@Injectable()
export class AllResponseTransformInterceptor<T> implements NestInterceptor<Response<T>>
{
    intercept( context: ExecutionContext, next: CallHandler ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => ({
                status: context.switchToHttp().getResponse().statusCode,
                data: !data ? null : data,
            })),
        );
    }
}
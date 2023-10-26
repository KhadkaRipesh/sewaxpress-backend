import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { successResponse } from 'src/@utils';

export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<Response<T>>> {
    const message = this.reflector.get<string>('message', context.getHandler());
    const source = this.reflector.get<string>('source', context.getHandler());

    return next.handle().pipe(
      map((data) => {
        const success: successResponse = {
          success: true,
          source: source,
          data: data,
          message: message.replace('%s', source),
          status: 200,
        };
        return success;
      }),
    );
  }
}

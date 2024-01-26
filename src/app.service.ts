import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      health: 'ok',
      status: 200,
      docs: 'http://localhost:8848/docs/api',
      socket_docs: 'http://localhost:8848/docs/socket',
    };
  }
}

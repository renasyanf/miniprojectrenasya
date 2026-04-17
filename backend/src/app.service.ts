import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRootStatus() {
    return {
      statusCode: 200,
      data: {
        status: 'ok',
        service: 'auth-api',
      },
    };
  }
}

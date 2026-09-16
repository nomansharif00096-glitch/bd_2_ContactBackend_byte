import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  starting(): string {
    return 'Contact Form Backend Application!';
  }
}

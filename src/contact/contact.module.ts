import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { EmailService } from './email.service';

@Module({
  providers: [ContactService, EmailService],
  controllers: [ContactController],
})
export class ContactModule {}

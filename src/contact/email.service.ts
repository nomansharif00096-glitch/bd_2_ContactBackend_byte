import { Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: Number(this.configService.getOrThrow<string>('SMTP_PORT')) === 465,
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified.');
    } catch (error) {
      console.error(
        '[EmailService] SMTP verification failed at startup — check SMTP_* env vars:',
        error,
      );
    }
  }

  async sendingEmail(
    name: string,
    message: string,
    relayAddress: string,
  ): Promise<{ messageId: string; accepted: (string | nodemailer.SentMessageInfo)[] }> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${relayAddress}" <${this.configService.getOrThrow<string>('MAIL_FROM')}>`,
        replyTo: `"${relayAddress}" <${this.configService.getOrThrow<string>('MAIL_FROM')}>`,
        to: this.configService.getOrThrow<string>('CONTACT_RECEIVER'),
        text: [
          `Name: ${name}`,
          `Relay identity: ${relayAddress}`,
          '',
          'Message:',
          message,
        ].join('\n'),
      });

      return {
        messageId: info.messageId,
        accepted: info.accepted ?? [],
      };
    } catch (error) {
      console.error('[EmailService] send failed:', error);
      throw new ServiceUnavailableException({
        success: false,
        message: 'Your message could not be delivered. Please try again later.',
      });
    }
  }
}

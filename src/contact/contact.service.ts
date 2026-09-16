import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/createContactDto.dto';
import { randomBytes, randomUUID } from 'crypto';
import { join } from 'path';
import { mkdir, appendFile } from 'fs/promises';
import { EmailService } from './email.service';

@Injectable()
export class ContactService {
  constructor(private readonly emailService: EmailService) {}

  async formSubmission(createContactDto: CreateContactDto) {
    const hash = randomBytes(10).toString('hex');
    const relayAddress = `relay-${hash}@burner.local`;

    let delivery: { messageId: string; accepted: unknown[] };
    try {
      delivery = await this.emailService.sendingEmail(
        createContactDto.name,
        createContactDto.message,
        relayAddress,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('[ContactService] email delivery failed:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Could not deliver your message right now. Please try again later.',
      });
    }

    const storedAt = new Date().toISOString();
    const id = randomUUID();

    const record = {
      id,
      name: createContactDto.name,
      relayAddress,
      message: createContactDto.message,
      storedAt,
      delivery: {
        status: 'sent',
        messageId: delivery.messageId,
        accepted: delivery.accepted,
      },
    };

    try {
      const dataDirectory = join(process.cwd(), 'src/data');
      const storagePath = join(dataDirectory, 'submissions.jsonl');

      await mkdir(dataDirectory, { recursive: true });
      await appendFile(storagePath, `${JSON.stringify(record)}\n`, 'utf8');
    } catch (error) {
      console.error('[ContactService] failed to persist submission:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Message was sent but could not be recorded. Please contact support.',
      });
    }

    return {
      success: true,
      message: 'Submission received, forwarded, and stored successfully.',
      submission: {
        id,
        relayAddress,
        storedAt,
      },
    };
  }
}

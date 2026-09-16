import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/createContactDto.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('form')
  @HttpCode(HttpStatus.CREATED)
  async formSubmission(@Body() body: CreateContactDto) {
    return this.contactService.formSubmission(body);
  }
}

import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'name is required' })
  @MaxLength(100, { message: 'name must be 100 characters or fewer' })
  name!: string;

  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email!: string;

  @IsNotEmpty({ message: 'message is required' })
  @MinLength(2, { message: 'message must be at least 2 characters' })
  @MaxLength(5000, { message: 'message must be 5000 characters or fewer' })
  message!: string;
}

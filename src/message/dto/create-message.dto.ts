import { IsEmail, IsString, isString } from 'class-validator';
export class CreateMessageDto {
  @IsEmail()
  email: string;
  @IsString()
  name: string;
  @IsString()
  subject: string;
  @IsString()
  message: string;
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { DatabaseService } from '../database/database.service.js';
import { mapPrismaErrorToHttp } from '../common/handleError.js';
import { EmailService } from '../email_service/email_service.service.js';

@Injectable()
export class MessageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailService: EmailService,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    try {
      const { email, message, subject, name } = createMessageDto;

      if (!message) {
        throw new BadRequestException('Name and message are required');
      }

      const createdMessage = await this.databaseService.message.create({
        data: {
          email: email || 'No email',
          message: message,
          subject: subject || 'New Contact Form Submission',
          name: name || 'Anonymous',
        },
      });

      await this.emailService.sendMail(
        subject || 'New Contact Form Submission',
        message,
        name,
        email,
        'contact',
      );

      return createdMessage;
    } catch (error) {
      throw mapPrismaErrorToHttp(error);
    }
  }

  async findAll() {
    try {
      const messages = await this.databaseService.message.findMany({
        orderBy: { id: 'desc' },
      });
      return messages;
    } catch (error) {
      throw mapPrismaErrorToHttp(error);
    }
  }

  async findOne(id: number) {
    try {
      const message = await this.databaseService.message.findUnique({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }
      return message;
    } catch (error) {
      throw mapPrismaErrorToHttp(error);
    }
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    try {
      const existingMessage = await this.databaseService.message.findUnique({
        where: { id },
      });
      if (!existingMessage) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }

      const updatedMessage = await this.databaseService.message.update({
        where: { id },
        data: updateMessageDto,
      });

      return updatedMessage;
    } catch (error) {
      throw mapPrismaErrorToHttp(error);
    }
  }

  async remove(id: number) {
    try {
      const existingMessage = await this.databaseService.message.findUnique({
        where: { id },
      });
      if (!existingMessage) {
        throw new NotFoundException(`Message with id ${id} not found`);
      }

      await this.databaseService.message.delete({
        where: { id },
      });

      return { message: `Message with id ${id} deleted successfully` };
    } catch (error) {
      throw mapPrismaErrorToHttp(error);
    }
  }
}

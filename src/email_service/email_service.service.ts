import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.config.get<string>('EMAIL_USER'),
        pass: this.config.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"TechVibe Bot" <${this.config.get<string>('EMAIL_USER')}>`,
        to,
        subject,
        html,
      });

      return info;
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      throw error;
    }
  }
}

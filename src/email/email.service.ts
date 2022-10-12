import { Injectable } from '@nestjs/common';
import nodemailer = require('nodemailer');
import { config } from '../common/config';

type EmailOptions = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailSendingResponse {
  isEmailSent: boolean;
}

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(config.getEmailOptions());
  }

  public async send({
    email,
    title,
    message,
  }: {
    email: string;
    title: string;
    message: string;
  }): Promise<EmailSendingResponse> {
    try {
      await this.transporter.sendMail(
        this.generateOptions({ email, title, message }),
      );
      return {
        isEmailSent: true,
      };
    } catch (e) {
      return {
        isEmailSent: false,
      };
    }
  }

  private generateOptions({
    email,
    title,
    message,
  }: {
    email: string;
    title: string;
    message: string;
  }): EmailOptions {
    return {
      from: `Flanso <${config.get('EMAIL_LOGIN')}>`,
      to: email,
      subject: title,
      text: message,
      html: this.generateHtml(title, message),
    };
  }

  private generateHtml(title: string, body: string): string {
    return `<!DOCTYPE html>
			<html lang="ru">
			<head>
				<meta charset="UTF-8">
				<title>${title}</title>
			</head>
			<body>
				<h1>${title}</h1>
				<p>${body}</p>
			</body>
			</html>`;
  }
}

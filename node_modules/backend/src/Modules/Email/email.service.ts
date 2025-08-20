import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST', 'localhost');
    const port = Number(this.config.get<string>('SMTP_PORT', '587'));
    const secure = port === 465 || /^true$/i.test(this.config.get<string>('SMTP_SECURE', 'false'));

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    this.transporter.verify().then(
      () => this.logger.log(`SMTP OK: ${host}:${port} secure=${secure}`),
      (err) => this.logger.error('SMTP verify error', err),
    );
  }


  private resolveTemplatePath(name: string) {
   
    const distPath = join(__dirname, 'templates', `${name}.hbs`);
    if (fs.existsSync(distPath)) return distPath;

    
    const srcPath = join(process.cwd(), 'src', 'Modules', 'Email', 'templates', `${name}.hbs`);
    if (fs.existsSync(srcPath)) return srcPath;

  
    return distPath;
  }

  private async renderTemplate(name: string, context: any): Promise<string> {
    const templatePath = this.resolveTemplatePath(name);
    this.logger.debug(`Usando template: ${templatePath}`);
    const source = await fsp.readFile(templatePath, 'utf8');
    const tpl = Handlebars.compile(source);
    return tpl(context);
  }

  async enviarSolicitudBeca(
    dto: { nombre: string; cedula: string; telefono: string; correo?: string },
    attachments: Array<{ filename: string; path?: string; content?: Buffer | string; contentType?: string }>,
    solicitudId: string,
  ) {
    const adjuntosNombres = (attachments || []).map(a => a.filename);

    const html = await this.renderTemplate('solicitud-beca', {
      nombre: dto?.nombre || '-',
      cedula: dto?.cedula || '-',
      telefono: dto?.telefono || '-',
      solicitudId,
      adjuntos: adjuntosNombres, 
    });

    const to = (this.config.get<string>('MAIL_TO_BECAS', '') || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const subject = `Solicitud de Beca - ${dto?.cedula ?? ''}`.trim() || 'Solicitud de Beca';

    return this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM'),
      to,
      subject,
      html,
      attachments, 
    });
  }
}

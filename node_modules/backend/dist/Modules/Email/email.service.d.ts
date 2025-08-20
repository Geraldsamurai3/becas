import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService);
    private resolveTemplatePath;
    private renderTemplate;
    enviarSolicitudBeca(dto: {
        nombre: string;
        cedula: string;
        telefono: string;
        correo?: string;
    }, attachments: Array<{
        filename: string;
        path?: string;
        content?: Buffer | string;
        contentType?: string;
    }>, solicitudId: string): Promise<any>;
}

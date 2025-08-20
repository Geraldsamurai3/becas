import { BecaService } from './beca.service';
export declare class BecaController {
    private readonly becaService;
    constructor(becaService: BecaService);
    enviarSolicitud(createBecaDto: any, files: Express.Multer.File[]): Promise<{
        message: string;
        id: string;
        status: string;
    }>;
    private validarArchivosRequeridos;
    private procesarDatosFormulario;
}

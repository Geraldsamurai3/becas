import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { join, resolve } from 'path';
import * as fs from 'fs/promises';
import { PdfService } from '../Pdf/pdf.service';    
import { EmailService } from '../Email/email.service'; 

interface MiembroFamiliar {
  nombre: string;
  cedula: string;
  edad: number;
  parentesco: string;
  escolaridad: string;
  ocupacion: string;
  trabajo: string;
  ingreso: number;
  telefono: string;
  correo: string;
}
interface SolicitudData {
  fecha: string;
  nombre: string;
  cedula: string;
  edad: number;
  genero: string;
  correo: string;
  telefono: string;
  nacimiento: string;
  anio: string;
  otra_beca: string;
  ocupacion: string;
  distrito: string;
  direccion: string;
  centro: string;
  correo_centro: string;
  director: string;
  encargado: string;
  distrito_centro: string;
  direccion_centro: string;
  vulnerabilidad: string;
  firma: string;
  nf_miembros: MiembroFamiliar[];
}

@Injectable()
export class BecaService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
  ) {}

  async procesarSolicitud(
    solicitudData: SolicitudData,
    files: Express.Multer.File[] = [],          
  ) {
    const solicitudId = uuidv4();

    try {
   
      const pdfBuffer = await this.pdfService.generarPdfSolicitud(
        solicitudData,
        solicitudId,
      );

   
      const attachments = [
        {
          filename: `solicitud_beca_${solicitudId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
        ...files.map((file) => ({
          filename: this.obtenerNombreArchivoOriginal(file),
         
          path: this.getArchivoPath(file, true),
          contentType: file.mimetype,
        })),
      ];

     
      await this.emailService.enviarSolicitudBeca(
        solicitudData,
        attachments,
        solicitudId,
      );

     
      await this.limpiarArchivosTemporales(files);

      return {
        id: solicitudId,
        status: 'enviado',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      await this.limpiarArchivosTemporales(files);
      throw error;
    }
  }

  private obtenerNombreArchivoOriginal(file: Express.Multer.File): string {
    const friendly: Record<string, string> = {
      cedula_file: 'Cedula_de_Identidad',
      notas_file: 'Notas_de_Calificacion',
      constancia_file: 'Constancia_de_Estudios',
      foto_file: 'Foto_Pasaporte',
      iban_file: 'Constancia_Bancaria_IBAN',
      sinirube_file: 'Reporte_SINIRUBE',
      jurada_file: 'Declaracion_Jurada',
    };

    const base = (file.originalname || '').replace(/\.[^.]+$/, '').toLowerCase();
    const ext = (file.originalname.split('.').pop() || '').toLowerCase();

    const nombreAmigable = friendly[base] || base || 'documento';
    const seguro = this.sanitizarNombre(nombreAmigable);
    return ext ? `${seguro}.${ext}` : seguro;
  }

  private sanitizarNombre(n: string): string {
    return (n || 'archivo').replace(/[^\w.\-]+/g, '_');
  }

  
  private getArchivoPath(file: Express.Multer.File, absolute = false): string {
    const anyFile = file as any;
    const rel = anyFile.path ?? join('./uploads', file.filename);
    return absolute ? resolve(rel) : rel;
  }

  private async limpiarArchivosTemporales(files: Express.Multer.File[]) {
    await Promise.all(
      (files || []).map(async (file) => {
        try {
          const p = this.getArchivoPath(file, true);
          await fs.unlink(p);
        } catch {
         
        }
      }),
    );
  }
}

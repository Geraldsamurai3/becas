import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BecaService } from './beca.service';

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

@ApiTags('beca')
@Controller('beca')
export class BecaController {
  constructor(private readonly becaService: BecaService) {}

  @Post('solicitud')
  @ApiOperation({ summary: 'Enviar solicitud de beca' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Solicitud enviada correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o archivos faltantes' })
  @UseInterceptors(
  FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const base = file.originalname.replace(/[^\w.\-]/g, '_'); 
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${base.replace(/\.[^.]+$/, '')}-${unique}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedExt = new Set(['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.docx']);
      const allowedMime = new Set([
        'image/jpeg',
        'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]);
      const extOk = allowedExt.has(extname(file.originalname).toLowerCase());
      const mimeOk = allowedMime.has(file.mimetype);
      if (extOk && mimeOk) return cb(null, true);
      if (extOk) return cb(null, true);
      cb(new BadRequestException('Tipo de archivo no permitido'), false);
    },
    limits: { fileSize: 30 * 1024 * 1024 },
  }),
)
async enviarSolicitud(@Body() createBecaDto: any, @UploadedFiles() files: Express.Multer.File[]) {
  try {
    const solicitudData = this.procesarDatosFormulario(createBecaDto);
    this.validarArchivosRequeridos(files);
    const resultado = await this.becaService.procesarSolicitud(solicitudData, files);
    return { message: 'Solicitud enviada correctamente', id: resultado.id, status: 'success' };
  } catch (error: any) {
    if (error instanceof HttpException) throw error; 
    throw new HttpException({ message: 'Error al procesar la solicitud', error: error.message }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

private validarArchivosRequeridos(files: Express.Multer.File[]) {
  const requeridos = [
    'cedula_file',
    'notas_file',
    'constancia_file',
    'foto_file',
    'iban_file',
    'sinirube_file',
    'jurada_file',
  ];
  const base = (n: string) => n.replace(/\.[^.]+$/, '').toLowerCase();
  const subidosPorNombre = new Set(files.map(f => base(f.originalname))); 
  const faltantes = requeridos.filter(r => !subidosPorNombre.has(r));
  if (faltantes.length) throw new BadRequestException(`Faltan los siguientes archivos: ${faltantes.join(', ')}`);
}
  private procesarDatosFormulario(data: any): SolicitudData {
    const nf_miembros: MiembroFamiliar[] = [];
    
    if (Array.isArray(data.nf_nombre)) {
      for (let i = 0; i < data.nf_nombre.length; i++) {
        if (data.nf_nombre[i]) {
          const miembro: MiembroFamiliar = {
            nombre: data.nf_nombre[i] || '',
            cedula: data.nf_cedula?.[i] || '',
            edad: parseInt(data.nf_edad?.[i] || '0') || 0,
            parentesco: data.nf_parentesco?.[i] || '',
            escolaridad: data.nf_escolaridad?.[i] || '',
            ocupacion: data.nf_ocupacion?.[i] || '',
            trabajo: data.nf_trabajo?.[i] || '',
            ingreso: parseFloat(data.nf_ingreso?.[i] || '0') || 0,
            telefono: data.nf_telefono?.[i] || '',
            correo: data.nf_correo?.[i] || '',
          };
          nf_miembros.push(miembro);
        }
      }
    } else if (data.nf_nombre) {
      const miembro: MiembroFamiliar = {
        nombre: data.nf_nombre || '',
        cedula: data.nf_cedula || '',
        edad: parseInt(data.nf_edad || '0') || 0,
        parentesco: data.nf_parentesco || '',
        escolaridad: data.nf_escolaridad || '',
        ocupacion: data.nf_ocupacion || '',
        trabajo: data.nf_trabajo || '',
        ingreso: parseFloat(data.nf_ingreso || '0') || 0,
        telefono: data.nf_telefono || '',
        correo: data.nf_correo || '',
      };
      nf_miembros.push(miembro);
    }

    const solicitudData: SolicitudData = {
      fecha: data.fecha || '',
      nombre: data.nombre || '',
      cedula: data.cedula || '',
      edad: parseInt(data.edad || '0') || 0,
      genero: data.genero || '',
      correo: data.correo || '',
      telefono: data.telefono || '',
      nacimiento: data.nacimiento || '',
      anio: data.anio || '',
      otra_beca: data.otra_beca || '',
      ocupacion: data.ocupacion || '',
      distrito: data.distrito || '',
      direccion: data.direccion || '',
      centro: data.centro || '',
      correo_centro: data.correo_centro || '',
      director: data.director || '',
      encargado: data.encargado || '',
      distrito_centro: data.distrito_centro || '',
      direccion_centro: data.direccion_centro || '',
      vulnerabilidad: data.vulnerabilidad || '',
      firma: data.firma || '',
      nf_miembros,
    };

    return solicitudData;
  }

}
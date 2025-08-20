"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BecaController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const multer_1 = require("multer");
const path_1 = require("path");
const beca_service_1 = require("./beca.service");
let BecaController = class BecaController {
    becaService;
    constructor(becaService) {
        this.becaService = becaService;
    }
    async enviarSolicitud(createBecaDto, files) {
        try {
            const solicitudData = this.procesarDatosFormulario(createBecaDto);
            this.validarArchivosRequeridos(files);
            const resultado = await this.becaService.procesarSolicitud(solicitudData, files);
            return { message: 'Solicitud enviada correctamente', id: resultado.id, status: 'success' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException({ message: 'Error al procesar la solicitud', error: error.message }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    validarArchivosRequeridos(files) {
        const requeridos = [
            'cedula_file',
            'notas_file',
            'constancia_file',
            'foto_file',
            'iban_file',
            'sinirube_file',
            'jurada_file',
        ];
        const base = (n) => n.replace(/\.[^.]+$/, '').toLowerCase();
        const subidosPorNombre = new Set(files.map(f => base(f.originalname)));
        const faltantes = requeridos.filter(r => !subidosPorNombre.has(r));
        if (faltantes.length)
            throw new common_1.BadRequestException(`Faltan los siguientes archivos: ${faltantes.join(', ')}`);
    }
    procesarDatosFormulario(data) {
        const nf_miembros = [];
        if (Array.isArray(data.nf_nombre)) {
            for (let i = 0; i < data.nf_nombre.length; i++) {
                if (data.nf_nombre[i]) {
                    const miembro = {
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
        }
        else if (data.nf_nombre) {
            const miembro = {
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
        const solicitudData = {
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
};
exports.BecaController = BecaController;
__decorate([
    (0, common_1.Post)('solicitud'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar solicitud de beca' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Solicitud enviada correctamente' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o archivos faltantes' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const base = file.originalname.replace(/[^\w.\-]/g, '_');
                const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${base.replace(/\.[^.]+$/, '')}-${unique}${(0, path_1.extname)(file.originalname)}`);
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
            const extOk = allowedExt.has((0, path_1.extname)(file.originalname).toLowerCase());
            const mimeOk = allowedMime.has(file.mimetype);
            if (extOk && mimeOk)
                return cb(null, true);
            if (extOk)
                return cb(null, true);
            cb(new common_1.BadRequestException('Tipo de archivo no permitido'), false);
        },
        limits: { fileSize: 30 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], BecaController.prototype, "enviarSolicitud", null);
exports.BecaController = BecaController = __decorate([
    (0, swagger_1.ApiTags)('beca'),
    (0, common_1.Controller)('beca'),
    __metadata("design:paramtypes", [beca_service_1.BecaService])
], BecaController);
//# sourceMappingURL=beca.controller.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BecaService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const path_1 = require("path");
const fs = __importStar(require("fs/promises"));
const pdf_service_1 = require("../Pdf/pdf.service");
const email_service_1 = require("../Email/email.service");
let BecaService = class BecaService {
    pdfService;
    emailService;
    constructor(pdfService, emailService) {
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    async procesarSolicitud(solicitudData, files = []) {
        const solicitudId = (0, uuid_1.v4)();
        try {
            const pdfBuffer = await this.pdfService.generarPdfSolicitud(solicitudData, solicitudId);
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
            await this.emailService.enviarSolicitudBeca(solicitudData, attachments, solicitudId);
            await this.limpiarArchivosTemporales(files);
            return {
                id: solicitudId,
                status: 'enviado',
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            await this.limpiarArchivosTemporales(files);
            throw error;
        }
    }
    obtenerNombreArchivoOriginal(file) {
        const friendly = {
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
    sanitizarNombre(n) {
        return (n || 'archivo').replace(/[^\w.\-]+/g, '_');
    }
    getArchivoPath(file, absolute = false) {
        const anyFile = file;
        const rel = anyFile.path ?? (0, path_1.join)('./uploads', file.filename);
        return absolute ? (0, path_1.resolve)(rel) : rel;
    }
    async limpiarArchivosTemporales(files) {
        await Promise.all((files || []).map(async (file) => {
            try {
                const p = this.getArchivoPath(file, true);
                await fs.unlink(p);
            }
            catch {
            }
        }));
    }
};
exports.BecaService = BecaService;
exports.BecaService = BecaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pdf_service_1.PdfService,
        email_service_1.EmailService])
], BecaService);
//# sourceMappingURL=beca.service.js.map
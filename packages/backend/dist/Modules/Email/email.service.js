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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
const path_1 = require("path");
const fs = __importStar(require("fs"));
const fsp = __importStar(require("fs/promises"));
const Handlebars = __importStar(require("handlebars"));
let EmailService = EmailService_1 = class EmailService {
    config;
    logger = new common_1.Logger(EmailService_1.name);
    transporter;
    constructor(config) {
        this.config = config;
        const host = this.config.get('SMTP_HOST', 'localhost');
        const port = Number(this.config.get('SMTP_PORT', '587'));
        const secure = port === 465 || /^true$/i.test(this.config.get('SMTP_SECURE', 'false'));
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user: this.config.get('SMTP_USER'),
                pass: this.config.get('SMTP_PASS'),
            },
        });
        this.transporter.verify().then(() => this.logger.log(`SMTP OK: ${host}:${port} secure=${secure}`), (err) => this.logger.error('SMTP verify error', err));
    }
    resolveTemplatePath(name) {
        const distPath = (0, path_1.join)(__dirname, 'templates', `${name}.hbs`);
        if (fs.existsSync(distPath))
            return distPath;
        const srcPath = (0, path_1.join)(process.cwd(), 'src', 'Modules', 'Email', 'templates', `${name}.hbs`);
        if (fs.existsSync(srcPath))
            return srcPath;
        return distPath;
    }
    async renderTemplate(name, context) {
        const templatePath = this.resolveTemplatePath(name);
        this.logger.debug(`Usando template: ${templatePath}`);
        const source = await fsp.readFile(templatePath, 'utf8');
        const tpl = Handlebars.compile(source);
        return tpl(context);
    }
    async enviarSolicitudBeca(dto, attachments, solicitudId) {
        const adjuntosNombres = (attachments || []).map(a => a.filename);
        const html = await this.renderTemplate('solicitud-beca', {
            nombre: dto?.nombre || '-',
            cedula: dto?.cedula || '-',
            telefono: dto?.telefono || '-',
            solicitudId,
            adjuntos: adjuntosNombres,
        });
        const to = (this.config.get('MAIL_TO_BECAS', '') || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        const subject = `Solicitud de Beca - ${dto?.cedula ?? ''}`.trim() || 'Solicitud de Beca';
        return this.transporter.sendMail({
            from: this.config.get('SMTP_FROM'),
            to,
            subject,
            html,
            attachments,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map
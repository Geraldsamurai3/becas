import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument = require('pdfkit');

type AnyObj = Record<string, any>;

@Injectable()
export class PdfService {
  async generarPdfSolicitud(
    data: AnyObj,
    solicitudId: string,
    logoPath?: string, 
  ): Promise<Buffer> {
    const d = data || {};
    const nf: AnyObj[] = Array.isArray(d.nf_miembros) ? d.nf_miembros : [];

    const DEFAULT_LOGO_REL = 'assets/Logo.png';

    const resolveLogoPath = (raw?: string): string | null => {
      const candidates: string[] = [];
      if (raw) candidates.push(path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw));
      candidates.push(path.resolve(process.cwd(), DEFAULT_LOGO_REL));
      candidates.push(path.resolve(__dirname, '..', '..', DEFAULT_LOGO_REL));
      candidates.push(path.resolve(__dirname, '..', DEFAULT_LOGO_REL));
      candidates.push(path.resolve(__dirname, DEFAULT_LOGO_REL));
      for (const p of candidates) {
        try { if (fs.existsSync(p)) return p; } catch {}
      }
      return null;
    };

    const logoResolved = resolveLogoPath(logoPath);

    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 70, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const contentW = () => doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = () => doc.page.margins.left;
      const endX = () => doc.page.width - doc.page.margins.right;
      const bottomY = () => doc.page.height - doc.page.margins.bottom;

      const colors = {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1e293b',
        light: '#94a3b8',
        border: '#e2e8f0',
        background: '#f8fafc',
      };

      const COL_GAP = 25; 
      const getCols = () => {
        const colW = (contentW() - (COL_GAP * 2)) / 3; 
        const x1 = startX();
        const x2 = startX() + colW + COL_GAP;
        const x3 = startX() + (colW + COL_GAP) * 2;
        return { colW, x1, x2, x3 };
      };

      const drawHeader = () => {
        const logoSize = 60;
        const headerY = 15;
        
        const logoX = startX();

        try {
          if (logoResolved) {
            const img = fs.readFileSync(logoResolved);
            doc.image(img, logoX, headerY, { width: logoSize, height: logoSize, fit: [logoSize, logoSize] });
          }
        } catch {}

        const textStartX = startX();
        const textWidth = contentW(); 

        doc.fontSize(16).fillColor(colors.text).font('Helvetica-Bold')
          .text('MUNICIPALIDAD DE SANTA CRUZ', textStartX, headerY, { width: textWidth, align: 'center' });

        doc.fontSize(12).fillColor(colors.secondary).font('Helvetica')
          .text('GUANACASTE, COSTA RICA', textStartX, headerY + 20, { width: textWidth, align: 'center' });

        doc.fontSize(10).fillColor(colors.light).font('Helvetica')
          .text('Departamento de Desarrollo Social y Familia', textStartX, headerY + 35, { width: textWidth, align: 'center' });

        doc.moveTo(startX(), headerY + logoSize + 10).lineTo(endX(), headerY + logoSize + 10)
          .strokeColor(colors.text).lineWidth(2).stroke();

        doc.moveTo(startX(), headerY + logoSize + 15).lineTo(endX(), headerY + logoSize + 15)
          .strokeColor(colors.secondary).lineWidth(0.5).stroke();
      };

      const ensureSpace = (needed: number) => {
        const available = bottomY() - doc.y - 30;
        if (available < needed) {
          doc.addPage();
          drawHeader();
          doc.y = doc.page.margins.top + 30; 
        }
      };

      const drawField = (label: string, value: any, x: number, width: number) => {
        const contentValue = value == null || value === '' ? '-' : String(value);
        doc.fontSize(9).fillColor(colors.primary).font('Helvetica-Bold')
          .text(label.toUpperCase(), x, doc.y);
        doc.fontSize(11).fillColor(colors.text).font('Helvetica')
          .text(contentValue, x, doc.y + 15, { width: width - 10 });
        return 45; 
      };

      const threeFields = (l1: string, v1: any, l2: string, v2: any, l3: string, v3: any) => {
        ensureSpace(55);
        const { colW, x1, x2, x3 } = getCols();
        const y = doc.y;
        doc.y = y; drawField(l1, v1, x1, colW);
        doc.y = y; drawField(l2, v2, x2, colW);
        doc.y = y; drawField(l3, v3, x3, colW);
        doc.y = y + 50;
      };

      const twoFields = (l1: string, v1: any, l2: string, v2: any) => {
        ensureSpace(55);
        const { colW, x1, x3 } = getCols(); 
        const y = doc.y;
        doc.y = y; drawField(l1, v1, x1, colW);
        doc.y = y; drawField(l2, v2, x3, colW);
        doc.y = y + 50;
      };

      const fullField = (label: string, value: any) => {
        ensureSpace(55);
        drawField(label, value, startX(), contentW());
        doc.y += 50;
      };

      const sectionTitle = (title: string) => {
        ensureSpace(65);
        doc.rect(startX(), doc.y, contentW(), 35).fillColor(colors.background).fill();
        doc.rect(startX(), doc.y, 4, 35).fillColor(colors.primary).fill();
        doc.fontSize(14).fillColor(colors.primary).font('Helvetica-Bold')
          .text(title, startX() + 15, doc.y + 10);
        doc.y += 55;
      };

      const subTitle = (title: string) => {
        doc.fontSize(12).fillColor(colors.secondary).font('Helvetica-Bold')
          .text(title, startX(), doc.y);
        doc.y += 30;
      };

      drawHeader();
      doc.y = doc.page.margins.top + 30; 

      try {
        doc.fontSize(20).fillColor(colors.text).font('Helvetica-Bold')
          .text('Solicitud de Beca Estudiantil', startX(), doc.y, { width: contentW(), align: 'center' });
        doc.y += 30;

        doc.fontSize(10).fillColor(colors.light).font('Helvetica').text('ID DE SOLICITUD', startX(), doc.y);
        doc.fontSize(12).fillColor(colors.text).font('Helvetica-Bold').text(solicitudId, startX(), doc.y + 12);
        doc.y += 40;

        sectionTitle('1. Datos del Solicitante');
        threeFields('Fecha', d.fecha, 'Nombre', d.nombre, 'Cédula', d.cedula ?? d.identificacion);
        threeFields('Edad', d.edad, 'Género', d.genero, 'Teléfono', d.telefono);
        twoFields('Correo electrónico', d.correo, 'Fecha de nacimiento', d.nacimiento);
        twoFields('Año en curso', d.anio, 'Recibe otra beca', d.otra_beca);
        twoFields('Ocupación', d.ocupacion, 'Distrito', d.distrito);
        fullField('Dirección y características de vivienda', d.direccion);

        if (!nf.length) {
          sectionTitle('2. Núcleo Familiar');
          doc.fontSize(11).fillColor(colors.light).font('Helvetica-Oblique')
            .text('No se registraron miembros del núcleo familiar', startX(), doc.y);
          doc.y += 30;
        } else {
          const totalHeight = 55 + nf.length * 220;
          const available = bottomY() - doc.y - 30;
          if (available < totalHeight) {
            doc.addPage();
            drawHeader();
            doc.y = doc.page.margins.top + 30; 
          }

          sectionTitle('2. Núcleo Familiar');
          nf.forEach((member: AnyObj, idx: number) => {
            subTitle(`Miembro ${idx + 1}`);
            threeFields('Nombre', member?.nombre, 'Cédula', member?.cedula, 'Edad', member?.edad);
            threeFields('Parentesco', member?.parentesco, 'Escolaridad', member?.escolaridad, 'Ocupación', member?.ocupacion);
            twoFields('Lugar de trabajo', member?.trabajo, 'Ingreso mensual', member?.ingreso ? `${Number(member.ingreso).toLocaleString('es-CR')}` : '');
            twoFields('Teléfono', member?.telefono, 'Correo electrónico', member?.correo);
            doc.y += 20;
          });
        }

        sectionTitle('3. Centro Educativo');
        twoFields('Centro educativo', d.centro, 'Correo del centro', d.correo_centro);
        twoFields('Director(a)', d.director, 'Encargado de becas', d.encargado);
        fullField('Distrito del centro', d.distrito_centro);
        fullField('Dirección del centro educativo', d.direccion_centro);

        sectionTitle('4. Situación de Vulnerabilidad');
        fullField('Descripción de la situación', d.vulnerabilidad);

        sectionTitle('5. Datos del Firmante');
        twoFields('Nombre del firmante', d.firma, 'Fecha de firma', d.fecha);
      } catch (err) {
        reject(err);
        return;
      }

      doc.end();
    });
  }
}
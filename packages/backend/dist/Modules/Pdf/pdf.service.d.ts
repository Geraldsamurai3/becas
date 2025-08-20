type AnyObj = Record<string, any>;
export declare class PdfService {
    generarPdfSolicitud(data: AnyObj, solicitudId: string, logoPath?: string): Promise<Buffer>;
}
export {};

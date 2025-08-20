export declare class MiembroFamiliarDto {
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
export declare class CreateBecaDto {
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
    nf_miembros: MiembroFamiliarDto[];
    centro: string;
    correo_centro: string;
    director: string;
    encargado: string;
    distrito_centro: string;
    direccion_centro: string;
    vulnerabilidad: string;
    firma: string;
}

import { IsString, IsEmail, IsNumber, IsOptional, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MiembroFamiliarDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cedula: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  edad: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  escolaridad: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ocupacion: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trabajo: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  ingreso: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty()
  @IsEmail()
  correo: string;
}

export class CreateBecaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cedula: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  edad: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  genero: string;

  @ApiProperty()
  @IsEmail()
  correo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefono: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nacimiento: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  anio: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otra_beca: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ocupacion: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  distrito: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  direccion: string;


  @ApiProperty({ type: [MiembroFamiliarDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MiembroFamiliarDto)
  nf_miembros: MiembroFamiliarDto[];

  
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  centro: string;

  @ApiProperty()
  @IsEmail()
  correo_centro: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  director: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  encargado: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  distrito_centro: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  direccion_centro: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vulnerabilidad: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firma: string;
}
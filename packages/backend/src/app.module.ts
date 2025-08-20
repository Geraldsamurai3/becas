// src/app.module.ts
import { Module } from '@nestjs/common';
import { BecaModule } from './Modules/Beca/beca.module';
import { EmailModule } from './Modules/Email/email.module';
import { PdfModule } from './Modules/Pdf/pdf.module';

@Module({
  imports: [BecaModule,EmailModule,PdfModule],
})
export class AppModule {}

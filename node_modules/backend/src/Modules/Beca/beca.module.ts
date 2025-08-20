import { Module } from '@nestjs/common';
import { BecaService } from './beca.service';
import { BecaController } from './beca.controller';
import { PdfModule } from '../Pdf/pdf.module';
import { EmailModule } from '../Email/email.module';

@Module({
  imports: [PdfModule, EmailModule],
  controllers: [BecaController],
  providers: [BecaService],
})
export class BecaModule {}

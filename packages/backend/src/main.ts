// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
  console.log(`🚀 API en: ${await app.getUrl()}`);
}
bootstrap();

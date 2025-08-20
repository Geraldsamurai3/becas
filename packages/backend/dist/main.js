"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.setGlobalPrefix('api');
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
    console.log(`🚀 API en: ${await app.getUrl()}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map
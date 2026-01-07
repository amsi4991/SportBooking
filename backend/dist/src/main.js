"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: true,
    });
    // Debug: print all registered routes
    const expressApp = app.getHttpAdapter().getInstance();
    const routes = expressApp._router.stack
        .filter((layer) => layer.route || layer.name === 'router')
        .map((layer) => ({
        methods: layer.route?.methods || (layer.name === 'router' ? 'router' : 'unknown'),
        path: layer.route?.path || (layer.name === 'router' ? layer.regexp : 'unknown')
    }));
    console.log('📊 Registered routes count:', routes.length);
    console.log('📊 Routes:', JSON.stringify(routes, null, 2));
    await app.listen(3000);
    console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();

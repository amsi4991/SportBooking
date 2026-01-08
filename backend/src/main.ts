import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Abilita la validazione globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));
  
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Debug: print all registered routes
  const expressApp = app.getHttpAdapter().getInstance();
  const routes = expressApp._router.stack
    .filter((layer: any) => layer.route || layer.name === 'router')
    .map((layer: any) => ({
      methods: layer.route?.methods || (layer.name === 'router' ? 'router' : 'unknown'),
      path: layer.route?.path || (layer.name === 'router' ? layer.regexp : 'unknown')
    }));
  console.log('📊 Registered routes count:', routes.length);
  console.log('📊 Routes:', JSON.stringify(routes, null, 2));
  
  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
}

bootstrap();
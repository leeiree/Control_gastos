import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS para que el frontend pueda conectarse
  app.enableCors({
    origin: 'http://localhost:4200', // Permitir solo peticiones desde Angular
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('Backend corriendo en http://localhost:3000');
}
bootstrap();

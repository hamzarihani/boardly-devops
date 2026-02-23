import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // Allow all origins, or specify an array of allowed origins: ['http://localhost:3000', 'https://your-domain.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  } );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
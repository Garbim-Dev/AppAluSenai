import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AlunosModule } from './alunos/alunos.module';

@Module({
  imports: [PrismaModule, AlunosModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { StatusCadastro } from '@prisma/client';

@Controller('api/alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Post()
  create(@Body() dto: CreateAlunoDto) {
    return this.alunosService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: StatusCadastro) {
    return this.alunosService.findAll(status);
  }

  @Get('check-cpf/:cpf')
  checkCpf(@Param('cpf') cpf: string) {
    return this.alunosService.findByCpf(cpf);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: StatusCadastro,
    @Body('observacoes') observacoes?: string,
  ) {
    return this.alunosService.updateStatus(Number(id), status, observacoes);
  }
}
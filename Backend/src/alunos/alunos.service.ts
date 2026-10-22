import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { StatusCadastro } from '@prisma/client';

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlunoDto) {
    const existing = await this.prisma.aluno.findUnique({
      where: { cpf: dto.cpf },
    });

    if (existing) {
      throw new ConflictException('Já existe um cadastro com este CPF.');
    }

    return this.prisma.aluno.create({
      data: {
        ...dto,
        dataNascimento: new Date(dto.dataNascimento),
        rgDataEmissao: dto.rgDataEmissao ? new Date(dto.rgDataEmissao) : null,
        maeDataNascimento: dto.maeDataNascimento ? new Date(dto.maeDataNascimento) : null,
      },
    });
  }

  async findAll(status?: StatusCadastro) {
    return this.prisma.aluno.findMany({
      where: status ? { statusCadastro: status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCpf(cpf: string) {
    const cleanCPF = cpf.replace(/\D/g, '');
    const aluno = await this.prisma.aluno.findUnique({
      where: { cpf: cleanCPF },
      select: {
        id: true,
        nomeCompleto: true,
        curso: true,
        turno: true,
        statusCadastro: true,
      },
    });

    if (!aluno) {
      return { existe: false };
    }
    return { existe: true, aluno };
  }

  async updateStatus(id: number, status: StatusCadastro, observacoes?: string) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id } });
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado.');
    }

    return this.prisma.aluno.update({
      where: { id },
      data: {
        statusCadastro: status,
        observacoesSecretaria: observacoes,
      },
    });
  }
}
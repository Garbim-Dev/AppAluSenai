import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import {
  Turno,
  Sexo,
  EstadoCivil,
  Escolaridade,
  TipoEscola,
  Etnia,
  NecessidadeEspecial,
  SituacaoOcupacional,
} from '@prisma/client';
import { IsCPF } from '../validators/is-cpf.validator';

const cleanDigits = ({ value }: { value: any }) =>
  typeof value === 'string' ? value.replace(/\D/g, '') : value;

const toUpperTrim = ({ value }: { value: any }) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toUpperCase() : value;

export class CreateAlunoDto {
  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  curso: string;

  @IsEnum(Turno)
  turno: Turno;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  nomeCompleto: string;

  @IsOptional()
  @IsString()
  @Transform(toUpperTrim)
  nomeSocial?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(cleanDigits)
  rgNumero: string;

  @IsOptional()
  @IsDateString()
  rgDataEmissao?: string;

  @IsNotEmpty()
  @Transform(cleanDigits)
  @IsCPF()
  cpf: string;

  @IsNotEmpty()
  @IsDateString()
  dataNascimento: string;

  @IsOptional()
  @IsString()
  @Transform(cleanDigits)
  cnhNumero?: string;

  @IsOptional()
  @IsString()
  @Transform(toUpperTrim)
  cnhTipo?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  naturalidade: string;

  @IsOptional()
  @IsString()
  @Transform(toUpperTrim)
  nacionalidade?: string = 'BRASILEIRA';

  @IsEnum(Sexo)
  sexo: Sexo;

  @IsEnum(EstadoCivil)
  estadoCivil: EstadoCivil;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  nomeMae: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  @Transform(toUpperTrim)
  maeEstadoNatal?: string;

  @IsOptional()
  @IsString()
  @Transform(toUpperTrim)
  maeNaturalidade?: string;

  @IsOptional()
  @IsDateString()
  maeDataNascimento?: string;

  @IsOptional()
  @IsString()
  @Transform(toUpperTrim)
  nomePai?: string;

  @IsEnum(Escolaridade)
  escolaridade: Escolaridade;

  @IsEnum(TipoEscola)
  tipoEscolaOrigem: TipoEscola;

  @IsEnum(Etnia)
  etnia: Etnia;

  @IsOptional()
  @IsEnum(NecessidadeEspecial)
  necessidadeEspecial?: NecessidadeEspecial;

  @IsEnum(SituacaoOcupacional)
  situacaoOcupacional: SituacaoOcupacional;

  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  email: string;

  @IsNotEmpty()
  @Length(8, 8)
  @Transform(cleanDigits)
  cep: string;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  enderecoLogradouro: string;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  bairro: string;

  @IsNotEmpty()
  @IsString()
  @Transform(toUpperTrim)
  municipio: string;

  @IsNotEmpty()
  @Length(2, 2)
  @Transform(toUpperTrim)
  uf: string;

  @IsNotEmpty()
  @Length(11, 11)
  @Transform(cleanDigits)
  telefoneCelular: string;

  @IsOptional()
  @Transform(cleanDigits)
  telefoneResidencial?: string;

  @IsOptional()
  @Transform(cleanDigits)
  telefoneRecados?: string;

  @IsBoolean()
  termoLgpdAceito: boolean;
}
import { Regiao } from './types';

export const regioes: Regiao[] = [
  {
    id: 1,
    nome: "Avenida Central",
    irregularidades: ["buraco", "acostamento estreito"],
    rota_segura: false,
    tipo_permissao: ["motorista"]
  },
  {
    id: 2,
    nome: "Rua das Palmeiras",
    irregularidades: [],
    rota_segura: true,
    tipo_permissao: ["ciclista", "pedestre"]
  },
  {
    id: 3,
    nome: "Travessa da Escola",
    irregularidades: ["calçada estreita"],
    rota_segura: true,
    tipo_permissao: ["pedestre"]
  }
];

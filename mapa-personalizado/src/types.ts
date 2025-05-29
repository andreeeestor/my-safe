export type TipoUsuario = 'ciclista' | 'pedestre' | 'motorista';

export interface Preferencias {
  evitar_ruas_sem_ciclovia?: boolean;
  mostrar_irregularidades?: boolean;
}

export interface Usuario {
  tipo: TipoUsuario;
  preferencias: Preferencias;
}

export interface Regiao {
  id: number;
  nome: string;
  irregularidades: string[];
  rota_segura: boolean;
  tipo_permissao: TipoUsuario[];
}

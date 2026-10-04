// Mensagens entre cliente e servidor (WebSocket, JSON). O cliente importa só os tipos.

import type { StopSettings } from '../motor/autopass.ts';
import type { Answer } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';

export type Modo = '4p' | '1v1';
export type TipoAssento = 'humano' | 'bot' | 'vazio';

export interface AssentoPublico {
  indice: number;
  tipo: TipoAssento;
  nome: string | null;
  deck: string | null;
  conectado: boolean;
}

export interface SalaPublica {
  codigo: string;
  modo: Modo;
  estado: 'espera' | 'jogando' | 'fim';
  assentos: AssentoPublico[];
  anfitriao: number;
  /** semente da partida em andamento (registrada para reprodução) */
  semente: string | null;
}

export interface DeckResumo {
  id: string;
  nome: string;
  comandante: string;
  cores: string[];
}

/** imagem de cada carta/ficha pelo nome da definição */
export interface InfoCarta {
  /** id da imagem da frente (pasta em cartas/assets/cards) */
  f: string | null;
  /** id da imagem do verso, se a carta tiver duas faces */
  v: string | null;
  /** nome da impressão em português, se houver */
  pt: string | null;
  /** carta ainda sem definição: o efeito é aplicado no modo manual */
  pendente: boolean;
  /** texto Oracle em inglês (para o zoom e para as pendentes) */
  oracle: string;
  /** é uma ficha (para o ajuste manual "criar ficha") */
  ficha?: boolean;
  /** nome para mostrar */
  nome?: string;
}

export type MsgCliente =
  | { t: 'criar'; nome: string; senhaSala: string; modo: Modo }
  | { t: 'entrar'; codigo: string; senhaSala: string; nome: string }
  | { t: 'retomar'; codigo: string; token: string }
  | { t: 'deck'; deck: string }
  | { t: 'bot'; assento: number; deck: string | null }
  | { t: 'iniciar' }
  | { t: 'responder'; decisao: number; resposta: Answer }
  | { t: 'paradas'; paradas: StopSettings }
  | { t: 'passarTurno' }
  | { t: 'conceder' }
  | { t: 'sair' }
  | { t: 'novaPartida' };

export type MsgServidor =
  | { t: 'sala'; sala: SalaPublica; voce: number; token: string }
  | { t: 'jogo'; vista: GameView; paradas: StopSettings }
  | { t: 'saiu' }
  | { t: 'erro'; msg: string };

// Mensagens entre cliente e servidor (WebSocket, JSON). O cliente importa só os tipos.

import type { StopSettings } from '../motor/autopass.ts';
import type { Answer } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';

export type Modo = '4p' | '1v1';
export type RegraMulligan = 'londres' | 'livre';
/** auxílios da interface (brilhos, avisos, pagar automaticamente): cada um escolhe, ou a sala proíbe todos */
export type RegraAuxilios = 'permitidos' | 'proibidos';
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
  /** regra de mulligan escolhida por quem criou a sala */
  mulligan: RegraMulligan;
  /** regra de auxílios escolhida por quem criou a sala */
  auxilios: RegraAuxilios;
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

/** uma linha do que um pedido de desfazer vai voltar */
export interface LinhaDesfeita {
  texto: string;
  /** a linha é de outro jogador (jogada que volta junto) */
  outro: boolean;
}

/** pedido de desfazer aberto: a mesa fica parada até todos os humanos aceitarem */
export interface PedidoDesfazer {
  de: number;
  linhas: LinhaDesfeita[];
  aceitaram: number[];
  faltam: number[];
  /** tempo que falta para o pedido expirar, quando a mensagem saiu, e o prazo inteiro */
  restanteMs: number;
  totalMs: number;
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
  | { t: 'novaPartida' }
  /** posição de uma permanente sua na sua área (x e y de 0 a 1), ou de várias de uma vez (`lista`, grupo
   * selecionado); limpar: volta a arrumação padrão (de uma ou de todas) */
  | { t: 'posicao'; obj?: number; x?: number; y?: number; limpar?: boolean; lista?: { obj: number; x: number; y: number }[] }
  | { t: 'mulligan'; regra: RegraMulligan }
  | { t: 'auxilios'; regra: RegraAuxilios }
  /** pedir para desfazer a sua última jogada deste turno; responder ou cancelar um pedido aberto */
  | { t: 'desfazer' }
  | { t: 'desfazerResposta'; aceitar: boolean }
  | { t: 'desfazerCancelar' }
  /** mostrar uma carta da sua mão a todos ou a alguns jogadores */
  | { t: 'revelar'; obj: number; para: number[] | 'todos' };

/** posição escolhida para cada permanente, pelo id do objeto: [x, y] de 0 a 1 dentro da área de quem a controla */
export type Posicoes = Record<string, [number, number]>;

export type MsgServidor =
  | { t: 'sala'; sala: SalaPublica; voce: number; token: string }
  | { t: 'jogo'; vista: GameView; paradas: StopSettings; posicoes: Posicoes; desfazivel: boolean; desfazer: PedidoDesfazer | null }
  /** aviso curto para a mesa (pedido de desfazer aceito, recusado ou expirado) */
  | { t: 'aviso'; msg: string }
  | { t: 'saiu' }
  /** alguém mostrou uma carta da mão (para quem recebeu e para quem mostrou) */
  | { t: 'revelada'; de: number; def: string; nome: string; para: number[] | 'todos' }
  | { t: 'erro'; msg: string };

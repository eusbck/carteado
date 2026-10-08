// Mensagens entre cliente e servidor (WebSocket, JSON). O cliente importa só os tipos.

import type { NivelBot } from '../bots/niveis.ts';
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
  /** nível do bot (null para pessoas e assentos vazios) */
  nivel?: NivelBot | null;
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

/** uma carta na tela Decks */
export interface CartaCatalogo {
  nome: string;
  quantidade: number;
  /** nome da impressão em português, se houver */
  pt: string | null;
  /** id da imagem (/img/<id>/frente/p), se houver */
  img: string | null;
  tipo: string;
  /** a carta já tem regras no jogo */
  pronta: boolean;
}

/** um deck na tela Decks (jogável ou não) */
export interface DeckCatalogo {
  id: string;
  nome: string;
  link: string;
  comandante: string;
  comandantePt: string | null;
  cores: string[];
  /** id da imagem do comandante (arte de fundo do cartão) */
  arte: string | null;
  /** pronto: no saguão; preparacao: falta implementar cartas; atualizacao: jogável, com uma versão nova esperando cartas */
  estado: 'pronto' | 'preparacao' | 'atualizacao';
  importadoEm: string;
  verificadoEm: string | null;
  /** data da versão no Moxfield */
  atualizadoEm: string | null;
  /** cartas diferentes da lista (com o comandante) */
  total: number;
  /** versão que espera cartas: um deck novo ou uma atualização */
  preparacao: {
    prontas: number;
    total: number;
    faltam: CartaCatalogo[];
    entram: CartaCatalogo[];
    saem: CartaCatalogo[];
    comandante: { de: string; para: string } | null;
    recebidaEm: string;
  } | null;
}

/** o que confirmar a importação ou a atualização vai fazer (passo 1, nada gravado ainda) */
export interface Proposta {
  token: string;
  id: string;
  nome: string;
  link: string;
  /** o deck ainda não está na mesa */
  novo: boolean;
  comandante: string;
  comandantePt: string | null;
  /** cartas diferentes da lista nova (com o comandante) e quantas já têm regras */
  total: number;
  prontas: number;
  faltam: CartaCatalogo[];
  /** diferença para a lista atual (ou para a em preparação, num deck que ainda não está na mesa) */
  entram: CartaCatalogo[];
  saem: CartaCatalogo[];
  trocaComandante: { de: string; para: string } | null;
  /** jogavel: entra no saguão ao confirmar; preparacao: fica esperando as cartas; nada: não mudou nada */
  destino: 'jogavel' | 'preparacao' | 'nada';
  /** o que confirmar faz, em uma frase */
  resumo: string;
  /** regras de deck que a lista não cumpre: impedem confirmar */
  erros: string[];
  avisos: string[];
}

/** importação ou atualização em andamento (uma por vez para a mesa toda) */
export interface TarefaPublica {
  id: number;
  tipo: 'verificar' | 'confirmar';
  deck: string | null;
  nome: string | null;
  etapa: string;
  feito: number;
  total: number;
  estado: 'andando' | 'pronta' | 'erro';
  erro?: string;
  proposta?: Proposta;
  resultado?: { id: string; destino: 'jogavel' | 'preparacao' | 'nada'; texto: string };
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
  /** pôr (ou trocar o deck ou o nível de) um bot num assento; deck null tira o bot */
  | { t: 'bot'; assento: number; deck: string | null; nivel?: NivelBot }
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
  /** um bot está pensando há mais de um segundo (null: ninguém) */
  | { t: 'pensando'; assento: number | null }
  /** a lista de decks do saguão mudou (deck importado ou atualizado) */
  | { t: 'decks'; decks: DeckResumo[] }
  /** andamento de uma importação ou atualização de deck (null: nenhuma); `mudou`: o catálogo mudou */
  | { t: 'catalogo'; tarefa: TarefaPublica | null; mudou: boolean }
  | { t: 'erro'; msg: string };

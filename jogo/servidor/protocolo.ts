// Mensagens entre cliente e servidor (WebSocket, JSON). O cliente importa só os tipos; o servidor usa também o
// validador das mensagens do cliente (validarMsg, no fim).

import type { NivelBot } from '../bots/niveis.ts';
import type { StopSettings } from '../motor/autopass.ts';
import type { ModoJogo } from '../motor/modos.ts';
import type { MotivoZona } from '../motor/diario.ts';
import type { Answer, ManaType, ObjId, PlayerId, Step, ZoneName } from '../motor/types.ts';
import type { GameView } from '../motor/view.ts';

/** jeito antigo de pedir o tamanho da sala ('4p': quatro lugares, '1v1': dois); hoje vale `lugares`, de 2 a 6 */
export type Modo = '4p' | '1v1';
export type RegraMulligan = 'londres' | 'livre';
/** auxílios da interface (brilhos, avisos, pagar automaticamente): cada um escolhe, ou a sala proíbe todos */
export type RegraAuxilios = 'permitidos' | 'proibidos';
export type TipoAssento = 'humano' | 'bot' | 'vazio';
/** passos do saguão, um de cada vez: quem joga entra (e o anfitrião põe bots), o anfitrião define as regras, cada um
 * escolhe o deck. O anfitrião avança; a sala volta para os lugares quando um lugar vaga. */
export type EtapaSaguao = 'lugares' | 'regras' | 'decks';

export interface AssentoPublico {
  indice: number;
  tipo: TipoAssento;
  nome: string | null;
  deck: string | null;
  conectado: boolean;
  /** nível do bot (null para pessoas e assentos vazios) */
  nivel?: NivelBot | null;
  /** retrato escolhido (servidor/avatares.ts); null: o do comandante do deck, ou a inicial do nome */
  avatar?: string | null;
}

/** o número de lugares da sala é o tamanho de `assentos` (de MIN_LUGARES a MAX_ASSENTOS) */
export interface SalaPublica {
  codigo: string;
  estado: 'espera' | 'jogando' | 'fim';
  assentos: AssentoPublico[];
  anfitriao: number;
  /** regra de mulligan escolhida por quem criou a sala */
  mulligan: RegraMulligan;
  /** regra de auxílios escolhida por quem criou a sala */
  auxilios: RegraAuxilios;
  /** identificador da partida (hash curto da semente; null sem partida). A semente fica só no servidor: com ela dava
   * para refazer os embaralhamentos e ver o grimório e a mão de todos */
  partida: string | null;
  /** tempo corrido da partida, em ms desde a época Unix; null sem partida ou numa salva antes deste registro */
  cronometro: { iniciadaEm: number; encerradaEm: number | null } | null;
  /** passo do saguão em que a sala está (vale com a sala esperando) */
  etapa: EtapaSaguao;
  /** nomes de quem está assistindo agora (conectados), na ordem de chegada */
  espectadores: string[];
  /** modo de jogo da sala (motor/modos.ts): o saguão só mostra os decks dele */
  formato: ModoJogo;
}

/** de onde o deck vem (servidor/catalogo/origem.ts): precon igual ao produto, precon com cartas trocadas, lista
 * montada por alguém ou deck criado aqui */
export interface OrigemPublica {
  tipo: 'precon' | 'modificado' | 'montado' | 'casa';
  /** o precon oficial (precon e modificado) */
  produto?: string;
  /** cartas trocadas em relação ao precon (modificado) */
  trocas?: number;
}

export interface DeckResumo {
  id: string;
  nome: string;
  /** modo de jogo do deck (motor/modos.ts) */
  formato: ModoJogo;
  /** null nos decks sem comandante (Standard) */
  comandante: string | null;
  /** segundo comandante (parceiros) */
  parceiro?: string | null;
  /** carta que ilustra o deck: o comandante ou, sem ele, a capa escolhida */
  capa: string;
  /** cartas no deck (com o comandante) */
  total: number;
  cores: string[];
  origem?: OrigemPublica;
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

/** uma carta que um deck montado na mesa pode ter (tela Montar deck); nome em português, imagem, tipo e texto vêm de
 * /api/cartas */
export interface CartaMontagem {
  nome: string;
  /** custo de mana como no Oracle ("{2}{G}{G}"; faces separadas por " // ") */
  custo: string;
  /** valor de mana */
  vm: number;
  /** identidade de cor (W U B R G) */
  ci: string[];
  /** pode ser comandante sozinha (CR 903.3) */
  comandante: boolean;
  /** com quem pode formar dupla de comandantes (parceiros e Backgrounds, CR 702.124) */
  parceiros?: string[];
  /** cópias que o deck pode ter além de uma: 0 sem limite (básicos, "any number"), N até N; sem o campo, uma */
  teto?: number;
}

/** a lista de um deck jogável, para a prévia no saguão */
export interface ListaDeck {
  id: string;
  nome: string;
  formato: ModoJogo;
  /** null nos decks sem comandante */
  comandante: CartaCatalogo | null;
  /** segundo comandante (parceiros) */
  parceiro?: CartaCatalogo | null;
  /** as outras cartas (sem o comandante) */
  cartas: CartaCatalogo[];
}

/** um deck na tela Decks (jogável ou não) */
export interface DeckCatalogo {
  id: string;
  nome: string;
  link: string;
  formato: ModoJogo;
  /** null nos decks sem comandante */
  comandante: string | null;
  comandantePt: string | null;
  parceiro?: string | null;
  parceiroPt?: string | null;
  cores: string[];
  /** id da imagem do comandante, ou da capa sem ele (arte de fundo do cartão) */
  arte: string | null;
  /** pronto: no saguão; preparacao: falta implementar cartas; atualizacao: jogável, com uma versão nova esperando cartas */
  estado: 'pronto' | 'preparacao' | 'atualizacao';
  importadoEm: string;
  verificadoEm: string | null;
  /** data da versão no Moxfield */
  atualizadoEm: string | null;
  /** cartas diferentes da lista (com o comandante) */
  total: number;
  /** deck montado na mesa (tela Montar deck): dá para editar e apagar */
  criado?: { autor: string | null; editadoEm: string };
  origem: OrigemPublica;
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
  formato: ModoJogo;
  /** null nos decks sem comandante */
  comandante: string | null;
  comandantePt: string | null;
  parceiro?: string | null;
  parceiroPt?: string | null;
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

/** importação ou atualização de deck (várias andam juntas; o mesmo deck, uma de cada vez) */
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
  /** linha de tipo em inglês (faces separadas por " // "), para a busca */
  tipo: string;
  /** linha de tipo e texto da impressão em português, se houver (para a busca) */
  tipoPt?: string;
  textoPt?: string;
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

/**
 * Onda B (registro R8): linha de sistema do registro, guardada pela sala (fora do motor: a partida se refaz pelas
 * entradas e estas linhas não vêm delas). `apos` é o seq da última linha do registro do motor quando aconteceu; o
 * cliente intercala por ele.
 */
export interface LinhaSistema {
  id: number;
  apos: number;
  tipo: 'entrou' | 'saiu' | 'voltou' | 'desfazer' | 'partida';
  texto: string;
  /** assento de quem a linha fala, se for de alguém */
  quem: number | null;
  /** quando aconteceu (ms desde 1970) */
  em: number;
  /** "caiu e voltou" repetido em seguida vira uma linha só, com a conta */
  vezes?: number;
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

/** uma mensagem do chat da sala (o nome fica gravado: quem senta depois no assento pode ter outro) */
export interface MsgChat {
  id: number;
  /** assento de quem escreveu */
  de: number;
  /** quem escreveu: o id de autor de quem ocupava o assento (o `quem` da mensagem `sala`). Outra pessoa que sente
   * depois no mesmo assento tem outro id. Vazio nas mensagens gravadas antes dele existir */
  quem: string;
  /** o nome de quem escreveu, como estava no assento */
  nome: string;
  texto: string;
  /** quando chegou ao servidor (ms desde 1970) */
  em: number;
}

export type MsgCliente =
  /** `lugares`: quantos jogadores (2 a 6); sem ele, `modo` (o jeito antigo) e, sem os dois, quatro */
  | { t: 'criar'; nome: string; senhaSala: string; lugares?: number; modo?: Modo; formato?: ModoJogo }
  | { t: 'entrar'; codigo: string; senhaSala: string; nome: string }
  /** assistir a sala sem ocupar assento (modo espectador) */
  | { t: 'assistir'; codigo: string; senhaSala: string; nome: string }
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
  /** o anfitrião troca o modo de jogo da sala (os decks de outro modo saem dos assentos) */
  | { t: 'formato'; formato: ModoJogo }
  /** o anfitrião muda o passo do saguão */
  | { t: 'etapa'; etapa: EtapaSaguao }
  /** o anfitrião muda o número de lugares da sala (só tira lugares livres) */
  | { t: 'lugares'; n: number }
  /** o retrato do seu assento (null: volta ao do comandante do deck) */
  | { t: 'avatar'; avatar: string | null }
  /** pedir para desfazer a sua última jogada deste turno; responder ou cancelar um pedido aberto */
  | { t: 'desfazer' }
  | { t: 'desfazerResposta'; aceitar: boolean }
  | { t: 'desfazerCancelar' }
  /** mostrar uma carta da sua mão a todos ou a alguns jogadores */
  | { t: 'revelar'; obj: number; para: number[] | 'todos' }
  /** mensagem no chat da sala */
  | { t: 'chat'; texto: string }
  /** batimento: o servidor responde `pong` na hora, com ou sem sala, sem gravar nada e fora de qualquer limite */
  | { t: 'ping' };

/** posição escolhida para cada permanente, pelo id do objeto: [x, y] de 0 a 1 dentro da área de quem a controla */
export type Posicoes = Record<string, [number, number]>;

// ---------------------------------------------------------------------------------------------------------------
// Validação das mensagens do cliente (a única porta de entrada: Gerente.tratar). Confere a forma: o tipo existe e os
// campos que a sala usa como índice ou objeto têm o tipo e o intervalo certos ('__proto__' como assento trocava o
// protótipo da lista de assentos e derrubava a sala). Os valores de lista fechada (passo do saguão, regra, nível,
// retrato, modo) e o que depende da sala (deck existe, assento livre, decisão pendente) a sala confere, com a
// mensagem própria de cada caso. Textos têm um teto de tamanho (a sala ainda limpa e corta).
// ---------------------------------------------------------------------------------------------------------------

/** maior número de assentos de uma sala (6 jogadores) */
export const MAX_ASSENTOS = 6;
/** menor número de lugares de uma sala (o duelo) */
export const MIN_LUGARES = 2;
/** teto de tamanho de qualquer texto de uma mensagem (nome, senha, código, deck, chat…) */
const TEXTO_MAX = 2000;

const ehObjeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const inteiro = (x: unknown, min: number, max: number) => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
/** texto dentro do teto; outro tipo passa (a sala limpa, recusa com a mensagem dela, ou ignora) */
const curto = (x: unknown) => typeof x !== 'string' || x.length <= TEXTO_MAX;
const sempre = () => true;

const FORMAS: { [T in MsgCliente['t']]: (m: Record<string, unknown>) => boolean } = {
  criar: (m) => curto(m.nome) && curto(m.senhaSala) && curto(m.formato) && (m.lugares === undefined || inteiro(m.lugares, MIN_LUGARES, MAX_ASSENTOS)),
  entrar: (m) => curto(m.codigo) && curto(m.senhaSala) && curto(m.nome),
  assistir: (m) => curto(m.codigo) && curto(m.senhaSala) && curto(m.nome),
  retomar: (m) => curto(m.codigo) && curto(m.token),
  deck: (m) => curto(m.deck),
  // o assento vira índice da lista de assentos: inteiro e no intervalo (a sala confere o tamanho dela)
  bot: (m) => inteiro(m.assento, 0, MAX_ASSENTOS - 1) && (m.deck === null || typeof m.deck === 'string') && curto(m.deck) && curto(m.nivel),
  iniciar: sempre,
  novaPartida: sempre,
  // a resposta vai para o motor, que confere o resto pela decisão pendente
  responder: (m) => inteiro(m.decisao, 0, Number.MAX_SAFE_INTEGER) && ehObjeto(m.resposta) && typeof m.resposta.kind === 'string',
  paradas: sempre,
  passarTurno: sempre,
  conceder: sempre,
  sair: sempre,
  posicao: (m) => m.lista === undefined || (Array.isArray(m.lista) && m.lista.length <= 300),
  mulligan: sempre,
  auxilios: sempre,
  formato: (m) => curto(m.formato),
  etapa: sempre,
  lugares: (m) => inteiro(m.n, MIN_LUGARES, MAX_ASSENTOS),
  avatar: (m) => curto(m.avatar),
  desfazer: sempre,
  desfazerResposta: (m) => typeof m.aceitar === 'boolean',
  desfazerCancelar: sempre,
  revelar: (m) => m.para === 'todos' || (Array.isArray(m.para) && m.para.length <= MAX_ASSENTOS),
  chat: (m) => curto(m.texto),
  ping: sempre,
};

/** o tipo da mensagem do cliente, se for um que existe (vai no `de` dos erros) */
export function tipoMsg(m: unknown): MsgCliente['t'] | null {
  return ehObjeto(m) && typeof m.t === 'string' && Object.hasOwn(FORMAS, m.t) ? (m.t as MsgCliente['t']) : null;
}

/** confere a forma de uma mensagem do cliente; devolve o motivo da recusa ou null */
export function validarMsg(m: unknown): string | null {
  if (!ehObjeto(m) || typeof m.t !== 'string') return 'Mensagem inválida';
  if (!Object.hasOwn(FORMAS, m.t)) return 'Mensagem desconhecida';
  return FORMAS[m.t as MsgCliente['t']](m) ? null : 'Mensagem inválida';
}

/** por que uma vista não continua a anterior (mensagem `jogo`) */
export type Reinicio = 'cheia' | 'desfeita';

// ------------------------------------------------------------------ cena (F2 do estudo do Arena)
// Os eventos do motor desde a última vista, já filtrados e redigidos para o assento (servidor/cena.ts). Nunca levam
// CardId nem def (a identidade vem da vista); um id só vai a quem via o objeto naquela encarnação; nenhum id de
// grimório; movimento entre zonas escondidas vira contagem; prioridade e passe não viram evento.

/** um lado de uma troca de zona: `id` só se o assento via o objeto daquele lado */
export interface LadoZona { id?: ObjId; zona: ZoneName | 'nowhere'; dono: PlayerId }
/** alvo, dano ou marcador: num jogador, ou num objeto (`id` só se o assento o via; sem id = um objeto oculto) */
export type AlvoCena = { jogador: PlayerId } | { id?: ObjId };

export type EventoCena = { seq: number; lote: number } & (
  | { tipo: 'passo'; etapa: Step; ativo: PlayerId; primeiraPrincipal?: true }
  | { tipo: 'zona'; de: LadoZona; para: LadoZona; motivo: MotivoZona; controlador: PlayerId; ficha?: true; por?: PlayerId }
  | { tipo: 'conjurar'; id?: ObjId; jogador: PlayerId; de: ZoneName; copia?: true }
  | { tipo: 'copiar'; id?: ObjId; jogador: PlayerId }
  | { tipo: 'ativar'; id?: ObjId; fonte?: ObjId; jogador: PlayerId }
  | { tipo: 'gatilho'; id?: ObjId; fonte?: ObjId; controlador: PlayerId }
  | { tipo: 'alvo'; alvo: AlvoCena; fonte?: ObjId; controlador: PlayerId; magica: boolean }
  /** começo da resolução do topo da pilha (vem antes de `resolver`, ou de `sem-alvos`) */
  | { tipo: 'resolvendo'; id?: ObjId; controlador: PlayerId }
  | { tipo: 'resolver'; id?: ObjId; controlador: PlayerId }
  /** mágica ou habilidade anulada; vem antes da troca de zona (motivo 'anulada'); a habilidade some sem zona */
  | { tipo: 'anulada'; id?: ObjId; controlador: PlayerId }
  /** não resolveu por alvos ilegais; vem antes da troca de zona (motivo 'sem-alvos') ou do sumiço da habilidade */
  | { tipo: 'sem-alvos'; id?: ObjId; controlador: PlayerId }
  /** `id`: a carta na mão, só para quem a vê (o dono); os outros sabem só que comprou */
  | { tipo: 'comprar'; jogador: PlayerId; id?: ObjId; n: number }
  | { tipo: 'descartar'; jogador: PlayerId; id?: ObjId }
  /** `ids`: as que o assento vê no cemitério; `n`: quantas */
  | { tipo: 'moer'; jogador: PlayerId; ids: ObjId[]; n: number }
  | { tipo: 'embaralhar'; jogador: PlayerId }
  | { tipo: 'buscar'; jogador: PlayerId; grimorio: PlayerId }
  /** vidência ou vigiar: só quantas cartas, nunca quais */
  | { tipo: 'olhar'; jogador: PlayerId; n: number; como: 'videncia' | 'vigiar' }
  | { tipo: 'atacantes'; jogador: PlayerId; ataques: { id?: ObjId; alvo: AlvoCena }[] }
  /** [bloqueador, atacante] */
  | { tipo: 'bloqueadores'; bloqueios: [ObjId | null, ObjId | null][] }
  | { tipo: 'dano'; fonte?: ObjId; controlador: PlayerId; alvo: AlvoCena; quantidade: number; combate: boolean; prevenido?: true }
  /** `quantidade`: positiva ganhou, negativa perdeu */
  | { tipo: 'vida'; jogador: PlayerId; quantidade: number; fonte?: ObjId }
  /** `quantidade`: positiva pôs, negativa tirou */
  | { tipo: 'marcadores'; alvo: AlvoCena; marcador: string; quantidade: number; por?: PlayerId }
  | { tipo: 'virar'; id?: ObjId; desvirar?: true; mana?: true }
  | { tipo: 'mana'; jogador: PlayerId; fonte?: ObjId; cores: ManaType[] }
  | { tipo: 'ficha'; id?: ObjId; jogador: PlayerId }
  /** `face`: a face nova (transformar); `revelada`: a permanente virada para baixo ficou de frente */
  | { tipo: 'transformar'; id?: ObjId; face?: number; revelada?: true }
  | { tipo: 'fase'; id?: ObjId; saiu: boolean }
  | { tipo: 'anexar'; id?: ObjId; a?: ObjId; solto?: true }
  | { tipo: 'controle'; id?: ObjId; de: PlayerId; para: PlayerId }
  | { tipo: 'regenerar'; id?: ObjId }
  | { tipo: 'designacao'; qual: 'monarca' | 'anel' | 'monstruoso' | 'preparado' | 'tripulado' | 'nivel' | 'destrancar' | 'pavor'; jogador?: PlayerId; id?: ObjId; n?: number }
  | { tipo: 'mecanica'; qual: 'tramar' | 'exercito' | 'confronto' | 'definhar'; jogador: PlayerId; id?: ObjId; ids?: ObjId[]; n?: number; venceu?: boolean }
  | { tipo: 'jogador'; jogador: PlayerId; saiu: true }
);

/**
 * a cena que vai junto com a vista. `epoca` muda quando a partida é trocada inteira (nova, desfeita, refeita,
 * retomada): o cliente descarta o que esperava. `de`: o último evento já entregue antes desta (exclusivo); `ate`: o
 * último coberto por esta (a próxima começa dele). `salto`: eventos demais ou perdidos; vem sem eventos e o cliente só
 * desenha a vista. A conexão nova começa no fim, sem passado.
 */
export interface Cena { epoca: number; de: number; ate: number; eventos: EventoCena[]; salto?: true }

export type MsgServidor =
  /** `quem`: o seu id de autor; `agora`: hora do servidor em ms, acrescentada só ao enviar, fora da comparação */
  /** `voce`: null para quem assiste (modo espectador) */
  | { t: 'sala'; sala: SalaPublica; voce: number | null; token: string; quem: string; agora: number }
  /** `seq`: número da vista nesta conexão (1, 2, 3…; recomeça a cada conexão), acrescentado só ao enviar, fora da
   * comparação. `reinicio`: a vista não continua a anterior: 'cheia' (a primeira desta conexão, partida nova ou refeita)
   * ou 'desfeita' (um pedido de desfazer voltou a partida). Sem ele, continua: o cliente põe a vista na fila de quadros
   * e anima a diferença; com ele, esvazia a fila e mostra a vista na hora, sem animação. `cena`: os eventos desde a
   * vista anterior, redigidos para o assento (Cena), também fora da comparação */
  | { t: 'jogo'; vista: GameView; paradas: StopSettings; posicoes: Posicoes; desfazivel: boolean; desfazer: PedidoDesfazer | null; seq?: number; reinicio?: Reinicio; cena?: Cena }
  /** aviso curto para a mesa (pedido de desfazer aceito, recusado ou expirado) */
  | { t: 'aviso'; msg: string }
  | { t: 'saiu' }
  /** alguém mostrou uma carta da mão (para quem recebeu e para quem mostrou) */
  | { t: 'revelada'; de: number; def: string; nome: string; para: number[] | 'todos' }
  /** um bot está pensando há mais de um segundo (null: ninguém) */
  | { t: 'pensando'; assento: number | null }
  /** a lista de decks do saguão mudou (deck importado ou atualizado) */
  | { t: 'decks'; decks: DeckResumo[] }
  /** andamento de uma das importações ou atualizações de deck (cada aviso traz uma tarefa, pelo id; null: só o
   * catálogo mudou); `mudou`: o catálogo mudou */
  | { t: 'catalogo'; tarefa: TarefaPublica | null; mudou: boolean }
  /** chat da sala: `tudo` traz a conversa guardada inteira (ao entrar ou voltar); sem ele, só as mensagens novas */
  | { t: 'chat'; msgs: MsgChat[]; tudo?: boolean }
  /** Onda B: linhas de sistema do registro (entrou, saiu, desfazer…); `tudo`: a lista inteira, troca a de antes */
  | { t: 'sistema'; linhas: LinhaSistema[]; tudo?: boolean }
  /** resposta ao batimento (`ping`) */
  | { t: 'pong' }
  /** `de`: o tipo da mensagem do cliente que causou o erro (ausente quando o erro não responde a uma mensagem, como
   * o aviso a toda a mesa de um erro do motor numa jogada de bot) */
  | { t: 'erro'; msg: string; de?: MsgCliente['t'] };

// ---------------------------------------------------------------------------
// Relatos de erro (botão "Reportar erro"): o que a pessoa escreve, as imagens e o contexto do cliente. O servidor
// junta a partida da sala (entradas e checkpoint, para refazer o erro) e grava tudo em dados-locais/relatos/<id>/.
// Quem cuida do jogo lê com: node ferramentas/relatos.ts
// ---------------------------------------------------------------------------

export type TipoRelato = 'regra' | 'visual' | 'travou' | 'bot' | 'outro';
export type RepeteRelato = 'sempre' | 'as-vezes' | 'uma-vez' | 'nao-sei';

export interface ImagemRelato {
  /** data URL (image/png, image/jpeg ou image/webp) */
  dados: string;
  /** tela: o print da página feito pelo jogo; aba: captura da aba pelo navegador; anexo: arquivo ou colado */
  origem: 'tela' | 'aba' | 'anexo';
  /** nome do arquivo anexado, se houver */
  nome?: string;
  /** a pessoa riscou em cima (Marcador) */
  marcada?: boolean;
}

export interface PedidoRelato {
  tipo: TipoRelato;
  /** o que aconteceu (obrigatório) */
  oque: string;
  esperado?: string;
  passos?: string;
  repete?: RepeteRelato;
  /** cartas envolvidas (nomes em inglês, como no motor) */
  cartas?: string[];
  /** quem relata */
  nome?: string;
  imagens: ImagemRelato[];
  /** a sala em que a pessoa está, com o token do assento: o servidor só junta a partida se o token conferir */
  sala?: { codigo: string; token: string } | null;
  /** junta a partida (entradas, checkpoint e listas) para refazer o erro */
  anexarPartida: boolean;
  /** o que o cliente sabe na hora: tela, navegador, erros, últimas mensagens, a vista da mesa… */
  contexto: Record<string, unknown>;
}

export type RespostaRelato = { ok: true; id: string } | { ok: false; erro: string };

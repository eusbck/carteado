// As cenas do palco do Como jogar. Cada cena é uma lista de quadros; um quadro diz onde cada carta está (posição no
// palco de 0 a 100, giro, face) e o CSS faz o caminho entre um quadro e o seguinte (só transform e opacity). Rolar de
// volta para um passo recomeça a cena dele do primeiro quadro. Sem linha do tempo nem biblioteca de animação.

/** as cartas do palco e a carta de verdade que cada uma mostra (nomes do motor, todos do catálogo do jogo) */
export const ATORES = {
  t1: 'Forest', t2: 'Forest', t3: 'Plains', t4: 'Plains', t5: 'Forest', t6: 'Plains',
  elfo: 'Llanowar Elves', anjo: 'Serra Angel', espadas: 'Swords to Plowshares',
  cmd: "Trostani, Selesnya's Voice",
  op1: 'Indomitable Ancients', op2: 'Llanowar Tribe',
} as const;
export type Ator = keyof typeof ATORES;

/** a carta do "Como ler uma carta" */
export const CARTA_EXEMPLO = 'Serra Angel';

export interface Estado {
  /** centro da carta no palco, de 0 a 100 (esquerda→direita, alto→baixo) */
  x: number;
  y: number;
  /** giro em graus (90 = virada) */
  r?: number;
  /** escala (1 = tamanho normal) */
  s?: number;
  /** de costas */
  oculta?: boolean;
  /** invisível (fora do jogo: exilada, ou ainda não entrou na cena) */
  some?: boolean;
  /** atraso do movimento, em ms (as cartas saem uma atrás da outra) */
  d?: number;
  /** fica por cima das outras */
  z?: number;
  /** contorno de destaque */
  brilho?: boolean;
}

export interface Marca {
  x: number;
  y: number;
  /** texto fixo (números) ou a chave de um rótulo traduzido em textos.ts → palco */
  t?: string;
  rotulo?: 'enjoo' | 'exilio';
  tipo: 'dano' | 'info';
}

export interface Quadro {
  /** quanto esperar, em ms, depois do quadro anterior */
  espera: number;
  atores: Partial<Record<Ator, Estado>>;
  /** [você, oponente] */
  vida?: [number, number];
  /** as vidas pulsam (o passo é sobre elas) */
  pulsoVida?: boolean;
  /** fase do turno em destaque na faixa de cima, de 0 a 4 */
  fase?: number;
  /** mostra a zona de comando */
  comando?: boolean;
  marcas?: Marca[];
}

// ---------------------------------------------------------------- lugares do palco
export const GRIMORIO = { x: 90, y: 85 } as const;
export const CEMITERIO = { x: 90, y: 56 } as const;
export const COMANDO = { x: 10, y: 56 } as const;
export const VIDA_VOCE = { x: 10, y: 86 } as const;
export const VIDA_OPONENTE = { x: 10, y: 14 } as const;
const Y_OPONENTE = 14, Y_ATAQUE = 33, Y_CRIATURAS = 40, Y_TERRENOS = 62, Y_MAO = 84, MEIO = 48;

const PASSO_CRIATURAS = 17;

type Atores = Partial<Record<Ator, Estado>>;

/** onde cada carta fica quando o quadro não fala dela */
export function repouso(a: Ator): Estado {
  if (a === 'cmd') return { ...COMANDO, some: true };
  if (a === 'op1' || a === 'op2') return { x: MEIO, y: Y_OPONENTE, some: true };
  return { ...GRIMORIO, oculta: true };
}

/** a mão em leque */
function mao(ids: Ator[], destaque: Ator[] = []): Atores {
  const meio = (ids.length - 1) / 2, passo = Math.min(9.5, 57 / Math.max(1, ids.length - 1));
  const s: Atores = {};
  ids.forEach((id, i) => {
    const alto = destaque.includes(id);
    s[id] = { x: MEIO + (i - meio) * passo, y: Y_MAO + (i - meio) ** 2 * 0.4 - (alto ? 7 : 0), r: (i - meio) * 3.5, d: i * 70, z: 20 + i, brilho: alto, s: alto ? 1.12 : 1 };
  });
  return s;
}

/** uma fileira do campo, centrada; `viradas` ficam de lado */
function fileira(ids: Ator[], y: number, viradas: Ator[] = [], passo = 13.5): Atores {
  const meio = (ids.length - 1) / 2;
  const s: Atores = {};
  ids.forEach((id, i) => { s[id] = { x: MEIO + (i - meio) * passo, y, r: viradas.includes(id) ? 90 : 0, d: i * 60 }; });
  return s;
}
const terrenos = (ids: Ator[], viradas: Ator[] = []) => fileira(ids, Y_TERRENOS, viradas, ids.length > 4 ? 14 : 15.5);
const criaturas = (ids: Ator[], viradas: Ator[] = []) => fileira(ids, Y_CRIATURAS, viradas, PASSO_CRIATURAS);

const q = (espera: number, atores: Atores, resto: Omit<Quadro, 'espera' | 'atores'> = {}): Quadro => ({ espera, atores, ...resto });

const MAO7: Ator[] = ['t1', 'elfo', 't3', 'anjo', 't2', 'espadas', 't4'];
const MAO6 = MAO7.filter((a) => a !== 't1');
const MAO5 = MAO6.filter((a) => a !== 'elfo');
/** a mesa de um turno mais adiante: quatro terrenos, o elfo e o anjo em campo */
const T4: Ator[] = ['t1', 't2', 't3', 't4'];
const OPONENTE: Atores = { op1: { x: MEIO, y: Y_OPONENTE } };
const xCriatura = (i: 0 | 1) => MEIO + (i - 0.5) * PASSO_CRIATURAS;
const ATACANDO: Atores = { elfo: { x: xCriatura(0), y: Y_ATAQUE, r: 90 }, anjo: { x: xCriatura(1), y: Y_ATAQUE, r: 90, d: 120 } };
const CMD_EM_CAMPO: Estado = { x: MEIO, y: Y_CRIATURAS };

export const CENAS = {
  // ---------------------------------------------------------------- 1. Preparação
  comprar: [
    q(0, {}),
    q(500, mao(MAO7)),
  ],
  mulligan: [
    q(0, mao(MAO7)),
    q(900, mao(MAO7, ['anjo', 'espadas'])),
    q(1100, { ...mao(['t1', 'elfo', 't3', 't2', 't4']), anjo: { ...GRIMORIO, oculta: true }, espadas: { ...GRIMORIO, oculta: true, d: 120 } }),
    q(900, mao(['t1', 'elfo', 't3', 't5', 't2', 't6', 't4'])),
  ],
  vida: [
    q(0, mao(MAO7), { vida: [40, 40], pulsoVida: true }),
  ],

  // ---------------------------------------------------------------- 2. Conjurar mágicas
  custo: [
    q(0, mao(MAO7)),
    q(500, mao(MAO7, ['elfo'])),
  ],
  terrenos: [
    q(0, mao(MAO7, ['t1'])),
    q(900, { ...mao(MAO6), ...terrenos(['t1']) }),
    q(1100, { ...mao(MAO6, ['elfo']), ...terrenos(['t1'], ['t1']) }),
    q(1100, { ...mao(MAO5), ...terrenos(['t1'], ['t1']), ...criaturas(['elfo']) }),
  ],
  permanentes: [
    q(0, { ...mao(MAO5), ...terrenos(['t1'], ['t1']), ...criaturas(['elfo']) }, { marcas: [{ x: MEIO + 9, y: Y_CRIATURAS - 10, rotulo: 'enjoo', tipo: 'info' }] }),
  ],
  instantaneas: [
    q(0, { ...mao(['anjo', 't2', 'espadas', 't4'], ['espadas']), ...terrenos(['t1', 't3']), ...criaturas(['elfo']), op2: { x: MEIO, y: Y_OPONENTE } }),
    q(1100, { ...mao(['anjo', 't2', 't4']), ...terrenos(['t1', 't3'], ['t3']), ...criaturas(['elfo']), op2: { x: MEIO, y: Y_OPONENTE }, espadas: { x: MEIO + 14, y: 24, s: 1.15, z: 40, brilho: true } }),
    q(1300, { ...mao(['anjo', 't2', 't4']), ...terrenos(['t1', 't3'], ['t3']), ...criaturas(['elfo']), op2: { x: MEIO, y: Y_OPONENTE, some: true, s: 0.7 }, espadas: { ...CEMITERIO } }, { marcas: [{ x: MEIO, y: Y_OPONENTE, rotulo: 'exilio', tipo: 'info' }] }),
  ],

  // ---------------------------------------------------------------- 3. O turno
  inicio: [
    q(0, { ...mao(['espadas']), ...terrenos(T4, T4), ...criaturas(['elfo', 'anjo'], ['elfo', 'anjo']), ...OPONENTE }, { fase: 0 }),
    q(900, { ...mao(['espadas']), ...terrenos(T4), ...criaturas(['elfo', 'anjo']), ...OPONENTE }, { fase: 0 }),
    q(1100, { ...mao(['espadas', 't5']), ...terrenos(T4), ...criaturas(['elfo', 'anjo']), ...OPONENTE }, { fase: 0 }),
  ],
  principal1: [
    q(0, { ...mao(['espadas', 't5'], ['t5']), ...terrenos(T4), ...criaturas(['elfo', 'anjo']), ...OPONENTE }, { fase: 1 }),
    q(1000, { ...mao(['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo']), ...OPONENTE }, { fase: 1 }),
  ],
  combate: [
    q(0, { ...mao(['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo']), ...OPONENTE }, { fase: 2 }),
    q(800, { ...mao(['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo']), anjo: { x: xCriatura(1), y: Y_ATAQUE - 4, r: 90 }, ...OPONENTE }, { fase: 2 }),
    q(1100, { ...mao(['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo'], ['anjo']), ...OPONENTE }, { fase: 2, vida: [40, 36], marcas: [{ x: VIDA_OPONENTE.x + 9, y: VIDA_OPONENTE.y, t: '−4', tipo: 'dano' }] }),
  ],
  principal2: [
    q(0, { ...mao(['espadas'], ['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo'], ['anjo']), ...OPONENTE }, { fase: 3, vida: [40, 36] }),
  ],
  final: [
    q(0, { ...mao(['espadas']), ...terrenos([...T4, 't5']), ...criaturas(['elfo', 'anjo'], ['anjo']), ...OPONENTE }, { fase: 4, vida: [40, 36] }),
  ],

  // ---------------------------------------------------------------- 4. Combate
  atacantes: [
    q(0, { ...mao(['espadas']), ...terrenos(T4), ...criaturas(['elfo', 'anjo']), ...OPONENTE }),
    q(800, { ...mao(['espadas']), ...terrenos(T4), ...ATACANDO, ...OPONENTE }),
  ],
  bloqueadores: [
    q(0, { ...mao(['espadas']), ...terrenos(T4), ...ATACANDO, ...OPONENTE }),
    q(900, { ...mao(['espadas']), ...terrenos(T4), ...ATACANDO, op1: { x: xCriatura(0), y: Y_OPONENTE + 1, brilho: true } }),
  ],
  dano: [
    q(0, { ...mao(['espadas']), ...terrenos(T4), ...ATACANDO, op1: { x: xCriatura(0), y: Y_OPONENTE + 1 } }),
    q(900, { ...mao(['espadas']), ...terrenos(T4), ...ATACANDO, elfo: { x: xCriatura(0), y: Y_ATAQUE - 5, r: 90 }, anjo: { x: xCriatura(1), y: Y_ATAQUE - 8, r: 90 }, op1: { x: xCriatura(0), y: Y_OPONENTE + 3 } }),
    q(700, { ...mao(['espadas']), ...terrenos(T4), anjo: { x: xCriatura(1), y: Y_ATAQUE, r: 90 }, elfo: { ...CEMITERIO }, op1: { x: xCriatura(0), y: Y_OPONENTE + 1 } },
      { vida: [40, 36], marcas: [{ x: VIDA_OPONENTE.x + 9, y: VIDA_OPONENTE.y, t: '−4', tipo: 'dano' }] }),
  ],

  // ---------------------------------------------------------------- 5. Commander
  comandante: [
    q(0, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: { ...COMANDO, brilho: true } }, { comando: true }),
    q(1200, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4, T4), cmd: CMD_EM_CAMPO }, { comando: true }),
  ],
  identidade: [
    q(0, { cmd: { x: MEIO, y: 33, s: 1.55, z: 30 } }, { comando: true }),
    q(700, { cmd: { x: MEIO, y: 33, s: 1.55, z: 30 }, ...fileira(['t1', 'elfo', 'anjo', 'espadas', 't3'], 78, [], 13.5) }, { comando: true }),
  ],
  quarenta: [
    q(0, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: CMD_EM_CAMPO, ...OPONENTE }, { comando: true, vida: [40, 40], pulsoVida: true }),
  ],
  taxa: [
    q(0, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: CMD_EM_CAMPO, ...OPONENTE }, { comando: true }),
    q(1000, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: { ...COMANDO }, ...OPONENTE }, { comando: true }),
    q(800, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: { ...COMANDO, brilho: true }, ...OPONENTE }, { comando: true, marcas: [{ x: COMANDO.x + 9, y: COMANDO.y - 9, t: '+2', tipo: 'dano' }] }),
  ],
  danoComandante: [
    q(0, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: CMD_EM_CAMPO }, { comando: true, vida: [40, 40] }),
    q(900, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: { x: MEIO, y: Y_ATAQUE - 8, r: 90, brilho: true } }, { comando: true, vida: [40, 40] }),
    q(1000, { ...mao(['elfo', 'anjo', 'espadas']), ...terrenos(T4), cmd: { x: MEIO, y: Y_CRIATURAS, r: 90 } }, { comando: true, vida: [40, 38], marcas: [{ x: VIDA_OPONENTE.x + 11, y: VIDA_OPONENTE.y, t: '2 / 21', tipo: 'dano' }] }),
  ],
} satisfies Record<string, Quadro[]>;

export type IdCena = keyof typeof CENAS;

/** o estado de todas as cartas num quadro (as que o quadro não cita ficam no repouso) */
export function estados(quadro: Quadro): Record<Ator, Estado> {
  const s = {} as Record<Ator, Estado>;
  for (const a of Object.keys(ATORES) as Ator[]) s[a] = quadro.atores[a] ?? repouso(a);
  return s;
}

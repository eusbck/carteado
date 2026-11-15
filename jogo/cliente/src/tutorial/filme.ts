// O filme do Como jogar: uma partida curta contada em quadros. Cada passo do texto é um trecho do filme e começa
// exatamente onde o anterior terminou, então rolar para baixo ou para cima nunca faz uma carta pular de lugar. A
// rolagem escolhe um ponto do filme (com fração) e Palco.tsx desenha o meio do caminho entre dois quadros.
//
// A mesa é descrita por zonas (grimório, mão, terrenos, criaturas…); `dispor` transforma as zonas em posições no
// palco, um mundo de 1000 × 760 que a tela escala.

/** a carta de verdade do "Como ler uma carta" */
export const CARTA_EXEMPLO = 'Serra Angel';

export type Cor = 'G' | 'W' | 'U' | 'R' | 'GW';
export type Icone = 'arvore' | 'sol' | 'elfo' | 'anjo' | 'espada' | 'fera' | 'lobo' | 'escudo' | 'coroa' | 'raio' | 'onda';

/** como cada carta do palco é desenhada (CartaArte.tsx): cartas estilizadas, grandes e legíveis */
export interface Arte { cor: Cor; icone: Icone; custo?: string[]; pt?: string; terreno?: boolean; lenda?: boolean }

export const ARTES = {
  // a primeira mão, ruim: só mágicas
  m1: { cor: 'W', icone: 'anjo', custo: ['3', 'W', 'W'], pt: '4/4' },
  m2: { cor: 'G', icone: 'lobo', custo: ['3', 'G'], pt: '4/3' },
  m3: { cor: 'W', icone: 'raio', custo: ['2', 'W'] },
  m4: { cor: 'G', icone: 'fera', custo: ['4', 'G', 'G'], pt: '6/6' },
  m5: { cor: 'W', icone: 'escudo', custo: ['1', 'W'], pt: '1/4' },
  m6: { cor: 'G', icone: 'raio', custo: ['1', 'G'] },
  m7: { cor: 'W', icone: 'espada', custo: ['W'] },
  // a mão que fica, e o que vem depois
  F1: { cor: 'G', icone: 'arvore', terreno: true },
  F2: { cor: 'G', icone: 'arvore', terreno: true },
  F3: { cor: 'G', icone: 'arvore', terreno: true },
  P1: { cor: 'W', icone: 'sol', terreno: true },
  P2: { cor: 'W', icone: 'sol', terreno: true },
  elfo: { cor: 'G', icone: 'elfo', custo: ['G'], pt: '1/1' },
  anjo: { cor: 'W', icone: 'anjo', custo: ['2', 'W'], pt: '3/3' },
  espadas: { cor: 'W', icone: 'espada', custo: ['W'] },
  B1: { cor: 'W', icone: 'escudo', custo: ['1', 'W'], pt: '1/4' },
  // o oponente
  o1: { cor: 'R', icone: 'fera', custo: ['2', 'R'], pt: '3/3' },
  o2: { cor: 'R', icone: 'lobo', custo: ['1', 'R'], pt: '2/2' },
  // Commander
  cmd: { cor: 'GW', icone: 'coroa', custo: ['2', 'G', 'W'], pt: '3/3', lenda: true },
  i1: { cor: 'G', icone: 'lobo', custo: ['2', 'G'], pt: '3/2' },
  i2: { cor: 'W', icone: 'escudo', custo: ['1', 'W'], pt: '1/4' },
  i3: { cor: 'U', icone: 'onda', custo: ['1', 'U'] },
} as const satisfies Record<string, Arte>;
export type Ator = keyof typeof ARTES;
export const ATORES = Object.keys(ARTES) as Ator[];

// ---------------------------------------------------------------- lugares do mundo (1000 × 760)
export const MUNDO = { w: 1000, h: 790 } as const;
export const CARTA = { w: 100, h: 140 } as const;
export const CAMPO = { x1: 150, y1: 46, x2: 790, y2: 564, meio: 305 } as const;
export const BIB = { x: 892, y: 150 } as const;
export const CEM = { x: 892, y: 352 } as const;
export const CMD = { x: 68, y: 330 } as const;
export const VIDA_OP = { x: 68, y: 128 } as const;
export const VIDA_EU = { x: 68, y: 500 } as const;
const CX = (CAMPO.x1 + CAMPO.x2) / 2;
const Y_OP = 168, Y_BLOQ = 228, Y_ATAQUE = 316, Y_CRIATURAS = 380, Y_TERRENOS = 494, Y_MAO = 708, Y_AVISO = 534, PASSO_CRIATURA = 132;
const CAM_NORMAL = { x: MUNDO.w / 2, y: MUNDO.h / 2, z: 1 };
const CAM_COMBATE = { x: 478, y: 332, z: 1.06 };

export interface Estado { x: number; y: number; r: number; s: number; face: number; o: number; z: number; brilho: number }
export type TipoMarca = 'dano' | 'info' | 'ok' | 'nao' | 'zz' | 'mana';
/** um aviso sobre o palco; `t` é um texto fixo ("−3") ou a chave de um rótulo traduzido (textos.ts → palco.marcas) */
export interface Marca { x: number; y: number; t: string; tipo: TipoMarca }
export interface Quadro {
  atores: Record<Ator, Estado>;
  /** fração do trecho que cada carta espera antes de sair (cartas distribuídas uma atrás da outra) */
  atraso: Partial<Record<Ator, number>>;
  marcas: Record<string, Marca>;
  vida: [number, number];
  vidaO: number;
  comandoO: number;
  /** escurece a mesa por trás de uma carta em destaque */
  veu: number;
  /** fase do turno acesa na faixa de cima (-1: faixa escondida) */
  fase: number;
  cam: { x: number; y: number; z: number };
}

/** a mesa por zonas: o que o roteiro mexe */
interface Mesa {
  biblioteca: Ator[];
  mao: Ator[];
  terrenos: Ator[];
  criaturas: Ator[];
  opCriaturas: Ator[];
  cemiterio: Ator[];
  comando: Ator[];
  fora: Ator[];
  pilha: Ator | null;
  virada: Ator[];
  atacando: Ator[];
  /** quem bloqueia → quem é bloqueado */
  bloqueio: Partial<Record<Ator, Ator>>;
  enjoo: Ator[];
  ferida: Partial<Record<Ator, string>>;
  especial: Partial<Record<Ator, Partial<Estado>>>;
  vida: [number, number];
  vidaO: number;
  comandoO: number;
  veu: number;
  fase: number;
  cam: { x: number; y: number; z: number };
  // só valem no quadro em que foram marcados
  destaque: Ator[];
  brilho: Ator[];
  atraso: Partial<Record<Ator, number>>;
  marcas: Record<string, Marca>;
}

const tirar = (lista: Ator[], id: Ator) => { const i = lista.indexOf(id); if (i >= 0) lista.splice(i, 1); };
function tirarDeTudo(m: Mesa, id: Ator): void {
  for (const z of [m.biblioteca, m.mao, m.terrenos, m.criaturas, m.opCriaturas, m.cemiterio, m.comando, m.fora]) tirar(z, id);
  if (m.pilha === id) m.pilha = null;
}

const base = (x: number, y: number, e: Partial<Estado> = {}): Estado => ({ x, y, r: 0, s: 1, face: 1, o: 1, z: 20, brilho: 0, ...e });

/** onde fica quem ainda não entrou na partida (ou saiu dela) quando não há quadro anterior */
const ORIGEM: Partial<Record<Ator, { x: number; y: number }>> = { o1: { x: CX, y: Y_OP }, o2: { x: CX, y: Y_OP }, cmd: CMD, i1: { x: 250, y: 300 }, i2: { x: 690, y: 210 }, i3: { x: 690, y: 400 } };

function dispor(m: Mesa, ant: Quadro | null): Quadro {
  const a = {} as Record<Ator, Estado>;
  m.biblioteca.forEach((id, i) => { a[id] = base(BIB.x - i * 0.3, BIB.y - i * 0.55, { face: 0, z: 10 + i, s: 1.08 }); });
  const n = m.mao.length, meio = (n - 1) / 2, passo = n > 1 ? Math.min(92, 540 / (n - 1)) : 0;
  m.mao.forEach((id, i) => {
    const k = i - meio, alto = m.destaque.includes(id);
    a[id] = base(CX + k * passo, Y_MAO + k * k * 2.6 - (alto ? 44 : 0), { r: alto ? 0 : k * 3.2, s: alto ? 1.16 : 1, z: alto ? 80 : 60 + i });
  });
  const fileira = (ids: Ator[], y: number, passoF: number, z: number, s = 1) => {
    const meioF = (ids.length - 1) / 2;
    ids.forEach((id, i) => { a[id] = base(CX + (i - meioF) * passoF, y, { r: m.virada.includes(id) ? 90 : 0, z, s }); });
  };
  fileira(m.terrenos, Y_TERRENOS, m.terrenos.length > 4 ? 120 : 128, 22, 0.86);
  fileira(m.criaturas, Y_CRIATURAS, PASSO_CRIATURA, 30);
  fileira(m.opCriaturas, Y_OP, PASSO_CRIATURA, 30);
  for (const id of m.atacando) if (a[id]) a[id] = { ...a[id], y: Y_ATAQUE, r: 90, z: 40 };
  for (const [quem, alvo] of Object.entries(m.bloqueio) as [Ator, Ator][]) if (a[quem] && a[alvo]) a[quem] = { ...a[quem], x: a[alvo].x, y: Y_BLOQ, z: 41 };
  m.cemiterio.forEach((id, i) => { a[id] = base(CEM.x + (i % 2 ? 3 : -3), CEM.y - i * 0.6, { r: i % 2 ? 4 : -3, s: 1.08, z: 30 + i }); });
  m.comando.forEach((id) => { a[id] = base(CMD.x, CMD.y, { s: 1.08, z: 30 }); });
  if (m.pilha) a[m.pilha] = base(CX, CAMPO.meio - 10, { s: 1.55, z: 95, brilho: 1 });
  for (const id of m.fora) {
    const p = ant?.atores[id] ?? base(ORIGEM[id]?.x ?? CX, ORIGEM[id]?.y ?? Y_OP);
    // já estava fora: fica onde sumiu (sem ir subindo a cada quadro)
    a[id] = p.o === 0 ? { ...p } : { ...p, o: 0, s: p.s * 0.7, y: p.y - 30, brilho: 0, z: 5 };
  }
  for (const id of ATORES) if (!a[id]) a[id] = base(BIB.x, BIB.y, { face: 0, o: 0 });
  for (const [id, e] of Object.entries(m.especial) as [Ator, Partial<Estado>][]) a[id] = { ...a[id], ...e };
  for (const id of m.brilho) a[id] = { ...a[id], brilho: 1 };

  const marcas: Record<string, Marca> = { ...m.marcas };
  for (const id of m.enjoo) if (a[id] && a[id].o > 0) marcas[`zz-${id}`] = { x: a[id].x + 42, y: a[id].y - 74, t: 'enjoo', tipo: 'zz' };
  for (const [id, t] of Object.entries(m.ferida) as [Ator, string][]) if (a[id] && a[id].o > 0) marcas[`ferida-${id}`] = { x: a[id].x + 38, y: a[id].y + 56, t, tipo: 'dano' };

  return { atores: a, atraso: { ...m.atraso }, marcas, vida: [...m.vida], vidaO: m.vidaO, comandoO: m.comandoO, veu: m.veu, fase: m.fase, cam: { ...m.cam } };
}

// ---------------------------------------------------------------- o roteiro
export type IdCena =
  | 'comprar' | 'mulligan' | 'vida'
  | 'custo' | 'terrenos' | 'permanentes' | 'instantaneas'
  | 'inicio' | 'principal1' | 'combate' | 'principal2' | 'final'
  | 'atacantes' | 'bloqueadores' | 'dano'
  | 'comandante' | 'identidade' | 'quarenta' | 'taxa' | 'danoComandante';

export interface Trecho { cena: IdCena; /** índice do primeiro quadro do trecho em `quadros` */ de: number; /** quantos quadros o trecho anda */ passos: number }
export interface Filme { quadros: Quadro[]; trechos: Trecho[] }

type Mudanca = (m: Mesa) => void;

function montar(): Filme {
  const m: Mesa = {
    // o topo é o fim da lista: a primeira mão sai de m1 a m7
    biblioteca: ['P2', 'F3', 'B1', 'espadas', 'P1', 'anjo', 'F2', 'elfo', 'F1', 'm7', 'm6', 'm5', 'm4', 'm3', 'm2', 'm1'],
    mao: [], terrenos: [], criaturas: [], opCriaturas: [], cemiterio: [], comando: [], fora: ['o1', 'o2', 'cmd', 'i1', 'i2', 'i3'],
    pilha: null, virada: [], atacando: [], bloqueio: {}, enjoo: [], ferida: {}, especial: {},
    vida: [40, 40], vidaO: 0, comandoO: 0, veu: 0, fase: -1, cam: { ...CAM_NORMAL },
    destaque: [], brilho: [], atraso: {}, marcas: {},
  };
  const quadros: Quadro[] = [dispor(m, null)];
  const trechos: Trecho[] = [];
  const trecho = (cena: IdCena, ...mudancas: Mudanca[]) => {
    trechos.push({ cena, de: quadros.length - 1, passos: mudancas.length });
    for (const f of mudancas) {
      m.destaque = []; m.brilho = []; m.atraso = {}; m.marcas = {};
      f(m);
      quadros.push(dispor(m, quadros[quadros.length - 1]));
    }
  };
  // ---- ajudantes
  const comprar = (k: number) => (q: Mesa) => { for (let i = 0; i < k; i++) { const id = q.biblioteca.pop()!; q.mao.push(id); q.atraso[id] = i * 0.07; } };
  const baixar = (id: Ator, zona: 'terrenos' | 'criaturas') => { tirarDeTudo(m, id); m[zona].push(id); };
  const virar = (...ids: Ator[]) => { for (const id of ids) if (!m.virada.includes(id)) m.virada.push(id); };
  const desvirarTudo = () => { m.virada = []; };
  const embaralhar = (q: Mesa) => { q.biblioteca.forEach((id, i) => { q.especial[id] = { x: BIB.x + (i % 2 ? 34 : -34), y: BIB.y + (i % 3) * 4, r: i % 2 ? 9 : -9 }; }); };
  const arrumar = (q: Mesa) => { q.especial = {}; };

  // ======================================================== 1. Preparação
  trecho('comprar', embaralhar, (q) => { arrumar(q); comprar(7)(q); });
  trecho('mulligan',
    (q) => { q.destaque = [...q.mao]; q.marcas.semTerreno = { x: CX, y: Y_AVISO, t: 'semTerreno', tipo: 'nao' }; },
    (q) => { q.mao.slice().reverse().forEach((id, i) => { tirarDeTudo(q, id); q.biblioteca.push(id); q.atraso[id] = i * 0.06; }); },
    embaralhar,
    (q) => {
      arrumar(q);
      // a ordem nova depois de embaralhar: a mão boa por cima
      q.biblioteca = ['P2', 'F3', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'B1', 'espadas', 'P1', 'anjo', 'F2', 'elfo', 'F1'];
      comprar(7)(q);
    },
    (q) => { q.destaque = ['B1']; q.marcas.fundo = { x: CX, y: Y_AVISO, t: 'fundo', tipo: 'info' }; },
    (q) => { tirarDeTudo(q, 'B1'); q.biblioteca.unshift('B1'); q.especial.B1 = { x: BIB.x, y: BIB.y + 8, z: 2, face: 0, s: 1.08 }; },
  );
  trecho('vida',
    (q) => { q.especial = {}; q.vidaO = 1; q.marcas.v40a = { x: VIDA_EU.x + 74, y: VIDA_EU.y, t: '40', tipo: 'info' }; q.marcas.v40b = { x: VIDA_OP.x + 74, y: VIDA_OP.y, t: '40', tipo: 'info' }; },
    (q) => { q.marcas.comeca = { x: CX, y: CAMPO.meio + 60, t: 'voceComeca', tipo: 'info' }; },
  );

  // ======================================================== 2. Conjurar mágicas
  trecho('custo',
    (q) => { q.destaque = ['elfo']; q.marcas.custoElfo = { x: CX + 150, y: Y_MAO - 96, t: 'custoElfo', tipo: 'info' }; },
  );
  trecho('terrenos',
    (q) => { q.destaque = ['F1']; },
    () => { baixar('F1', 'terrenos'); m.marcas.umPorTurno = { x: CX, y: Y_TERRENOS - 84, t: 'umPorTurno', tipo: 'info' }; },
    () => { virar('F1'); m.marcas.manaG = { x: CX + 84, y: Y_TERRENOS - 44, t: 'manaG', tipo: 'mana' }; },
    () => { baixar('elfo', 'criaturas'); m.atraso.elfo = 0.1; },
  );
  trecho('permanentes',
    () => { m.enjoo = ['elfo']; m.brilho = ['elfo']; },
  );
  trecho('instantaneas',
    () => { tirarDeTudo(m, 'o2'); m.opCriaturas.push('o2'); },
    () => { baixar('P1', 'terrenos'); },
    () => { m.destaque = ['espadas']; },
    () => { virar('P1'); tirarDeTudo(m, 'espadas'); m.pilha = 'espadas'; m.marcas.alvo = { x: CX, y: Y_OP - 92, t: 'alvo', tipo: 'nao' }; },
    () => { tirarDeTudo(m, 'o2'); m.fora.push('o2'); m.pilha = 'espadas'; m.marcas.exilada = { x: CX, y: Y_OP, t: 'exilada', tipo: 'info' }; },
    () => { m.pilha = null; m.cemiterio.push('espadas'); },
  );

  // ======================================================== 3. O turno
  trecho('inicio',
    () => { m.fase = 0; tirarDeTudo(m, 'o1'); m.opCriaturas.push('o1'); },
    () => { desvirarTudo(); m.enjoo = []; m.marcas.desvirar = { x: CX, y: CAMPO.meio, t: 'desvirar', tipo: 'info' }; },
    () => { const id = m.biblioteca.pop()!; m.mao.push(id); m.marcas.compra = { x: CX, y: Y_AVISO, t: 'compra', tipo: 'info' }; },
  );
  trecho('principal1',
    () => { m.fase = 1; m.destaque = ['F3']; },
    () => { baixar('F3', 'terrenos'); },
    () => { m.destaque = ['anjo']; },
    () => { virar('F1', 'F3', 'P1'); baixar('anjo', 'criaturas'); m.enjoo = ['anjo']; },
  );
  trecho('combate',
    () => { m.fase = 2; m.atacando = ['elfo']; virar('elfo'); },
    () => { m.especial.elfo = { y: Y_BLOQ - 20 }; },
    () => { delete m.especial.elfo; m.atacando = []; m.vida = [40, 39]; m.marcas.d1 = { x: VIDA_OP.x + 70, y: VIDA_OP.y, t: '−1', tipo: 'dano' }; },
  );
  trecho('principal2',
    () => { m.fase = 3; },
    () => { m.destaque = ['F2']; m.marcas.jaBaixou = { x: CX, y: Y_AVISO, t: 'jaBaixou', tipo: 'nao' }; },
  );
  trecho('final',
    () => { m.fase = 4; m.marcas.vez = { x: CX, y: CAMPO.meio, t: 'vez', tipo: 'info' }; },
  );

  // ======================================================== 4. Combate (a câmera chega mais perto)
  trecho('atacantes',
    () => { m.fase = -1; m.cam = { ...CAM_COMBATE }; desvirarTudo(); m.enjoo = []; },
    () => { m.atacando = ['elfo', 'anjo']; virar('elfo', 'anjo'); m.atraso.anjo = 0.12; },
  );
  trecho('bloqueadores',
    () => { m.bloqueio = { o1: 'elfo' }; m.brilho = ['o1']; },
  );
  trecho('dano',
    () => {
      m.especial = { elfo: { y: Y_ATAQUE - 26 }, o1: { y: Y_BLOQ + 22 }, anjo: { y: 218 } };
      m.marcas.golpe1 = { x: CX - PASSO_CRIATURA / 2, y: (Y_ATAQUE + Y_BLOQ) / 2, t: '1', tipo: 'dano' };
      m.marcas.golpe2 = { x: CX + PASSO_CRIATURA / 2, y: 130, t: '3', tipo: 'dano' };
    },
    () => {
      m.especial = {}; m.bloqueio = {}; m.atacando = [];
      tirarDeTudo(m, 'elfo'); m.cemiterio.push('elfo'); m.ferida = { o1: '1' };
      m.vida = [40, 36]; m.marcas.d3 = { x: VIDA_OP.x + 70, y: VIDA_OP.y, t: '−3', tipo: 'dano' };
    },
  );

  // ======================================================== 5. Commander
  trecho('comandante',
    () => { m.cam = { ...CAM_NORMAL }; m.ferida = {}; desvirarTudo(); m.comandoO = 1; tirarDeTudo(m, 'cmd'); m.comando.push('cmd'); m.brilho = ['cmd']; },
    () => { baixar('F2', 'terrenos'); },
    () => { virar('F1', 'F2', 'F3', 'P1'); baixar('cmd', 'criaturas'); m.atraso.cmd = 0.15; },
  );
  trecho('identidade',
    () => { m.veu = 1; m.especial.cmd = { x: CX, y: 300, s: 2.1, z: 96, r: 0 }; m.marcas.cores = { x: CX, y: 470, t: 'cores', tipo: 'info' }; },
    () => {
      m.veu = 1; tirar(m.fora, 'i1'); tirar(m.fora, 'i2'); tirar(m.fora, 'i3');
      const ve = { s: 1.35, z: 97, o: 1, face: 1, r: 0 };
      m.especial.i1 = { ...ve, x: 250, y: 300 }; m.especial.i2 = { ...ve, x: 690, y: 210 }; m.especial.i3 = { ...ve, x: 690, y: 400 };
      m.atraso = { i1: 0, i2: 0.12, i3: 0.24 };
      m.marcas.cores = { x: CX, y: 470, t: 'cores', tipo: 'info' };
      m.marcas.ok1 = { x: 250, y: 186, t: '✓', tipo: 'ok' }; m.marcas.ok2 = { x: 690, y: 96, t: '✓', tipo: 'ok' }; m.marcas.nao3 = { x: 690, y: 514, t: '✕', tipo: 'nao' };
    },
  );
  trecho('quarenta',
    () => {
      m.veu = 0; delete m.especial.cmd; for (const id of ['i1', 'i2', 'i3'] as const) { delete m.especial[id]; m.fora.push(id); } m.marcas.q40a = { x: VIDA_EU.x + 74, y: VIDA_EU.y, t: '40', tipo: 'info' }; m.marcas.jogadores = { x: CX, y: CAMPO.meio, t: 'jogadores', tipo: 'info' }; },
  );
  trecho('taxa',
    () => { m.especial.cmd = { y: CAMPO.meio + 10, s: 1.15, brilho: 1 }; m.marcas.morre = { x: CX, y: Y_CRIATURAS - 92, t: 'morre', tipo: 'nao' }; },
    () => { delete m.especial.cmd; tirarDeTudo(m, 'cmd'); m.comando.push('cmd'); tirar(m.virada, 'cmd'); },
    () => { m.brilho = ['cmd']; m.marcas.taxa = { x: CMD.x + 78, y: CMD.y - 84, t: 'taxa', tipo: 'dano' }; },
  );
  trecho('danoComandante',
    () => { desvirarTudo(); baixar('cmd', 'criaturas'); virar('F1', 'F2', 'F3', 'P1', 'P2'); },
    () => { m.atacando = ['cmd']; virar('cmd'); m.cam = { ...CAM_COMBATE }; },
    () => { m.especial.cmd = { y: Y_BLOQ }; },
    () => {
      delete m.especial.cmd; m.atacando = []; m.vida = [40, 33];
      m.marcas.d3c = { x: VIDA_OP.x + 70, y: VIDA_OP.y, t: '−3', tipo: 'dano' };
      m.marcas.rastreio = { x: VIDA_OP.x + 104, y: VIDA_OP.y + 62, t: 'rastreio', tipo: 'info' };
    },
  );
  return { quadros, trechos };
}

export const FILME: Filme = montar();
export const CENAS: IdCena[] = FILME.trechos.map((t) => t.cena);
/** o último ponto do filme */
export const FIM = FILME.quadros.length - 1;

// ---------------------------------------------------------------- o meio do caminho entre dois quadros
const lim = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export interface EstadoNoCaminho extends Estado { voo: number }

/** o estado de uma carta no ponto `pos` do filme: posição em arco, um leve erguer no meio do voo, giro e virada */
export function estadoEm(pos: number, id: Ator, semVoo = false): EstadoNoCaminho {
  const i = Math.min(Math.max(0, Math.floor(pos)), FIM - 1 < 0 ? 0 : FIM - 1);
  const A = FILME.quadros[i], B = FILME.quadros[Math.min(i + 1, FIM)];
  const e = lim(pos - i);
  const a = A.atores[id], b = B.atores[id];
  const atrasoMax = Math.max(0, ...Object.values(B.atraso).map((x) => x ?? 0));
  const d = B.atraso[id] ?? 0, janela = Math.max(0.4, 1 - atrasoMax);
  const t = suave(lim((e - d) / janela));
  const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
  const voo = semVoo ? 0 : Math.sin(Math.PI * t) * Math.min(1, dist / 260);
  return {
    x: a.x + dx * t,
    y: a.y + dy * t - voo * Math.min(70, dist * 0.22),
    r: a.r + (b.r - a.r) * t + voo * Math.sign(dx || 1) * 7,
    s: (a.s + (b.s - a.s) * t) * (1 + voo * 0.14),
    face: a.face + (b.face - a.face) * t,
    o: a.o + (b.o - a.o) * t,
    z: voo > 0.02 ? 200 + Math.max(a.z, b.z) : t < 0.5 ? a.z : b.z,
    brilho: a.brilho + (b.brilho - a.brilho) * t,
    voo,
  };
}

/** o restante do palco no ponto `pos` (vidas, câmera, véu, fase) */
export function cenaEm(pos: number) {
  const i = Math.min(Math.max(0, Math.floor(pos)), Math.max(0, FIM - 1));
  const A = FILME.quadros[i], B = FILME.quadros[Math.min(i + 1, FIM)];
  const t = suave(lim(pos - i));
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    i, t, A, B,
    cam: { x: l(A.cam.x, B.cam.x), y: l(A.cam.y, B.cam.y), z: l(A.cam.z, B.cam.z) },
    vida: [Math.round(l(A.vida[0], B.vida[0])), Math.round(l(A.vida[1], B.vida[1]))] as [number, number],
    vidaO: l(A.vidaO, B.vidaO),
    comandoO: l(A.comandoO, B.comandoO),
    veu: l(A.veu, B.veu),
    fase: t < 0.5 ? A.fase : B.fase,
  };
}

/** todas as marcas que aparecem em algum quadro (o palco cria um elemento para cada uma, uma vez só) */
export const MARCAS: Record<string, Marca> = (() => {
  const todas: Record<string, Marca> = {};
  for (const q of FILME.quadros) for (const [id, mk] of Object.entries(q.marcas)) todas[id] ??= mk;
  return todas;
})();

/** a marca no ponto `pos`: aparece e some com o trecho, na posição do quadro onde ela está */
export function marcaEm(pos: number, id: string): { o: number; x: number; y: number } {
  const i = Math.min(Math.max(0, Math.floor(pos)), Math.max(0, FIM - 1));
  const A = FILME.quadros[i].marcas[id], B = FILME.quadros[Math.min(i + 1, FIM)].marcas[id];
  const t = lim(pos - i);
  const entra = lim((t - 0.55) / 0.35), sai = lim(1 - t / 0.3);
  if (A && B) return { o: 1, x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t };
  if (B) return { o: entra, x: B.x, y: B.y };
  if (A) return { o: sai, x: A.x, y: A.y };
  return { o: 0, x: MARCAS[id].x, y: MARCAS[id].y };
}

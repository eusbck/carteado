// Validação de deck de cada modo de jogo (motor/modos.ts): Commander (CR 903.3, 903.4, 903.5) com a dupla de
// comandantes (parceiros, CR 702.124) e Standard (CR 100.2a; MTR 3.3 e 6.1).

import { BASIC_LAND_MANA, oracle, type OracleCard, type OracleFace } from './oracle.ts';
import type { DeckList } from './state.ts';
import { MODOS, modoDe } from './modos.ts';
import type { Color } from './types.ts';

export interface DeckProblem { rule: string; message: string }

const lendaria = (f: OracleFace) => f.supertypes.includes('Legendary');

/** CR 903.3: lendária e (a) criatura, (b) Veículo ou (c) Espaçonave com caixa de poder/resistência (texto das CR de
 *  25/09/2026); ou "pode ser seu comandante", 903.3a */
export function podeSerComandante(c: OracleCard): boolean {
  const f = c.faces[0];
  const temPT = f.power !== null || f.toughness !== null || f.ptStar;
  const tipoOk = f.types.includes('Creature') || f.subtypes.includes('Vehicle') || (f.subtypes.includes('Spacecraft') && temPT);
  return lendaria(f) && (tipoOk || f.oracleText.includes('can be your commander'));
}

/** Background lendário (CR 702.124k): só pode ser comandante ao lado de quem tem "choose a Background" */
const ehBackground = (c: OracleCard) => lendaria(c.faces[0]) && c.faces[0].types.includes('Enchantment') && c.faces[0].subtypes.includes('Background');

/** Doctor de Time Lord sem outros tipos de criatura (CR 702.124m) */
const ehDoctor = (c: OracleCard) => {
  const f = c.faces[0];
  return lendaria(f) && f.types.includes('Creature') && f.subtypes.length === 2 && f.subtypes.includes('Time Lord') && f.subtypes.includes('Doctor');
};

/** as habilidades de parceiro de uma carta, lidas do Oracle (CR 702.124a): cada uma é uma linha de palavra-chave */
export function habilidadesDeParceiro(c: OracleCard): { tipo: 'partner' | 'partner-texto' | 'partner-with' | 'background' | 'companion'; valor?: string }[] {
  const out: ReturnType<typeof habilidadesDeParceiro> = [];
  const texto = c.faces[0].oracleText.replace(/[’‘]/g, "'");
  for (const bruta of texto.split('\n')) {
    const linha = bruta.replace(/\s*\(.*\)\s*$/, '').trim(); // sem o lembrete entre parênteses
    let m: RegExpMatchArray | null;
    if (/^partner$/i.test(linha)) out.push({ tipo: 'partner' });
    else if ((m = linha.match(/^partner with (.+)$/i))) out.push({ tipo: 'partner-with', valor: m[1].trim() });
    else if ((m = linha.match(/^partner\s*[—-]\s*(.+)$/i))) out.push({ tipo: 'partner-texto', valor: m[1].trim().toLowerCase() });
    // impressões antigas de "partner—Friends forever" (Stranger Things) escrevem só "Friends forever"
    else if (/^friends forever$/i.test(linha)) out.push({ tipo: 'partner-texto', valor: 'friends forever' });
    else if (/^choose a background$/i.test(linha)) out.push({ tipo: 'background' });
    else if (/^doctor's companion$/i.test(linha)) out.push({ tipo: 'companion' });
  }
  return out;
}

/** as duas cartas podem ser comandantes juntas? (CR 702.124f: habilidades diferentes não se combinam) */
export function duplaValida(a: OracleCard, b: OracleCard): boolean {
  const ha = habilidadesDeParceiro(a), hb = habilidadesDeParceiro(b);
  const tem = (h: typeof ha, t: string) => h.some((x) => x.tipo === t);
  if (tem(ha, 'partner') && tem(hb, 'partner')) return true; // 702.124h
  if (ha.some((x) => x.tipo === 'partner-texto' && hb.some((y) => y.tipo === 'partner-texto' && y.valor === x.valor))) return true; // 702.124i
  const com = (h: typeof ha, nome: string) => h.some((x) => x.tipo === 'partner-with' && x.valor === nome);
  if (com(ha, b.name) && com(hb, a.name)) return true; // 702.124j
  if ((tem(ha, 'background') && ehBackground(b)) || (tem(hb, 'background') && ehBackground(a))) return true; // 702.124k
  if ((tem(ha, 'companion') && ehDoctor(b)) || (tem(hb, 'companion') && ehDoctor(a))) return true; // 702.124m
  return false;
}

/** legalidade de uma carta num formato, como o Scryfall dá ('legal', 'not_legal', 'banned', 'restricted');
 *  undefined quando não se sabe (a validação não acusa nada) */
export type Legalidade = (nome: string, formato: string) => string | undefined;

/**
 * Problemas do deck no modo dele (DeckList.formato; sem a chave, Commander). `buscar` troca a fonte dos dados Oracle
 * (importação: cartas que ainda não estão em gerado/); `legalidade` vem dos dados do Scryfall, quando há.
 */
export function validateDeck(deck: DeckList, buscar: (name: string) => OracleCard = oracle, legalidade?: Legalidade): DeckProblem[] {
  return modoDe(deck) === 'standard' ? validarStandard(deck, buscar, legalidade) : validarCommander(deck, buscar);
}

const NUMEROS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

/** quantas cópias o deck pode ter (CR 100.2a: até 4, fora os básicos; a carta pode mudar isso, ex.: Relentless Rats,
 *  Seven Dwarves); Infinity para sem limite */
export function limiteDeCopias(c: OracleCard): number {
  const f = c.faces[0];
  if (f.supertypes.includes('Basic') && f.types.includes('Land')) return Infinity;
  const texto = c.faces.map((x) => x.oracleText).join('\n');
  if (/A deck can have any number of cards named/i.test(texto)) return Infinity;
  const m = texto.match(/A deck can have up to (\w+) cards named/i);
  if (m) return NUMEROS[m[1].toLowerCase()] ?? (Number(m[1]) || 4);
  return 4;
}

/** Standard: 60 cartas ou mais no deck principal (CR 100.2a), até 4 cópias, só cartas legais no formato (MTR 3.3) */
function validarStandard(deck: DeckList, buscar: (name: string) => OracleCard, legalidade?: Legalidade): DeckProblem[] {
  const out: DeckProblem[] = [];
  if (deck.comandante || deck.parceiro) out.push({ rule: '100.2a', message: 'Deck de Standard não tem comandante' });
  const total = deck.cartas.reduce((n, e) => n + e.quantidade, 0);
  if (total < 60) out.push({ rule: '100.2a', message: `O deck tem ${total} cartas (precisa de pelo menos 60)` });
  // a mesma carta pode vir em mais de uma linha (edições diferentes): conta o nome
  const porNome = new Map<string, number>();
  for (const e of deck.cartas) porNome.set(e.nome, (porNome.get(e.nome) ?? 0) + e.quantidade);
  for (const [nome, q] of porNome) {
    const c = buscar(nome);
    const limite = limiteDeCopias(c);
    if (q > limite) out.push({ rule: '100.2a', message: `${nome} aparece ${q} vezes (no máximo ${limite})` });
    const l = legalidade?.(nome, MODOS.standard.legalidade);
    if (l === 'banned') out.push({ rule: 'MTR 3.3', message: `${nome} está banida no Standard` });
    else if (l && l !== 'legal') out.push({ rule: 'MTR 3.3', message: `${nome} não é legal no Standard` });
  }
  return out;
}

function validarCommander(deck: DeckList, buscar: (name: string) => OracleCard): DeckProblem[] {
  const out: DeckProblem[] = [];
  if (!deck.comandante) return [{ rule: '903.3', message: 'O deck de Commander precisa de um comandante' }];
  const cmd = buscar(deck.comandante);
  const par = deck.parceiro ? buscar(deck.parceiro) : null;
  if (par) {
    // CR 702.124: dois comandantes só com uma habilidade de parceiro que case os dois
    if (!duplaValida(cmd, par)) {
      out.push({ rule: '702.124', message: `${deck.comandante} e ${deck.parceiro} não podem ser comandantes juntos (nenhuma habilidade de parceiro combina os dois)` });
    }
    // um Background é comandante pela própria dupla (702.124k); os outros seguem a CR 903.3
    for (const c of [cmd, par]) {
      if (!podeSerComandante(c) && !(ehBackground(c) && duplaValida(cmd, par))) out.push({ rule: '903.3', message: `${c.name} não pode ser comandante` });
    }
    if (deck.parceiro === deck.comandante) out.push({ rule: '903.5b', message: `${deck.parceiro} repete o comandante` });
  } else if (!podeSerComandante(cmd)) {
    out.push({ rule: '903.3', message: `${deck.comandante} não pode ser comandante` });
  }
  // CR 903.5a e 702.124b: exatamente 100 cartas, contando o comandante (ou os dois)
  const total = (par ? 2 : 1) + deck.cartas.reduce((n, e) => n + e.quantidade, 0);
  if (total !== 100) out.push({ rule: '903.5a', message: `O deck tem ${total} cartas (precisa de 100)` });
  // CR 702.124c: a identidade de cor é a dos dois juntos
  const identity = new Set<Color>([...cmd.colorIdentity, ...(par?.colorIdentity ?? [])]);
  const nomeIdentidade = par ? `${deck.comandante} e ${deck.parceiro}` : deck.comandante;
  for (const e of deck.cartas) {
    const c = buscar(e.nome);
    const basic = c.faces[0].supertypes.includes('Basic') && c.faces[0].types.includes('Land');
    // CR 903.5b: singleton, exceto terrenos básicos
    if (!basic && e.quantidade > 1) out.push({ rule: '903.5b', message: `${e.nome} aparece ${e.quantidade} vezes` });
    if (e.nome === deck.comandante || e.nome === deck.parceiro) out.push({ rule: '903.5b', message: `${e.nome} repete o comandante` });
    // CR 903.5c: identidade de cor dentro da do comandante
    for (const col of c.colorIdentity) if (!identity.has(col)) out.push({ rule: '903.5c', message: `${e.nome} tem ${col}, fora da identidade de ${nomeIdentidade}` });
    // CR 903.5d: tipos básicos de terreno só se a cor que produzem estiver na identidade
    for (const face of c.faces) for (const st of face.types.includes('Land') ? face.subtypes : []) {
      const col = BASIC_LAND_MANA[st];
      if (col && !identity.has(col)) out.push({ rule: '903.5d', message: `${e.nome} é ${st}, que produz ${col}` });
    }
  }
  return out;
}

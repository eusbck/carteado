// Validação de deck de Commander (CR 903.3, 903.4, 903.5) e de dupla de comandantes (parceiros, CR 702.124).

import { BASIC_LAND_MANA, oracle, type OracleCard, type OracleFace } from './oracle.ts';
import type { DeckList } from './state.ts';
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

/** `buscar` troca a fonte dos dados Oracle (importação: cartas que ainda não estão em gerado/) */
export function validateDeck(deck: DeckList, buscar: (name: string) => OracleCard = oracle): DeckProblem[] {
  const out: DeckProblem[] = [];
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

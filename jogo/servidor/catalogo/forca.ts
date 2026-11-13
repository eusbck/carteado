// Força e complexidade de cada deck.
//
// Força: o "bracket" do Commander (sistema oficial da Wizards, beta desde fevereiro de 2025), de 1 a 5:
//   1 Exibição  — deck temático, sem Game Changers, sem destruição de terrenos em massa, turnos extras ou combos
//   2 Básico    — o nível de um precon médio: sem Game Changers, sem combo de duas cartas, sem terrenos em massa
//   3 Turbinado — até três Game Changers; combo de duas cartas só no fim do jogo; sem terrenos em massa
//   4 Otimizado — sem limites além da lista de banidas
//   5 cEDH      — competitivo, montado para o metagame
// A conta olha só as cartas (a Wizards diz que o bracket é também a intenção de quem montou): Game Changers (lista
// oficial, abaixo), destruição de terrenos em massa, turnos extras e combos. Os três últimos vêm da análise do
// Commander Spellbook (commanderspellbook.com, `POST /estimate-bracket`), feita por `node ferramentas/decks.ts forca`
// e guardada em decks/forca.json. O 1 nunca sai da conta (depende da intenção); o 5 só para deck que se declara cEDH.
// Sem a análise gravada (ou com a lista mudada desde ela), vale uma estimativa só pelos Game Changers.
//
// Complexidade: não existe medida oficial por deck; é uma conta da mesa sobre o texto Oracle das cartas (quantas
// habilidades disparadas e ativadas, escolhas, mágicas instantâneas, cemitério, palavras-chave difíceis e o tamanho
// do texto), com o comandante pesando mais. Sai Baixa, Média ou Alta.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { hasOracle, oracle } from '../../motor/oracle.ts';
import type { Rede } from './rede.ts';
import type { Lista } from './tipos.ts';

// ---------------------------------------------------------------------------- Game Changers

/** lista oficial dos Game Changers (53 cartas), como ficou na atualização de 9 de fevereiro de 2026 (entraram
 * Farewell e Biorhythm; em outubro de 2025 saíram dez, entre elas Food Chain, Yuriko e Urza). A análise do Spellbook
 * traz a marcação atualizada; esta lista serve à estimativa sem rede. */
export const GAME_CHANGERS: readonly string[] = [
  'Drannith Magistrate', 'Enlightened Tutor', 'Farewell', 'Humility', "Serra's Sanctum", 'Smothering Tithe', "Teferi's Protection",
  'Consecrated Sphinx', 'Cyclonic Rift', 'Fierce Guardianship', 'Force of Will', 'Gifts Ungiven', 'Intuition', 'Mystical Tutor',
  'Narset, Parter of Veils', 'Rhystic Study', "Thassa's Oracle",
  'Ad Nauseam', "Bolas's Citadel", 'Braids, Cabal Minion', 'Demonic Tutor', 'Imperial Seal', 'Necropotence', 'Opposition Agent',
  'Orcish Bowmasters', 'Tergrid, God of Fright', 'Vampiric Tutor',
  'Gamble', "Jeska's Will", 'Underworld Breach',
  'Biorhythm', 'Crop Rotation', "Gaea's Cradle", 'Natural Order', 'Seedborn Muse', 'Survival of the Fittest', 'Worldly Tutor',
  'Aura Shards', 'Coalition Victory', 'Grand Arbiter Augustin IV', 'Notion Thief',
  'Ancient Tomb', 'Chrome Mox', 'Field of the Dead', 'Glacial Chasm', 'Grim Monolith', "Lion's Eye Diamond", 'Mana Vault',
  "Mishra's Workshop", 'Mox Diamond', 'Panoptic Mirror', 'The One Ring', 'The Tabernacle at Pendrell Vale',
];
const GC = new Set(GAME_CHANGERS);

// ---------------------------------------------------------------------------- análise gravada

export type Bracket = 1 | 2 | 3 | 4 | 5;

export const NOME_BRACKET: Record<Bracket, string> = { 1: 'Exibição', 2: 'Básico', 3: 'Turbinado', 4: 'Otimizado', 5: 'cEDH' };

/** um combo achado pelo Spellbook */
export interface ComboAchado {
  cartas: string[];
  /** o que o combo faz ("Infinite mana", "Each opponent loses the game") */
  resultado: string[];
  /** combo de duas cartas (sem contar terrenos e o resto que qualquer deck tem) */
  duasCartas: boolean;
  /** relevante para o bracket (ganha o jogo ou trava a mesa) */
  relevante: boolean;
}

export interface AnaliseForca {
  /** hash da lista analisada: se a lista mudar, a análise deixa de valer */
  lista: string;
  /** a etiqueta do Spellbook (E Exhibition, C Core, O Oddball, P Powerful, S Spicy, R Ruthless, B Banned) */
  etiqueta: string;
  gameChangers: string[];
  terrenosEmMassa: string[];
  turnosExtras: string[];
  combos: ComboAchado[];
  conferidoEm: string;
}

export interface ForcaArquivo { formato: 1; decks: Record<string, AnaliseForca> }

const arquivo = (pastaDecks: string) => join(pastaDecks, 'forca.json');

export function lerForca(pastaDecks: string): ForcaArquivo {
  try {
    const a = arquivo(pastaDecks);
    if (existsSync(a)) {
      const o = JSON.parse(readFileSync(a, 'utf8')) as ForcaArquivo;
      if (o.formato === 1 && o.decks) return o;
    }
  } catch (e) {
    console.error('decks/forca.json:', e);
  }
  return { formato: 1, decks: {} };
}

export function gravarForca(pastaDecks: string, o: ForcaArquivo): void {
  const a = arquivo(pastaDecks);
  const ordenado: ForcaArquivo = { formato: 1, decks: Object.fromEntries(Object.entries(o.decks).sort(([x], [y]) => x.localeCompare(y))) };
  writeFileSync(a + '.novo', JSON.stringify(ordenado, null, 1) + '\n');
  renameSync(a + '.novo', a);
}

const comandantes = (l: Lista) => [l.comandante, l.parceiro].filter((n): n is string => !!n);

/** impressão digital da lista (comandantes e cartas com quantidade, em qualquer ordem) */
export function hashLista(l: Lista): string {
  const linhas = [...comandantes(l).map((n) => `C ${n}`), ...l.cartas.map((c) => `${c.quantidade} ${c.nome}`)].sort();
  return createHash('sha1').update(linhas.join('\n')).digest('hex').slice(0, 16);
}

// ---------------------------------------------------------------------------- Commander Spellbook

const SPELLBOOK = 'https://backend.commanderspellbook.com/estimate-bracket';

interface RespostaSpellbook {
  bracketTag: string;
  cards: { card: { name: string } | string; gameChanger: boolean; massLandDenial: boolean; extraTurn: boolean }[];
  combos: {
    combo: { uses: { card: { name: string } }[]; produces: { feature: { name: string } }[] };
    relevant: boolean; definitelyTwoCard: boolean; massLandDenial: boolean; extraTurn: boolean;
  }[];
}

/** pede a análise de uma lista ao Commander Spellbook (só nomes de cartas públicas vão na consulta) */
export async function analisar(rede: Rede, l: Lista, agora = new Date()): Promise<AnaliseForca> {
  const cmd = comandantes(l);
  const corpo = {
    commanders: cmd.map((card) => ({ card, quantity: 1 })),
    main: l.cartas.filter((c) => !cmd.includes(c.nome)).map((c) => ({ card: c.nome, quantity: c.quantidade })),
  };
  const r = await rede.json<RespostaSpellbook>(SPELLBOOK, { metodo: 'POST', corpo });
  const nome = (c: RespostaSpellbook['cards'][number]) => (typeof c.card === 'string' ? c.card : c.card.name);
  const marcadas = (k: 'gameChanger' | 'massLandDenial' | 'extraTurn') => r.cards.filter((c) => c[k]).map(nome);
  return {
    lista: hashLista(l),
    etiqueta: r.bracketTag,
    gameChangers: marcadas('gameChanger'),
    terrenosEmMassa: marcadas('massLandDenial'),
    turnosExtras: marcadas('extraTurn'),
    combos: r.combos.map((c) => ({
      cartas: c.combo.uses.map((u) => u.card.name),
      resultado: c.combo.produces.map((p) => p.feature.name),
      duasCartas: c.definitelyTwoCard,
      relevante: c.relevant,
    })),
    conferidoEm: agora.toISOString(),
  };
}

// ---------------------------------------------------------------------------- o bracket

export interface ForcaDeck {
  bracket: Bracket;
  /** true: só pelos Game Changers (sem a análise do Spellbook para esta lista) */
  estimado: boolean;
  gameChangers: string[];
  /** por que deu esse bracket, frases curtas para a dica */
  motivos: string[];
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;
const juntar = (xs: string[], max = 4) => (xs.length > max ? `${xs.slice(0, max).join(', ')} e mais ${xs.length - max}` : xs.join(', '));

/** o bracket de um deck pelas regras oficiais, a partir das cartas e (se houver) da análise do Spellbook */
export function bracketDe(nomeDeck: string, l: Lista, a: AnaliseForca | null): ForcaDeck {
  const valida = a && a.lista === hashLista(l) ? a : null;
  const todas = [...comandantes(l), ...l.cartas.map((c) => c.nome)];
  const gcs = [...new Set(valida ? [...valida.gameChangers, ...todas.filter((n) => GC.has(n))] : todas.filter((n) => GC.has(n)))];
  const motivos: string[] = [];
  let b = 2 as Bracket;
  const subir = (para: Bracket, motivo: string) => { if (para > b) b = para; motivos.push(motivo); };

  if (gcs.length >= 4) subir(4, `${plural(gcs.length, 'Game Changer', 'Game Changers')} (o 3 aceita até três): ${juntar(gcs)}`);
  else if (gcs.length) subir(3, `${plural(gcs.length, 'Game Changer', 'Game Changers')}: ${juntar(gcs)}`);

  if (valida) {
    if (valida.terrenosEmMassa.length) subir(4, `destruição de terrenos em massa: ${juntar(valida.terrenosEmMassa)}`);
    const relevantes = valida.combos.filter((c) => c.relevante);
    const duas = relevantes.filter((c) => c.duasCartas);
    // Ruthless no Spellbook: combo de duas cartas cedo, trava ou turnos extras em sequência (proibidos até o 3)
    if (valida.etiqueta === 'R') subir(4, duas.length ? `combo que pode vencer cedo: ${duas.slice(0, 2).map((c) => c.cartas.join(' + ')).join('; ')}` : 'combo, trava ou turnos extras em sequência');
    else if (valida.etiqueta === 'S' || valida.etiqueta === 'P') {
      if (relevantes.length) subir(3, `${plural(relevantes.length, 'combo', 'combos')} para o fim do jogo: ${relevantes.slice(0, 2).map((c) => c.cartas.join(' + ')).join('; ')}`);
      else if (!gcs.length) subir(3, 'cartas fortes para o 2');
    }
    if (valida.turnosExtras.length >= 3) subir(3, `${plural(valida.turnosExtras.length, 'carta', 'cartas')} de turno extra: ${juntar(valida.turnosExtras)}`);
    else if (valida.turnosExtras.length) motivos.push(`turno extra (poucos cabem no 2): ${juntar(valida.turnosExtras)}`);
  }
  if (b === 4 && /\bc ?edh\b/i.test(nomeDeck)) { b = 5; motivos.push('o deck se declara cEDH (competitivo)'); }
  if (!motivos.length) motivos.push(valida ? 'nenhum Game Changer, combo de duas cartas ou destruição de terrenos em massa' : 'nenhum Game Changer');
  return { bracket: b, estimado: !valida, gameChangers: gcs, motivos };
}

// ---------------------------------------------------------------------------- complexidade

export type NivelComplexidade = 1 | 2 | 3;
export const NOME_COMPLEXIDADE: Record<NivelComplexidade, string> = { 1: 'Baixa', 2: 'Média', 3: 'Alta' };

/** o que a conta precisa de cada carta (motor/oracle.ts) */
export interface DadosCarta {
  tipos: string[];
  /** texto Oracle de todas as faces */
  texto: string;
  palavrasChave: string[];
  faces: number;
}

/** os dados de uma carta a partir do Oracle da mesa (motor/oracle.ts); null para carta sem dados */
export function dadosOracle(nome: string): DadosCarta | null {
  if (!hasOracle(nome)) return null;
  const o = oracle(nome);
  return { tipos: o.faces.flatMap((f) => f.types), texto: o.faces.map((f) => f.oracleText).join('\n'), palavrasChave: o.keywords, faces: o.faces.length };
}

/** palavras-chave que pedem conta, memória ou uma decisão fora da hora */
const CHAVES_DIFICEIS = new Set([
  'Storm', 'Cascade', 'Mutate', 'Ninjutsu', 'Foretell', 'Flashback', 'Escape', 'Disturb', 'Convoke', 'Delve', 'Improvise',
  'Proliferate', 'Venture into the dungeon', 'Initiative', 'Monarch', 'Amass', 'Connive', 'Discover', 'Explore', 'Surveil',
  'Scry', 'Populate', 'Myriad', 'Partner', 'Dredge', 'Madness', 'Morph', 'Disguise', 'Cloak', 'Manifest', 'Plot', 'Suspend',
  'Embalm', 'Eternalize', 'Unearth', 'Blitz', 'Casualty', 'Craft', 'Bargain', 'Offspring', 'Gift', 'Forage', 'Celebration',
  'Station', 'Sneak', 'Miracle', 'Overload', 'Buyback', 'Kicker', 'Multikicker', 'Entwine', 'Splice', 'Replicate', 'Spectacle',
  'Prowl', 'Evoke', 'Emerge', 'Exploit', 'Encore', 'Squad', 'Backup', 'Eerie', 'Survival', 'Impending', 'Collect evidence',
  'Suspect', 'Cloak', 'Exhaust', 'Harmonize', 'Mobilize', 'Renew', 'Endure', 'Behold', 'Airbend', 'Waterbend', 'Earthbend',
  'Firebending', 'Learn', 'Adapt', 'Mentor', 'Training', 'Ward', 'Energy',
]);

export interface ComplexidadeDeck {
  nivel: NivelComplexidade;
  /** a pontuação média por carta (para conferir e calibrar) */
  pontos: number;
  /** o que mais pesa, frases curtas para a dica */
  motivos: string[];
}

interface Pontos { total: number; disparadas: number; ativadas: number; escolhas: number; instantes: number; cemiterio: number; linhaDeJogo: number; tabuleiro: number; chaves: number; texto: number }

/** quanto cada coisa pesa: o que é raro e pede decisão (instantâneas, tutores, escolhas, cemitério) pesa mais que o que
 * todo deck tem (habilidades disparadas, texto) */
const PESOS = { disparadas: 0.6, ativadas: 1, escolhas: 2, instantes: 3, cemiterio: 2, linhaDeJogo: 3, tabuleiro: 1, chaves: 2, texto: 0.8 };

function pontosCarta(c: DadosCarta): Pontos {
  // sem o texto lembrete, que só explica
  const t = c.texto.replace(/\([^)]*\)/g, '');
  const linhas = t.split('\n');
  const disparadas = Math.min(3, (t.match(/\b(When|Whenever|At the beginning|At end of combat)\b/g) ?? []).length);
  const ativ = linhas.filter((l) => /^[^"]*?:/.test(l) && !/^(Equip|Crew|Cycling|Ninjutsu|Level up)\b/.test(l));
  const ativadas = Math.min(2, ativ.filter((l) => !/: Add \{/.test(l)).length) + 0.3 * Math.min(1, ativ.filter((l) => /: Add \{/.test(l)).length);
  const escolhas = Math.min(1.5, 0.5 * [/\bchoose (one|two|three|any|up to|a|an)\b/i, /\{X\}|\bX\b/, /\bvote\b/i, /\bfor each\b/i, /\bcopy\b/i, /\bseparate\b.*\bpiles?\b/i, /\bin any order\b/i]
    .filter((r) => r.test(t)).length);
  const instantes = (c.tipos.includes('Instant') || /\bFlash\b/.test(t) ? 0.5 : 0) + (/\bcounter target\b/i.test(t) ? 0.5 : 0);
  const cemiterio = /graveyard/i.test(t) ? 0.5 : 0;
  // procurar no grimório (tutor), custo alternativo, jogar do exílio: decisões de sequência
  const linhaDeJogo = Math.min(1, 0.5 * [/\bsearch your library for (?!(a|up to \w+|two) basic)(?!a land\b)(?!.*\bland cards?\b)/i, /\brather than pay\b|\bwithout paying\b/i, /\bexile the top\b.*\b(you may|until)\b|\b(play|cast)\b.*\bfrom exile\b/i]
    .filter((r) => r.test(t)).length);
  // fichas e marcadores: o tabuleiro para acompanhar
  const tabuleiro = Math.min(0.6, 0.3 * [/\btokens?\b/i, /\bcounters? on\b/i].filter((r) => r.test(t)).length);
  const chaves = Math.min(1, 0.5 * c.palavrasChave.filter((k) => CHAVES_DIFICEIS.has(k)).length) + (c.faces > 1 ? 0.5 : 0);
  const texto = Math.min(2, t.split(/\s+/).filter(Boolean).length / 45);
  return { total: PESOS.disparadas * disparadas + PESOS.ativadas * ativadas + PESOS.escolhas * escolhas + PESOS.instantes * instantes + PESOS.cemiterio * cemiterio
      + PESOS.linhaDeJogo * linhaDeJogo + PESOS.tabuleiro * tabuleiro + PESOS.chaves * chaves + PESOS.texto * texto,
     disparadas, ativadas, escolhas, instantes, cemiterio, linhaDeJogo, tabuleiro, chaves, texto };
}

/** onde a pontuação média vira Média e Alta, calibrado nos 47 decks da mesa em 13/11/2026 (de 1,3 a 2,7): Ghalta e Kaalia
 * ficam em Baixa; Prismari, Lorehold, Quick Draw e os cEDH em Alta. Dá uns 15 Baixa, 25 Média e 7 Alta. */
export const LIMIARES_COMPLEXIDADE = { media: 1.9, alta: 2.35 };

/** complexidade de um deck pelo texto das cartas; `dados` devolve null para carta desconhecida (fica de fora) */
export function complexidadeDe(l: Lista, dados: (nome: string) => DadosCarta | null): ComplexidadeDeck {
  const cmd = new Set(comandantes(l));
  const itens: { p: Pontos; peso: number }[] = [];
  for (const nome of cmd) { const d = dados(nome); if (d) itens.push({ p: pontosCarta(d), peso: 6 }); }
  for (const e of l.cartas) {
    if (cmd.has(e.nome)) continue;
    const d = dados(e.nome);
    // terrenos básicos e terrenos que só dão mana não pesam
    if (!d || (d.tipos.includes('Land') && !d.tipos.includes('Creature') && pontosCarta(d).total < 1.5)) continue;
    itens.push({ p: pontosCarta(d), peso: e.quantidade });
  }
  const peso = itens.reduce((s, i) => s + i.peso, 0) || 1;
  const media = (k: keyof Pontos) => itens.reduce((s, i) => s + i.p[k] * i.peso, 0) / peso;
  const pontos = Math.round(media('total') * 100) / 100;
  const nivel: NivelComplexidade = pontos >= LIMIARES_COMPLEXIDADE.alta ? 3 : pontos >= LIMIARES_COMPLEXIDADE.media ? 2 : 1;
  // o que mais pesa: a categoria bem acima do deck típico da mesa (a mediana de cada uma nos 47 decks)
  const fatores: [number, string][] = [
    [media('disparadas') / 0.6, 'muitas habilidades disparadas para acompanhar'],
    [media('ativadas') / 0.31, 'muitas habilidades para ativar'],
    [media('escolhas') / 0.11, 'muitas escolhas, modos e valores de X'],
    [media('instantes') / 0.05, 'jogo na hora certa (instantâneas, contramágicas, lampejo)'],
    [media('cemiterio') / 0.04, 'uso do cemitério'],
    [media('linhaDeJogo') / 0.03, 'tutores, custos alternativos e mágicas do exílio'],
    [media('tabuleiro') / 0.07, 'fichas e marcadores para acompanhar'],
    [media('chaves') / 0.06, 'mecânicas com palavra-chave'],
  ];
  const fortes = fatores.filter(([v]) => v >= 1.6).sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, m]) => m);
  const motivos = nivel === 1 ? ['cartas diretas, com pouco texto'] : fortes.length ? fortes : ['um pouco de cada coisa'];
  return { nivel, pontos, motivos };
}

// Peças e notas de rulings repetidas nas cartas do deck Turtle Power! (marcadores +1/+1, fichas e parceiros).
import { addCounters, chars, defineAbility, lkiChars, on, sacrifice, triggered } from '../motor/api.ts';
import type { TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ObjId } from '../motor/types.ts';

/** notas dos rulings de "Parceiro — Seleção de personagem": tudo é da montagem do deck e dos dois comandantes */
export const SELECAO = {
  controla: 'regra geral: CR 702.124e — "você controla o seu comandante" vale com um ou com os dois (cartas/wakanda.ts controlaComandante)',
  dois: 'regra geral: CR 702.124i — dois comandantes só se os dois tiverem a mesma habilidade de parceiro; é da montagem do deck (decks/)',
  comecam: 'regra geral: CR 702.124b — os dois comandantes começam na zona de comando (motor/state.ts)',
  identidade: 'regra geral: CR 702.124c — a identidade de cor é a combinada dos dois comandantes; é da montagem do deck (decks/)',
  separados: 'regra geral: CR 702.124d — cada comandante conta as próprias conjurações e o próprio dano (PlayerState.commanderCasts e commanderDamage por carta)',
  perder: 'regra geral: CR 702.124a — as habilidades de parceiro valem antes de a partida começar; perdê-las depois não muda nada',
  refere: 'regra geral: CR 702.124e — o que se refere ao seu comandante vale para qualquer um dos dois, à sua escolha',
};

/** notas dos rulings das fichas Mutagen e Food */
export const MUTAGEN = {
  alvos: 'regra geral: CR 608.2b — com todos os alvos ilegais, a mágica ou habilidade não resolve e nenhuma ficha é criada (motor/stack.ts)',
  predefinida: 'regra geral: CR 111.10 — Mutagen é ficha predefinida: artefato incolor com "{1}, {T}, sacrifique: um marcador +1/+1 na criatura alvo, só como feitiço" (cartas/fichas.ts)',
};
export const COMIDA = {
  tipo: 'regra geral: CR 205.3g — Food é tipo de artefato, nunca tipo de criatura (motor/chars.ts)',
  alvos: 'regra geral: CR 608.2b — com todos os alvos ilegais, a mágica ou habilidade não resolve e nenhuma ficha é criada (motor/stack.ts)',
  naoComa: 'não se aplica: é um aviso para não comer as cartas',
  qualquer: 'regra geral: CR 205.3g — "um Food" é qualquer artefato Food, ficha ou não; um recurso paga um custo só (motor/costs.ts)',
};

/** a permanente tem algum marcador? */
export function temMarcador(g: G, id: ObjId): boolean {
  return Object.values(g.state.objects[id]?.counters ?? {}).some((n) => n > 0);
}

/** CR 701.10e: dobrar os marcadores de um tipo é pôr tantos quantos a permanente já tem (as substituições de marcadores se aplicam) */
export function dobraMarcadores(g: G, id: ObjId, tipo: string, quem: number): void {
  const n = g.state.objects[id]?.counters[tipo] ?? 0;
  if (n > 0) addCounters(g, { kind: 'obj', id }, tipo, n, quem);
}

/** "sempre que [esta permanente] ou outra criatura que não é ficha que você controla sai do campo" (Splinter, Rat King) */
export function saiEuOuOutraCriaturaSua(): TriggerSpec {
  return on.custom((e, c) => {
    if (e.type !== 'zone' || e.from !== 'battlefield') return false;
    if (e.old === c.source) return true;
    return outraCriaturaSuaQueSaiu(c.g, e.old, e.token, c.you);
  });
}

/** "sempre que outra criatura que não é ficha que você controla sai do campo" (Tokka & Rahzar) */
export function saiOutraCriaturaSua(): TriggerSpec {
  return on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.old !== c.source && outraCriaturaSuaQueSaiu(c.g, e.old, e.token, c.you));
}

function outraCriaturaSuaQueSaiu(g: G, antigo: ObjId, ficha: boolean, voce: number): boolean {
  const ch = lkiChars(g, antigo);
  return !ficha && !!ch && ch.types.includes('Creature') && ch.controller === voce;
}

/** gatilho atrasado "sacrifique essas fichas no fim do combate" (Shredder) */
export const SACRIFICA_NO_FIM_DO_COMBATE = defineAbility('tartarugas:sacrificaNoFimDoCombate', triggered({ kind: 'event', match: (e) => e.type === 'step' && e.step === 'endCombat' }, function* (c) {
  const fichas = ((c.data.fichas ?? []) as ObjId[]).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
  if (fichas.length) yield* sacrifice(c.g, fichas);
}, { text: 'No fim do combate, sacrifique essas fichas.' }));
/** notas dos rulings de "Parceiro com [nome]" (Bebop e Rocksteady) */
export const PARCEIRO_COM = {
  gatilho: 'regra geral: CR 702.124j — o gatilho de "parceiro com" dispara também no Commander e pode mirar qualquer jogador (cartas/vampiros.ts parceiroCom)',
  busca: 'regra geral: CR 702.124j — o jogador alvo procura no grimório dele, revela a carta, põe na mão e embaralha (cartas/vampiros.ts parceiroCom)',
  deck: 'regra geral: CR 702.124j — a outra metade é da montagem do deck: as duas podem ser comandantes juntas (decks/)',
  soEntreSi: 'regra geral: CR 702.124f — "parceiro com" só combina com o parceiro nomeado; perder a habilidade na partida não muda os comandantes',
};
/** a criatura recebeu dano neste turno? (Swift Demise): dano ainda marcado ou registrado nos eventos do turno */
export function recebeuDanoNoTurno(g: G, id: ObjId): boolean {
  if ((g.state.objects[id]?.damage ?? 0) > 0) return true;
  const d = g.state.damagedBy;
  return !!d && d.turn === g.state.turn.number && Object.values(d.pairs).some((alvos) => alvos.includes(id));
}

/** é Mutant, Ninja ou Turtle? (April O'Neil, Heroes in a Half Shell) */
export function ehMutanteNinjaOuTartaruga(g: G, id: ObjId): boolean {
  return chars(g, id).subtypes.some((s) => s === 'Mutant' || s === 'Ninja' || s === 'Turtle');
}
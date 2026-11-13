// Peças e notas de rulings repetidas nas cartas do deck Foods (Sam, Loyal Attendant + Frodo, Adventurous Hobbit).
import { chooseItems, lkiChars, moveObjects, nameOf, on } from '../motor/api.ts';
import type { Ctx, Gen, TriggerSpec } from '../motor/defs.ts';
import type { G } from '../motor/game-context.ts';
import type { ChoiceItem, ObjId, PlayerId } from '../motor/types.ts';

/** o objeto que saiu (pela última informação conhecida) era uma Food? Food é tipo de artefato (CR 205.3g) */
export function eraFood(g: G, antigo: ObjId): boolean {
  const ch = lkiChars(g, antigo);
  return !!ch && ch.types.includes('Artifact') && ch.subtypes.includes('Food');
}

/** "sempre que você sacrifica uma Food" (Trail of Crumbs): um gatilho por Food sacrificada */
export function voceSacrificaFood(): TriggerSpec {
  return on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && eraFood(c.g, e.old));
}

/** "se você sacrificou uma Food neste turno" (Elanor Gardner) */
export function sacrificouFoodNoTurno(g: G, p: PlayerId): boolean {
  return (g.state.turnStats[p]?.foodsSacrificed ?? 0) > 0;
}

/** notas dos rulings de dois comandantes ("Partner with", CR 702.124), já suportados na montagem e na partida */
export const PARCEIROS = {
  comecam: 'regra geral: CR 702.124b, 903.6 — os dois comandantes começam na zona de comando (testes/regras-comandante.test.ts, "partida com dois comandantes")',
  doisSo: 'regra geral: CR 702.124j — "partner with" só forma dupla com o parceiro nomeado (motor/deck.ts; testes/regras-comandante.test.ts)',
  gatilho: 'regra geral: CR 702.124j — o gatilho de "parceiro com" dispara também no Commander e pode mirar qualquer jogador (cartas/vampiros.ts parceiroCom)',
  busca: 'regra geral: CR 702.124j — o jogador alvo procura no grimório dele, revela a carta, põe na mão e embaralha (cartas/vampiros.ts parceiroCom)',
  montagem: 'regra geral: CR 702.124j — a segunda habilidade de "partner with" é da montagem do deck (motor/deck.ts; testes/regras-comandante.test.ts)',
  identidade: 'regra geral: CR 702.124c — a identidade de cor do deck é a dos dois comandantes juntos (testes/regras-comandante.test.ts)',
  separados: 'regra geral: CR 702.124d — imposto e dano de comandante são contados por carta (testes/regras-comandante.test.ts)',
  controla: 'regra geral: CR 702.124e — "você controla o seu comandante" vale com um ou com os dois (cartas/wakanda.ts controlaComandante)',
};

/**
 * "Olhe as N cartas do topo do seu grimório. Você pode revelar uma carta [filtro] entre elas e pô-la na sua mão. Coloque o
 * resto no fundo do seu grimório em qualquer ordem." (Trail of Crumbs). Devolve a carta posta na mão, ou null.
 */
export function* olhaTopoEPoeUmaNaMao(c: Ctx, n: number, filtro: (id: ObjId) => boolean, oQue: string, fonte: string): Gen<ObjId | null> {
  const s = c.g.state;
  const topo = s.zones.library[c.you].slice(0, n);
  if (topo.length === 0) return null;
  const itens = (ids: ObjId[], f?: (id: ObjId) => boolean): ChoiceItem[] => ids.map((id) => ({ id: String(id), label: nameOf(c.g, id), obj: id, card: { def: s.objects[id].def }, disabled: f ? !f(id) : false }));
  const [esc] = yield* chooseItems(c.g, c.you, `${fonte}: você pode revelar ${oQue} entre as cartas do topo e pô-la na mão`, itens(topo, filtro), 0, 1);
  const escolhida = esc !== undefined ? Number(esc) : null;
  if (escolhida !== null) {
    c.g.log(`${s.players[c.you].name} revela ${nameOf(c.g, escolhida)}.`, { rule: '701.20' });
    yield* moveObjects(c.g, [{ id: escolhida, to: 'hand' }], 'effect');
  }
  // o resto vai para o fundo na ordem que você escolher (a primeira escolhida fica mais em cima)
  const resto = topo.filter((id) => id !== escolhida && s.objects[id]?.zone === 'library');
  const ordem = resto.length > 1 ? (yield* chooseItems(c.g, c.you, 'Ordem das cartas que vão para o fundo (a primeira fica mais em cima)', itens(resto), resto.length, resto.length, true)).map(Number) : resto;
  s.zones.library[c.you] = [...s.zones.library[c.you].filter((id) => !ordem.includes(id)), ...ordem];
  c.g.bump();
  return escolhida;
}

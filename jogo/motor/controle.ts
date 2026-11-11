// lote3-d (deck [cEDH] - Twitch Control): mecânicas que faltavam ao motor. Tudo aditivo; cada uma tem teste de regra em
// testes/regras-controle-pilha.test.ts. Os ganchos novos (Grafdigger's Cage, Cursed Totem, mão inicial, troca de texto,
// "enquanto tiver um marcador", alvo em outra zona, "mude o alvo") ficam em defs.ts, chars.ts, stack.ts e actions.ts.
//
// - Manutenção cumulativa (CR 702.24)
// - Segundo dividido / split second (CR 702.61): quem consulta é priority.ts (ações legais) e stack.ts (conjurar e ativar)
// - Energia (CR 107.14, 122.1): marcadores de energia do jogador
// - Trocar o controle de dois permanentes (CR 701.12a-b)
// - Manifestar o pavor / manifest dread (CR 701.62)
// - Resistência a magia contra habilidades ativadas e desencadeadas (CR 702.11d): conferida em stack.ts isLegalTarget
// - Transmutar (CR 702.53)

import { addCounters, gainControl, moveObjects, putOntoBattlefield, sacrifice, searchLibrary, shuffleLibrary } from './actions.ts';
import { chooseItems, objItem, yesNo } from './ask.ts';
import { controllerOf, manaValue, nameOf } from './chars.ts';
import type { ActivatedDef, Gen, TriggeredDef } from './defs.ts';
import { activated, cost, on, triggered } from './dsl.ts';
import { mayPay } from './efeitos.ts';
import type { G } from './game-context.ts';
import { emit } from './triggers.ts';
import type { ObjId, PlayerId } from './types.ts';

// ---------------------------------------------------------------------------
// Manutenção cumulativa (CR 702.24)
// ---------------------------------------------------------------------------
/**
 * CR 702.24a: "No início da sua manutenção, se este permanente estiver no campo, ponha um marcador de idade nele. Depois
 * você pode pagar [custo] para cada marcador de idade nele. Se não pagar, sacrifique-o." Só custo de mana genérica ou
 * colorida (o que os decks usam). Cada instância dispara separadamente e conta todos os marcadores (702.24b).
 */
export function cumulativeUpkeep(custo: string): TriggeredDef {
  const a = triggered(on.upkeep('you'), function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o || o.zone !== 'battlefield') return;
    addCounters(c.g, { kind: 'obj', id: c.source }, 'age', 1, c.you);
    const n = c.g.state.objects[c.source]?.counters.age ?? 0;
    const total = custoVezes(custo, n);
    // pagar é opcional e só por inteiro (ruling 1 de Mystic Remora)
    const pagou = total === '' || (yield* mayPay(c, c.you, total, `manter ${nameOf(c.g, c.source)} (manutenção cumulativa, ${n} marcador(es) de idade)`));
    if (!pagou && c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
  }, {
    // "se este permanente estiver no campo" (CR 603.4)
    condition: (c) => c.g.state.objects[c.source]?.zone === 'battlefield',
    text: `Manutenção cumulativa ${custo} (no início da sua manutenção, ponha um marcador de idade neste permanente; depois sacrifique-o a menos que pague ${custo} para cada marcador de idade nele).`,
  });
  a.kw = 'cumulative upkeep';
  a.param = custo;
  return a;
}

/** o custo de mana repetido n vezes ("{1}" × 3 = "{3}"; "{U}" × 2 = "{U}{U}") */
export function custoVezes(custo: string, n: number): string {
  if (n <= 0) return '';
  const simbolos = custo.match(/\{[^}]+\}/g) ?? [];
  let generico = 0;
  const resto: string[] = [];
  for (const s of simbolos) {
    const num = s.match(/^\{(\d+)\}$/);
    if (num) generico += Number(num[1]); else resto.push(s);
  }
  const g = generico * n;
  return `${g > 0 ? `{${g}}` : ''}${Array.from({ length: n }, () => resto.join('')).join('')}`;
}

// ---------------------------------------------------------------------------
// Segundo dividido (CR 702.61)
// ---------------------------------------------------------------------------
export { SPLIT_SECOND, splitSecondActive } from './controle-base.ts';

// ---------------------------------------------------------------------------
// Energia (CR 107.14)
// ---------------------------------------------------------------------------
export function energyOf(g: G, p: PlayerId): number {
  return g.state.players[p]?.counters.energy ?? 0;
}

/** "você recebe {E}{E}…" (CR 107.14): marcadores de energia no jogador */
export function getEnergy(g: G, p: PlayerId, n: number): number {
  if (n <= 0) return 0;
  const k = addCounters(g, { kind: 'player', id: p }, 'energy', n, p);
  if (k > 0) g.log(`${g.state.players[p].name} recebe ${k} de energia ({E}).`, { rule: '107.14' });
  return k;
}

/** pagar N {E} é tirar N marcadores de energia; não dá para pagar mais do que se tem (CR 107.14, ruling) */
export function payEnergy(g: G, p: PlayerId, n: number): boolean {
  if (n <= 0) return true;
  const pl = g.state.players[p];
  if ((pl.counters.energy ?? 0) < n) return false;
  pl.counters.energy -= n;
  if (pl.counters.energy === 0) delete pl.counters.energy;
  g.bump();
  g.log(`${pl.name} paga ${n} de energia ({E}).`, { rule: '107.14' });
  return true;
}

// ---------------------------------------------------------------------------
// Trocar o controle (CR 701.12)
// ---------------------------------------------------------------------------
/**
 * CR 701.12a-b: troca o controle de dois permanentes. Se a troca inteira não puder acontecer (um deles saiu do campo)
 * nada muda; se os dois são do mesmo controlador, também não. A troca não tem duração (fica até o fim da partida).
 * Devolve true se trocou.
 */
export function exchangeControl(g: G, a: ObjId, b: ObjId, source: ObjId): boolean {
  const oa = g.state.objects[a];
  const ob = g.state.objects[b];
  if (!oa || !ob || oa.zone !== 'battlefield' || ob.zone !== 'battlefield' || oa.phasedOut || ob.phasedOut) return false;
  const ca = controllerOf(g, a);
  const cb = controllerOf(g, b);
  if (ca === cb) return false;
  if (g.state.players[ca].left || g.state.players[cb].left) return false;
  gainControl(g, a, cb, { kind: 'permanent' }, source);
  gainControl(g, b, ca, { kind: 'permanent' }, source);
  g.log(`${nameOf(g, a)} e ${nameOf(g, b)} trocam de controlador.`, { rule: '701.12b' });
  return true;
}

// ---------------------------------------------------------------------------
// Manifestar o pavor (CR 701.62)
// ---------------------------------------------------------------------------
/**
 * CR 701.62a: olhe as duas cartas do topo do seu grimório, manifeste uma delas (CR 701.40) e ponha a outra no cemitério.
 * Com uma carta só, ela é manifestada; sem cartas, nada acontece (ruling 7). Emite `manifestDread` no fim, mesmo que
 * alguma parte tenha sido impossível (701.62b). Devolve o permanente manifestado.
 */
export function* manifestDread(g: G, p: PlayerId): Gen<ObjId | null> {
  const pl = g.state.players[p];
  if (pl.left) return null;
  const topo = g.state.zones.library[p].slice(0, 2);
  let res: ObjId | null = null;
  if (topo.length) {
    let escolhida = topo[0];
    if (topo.length > 1) {
      const [r] = yield* chooseItems(g, p, 'Manifestar o pavor: escolha a carta que entra virada para baixo como criatura 2/2 (a outra vai para o cemitério)', topo.map((id) => ({ ...objItem(g, id, nameOf(g, id)), card: { def: g.state.objects[id].def } })), 1, 1);
      escolhida = Number(r);
    }
    const [id] = yield* putOntoBattlefield(g, [{ id: escolhida, controller: p, faceDown: true, data: { manifestada: true } }], 'manifest');
    res = id ?? null;
    const outras = topo.filter((x) => x !== escolhida && g.state.objects[x]?.zone === 'library');
    if (outras.length) yield* moveObjects(g, outras.map((x) => ({ id: x, to: 'graveyard' as const })), 'manifestDread');
    g.log(`${pl.name} manifesta o pavor.`, { rule: '701.62a', visibleTo: [p], hiddenText: `${pl.name} manifesta o pavor.` });
  }
  emit(g, [{ type: 'manifestDread', player: p, obj: res }]);
  return res;
}

// ---------------------------------------------------------------------------
// Resistência a magia contra habilidades (CR 702.11d)
// ---------------------------------------------------------------------------
export { HEXPROOF_FROM_ABILITIES, sourceIsAbility } from './controle-base.ts';

/** pagar ou não, com pergunta simples (sem mana): usado pelo pagamento de energia */
export function* mayPayEnergy(g: G, p: PlayerId, n: number, label: string): Gen<boolean> {
  if (energyOf(g, p) < n) return false;
  if (!(yield* yesNo(g, p, `Pagar ${n} de energia ({E}) para ${label}? (você tem ${energyOf(g, p)})`, `Pagar ${n} {E}`, 'Não pagar'))) return false;
  return payEnergy(g, p, n);
}


// ---------------------------------------------------------------------------
// Transmutar (CR 702.53)
// ---------------------------------------------------------------------------
/**
 * CR 702.53a: "[Custo], descarte esta carta: procure uma carta com o mesmo valor de mana da carta descartada, revele-a e
 * ponha-a na sua mão. Depois embaralhe. Ative somente como feitiço." Só funciona da mão.
 */
export function transmute(custo: string): ActivatedDef {
  return activated([...cost(custo), { k: 'discardSelf' }], function* (c) {
    // o valor de mana da carta descartada (a última informação dela)
    const mv = c.g.state.objects[c.source] ? manaValue(c.g, c.source) : (c.g.state.lki[c.source]?.chars.manaValue ?? 0);
    const achadas = yield* searchLibrary(c.g, c.you, c.you, { max: 1, filter: (id) => manaValue(c.g, id) === mv, prompt: `Transmutar: procure uma carta com valor de mana ${mv}` });
    if (achadas.length) {
      c.g.log(`${c.g.state.players[c.you].name} revela ${nameOf(c.g, achadas[0])}.`, { rule: '701.20' });
      yield* moveObjects(c.g, [{ id: achadas[0], to: 'hand' }], 'search');
    }
    shuffleLibrary(c.g, c.you);
  }, { kw: 'transmute', param: custo, zones: ['hand'], timing: 'sorcery', text: `Transmutar ${custo} (${custo}, descarte esta carta: procure uma carta com o mesmo valor de mana desta, revele-a e ponha-a na sua mão; depois embaralhe. Só como feitiço).` });
}

// Peças do deck Foods (Sam e Frodo) feitas pelo agente foods-b: forragear (CR 701.61), fabricar (CR 702.123),
// "sempre que você sacrifica uma Food" e "sempre que uma Food vai do campo para um cemitério".
import { addCounters, chooseItems, controlledBy, createTokens, exile, nameOf, objItem, on, sacrifice, triggered, yesNo } from '../motor/api.ts';
import type { CostPart, TriggeredDef, TriggerSpec } from '../motor/defs.ts';
import type { Chars, ObjId } from '../motor/types.ts';
import type { G } from '../motor/game-context.ts';
import { ehComida } from './esquilos.ts';

/** as características (na última informação conhecida) são de uma Food? (CR 205.3g: tipo de artefato) */
export function caracteristicasDeComida(ch: Chars | undefined | null): boolean {
  return !!ch && ch.types.includes('Artifact') && ch.subtypes.includes('Food');
}

/**
 * Custo "Forragear" (CR 701.61a): "Exile três cartas do seu cemitério ou sacrifique uma Food". Com as duas opções, o
 * jogador escolhe. Grava em `costInfo` `forage: 'exile' | 'food'` e, se sacrificou, `sacrificed`.
 */
export function forragear(): CostPart {
  return {
    k: 'custom', label: 'forragear (exile três cartas do seu cemitério ou sacrifique uma Food)',
    canPay: (c) => c.g.state.zones.graveyard[c.you].length >= 3 || controlledBy(c.g, c.you, (id) => ehComida(c.g, id)).length > 0,
    *pay(c) {
      const g = c.g;
      const cem = g.state.zones.graveyard[c.you];
      const comidas = controlledBy(g, c.you, (id) => ehComida(g, id));
      const podeExilar = cem.length >= 3;
      if (!podeExilar && !comidas.length) return false;
      let sacrificar = !podeExilar;
      if (podeExilar && comidas.length) {
        const [modo] = yield* chooseItems(g, c.you, 'Forragear: como pagar?', [
          { id: 'exile', label: 'Exilar três cartas do seu cemitério' },
          { id: 'food', label: 'Sacrificar uma Food' },
        ], 1, 1);
        sacrificar = modo === 'food';
      }
      if (sacrificar) {
        const [esc] = comidas.length === 1 ? [String(comidas[0])]
          : yield* chooseItems(g, c.you, 'Forragear: sacrifique uma Food', comidas.map((id) => objItem(g, id, nameOf(g, id))), 1, 1);
        const r = yield* sacrifice(g, [Number(esc)]);
        if (!r.some((x) => x !== null)) return false;
        return { forage: 'food', sacrificed: [Number(esc)] };
      }
      const ids = (yield* chooseItems(g, c.you, 'Forragear: exile três cartas do seu cemitério', cem.map((id) => objItem(g, id, nameOf(g, id))), 3, 3)).map(Number);
      yield* exile(g, ids);
      return { forage: 'exile' };
    },
  };
}

/** "Sempre que você sacrifica uma Food": um gatilho por Food sacrificada, pela última informação conhecida */
export function voceSacrificaComida(): TriggerSpec {
  return on.custom((e, c) => e.type === 'sacrifice' && e.player === c.you && caracteristicasDeComida(c.g.state.lki[e.old]?.chars));
}

/** "Sempre que você sacrifica uma ou mais Foods": um gatilho por lote de eventos */
export function voceSacrificaComidas(): TriggerSpec {
  return on.batch((evs, c) => evs.some((e) => e.type === 'sacrifice' && e.player === c.you && caracteristicasDeComida(c.g.state.lki[e.old]?.chars)));
}

/** "Sempre que uma Food é colocada num cemitério vinda do campo" (de qualquer jogador; CR 603.10a: olha para trás) */
export function comidaVaiParaOCemiterio(): TriggerSpec {
  return on.custom((e, c) => e.type === 'zone' && e.from === 'battlefield' && e.to === 'graveyard' && caracteristicasDeComida(c.g.state.lki[e.old]?.chars));
}

/**
 * Fabricar N (CR 702.123a): "Quando este permanente entra, você pode colocar N marcadores +1/+1 nele. Se não fizer
 * isso, crie N fichas de criatura artefato Servo 1/1 incolor." Se ele já saiu do campo, só cria os Servos (ruling).
 */
export function fabricar(n: number): TriggeredDef {
  return triggered(on.selfEnters(), function* (c) {
    const g = c.g;
    const noCampo = g.state.objects[c.source]?.zone === 'battlefield';
    const marcadores = noCampo && (yield* yesNo(g, c.you, `Fabricar ${n}: colocar ${n === 1 ? 'um marcador +1/+1' : `${n} marcadores +1/+1`} em ${nameOf(g, c.source)}?`, n === 1 ? 'Marcador +1/+1' : 'Marcadores +1/+1', n === 1 ? 'Ficha Servo' : 'Fichas Servo'));
    if (marcadores) addCounters(g, { kind: 'obj', id: c.source }, '+1/+1', n, c.you);
    else yield* createTokens(g, c.you, 'Servo', n);
  }, { text: `Fabricar ${n} (quando esta criatura entra, coloque ${n === 1 ? 'um marcador +1/+1' : `${n} marcadores +1/+1`} nela ou crie ${n === 1 ? 'uma ficha' : `${n} fichas`} de criatura artefato Servo 1/1 incolor.)` });
}

/** fichas que entraram neste turno sob o controle de p (Ocelot Pride) */
export function fichasQueEntraramNoTurno(g: G, p: number): ObjId[] {
  const s = g.state;
  const entrou = s.enteredThisTurn?.turn === s.turn.number ? s.enteredThisTurn.objs : [];
  return controlledBy(g, p, (id) => !!s.objects[id]?.isToken && entrou.includes(id));
}

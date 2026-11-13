// lote4-a (deck Jund Lands, Hearthhull): recursos de "terrenos importam" que faltavam ao motor. Tudo aditivo; teste de
// regra em testes/regras-terrenos.test.ts.
//
// - Mana que depende do que foi pago no custo (CR 106.7): `ManaAbilityDef.produceFromCost`, resolvida aqui por
//   `manaDoCusto` (chamada em costs.ts activateManaAbility). Squandered Resources: "Sacrifique um terreno: adicione uma
//   mana de qualquer tipo que o terreno sacrificado poderia produzir". `sacrificarTerrenoAnotandoMana()` é a parte de
//   custo que sacrifica o terreno anotando, antes de ele sair do campo, o que ele poderia produzir.
// - Manutenção cumulativa com pagamento de vida (CR 702.24a, 119.4): `cumulativeUpkeepLife(n)` (Glacial Chasm). A de mana
//   continua em controle.ts.

import { addCounters, loseLife, sacrifice } from './actions.ts';
import { chooseItems, objItem, yesNo } from './ask.ts';
import { controllerOf, isLand, nameOf } from './chars.ts';
import type { CostPart, Gen, ManaAbilityDef, SCtx, TriggeredDef } from './defs.ts';
import { on, triggered } from './dsl.ts';
import { couldProduce } from './efeitos.ts';
import type { G } from './game-context.ts';
import type { ManaType, ObjId, PlayerId } from './types.ts';

const ROTULO_MANA: Record<string, string> = { W: '{W}', U: '{U}', B: '{B}', R: '{R}', G: '{G}', C: '{C}' };

/**
 * A mana de uma habilidade com `produceFromCost`, depois de pagar o custo. Se a alternativa que o pagamento automático
 * pediu (`sugerida`) é possível, fica com ela; com uma só possibilidade, essa; senão o jogador escolhe. Sem possibilidade,
 * nenhuma mana (ruling 1 de Squandered Resources: o terreno que não produz mana não dá nada).
 */
export function* manaDoCusto(g: G, player: PlayerId, source: ObjId, def: ManaAbilityDef, info: Record<string, unknown>, sugerida: ManaType[]): Gen<ManaType[]> {
  const alts = def.produceFromCost!({ g, you: player, source }, info).filter((a) => a.length > 0);
  if (!alts.length) return [];
  const igual = alts.find((a) => a.join('') === sugerida.join(''));
  if (igual) return igual;
  if (alts.length === 1) return alts[0];
  const [k] = yield* chooseItems(g, player, `${nameOf(g, source)}: escolha a mana`, alts.map((a, i) => ({ id: String(i), label: a.map((t) => ROTULO_MANA[t] ?? t).join('') })), 1, 1);
  return alts[Number(k)] ?? alts[0];
}

/**
 * Parte de custo "Sacrifique um terreno" que anota em costInfo.tiposDoSacrificado o que o terreno poderia produzir no
 * momento em que foi sacrificado (CR 106.7: as habilidades de mana que ele tinha no campo, inclusive concedidas).
 */
export function sacrificarTerrenoAnotandoMana(): CostPart {
  const meus = (c: SCtx) => c.g.state.zones.battlefield.filter((id) => !c.g.state.objects[id].phasedOut && controllerOf(c.g, id) === c.you && isLand(c.g, id));
  return {
    k: 'custom', label: 'Sacrifique um terreno',
    canPay: (c) => meus(c).length > 0,
    *pay(c) {
      const cands = meus(c);
      if (!cands.length) return false;
      const [esc] = yield* chooseItems(c.g, c.you, 'Sacrifique um terreno', cands.map((id) => objItem(c.g, id, nameOf(c.g, id))), 1, 1);
      const id = Number(esc);
      const tipos = couldProduce(c.g, id);
      yield* sacrifice(c.g, [id]);
      return { sacrificed: [id], tiposDoSacrificado: tipos };
    },
  };
}

/** "Manutenção cumulativa — Pague N pontos de vida" (CR 702.24a; só se a vida der, CR 119.4) */
export function cumulativeUpkeepLife(n: number): TriggeredDef {
  const a = triggered(on.upkeep('you'), function* (c) {
    const o = c.g.state.objects[c.source];
    if (!o || o.zone !== 'battlefield') return;
    addCounters(c.g, { kind: 'obj', id: c.source }, 'age', 1, c.you);
    const idade = c.g.state.objects[c.source]?.counters.age ?? 0;
    const total = n * idade;
    let pagou = total === 0;
    if (!pagou && c.g.state.players[c.you].life >= total) {
      pagou = yield* yesNo(c.g, c.you, `Pagar ${total} de vida para manter ${nameOf(c.g, c.source)}? (manutenção cumulativa, ${idade} marcador(es) de idade)`, 'Pagar', 'Sacrificar');
      if (pagou) loseLife(c.g, c.you, total, c.source);
    }
    if (!pagou && c.g.state.objects[c.source]?.zone === 'battlefield') yield* sacrifice(c.g, [c.source]);
  }, {
    condition: (c) => c.g.state.objects[c.source]?.zone === 'battlefield',
    text: `Manutenção cumulativa — Pague ${n} de vida. (No início da sua manutenção, ponha um marcador de idade neste permanente; depois sacrifique-o a menos que pague ${n} de vida para cada marcador de idade nele.)`,
  });
  a.kw = 'cumulative upkeep';
  a.param = `Pay ${n} life`;
  return a;
}

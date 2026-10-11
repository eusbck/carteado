// Xander's Pact
// Casualty 2 (As you cast this spell, you may sacrifice a creature with power 2 or greater. When you do, copy this
// spell.)
// Each opponent exiles the top card of their library. You may cast spells from among those cards this turn. If you cast
// a spell this way, pay life equal to that spell's mana value rather than pay its mana cost.
import { casualty, defineAbility, defineCard, exile, isLand, manaValue, ruleEffect } from '../../motor/api.ts';
import type { SCtx, StaticDef } from '../../motor/defs.ts';
import type { ObjId, PlayerId } from '../../motor/types.ts';

const baixa = casualty(2);

// "Você pode conjurar mágicas dentre essas cartas neste turno", pagando vida igual ao valor de mana em vez do custo de mana
const PERMISSAO = defineAbility<StaticDef>("Xander's Pact:permissao", {
  kind: 'static',
  rules: {
    mayPlayFrom: (c, p, carta) => {
      const prm = (c as SCtx & { params?: { objs: ObjId[]; player: PlayerId } }).params;
      if (!prm || prm.player !== p || !prm.objs.includes(carta)) return null;
      // só mágicas: um terreno exilado assim não pode ser jogado
      if (c.g.state.objects[carta]?.zone !== 'exile' || isLand(c.g, carta)) return null;
      const valor = manaValue(c.g, carta);
      // rulings 1-2 (CR 118.9): custo alternativo no lugar do custo de mana; X vale 0
      return { key: `xander:${carta}`, label: `Xander's Pact (pagar ${valor} de vida)`, free: true, parts: valor > 0 ? [{ k: 'life', n: valor }] : [] };
    },
  },
});

export default defineCard({
  name: "Xander's Pact",
  faces: [{
    // CR 702.153a: custo adicional opcional de sacrificar + gatilho de conjuração que copia a mágica
    additionalCosts: [baixa.cost],
    abilities: [baixa.trigger],
    spell: {
      *effect(c) {
        const g = c.g;
        const topos = g.opponents(c.you).map((p) => g.state.zones.library[p][0]).filter((id): id is ObjId => id !== undefined);
        if (!topos.length) return;
        const exiladas = (yield* exile(g, topos)).filter((id): id is ObjId => id !== null && id !== undefined);
        if (exiladas.length) ruleEffect(c, PERMISSAO.id!, { kind: 'endOfTurn' }, { params: { objs: exiladas, player: c.you } });
      },
    },
  }],
  rulings: {
    1: 'teste: cada oponente exila o topo; você conjura essas mágicas neste turno pagando vida igual ao valor de mana',
    2: 'regra geral: CR 107.3b — X vale 0 ao conjurar sem pagar o custo de mana (motor/stack.ts)',
    3: 'regra geral: CR 702.153a — custo adicional opcional e gatilho que copia a mágica (cartas/defs/a-little-chat.test.ts)',
    4: 'regra geral: CR 702.153a — só uma criatura é sacrificada e a mágica é copiada uma vez (motor/conjurar-alternativo.ts casualty)',
    5: 'teste: CR 702.153a: com a baixa paga, a cópia resolve primeiro e cada oponente exila duas cartas',
    6: 'regra geral: CR 707.10 — a cópia não é conjurada (motor/stack.ts copySpell)',
  },
});

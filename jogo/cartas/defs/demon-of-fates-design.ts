// Demon of Fate's Design
// Flying, trample
// Once during each of your turns, you may cast an enchantment spell by paying life equal to its mana value rather than
// paying its mana cost.
// {2}{B}, Sacrifice another enchantment: This creature gets +X/+0 until end of turn, where X is the sacrificed
// enchantment's mana value.
import { activated, defineCard, isType, keywords, lkiChars, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';
import { vidaEmVezDeMana } from '../milagres.ts';

export default defineCard({
  name: "Demon of Fate's Design",
  faces: [{
    abilities: [
      ...keywords('flying', 'trample'),
      vidaEmVezDeMana("Demon of Fate's Design:vida",
        'Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de encantamento pagando vida igual ao valor de mana dela em vez de pagar o custo de mana.',
        (g, carta) => isType(g, carta, 'Enchantment')),
      activated('{2}{B}, Sacrifice another enchantment', function* (c) {
        const sac = ((c.data.costInfo as { sacrificed?: ObjId[] } | undefined)?.sacrificed ?? [])[0];
        const x = sac !== undefined ? (lkiChars(c.g, sac)?.manaValue ?? 0) : 0;
        if (c.g.state.objects[c.source]?.zone === 'battlefield') untilEndOfTurn(c, [c.source], [{ k: 'pt', p: x, t: 0 }]);
      }, { text: '{2}{B}, Sacrifique outro encantamento: Esta criatura recebe +X/+0 até o fim do turno, onde X é o valor de mana do encantamento sacrificado.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 118.9 — pagar vida em vez do custo de mana é custo alternativo: não se junta a outro; custos adicionais continuam (motor/stack.ts)',
    2: 'regra geral: CR 107.3b — sem pagar o custo de mana, X só pode ser 0 (motor/stack.ts)',
  },
});

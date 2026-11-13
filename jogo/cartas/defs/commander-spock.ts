// Commander Spock
// Strange new worlds — Whenever Commander Spock enters or attacks, reveal the top card of your library. You may cast
// that card without paying its mana cost if that spell's mana value is equal to or less than the number of differently
// named lands you control. If it's a land card, you may put it onto the battlefield tapped. If that card is still on
// top of your library, draw a card.
import { defineCard, draw, isLand, manaValue, mayCastFree, nameOf, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';
import type { Ctx, Gen } from '../../motor/defs.ts';
import { terrenosComNomesDiferentes } from '../startrek.ts';
import { jog, obj, reg } from '../../motor/registro.ts';

function* novosMundos(c: Ctx): Gen<void> {
  const s = c.g.state;
  const topo = s.zones.library[c.you][0];
  if (topo === undefined) return;
  reg(c.g, 'revela', { rule: '701.20' })`${jog(c.you)} revela ${obj(topo)}.`;
  if (isLand(c.g, topo)) {
    if (yield* yesNo(c.g, c.you, `Commander Spock: pôr ${nameOf(c.g, topo)} no campo, virado?`, 'Pôr no campo', 'Deixar no topo')) {
      yield* putOntoBattlefield(c.g, [{ id: topo, controller: c.you, tapped: true }], 'effect');
    }
  } else if (manaValue(c.g, topo) <= terrenosComNomesDiferentes(c.g, c.you)) {
    // CR 608.2g, 601.2: conjurada durante a resolução, sem pagar o custo de mana
    yield* mayCastFree(c.g, c.you, topo, `Commander Spock: conjurar ${nameOf(c.g, topo)} sem pagar o custo de mana?`);
  }
  // "se essa carta ainda estiver no topo do seu grimório, compre uma carta" (o mesmo objeto, CR 400.7)
  if (c.g.state.zones.library[c.you][0] === topo) yield* draw(c.g, c.you, 1);
}

const TEXTO = 'Strange new worlds — Sempre que Commander Spock entra ou ataca, revele a carta do topo do seu grimório. Você pode conjurá-la sem pagar o custo de mana se o valor de mana dessa mágica for menor ou igual ao número de terrenos com nomes diferentes que você controla. Se for uma carta de terreno, você pode pô-la no campo virada. Se essa carta ainda estiver no topo do seu grimório, compre uma carta.';

export default defineCard({
  name: 'Commander Spock',
  faces: [{
    abilities: [
      triggered(on.selfEnters(), novosMundos, { text: TEXTO }),
      triggered(on.selfAttacks(), novosMundos, { text: TEXTO }),
    ],
  }],
  rulings: {},
});

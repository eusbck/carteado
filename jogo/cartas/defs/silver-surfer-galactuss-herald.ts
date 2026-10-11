// Silver Surfer, Galactus's Herald
// Flying
// When Silver Surfer enters, you may search your library for a card named Galactus, Devourer of Worlds, reveal it, put
// it into your hand, then shuffle.
// Whenever Silver Surfer deals combat damage to a player, until the end of your next turn, target creature attacks that
// player each combat if able.
import { addEffect, defineCard, etb, keyword, nameOf, on, searchTo, t, tgt, triggered, yesNo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: "Silver Surfer, Galactus's Herald",
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        if (!(yield* yesNo(c.g, c.you, 'Silver Surfer: procurar Galactus, Devourer of Worlds no seu grimório?'))) return;
        yield* searchTo(c, c.you, (id) => nameOf(c.g, id) === 'Galactus, Devourer of Worlds', 1, 'hand', { reveal: true, prompt: 'Silver Surfer: escolha Galactus, Devourer of Worlds' });
      }, { text: 'Quando Silver Surfer entra, você pode procurar no seu grimório um card chamado Galactus, Devourer of Worlds, revelá-lo, colocá-lo na sua mão e depois embaralhar.'.replace('um card', 'uma carta').replace('revelá-lo, colocá-lo', 'revelá-la, colocá-la') }),
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // a exigência de atacar esse jogador (CR 508.1d) dura até o fim do seu próximo turno
        addEffect(c.g, {
          source: c.source, sourceDef: '', controller: c.you, affected: [id],
          duration: { kind: 'endOfYourNextTurn', player: c.you, afterTurn: c.g.state.turn.number },
          mods: [{ k: 'rule', id: 'rule:attacksIfAble', params: { player: c.event.player as PlayerId } }],
        });
      }, { targets: [t.creature()], text: 'Sempre que Silver Surfer causa dano de combate a um jogador, até o fim do seu próximo turno, a criatura alvo ataca esse jogador a cada combate se puder.' }),
    ],
  }],
  rulings: {},
});

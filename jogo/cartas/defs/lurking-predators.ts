// Lurking Predators
// Whenever an opponent casts a spell, reveal the top card of your library. If it's a creature card, put it onto the
// battlefield. Otherwise, you may put that card on the bottom of your library.
import { defineCard, isCreature, moveObjects, nameOf, on, putOntoBattlefield, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Lurking Predators',
  faces: [{
    abilities: [
      // ruling 1: resolve antes da mágica que o disparou
      triggered(on.custom((e, c) => e.type === 'cast' && !e.copy && c.g.isOpponent(c.you, e.player)), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        c.g.log(`${c.g.state.players[c.you].name} revela ${nameOf(c.g, topo)} (Lurking Predators).`, { rule: '701.20a' });
        // ruling 2: carta de criatura entra obrigatoriamente; ruling 3: qualquer carta com o tipo criatura
        if (isCreature(c.g, topo)) {
          yield* putOntoBattlefield(c.g, [{ id: topo, controller: c.you }], 'effect');
          return;
        }
        if (yield* yesNo(c.g, c.you, `Lurking Predators: colocar ${nameOf(c.g, topo)} no fundo do seu grimório?`)) yield* moveObjects(c.g, [{ id: topo, to: 'library', position: 'bottom' }], 'effect');
      }, { text: 'Sempre que um oponente conjura uma mágica, revele a carta do topo do seu grimório. Se for uma carta de criatura, coloque-a no campo de batalha. Senão, você pode colocar essa carta no fundo do seu grimório.' }),
    ],
  }],
  rulings: {
    1: 'teste: a criatura revelada entra antes de a mágica do oponente resolver',
    2: 'teste: carta que não é de criatura pode ir para o fundo ou ficar no topo',
    3: 'regra geral: CR 300.1 — "carta de criatura" é qualquer carta com o tipo criatura, mesmo com outros tipos (motor/chars.ts isCreature)',
  },
});

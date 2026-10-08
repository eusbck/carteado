// Betor, Ancestor's Voice
// Flying, lifelink
// At the beginning of your end step, put a number of +1/+1 counters on up to one other target creature you control equal
// to the amount of life you gained this turn. Return up to one target creature card with mana value less than or equal
// to the amount of life you lost this turn from your graveyard to the battlefield.
import { addCounters, and, defineCard, is, keywords, manaValue, on, putOntoBattlefield, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: "Betor, Ancestor's Voice",
  faces: [{
    abilities: [
      ...keywords('flying', 'lifelink'),
      triggered(on.endStep('you'), function* (c) {
        const st = c.g.state.turnStats[c.you];
        const cri = tgt(c, 0);
        if (cri !== null && st.lifeGained > 0) addCounters(c.g, { kind: 'obj', id: cri }, '+1/+1', st.lifeGained, c.you);
        const carta = tgt(c, 1);
        if (carta !== null) yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, {
        targets: [
          upTo(1, t.creature(and(is.yours, is.other), 'até uma outra criatura alvo que você controla')),
          upTo(1, t.card('graveyard', (c, id) => is.creature(c, id) && manaValue(c.g, id) <= c.g.state.turnStats[c.you].lifeLost, 'até uma carta de criatura alvo com valor de mana até a vida perdida no turno')),
        ],
        text: 'No início da sua etapa final, coloque marcadores +1/+1 igual à vida que você ganhou neste turno em até uma outra criatura alvo sua. Devolva até uma carta de criatura alvo com valor de mana até a vida que você perdeu neste turno do seu cemitério para o campo.',
      }),
    ],
  }],
  rulings: {},
});

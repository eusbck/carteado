// Moseo, Vein's New Dean
// Flying
// When Moseo enters, create a 1/1 black and green Pest creature token with "Whenever this token attacks, you gain 1
// life."
// Infusion — At the beginning of your end step, if you gained life this turn, return up to one target creature card with
// mana value X or less from your graveyard to the battlefield, where X is the amount of life you gained this turn.
import { and, createTokens, defineCard, etb, is, keyword, manaValue, on, putOntoBattlefield, t, tgt, triggered, upTo } from '../../motor/api.ts';

export default defineCard({
  name: "Moseo, Vein's New Dean",
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) { yield* createTokens(c.g, c.you, 'Pest (ataque)', 1); }, { text: 'Quando Moseo entra, crie uma ficha de criatura Pest preta e verde 1/1 com "Sempre que esta ficha ataca, você ganha 1 de vida."' }),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // ruling 2: verificado ao começar a etapa final (CR 603.4)
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        targets: [upTo(1, t.card('graveyard', and(is.creature, (c, id) => manaValue(c.g, id) <= c.g.state.turnStats[c.you].lifeGained), 'até uma carta de criatura alvo com valor de mana até a vida ganha no turno'))],
        text: 'Infusão — No início da sua etapa final, se você ganhou vida neste turno, devolva até uma carta de criatura alvo com valor de mana X ou menos do seu cemitério ao campo, onde X é a vida que você ganhou neste turno.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 202.3e — X vale 0 no cemitério',
    2: 'teste: sem vida ganha, não dispara',
  },
});

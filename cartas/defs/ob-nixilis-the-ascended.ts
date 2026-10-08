// Ob Nixilis, the Ascended
// Flying
// When Ob Nixilis enters, destroy all tapped creatures your opponents control. You gain 1 life for each creature
// destroyed this way.
// At the beginning of each end step, if you gained life this turn, create a 4/4 white Angel creature token with flying.
import { controllerOf, createTokens, defineCard, destroy, etb, gainLife, isCreature, keyword, on, permanentsMatching, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Ob Nixilis, the Ascended',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const alvos = permanentsMatching(c.g, (id) => isCreature(c.g, id) && c.g.state.objects[id].tapped && c.g.isOpponent(c.you, controllerOf(c.g, id)));
        // CR 702.12b: indestrutíveis não são destruídas e não contam
        const destruidas = (yield* destroy(c.g, alvos)).filter((x) => x !== null).length;
        if (destruidas > 0) gainLife(c.g, c.you, destruidas, c.source);
      }, { text: 'Quando Ob Nixilis entra, destrua todas as criaturas viradas que seus oponentes controlam. Você ganha 1 de vida para cada criatura destruída dessa forma.' }),
      triggered(on.endStep('each'), function* (c) {
        yield* createTokens(c.g, c.you, 'Angel', 1);
      }, {
        // CR 603.4: cláusula "se" verificada ao disparar e ao resolver; ruling 1: perdas no turno não importam
        condition: (c) => c.g.state.turnStats[c.you].lifeGained > 0,
        text: 'No início de cada etapa final, se você ganhou vida neste turno, crie uma ficha de criatura Anjo branca 4/4 com voar.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 — ganhou 2 e perdeu 4 no turno: ainda cria o Anjo, também na etapa final de um oponente',
  },
});

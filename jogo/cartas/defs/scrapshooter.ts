// Scrapshooter
// Gift a card (You may promise an opponent a gift as you cast this spell. If you do, when it enters, they draw a card.)
// Reach
// When this creature enters, if the gift was promised, destroy target artifact or enchantment an opponent controls.
import { and, defineCard, destroy, etb, giftCard, is, keyword, or, t, tgt } from '../../motor/api.ts';
import { presenteAoEntrar, presentePrometidoA } from '../dinossauros.ts';

const PRESENTE = giftCard();

export default defineCard({
  name: 'Scrapshooter',
  faces: [{
    // CR 702.174a: custo adicional opcional de escolher o oponente, ao conjurar
    gift: PRESENTE,
    abilities: [
      // CR 702.174b: no permanente, o presente é um gatilho de entrar (ruling 2)
      presenteAoEntrar(PRESENTE, 'Presente de uma carta: quando entra, se o presente foi prometido, o oponente escolhido compra uma carta.'),
      keyword('reach'),
      // ruling 7: pode prometer mesmo sem alvo para esta habilidade
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        condition: (c) => presentePrometidoA(c.g, c.source) !== null,
        targets: [t.permanent(and(or(is.artifact, is.enchantment), is.opponents), 'artefato ou encantamento alvo que um oponente controla')],
        text: 'Quando esta criatura entra, se o presente foi prometido, destrua o artefato ou encantamento alvo que um oponente controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: prometendo o presente, o oponente compra uma carta e o artefato dele é destruído',
    2: 'teste: prometendo o presente, o oponente compra uma carta e o artefato dele é destruído',
    3: 'não se aplica: Scrapshooter é uma criatura, não instantânea nem feitiço',
    4: 'regra geral: CR 608.3 — anulada, a mágica não entra e o presente não é dado (motor/stack.ts)',
    5: 'regra geral: CR 702.174a — o presente é prometido uma vez só, na conjuração (motor/stack.ts)',
    6: 'regra geral: CR 702.174b — só o permanente que veio da mágica tem o presente prometido (cartas/dinossauros.ts presentePrometidoA)',
    7: 'teste: sem prometer, ninguém compra e nada é destruído',
    8: 'não se aplica: texto geral sobre os tipos de presente',
  },
});

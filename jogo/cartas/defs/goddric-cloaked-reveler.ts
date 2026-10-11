// Goddric, Cloaked Reveler
// Haste
// Celebration — As long as two or more nonland permanents entered the battlefield under your control this turn, Goddric
// is a Dragon with base power and toughness 4/4, flying, and "{R}: Dragons you control get +1/+0 until end of turn."
// (He loses all other creature types.)
import { activated, chars, controlledBy, defineAbility, defineCard, keyword, selfGets, untilEndOfTurn } from '../../motor/api.ts';

const SOPRO = defineAbility('Goddric, Cloaked Reveler:sopro', activated('{R}', function* (c) {
  // ruling 2 (CR 611.2c): só os Dragons que você controla na resolução
  untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => chars(c.g, id).subtypes.includes('Dragon')), [{ k: 'pt', p: 1, t: 0 }]);
}, { text: '{R}: Os Dragons que você controla recebem +1/+0 até o fim do turno.' }));

export default defineCard({
  name: 'Goddric, Cloaked Reveler',
  faces: [{
    abilities: [
      keyword('haste'),
      // celebração (palavra de habilidade, CR 207.2c); rulings 6-7: bastam dois, e eles não precisam continuar no campo
      selfGets((c, o) => [
        // "é um Dragon": troca os tipos de criatura (perde Human e Noble), mantendo os tipos de carta e os supertipos
        { k: 'setTypes', types: [...chars(c.g, o.id).types], subtypes: ['Dragon'], keepSupertypes: true },
        { k: 'setPT', p: 4, t: 4 },
        { k: 'addKeyword', kw: 'flying' },
        { k: 'addAbility', id: SOPRO.id! },
      ], 'Celebração — Enquanto dois ou mais permanentes que não são terrenos tiverem entrado no campo de batalha sob o seu controle neste turno, Goddric é um Dragon com força e resistência básicas 4/4, voar e "{R}: Os Dragons que você controla recebem +1/+0 até o fim do turno." (Ele perde todos os outros tipos de criatura.)', {
        condition: (c) => (c.g.state.turnStats[c.you]?.nonlandPermanentsEntered ?? 0) >= 2,
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 613.6 — o efeito que já começou numa camada anterior continua mesmo que ele perca as habilidades (motor/chars.ts)',
    2: 'teste: {R} dá +1/+0 só aos Dragons que você controla na resolução',
    3: 'não se aplica: fala das outras cartas com celebração',
    4: 'não se aplica: fala das outras cartas com celebração',
    5: 'teste: com dois permanentes não terrenos entrando no turno, vira um Dragon 4/4 com voar; no turno seguinte volta ao normal',
    6: 'teste: terrenos não contam, e um permanente só não basta',
    7: 'teste: os permanentes que entraram não precisam continuar no campo',
  },
});

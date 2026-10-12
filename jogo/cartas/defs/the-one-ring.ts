// The One Ring
// Indestructible
// When The One Ring enters, if you cast it, you gain protection from everything until your next turn.
// At the beginning of your upkeep, you lose 1 life for each burden counter on The One Ring.
// {T}: Put a burden counter on The One Ring, then draw a card for each burden counter on The One Ring.
import { activated, addCounters, defineCard, draw, etb, keyword, loseLife, on, ruleEffect, triggered } from '../../motor/api.ts';
import { PROTECAO_TUDO } from '../jin.ts';

export default defineCard({
  name: 'The One Ring',
  faces: [{
    abilities: [
      keyword('indestructible'),
      etb(function* (c) {
        ruleEffect(c, 'rule:playerProtection', { kind: 'untilYourNextTurn', player: c.you, sinceTurn: c.g.state.turn.number }, { players: [c.you], params: { quality: 'everything' } });
      }, {
        // CR 603.4: "se você o conjurou"
        condition: (c) => (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.data.spell !== undefined,
        text: 'Quando The One Ring entra, se você o conjurou, você ganha proteção contra tudo até o seu próximo turno.',
      }),
      triggered(on.upkeep('you'), function* (c) {
        const n = c.g.state.objects[c.source]?.counters.burden ?? 0;
        if (n > 0) loseLife(c.g, c.you, n, c.source);
      }, { text: 'No início da sua manutenção, você perde 1 ponto de vida para cada marcador de fardo em The One Ring.' }),
      activated('{T}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'burden', 1, c.you);
        const n = (c.g.state.objects[c.source] ?? c.g.state.lki[c.source]?.obj)?.counters.burden ?? 0;
        if (n > 0) yield* draw(c.g, c.you, n);
      }, { text: '{T}: Coloque um marcador de fardo em The One Ring e depois compre uma carta para cada marcador de fardo em The One Ring.' }),
    ],
  }],
  rulings: {
    1: PROTECAO_TUDO.alvo,
    2: PROTECAO_TUDO.tres,
    3: 'regra geral: CR 615.12 — o dano que não pode ser prevenido reduz a sua vida normalmente (motor/actions.ts dealDamage)',
    4: PROTECAO_TUDO.soIsso,
  },
});
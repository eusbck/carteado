// Hearthhull, the Worldseed
// Station (It's an artifact creature at 8+.)
// 2+ | {1}, {T}, Sacrifice a land: Draw two cards. You may play an additional land this turn.
// 8+ | Flying, vigilance, haste
// Whenever you sacrifice a land, each opponent loses 2 life.
import { activated, defineCard, draw, extraLandThisTurn, loseLife, triggered } from '../../motor/api.ts';
import { comCargas, estacao, nivelDeEstacao } from '../estacao.ts';
import { sacrificaTerrenoCusto, voceSacrificaTerreno } from '../terras.ts';

export default defineCard({
  name: 'Hearthhull, the Worldseed',
  faces: [{
    abilities: [
      estacao(),
      activated([{ k: 'mana', cost: '{1}' }, { k: 'tap' }, sacrificaTerrenoCusto], function* (c) {
        yield* draw(c.g, c.you, 2);
        extraLandThisTurn(c.g, c.you);
      }, { condition: comCargas(2), text: '2+ | {1}, {T}, Sacrifique um terreno: Compre duas cartas. Você pode jogar um terreno adicional neste turno.' }),
      nivelDeEstacao(8, { criatura: true, mods: ['flying', 'vigilance', 'haste'].map((kw) => ({ k: 'addKeyword' as const, kw })) }, '8+ | Voar, vigilância, ímpeto. É uma criatura-artefato.'),
      triggered(voceSacrificaTerreno(), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 2, c.source);
      }, { text: 'Sempre que você sacrifica um terreno, cada oponente perde 2 de vida.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 903.3 — Espaçonave lendária com P/R pode ser comandante (motor/deck.ts)',
    2: 'regra geral: CR 702.184a — estação só como feitiço, virando outra criatura sua (cartas/estacao.ts)',
  },
});

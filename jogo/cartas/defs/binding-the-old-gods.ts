// Binding the Old Gods
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Destroy target nonland permanent an opponent controls.
// II — Search your library for a Forest card, put it onto the battlefield tapped, then shuffle.
// III — Creatures you control gain deathtouch until end of turn.
import { chapter, chars, controlledBy, controllerOf, defineCard, destroy, isCreature, sagaEnters, searchTo, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Binding the Old Gods',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1], function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [t.nonlandPermanent((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'permanente não terreno alvo que um oponente controla')],
        text: 'I — Destrua a permanente não terreno alvo que um oponente controla.',
      }),
      // "uma carta de Forest": qualquer carta com o tipo Forest, não só a básica
      chapter([2], function* (c) {
        yield* searchTo(c, c.you, (id) => chars(c.g, id).subtypes.includes('Forest'), 1, 'battlefield', { tapped: true, prompt: 'Procure uma carta de Forest' });
      }, { text: 'II — Procure no seu grimório uma carta de Forest, coloque-a no campo virada e depois embaralhe.' }),
      chapter([3], function* (c) {
        untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => isCreature(c.g, id)), [{ k: 'addKeyword', kw: 'deathtouch' }]);
      }, { text: 'III — As criaturas que você controla ganham toque mortífero até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: entra com um marcador e o capítulo I destrói uma permanente de um oponente; na fase principal seguinte, o II busca uma Forest virada',
    2: 'regra geral: CR 714.2b — capítulo dispara quando os marcadores chegam ao número dele (motor/mecanicas.ts chapter)',
    3: 'regra geral: CR 714.2c — capítulos já passados não disparam de novo (motor/mecanicas.ts chapter)',
    4: 'regra geral: CR 714.2 — a habilidade na pilha não depende mais da Saga',
    5: 'regra geral: CR 603.3b — com vários capítulos juntos, o controlador escolhe a ordem',
    6: 'regra geral: CR 714.2b — remover marcadores e pôr de novo dispara outra vez (motor/mecanicas.ts chapter)',
    7: 'teste: o III dá toque mortífero até o fim do turno e a Saga é sacrificada',
  },
});

// Bladewing the Risen
// Flying
// When Bladewing enters, you may return target Dragon permanent card from your graveyard to the battlefield.
// {B}{R}: Dragon creatures get +1/+1 until end of turn.
import { activated, allCreatures, defineCard, etb, isPermanentCard, isSubtype, keyword, putOntoBattlefield, t, tgt, untilEndOfTurn, upTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Bladewing the Risen',
  faces: [{
    abilities: [
      keyword('flying'),
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && c.g.state.objects[id]?.zone === 'graveyard') yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
      }, {
        // "você pode": o alvo é opcional
        targets: [upTo(1, t.card('graveyard', (c, id) => isPermanentCard(c.g, id) && isSubtype(c.g, id, 'Dragon'), 'carta de permanente Dragon alvo do seu cemitério', 'you'))],
        text: 'Quando Bladewing entra, você pode devolver ao campo a carta de permanente Dragon alvo do seu cemitério.',
      }),
      activated('{B}{R}', function* (c) {
        // CR 611.2c: vale para as criaturas Dragon que estão no campo na resolução, de qualquer jogador
        const ids = allCreatures(c.g).filter((id) => isSubtype(c.g, id, 'Dragon'));
        if (ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: 1, t: 1 }]);
      }, { text: '{B}{R}: As criaturas Dragon recebem +1/+1 até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
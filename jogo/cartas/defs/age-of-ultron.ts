// Age of Ultron
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — For each opponent, destroy up to one target nonartifact creature that player controls.
// II — For each opponent, you create a 2/2 colorless Robot Villain artifact creature token.
// III — Artifact creatures you control gain deathtouch until end of turn. Put a +1/+1 counter on each of them.
import { addCounters, chapter, createTokens, creaturesOf, defineCard, destroy, isType, sagaEnters, untilEndOfTurn } from '../../motor/api.ts';
import { umaPorOponente } from '../viloes.ts';

export default defineCard({
  name: 'Age of Ultron',
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1], function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' ? [r.id] : []));
        if (ids.length) yield* destroy(c.g, ids);
      }, {
        targets: [umaPorOponente('para cada oponente, até uma criatura alvo que não é artefato que esse jogador controla', (c, id) => !isType(c.g, id, 'Artifact'))],
        text: 'I — Para cada oponente, destrua até uma criatura alvo que não é artefato que esse jogador controla.',
      }),
      chapter([2], function* (c) {
        const n = c.g.opponents(c.you).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Robot Villain', n);
      }, { text: 'II — Para cada oponente, você cria uma ficha de criatura artefato Robot Villain 2/2 incolor.' }),
      chapter([3], function* (c) {
        const ids = creaturesOf(c.g, c.you).filter((id) => isType(c.g, id, 'Artifact'));
        if (!ids.length) return;
        untilEndOfTurn(c, ids, [{ k: 'addKeyword', kw: 'deathtouch' }]);
        for (const id of ids) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, { text: 'III — As criaturas artefato que você controla ganham toque mortífero até o fim do turno. Coloque um marcador +1/+1 em cada uma delas.' }),
    ],
  }],
  rulings: {},
});

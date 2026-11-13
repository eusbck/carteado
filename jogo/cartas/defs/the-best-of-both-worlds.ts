// The Best of Both Worlds
// (As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)
// I — Assimilate target nonartifact creature an opponent controls. (Gain control of it and put a +1/+1 counter on it.
// It's a Borg artifact creature and loses all other creature types.)
// II — Artifact creatures you control get +2/+2 until end of turn.
// III — Exile the Borg assimilated with this Saga, then return it to the battlefield under its owner's control.
import { and, assimilatePermanent, chapter, controlledBy, controllerOf, defineCard, is, moveObjects, not, putOntoBattlefield, sagaEnters, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { assimiladosPor, criaturaArtefato } from '../borg.ts';

const NOME = 'The Best of Both Worlds';

export default defineCard({
  name: NOME,
  faces: [{
    abilities: [
      // CR 714.3a
      sagaEnters(),
      chapter([1], function* (c) {
        const id = tgt(c);
        if (id !== null) assimilatePermanent(c.g, c.you, id, c.source, NOME);
      }, {
        targets: [t.creature(and(not(is.artifact), (c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id))), 'criatura que não é artefato alvo que um oponente controla')],
        text: 'I — Assimile a criatura que não é artefato alvo que um oponente controla (ganhe o controle dela e coloque um marcador +1/+1 nela; ela é uma criatura artefato Borg e perde todos os outros tipos de criatura).',
      }),
      chapter([2], function* (c) {
        untilEndOfTurn(c, controlledBy(c.g, c.you, (id) => criaturaArtefato(c, id)), [{ k: 'pt', p: 2, t: 2 }]);
      }, { text: 'II — As criaturas artefato que você controla recebem +2/+2 até o fim do turno.' }),
      // "o Borg assimilado com esta Saga": o mesmo objeto (CR 400.7); se ele já saiu do campo, nada acontece
      chapter([3], function* (c) {
        for (const id of assimiladosPor(c.g, c.source)) {
          const [noExilio] = yield* moveObjects(c.g, [{ id, to: 'exile' }], 'exile');
          if (noExilio === null || noExilio === undefined || c.g.state.objects[noExilio]?.zone !== 'exile') continue;
          yield* putOntoBattlefield(c.g, [{ id: noExilio, controller: c.g.state.objects[noExilio].owner }], 'effect');
        }
      }, { text: 'III — Exile o Borg assimilado com esta Saga e depois devolva-o ao campo sob o controle do dono.' }),
    ],
  }],
  rulings: {},
});

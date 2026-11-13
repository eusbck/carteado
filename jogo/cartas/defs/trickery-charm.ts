// Trickery Charm
// Choose one —
// • Target creature gains flying until end of turn.
// • Target creature becomes the creature type of your choice until end of turn.
// • Look at the top four cards of your library, then put them back in any order.
import { chooseCreatureType, defineCard, modal, t, tgt, untilEndOfTurn } from '../../motor/api.ts';
import { reordenaTopoDe } from '../milagres.ts';

export default defineCard({
  name: 'Trickery Charm',
  faces: [{
    spell: {
      modes: modal(1, 1, [
        {
          text: 'A criatura alvo ganha voar até o fim do turno',
          targets: [t.creature()],
          *effect(c) { const id = tgt(c); if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'flying' }]); },
        },
        {
          text: 'A criatura alvo passa a ser do tipo de criatura que você escolher até o fim do turno',
          targets: [t.creature()],
          *effect(c) {
            const id = tgt(c);
            if (id === null) return;
            const tipo = yield* chooseCreatureType(c.g, c.you, 'Trickery Charm: escolha o tipo de criatura');
            // CR 205.1b: troca os tipos de criatura; os outros tipos e subtipos ficam
            untilEndOfTurn(c, [id], [{ k: 'addTypes', subtypes: [tipo], loseOtherCreatureTypes: true }]);
          },
        },
        { text: 'Olhe as quatro cartas do topo do seu grimório e coloque-as de volta em qualquer ordem', *effect(c) { yield* reordenaTopoDe(c, c.you, 4, 'Trickery Charm'); } },
      ]),
    },
  }],
  rulings: {},
});

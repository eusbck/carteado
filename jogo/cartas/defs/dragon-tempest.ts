// Dragon Tempest
// Whenever a creature you control with flying enters, it gains haste until end of turn.
// Whenever a Dragon you control enters, it deals X damage to any target, where X is the number of Dragons you control.
import { and, controlledBy, dealDamage, defineCard, is, isSubtype, on, t, tgtRef, triggered, untilEndOfTurn } from '../../motor/api.ts';
import type { ObjId } from '../../motor/types.ts';

export default defineCard({
  name: 'Dragon Tempest',
  faces: [{
    abilities: [
      // ruling 3: as duas habilidades disparam para um Dragon com voar
      triggered(on.enters(and(is.creature, is.kw('flying'), is.yours)), function* (c) {
        const id = c.event.obj as ObjId;
        if (c.g.state.objects[id]?.zone === 'battlefield') untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'haste' }]);
      }, { text: 'Sempre que uma criatura com voar que você controla entra, ela ganha ímpeto até o fim do turno.' }),
      triggered(on.enters(and(is.subtype('Dragon'), is.yours)), function* (c) {
        const alvo = tgtRef(c);
        if (!alvo) return;
        // ruling 1: X = Dragons que você controla na resolução; ruling 2: o Dragon causa o dano mesmo fora do campo
        const x = controlledBy(c.g, c.you, (id) => isSubtype(c.g, id, 'Dragon')).length;
        if (x > 0) dealDamage(c.g, [{ source: c.event.obj as ObjId, target: alvo, amount: x, combat: false }]);
      }, {
        targets: [t.any()],
        text: 'Sempre que um Dragon que você controla entra, ele causa X de dano a qualquer alvo, onde X é o número de Dragons que você controla.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: X é contado na resolução',
    2: 'teste: o Dragon que entrou causa o dano mesmo fora do campo',
    3: 'teste: um Dragon com voar dispara as duas habilidades',
  },
});

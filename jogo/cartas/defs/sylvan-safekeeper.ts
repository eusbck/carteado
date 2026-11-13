// Sylvan Safekeeper
// Sacrifice a land: Target creature you control gains shroud until end of turn. (It can't be the target of spells or
// abilities.)
import { activated, defineCard, is, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Sylvan Safekeeper',
  faces: [{
    abilities: [
      activated('Sacrifice a land', function* (c) {
        const id = tgt(c);
        if (id !== null) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'shroud' }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: 'Sacrifique um terreno: A criatura alvo que você controla ganha manto até o fim do turno.' }),
    ],
  }],
  rulings: {},
});

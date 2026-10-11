// Mother of Runes
// {T}: Target creature you control gains protection from the color of your choice until end of turn.
import { activated, chooseColor, defineCard, is, t, tgt, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Mother of Runes',
  faces: [{
    abilities: [
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id === null) return;
        // a cor é escolhida na resolução
        const cor = yield* chooseColor(c.g, c.you, 'Mother of Runes: proteção contra qual cor?');
        untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'protection', param: `color:${cor}` }]);
      }, { targets: [t.creature(is.yours, 'criatura alvo que você controla')], text: '{T}: A criatura alvo que você controla ganha proteção contra a cor à sua escolha até o fim do turno.' }),
    ],
  }],
  rulings: {},
});
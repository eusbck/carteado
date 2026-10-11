// Voice of All
// Flying
// As this creature enters, choose a color.
// This creature has protection from the chosen color.
import { asEnters, chooseColor, defineCard, keyword, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Voice of All',
  faces: [{
    abilities: [
      keyword('flying'),
      asEnters(function* (c, ev) { ev.choices.cor = yield* chooseColor(c.g, ev.controller, 'Voice of All: escolha uma cor'); }, 'Ao entrar, escolha uma cor.'),
      selfGets((c, o) => {
        const cor = o.choices.cor as string | undefined;
        return [{ k: 'addKeyword', kw: 'protection', param: `color:${cor ?? ''}` }];
      }, 'Esta criatura tem proteção contra a cor escolhida.'),
    ],
  }],
  rulings: {},
});
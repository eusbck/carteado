// Thriving Moor
// This land enters tapped. As it enters, choose a color other than black.
// {T}: Add {B} or one mana of the chosen color.
import { asEnters, chooseColor, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Thriving Moor',
  faces: [{ abilities: [
    land.tapped(),
    // CR 614.1c e 614.12a: a cor é escolhida antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.cor = yield* chooseColor(c.g, c.you, 'Thriving Moor: escolha uma cor diferente de preto', ['W', 'U', 'R', 'G']);
    }, 'Ao entrar, escolha uma cor diferente de preto.'),
    mana((c) => {
      const cor = c.g.state.objects[c.source]?.choices.cor as ManaType | undefined;
      return cor ? [['B'], [cor]] : [['B']];
    }, { text: '{T}: Adicione {B} ou uma mana da cor escolhida.' }),
  ] }],
  rulings: {},
});

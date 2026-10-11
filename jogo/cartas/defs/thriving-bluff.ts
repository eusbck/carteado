// Thriving Bluff
// This land enters tapped. As it enters, choose a color other than red.
// {T}: Add {R} or one mana of the chosen color.
import { asEnters, chooseColor, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Thriving Bluff',
  faces: [{ abilities: [
    land.tapped(),
    // CR 614.1c e 614.12a: a cor é escolhida antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.cor = yield* chooseColor(c.g, c.you, 'Thriving Bluff: escolha uma cor diferente de vermelho', ['W', 'U', 'B', 'G']);
    }, 'Ao entrar, escolha uma cor diferente de vermelho.'),
    mana((c) => {
      const cor = c.g.state.objects[c.source]?.choices.cor as ManaType | undefined;
      return cor ? [['R'], [cor]] : [['R']];
    }, { text: '{T}: Adicione {R} ou uma mana da cor escolhida.' }),
  ] }],
  rulings: {},
});

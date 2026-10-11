// Thriving Grove
// This land enters tapped. As it enters, choose a color other than green.
// {T}: Add {G} or one mana of the chosen color.
import { asEnters, chooseColor, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Thriving Grove',
  faces: [{ abilities: [
    land.tapped(),
    // CR 614.1c e 614.12a: a cor é escolhida antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.cor = yield* chooseColor(c.g, c.you, 'Thriving Grove: escolha uma cor diferente de verde', ['W', 'U', 'B', 'R']);
    }, 'Ao entrar, escolha uma cor diferente de verde.'),
    mana((c) => {
      const cor = c.g.state.objects[c.source]?.choices.cor as ManaType | undefined;
      return cor ? [['G'], [cor]] : [['G']];
    }, { text: '{T}: Adicione {G} ou uma mana da cor escolhida.' }),
  ] }],
  rulings: {},
});

// Thriving Isle
// This land enters tapped. As it enters, choose a color other than blue.
// {T}: Add {U} or one mana of the chosen color.
import { asEnters, chooseColor, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Thriving Isle',
  faces: [{ abilities: [
    land.tapped(),
    // CR 614.1c e 614.12a: a cor é escolhida antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.cor = yield* chooseColor(c.g, c.you, 'Thriving Isle: escolha uma cor diferente de azul', ['W', 'B', 'R', 'G']);
    }, 'Ao entrar, escolha uma cor diferente de azul.'),
    mana((c) => {
      const cor = c.g.state.objects[c.source]?.choices.cor as ManaType | undefined;
      return cor ? [['U'], [cor]] : [['U']];
    }, { text: '{T}: Adicione {U} ou uma mana da cor escolhida.' }),
  ] }],
  rulings: {},
});

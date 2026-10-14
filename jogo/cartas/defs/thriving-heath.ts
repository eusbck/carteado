// Thriving Heath
// This land enters tapped. As it enters, choose a color other than white.
// {T}: Add {W} or one mana of the chosen color.
import { asEnters, chooseColor, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Thriving Heath',
  faces: [{ abilities: [
    land.tapped(),
    // CR 614.1c e 614.12a: a cor é escolhida antes de entrar
    asEnters(function* (c, ev) {
      ev.choices.cor = yield* chooseColor(c.g, c.you, 'Thriving Heath: escolha uma cor diferente de branco', ["U", "B", "R", "G"]);
    }, 'Ao entrar, escolha uma cor diferente de branco.'),
    mana((c) => {
      const cor = c.g.state.objects[c.source]?.choices.cor as ManaType | undefined;
      return cor ? [["W"], [cor]] : [["W"]];
    }, { text: '{T}: Adicione {W} ou uma mana da cor escolhida.' }),
  ] }],
  rulings: {},
});

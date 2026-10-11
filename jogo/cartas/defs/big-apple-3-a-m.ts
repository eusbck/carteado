// Big Apple, 3 a.m.
// This land enters tapped. As it enters, choose a color.
// {T}: Add one mana of the chosen color.
// {5}, {T}: Create a 1/1 black Rat creature token for each opponent you have.
import { activated, asEnters, chooseColor, createTokens, defineCard, entersTapped, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Big Apple, 3 a.m.',
  faces: [{
    abilities: [
      entersTapped(),
      // CR 614.12a: a cor é escolhida antes de entrar e fica gravada no objeto (CR 607.2d)
      asEnters(function* (c, ev) {
        ev.choices.color = yield* chooseColor(c.g, c.you, 'Big Apple, 3 a.m.: escolha uma cor');
      }, 'Ao entrar, escolha uma cor.'),
      mana((c) => {
        const cor = c.g.state.objects[c.source]?.choices.color as ManaType | undefined;
        return cor ? [[cor]] : [];
      }, { text: '{T}: Adicione uma mana da cor escolhida.' }),
      activated('{5}, {T}', function* (c) {
        // oponentes ainda na partida (CR 800.4a: quem saiu não é mais oponente)
        const n = c.g.opponents(c.you).filter((p) => !c.g.state.players[p].left).length;
        if (n > 0) yield* createTokens(c.g, c.you, 'Rat', n);
      }, { text: '{5}, {T}: Crie uma ficha de criatura Rat preta 1/1 para cada oponente que você tem.' }),
    ],
  }],
  rulings: {},
});

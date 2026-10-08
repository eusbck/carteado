// Heraldic Banner
// As this artifact enters, choose a color.
// Creatures you control of the chosen color get +1/+0.
// {T}: Add one mana of the chosen color.
import { anthem, asEnters, chars, chooseColor, controllerOf, defineCard, isCreature, mana } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { Color, ManaType } from '../../motor/types.ts';

/** cor escolhida ao entrar (ruling 2: pode não haver) */
const corEscolhida = (c: SCtx): Color | undefined => c.g.state.objects[c.source]?.choices.cor as Color | undefined;

export default defineCard({
  name: 'Heraldic Banner',
  faces: [{
    abilities: [
      // ruling 1: só uma das cinco cores (CR 105.1), nunca incolor nem "multicolorido"
      asEnters(function* (c, ev) { ev.choices.cor = yield* chooseColor(c.g, c.you, 'Heraldic Banner: escolha uma cor'); }, 'Ao entrar, escolha uma cor.'),
      anthem((c, id) => {
        const cor = corEscolhida(c);
        return !!cor && isCreature(c.g, id) && controllerOf(c.g, id) === c.you && chars(c.g, id).colors.includes(cor);
      }, () => [{ k: 'pt', p: 1, t: 0 }], 'As criaturas que você controla da cor escolhida recebem +1/+0.'),
      mana((c) => {
        const cor = corEscolhida(c);
        return cor ? [[cor as ManaType]] : []; // ruling 2: sem cor escolhida, não produz mana
      }, { text: '{T}: Adicione uma mana da cor escolhida.' }),
    ],
  }],
  rulings: {
    1: 'teste: a escolha oferece só as cinco cores; criaturas suas da cor recebem +1/+0 e ele produz essa cor',
    2: 'teste: sem cor escolhida, não dá +1/+0 nem produz mana',
  },
});

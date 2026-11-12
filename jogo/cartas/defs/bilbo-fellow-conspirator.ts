// Bilbo, Fellow Conspirator
// If you would create a Food token, instead create a Food token and a Treasure token.
import { copyValuesChars, defineCard, printedChars, staticAbility } from '../../motor/api.ts';
import type { TokenCreation } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

/** a ficha que seria criada é uma Food? Pelas características dela: vale também para a cópia de uma Food */
function ehFood(p: PlayerId, x: TokenCreation['tokens'][number]): boolean {
  const ch = x.copyOf ? copyValuesChars(x.copyOf, p) : x.def ? printedChars(x.def, 0, p) : null;
  return !!ch && ch.types.includes('Artifact') && ch.subtypes.includes('Food');
}

export default defineCard({
  name: 'Bilbo, Fellow Conspirator',
  faces: [{
    abilities: [
      // CR 614.1a: cada Food vira uma Food e um Treasure; cada Bilbo se aplica uma vez (ruling 2)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((x) => ehFood(ev.player, x)) ? null : {
            label: 'Bilbo, Fellow Conspirator: uma Food e um Treasure',
            *replace(e) { return { ...e, tokens: e.tokens.flatMap((x) => (ehFood(e.player, x) ? [x, { de: x.de, def: 'Treasure' }] : [x])) }; },
          }),
        },
        text: 'Se você fosse criar uma ficha Food, em vez disso crie uma ficha Food e uma ficha Treasure.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: criar duas Foods cria duas Foods e dois Treasures',
    2: 'regra geral: CR 616.1f — cada Bilbo é uma substituição própria e se aplica uma vez ao evento (motor/actions.ts substituirFichas)',
  },
});

// Academy Manufactor
// If you would create a Clue, Food, or Treasure token, instead create one of each.
import { copyValuesChars, defineCard, printedChars, staticAbility } from '../../motor/api.ts';
import type { TokenCreation } from '../../motor/defs.ts';
import type { PlayerId } from '../../motor/types.ts';

const TRES = ['Clue', 'Food', 'Treasure'];

/** a ficha que seria criada é uma Clue, uma Food ou um Treasure? Pelas características dela: também vale para a cópia de
 *  uma ficha dessas (Hazel of the Rootbloom, Second Harvest), que é uma ficha Food (ou Clue, ou Treasure) */
function ehDasTres(p: PlayerId, x: TokenCreation['tokens'][number]): boolean {
  const ch = x.copyOf ? copyValuesChars(x.copyOf, p) : x.def ? printedChars(x.def, 0, p) : null;
  return !!ch && ch.types.includes('Artifact') && ch.subtypes.some((s) => TRES.includes(s));
}

export default defineCard({
  name: 'Academy Manufactor',
  faces: [{
    abilities: [
      // CR 614.1a: cada Clue, Food ou Treasure vira uma de cada; com dois Manufactors, cada um se aplica uma vez (ruling 2)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you || !ev.tokens.some((x) => ehDasTres(ev.player, x)) ? null : {
            label: 'Academy Manufactor: uma Clue, uma Food e um Treasure',
            *replace(e) { return { ...e, tokens: e.tokens.flatMap((x) => (ehDasTres(e.player, x) ? TRES.map((def) => ({ de: x.de, def })) : [x])) }; },
          }),
        },
        text: 'Se você fosse criar uma ficha Clue, Food ou Treasure, em vez disso crie uma de cada.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: criar duas Food cria duas de cada: Clue, Food e Treasure',
    2: 'teste: com dois Manufactors, uma Food vira três de cada',
    3: 'não se aplica: ruling sem efeito de jogo',
    4: 'regra geral: criar a Clue pela substituição não é investigar (motor/criaturas.ts investigate)',
  },
});

// Field of the Dead
// This land enters tapped.
// {T}: Add {C}.
// Whenever this land or another land you control enters, if you control seven or more lands with different names,
// create a 2/2 black Zombie creature token.
import { createTokens, defineCard, land, mana, nameOf, on, triggered, type G } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { terrenosDe } from '../reanimar-terrenos.ts';

/** quantos nomes diferentes há entre os terrenos do jogador (ruling 2) */
function nomesDiferentes(g: G, p: PlayerId): number {
  return new Set(terrenosDe(g, p).map((id) => nameOf(g, id))).size;
}

export default defineCard({
  name: 'Field of the Dead',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      // CR 603.4: condição interveniente, conferida ao disparar e ao resolver; um disparo por terreno (ruling 3)
      triggered(on.landfall(), function* (c) {
        yield* createTokens(c.g, c.you, 'Zombie 2/2', 1);
      }, {
        condition: (c) => nomesDiferentes(c.g, c.you) >= 7,
        text: 'Sempre que este terreno ou outro terreno que você controla entra, se você controlar sete ou mais terrenos com nomes diferentes, crie uma ficha de criatura Zumbi 2/2 preta.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conta ele mesmo e o terreno que entra',
    2: 'teste: terrenos com o mesmo nome contam uma vez',
    3: 'teste: terrenos que entram juntos disparam um cada e todos contam',
  },
});

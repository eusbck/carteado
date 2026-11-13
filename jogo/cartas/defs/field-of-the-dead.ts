// Field of the Dead
// This land enters tapped.
// {T}: Add {C}.
// Whenever this land or another land you control enters, if you control seven or more lands with different names,
// create a 2/2 black Zombie creature token.
import { createTokens, defineCard, isLand, land, mana, nameOf, on, triggered } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import { terrenosDe } from '../terras.ts';

const seteNomes = (c: SCtx) => new Set(terrenosDe(c.g, c.you).map((id) => nameOf(c.g, id))).size >= 7;
void isLand;

export default defineCard({
  name: 'Field of the Dead',
  faces: [{
    abilities: [
      land.tapped(),
      mana('C'),
      // CR 603.4: condição interveniente
      triggered(on.landfall(), function* (c) { yield* createTokens(c.g, c.you, 'Zombie 2/2', 1); }, {
        condition: seteNomes,
        text: 'Sempre que este terreno ou outro terreno que você controla entra, se você controlar sete ou mais terrenos com nomes diferentes, crie uma ficha de criatura Zombie preta 2/2.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 603.4 — confere os sete nomes ao disparar e ao resolver',
    2: 'regra geral: CR 201.2 — terrenos básicos com o mesmo nome contam uma vez',
    3: 'regra geral: CR 111.1 — fichas de terreno também contam',
  },
});

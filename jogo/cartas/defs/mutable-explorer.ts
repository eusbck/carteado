// Mutable Explorer
// Changeling (This card is every creature type.)
// When this creature enters, create a tapped Mutavault token. (It's a land with "{T}: Add {C}" and "{1}: This token
// becomes a 2/2 creature with all creature types until end of turn. It's still a land.")
import { changeling, createTokens, defineCard, etb } from '../../motor/api.ts';

const POLIMORFO = 'regra geral: CR 702.73a — polimorfo é uma habilidade que define características e vale em todas as zonas (motor/criaturas.ts changeling)';

export default defineCard({
  name: 'Mutable Explorer',
  faces: [{
    abilities: [
      changeling(),
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Mutavault', 1, { tapped: true });
      }, { text: 'Quando esta criatura entra, crie uma ficha Mutavault virada.' }),
    ],
  }],
  rulings: {
    1: 'teste: cria uma ficha Mutavault virada, com as habilidades do Mutavault',
    2: POLIMORFO,
    3: POLIMORFO,
    4: 'regra geral: CR 613.1d — o polimorfo vale antes de perder as habilidades (camada 4 antes da 6, motor/chars.ts)',
    5: 'regra geral: CR 613.1 — um efeito que dá um tipo novo sobrescreve os tipos do polimorfo (camada 4, motor/chars.ts)',
  },
});

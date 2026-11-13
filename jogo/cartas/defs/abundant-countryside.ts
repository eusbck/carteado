// Abundant Countryside
// {T}: Add {C}.
// {T}: Add one mana of any color. Spend this mana only to cast a creature spell.
// {6}, {T}: Create a 1/1 colorless Shapeshifter creature token with changeling. (It's every creature type.)
import { activated, createTokens, defineCard, mana } from '../../motor/api.ts';
import { SO_MAGICA_DE_CRIATURA } from '../voja.ts';

const POLIMORFO = 'regra geral: CR 702.73a — polimorfo é uma habilidade que define características e vale em todas as zonas (motor/criaturas.ts changeling)';

export default defineCard({
  name: 'Abundant Countryside',
  faces: [{
    abilities: [
      mana('C'),
      mana('any', { restriction: SO_MAGICA_DE_CRIATURA, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica de criatura.' }),
      activated('{6}, {T}', function* (c) {
        yield* createTokens(c.g, c.you, 'Shapeshifter', 1);
      }, { text: '{6}, {T}: Crie uma ficha de criatura Metamorfo 1/1 incolor com polimorfo.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 613.1 — um efeito que dá um tipo novo sobrescreve os tipos do polimorfo (camada 4, motor/chars.ts)',
    2: POLIMORFO,
    3: 'regra geral: CR 613.1d — o polimorfo vale antes de perder as habilidades (camada 4 antes da 6, motor/chars.ts)',
    4: 'teste: a ficha criada é de todos os tipos de criatura',
  },
});

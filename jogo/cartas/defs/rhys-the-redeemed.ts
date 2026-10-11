// Rhys the Redeemed
// {2}{G/W}, {T}: Create a 1/1 green and white Elf Warrior creature token.
// {4}{G/W}{G/W}, {T}: For each creature token you control, create a token that's a copy of that creature.
import { activated, copiableValues, createTokens, creaturesOf, defineCard } from '../../motor/api.ts';

export default defineCard({
  name: 'Rhys the Redeemed',
  faces: [{
    abilities: [
      activated('{2}{G/W}, {T}', function* (c) { yield* createTokens(c.g, c.you, 'Elf Warrior verde e branco', 1); }, { text: '{2}{G/W}, {T}: Crie uma ficha de criatura Elf Warrior 1/1 verde e branca.' }),
      activated('{4}{G/W}{G/W}, {T}', function* (c) {
        // as fichas que você controla na resolução; as cópias criadas agora não são copiadas de novo
        const fichas = creaturesOf(c.g, c.you).filter((id) => c.g.state.objects[id].isToken);
        for (const id of fichas) yield* createTokens(c.g, c.you, { copyOf: copiableValues(c.g, id) }, 1);
      }, { text: '{4}{G/W}{G/W}, {T}: Para cada ficha de criatura que você controla, crie uma ficha que é uma cópia dessa criatura.' }),
    ],
  }],
  rulings: {},
});
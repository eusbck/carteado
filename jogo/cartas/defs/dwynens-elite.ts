// Dwynen's Elite
// When this creature enters, if you control another Elf, create a 1/1 green Elf Warrior creature token.
import { createTokens, defineCard, etb } from '../../motor/api.ts';
import { elfosDe } from '../voja.ts';

export default defineCard({
  name: "Dwynen's Elite",
  faces: [{
    abilities: [
      // CR 603.4: condição interveniente, conferida ao disparar e ao resolver (ruling 1)
      etb(function* (c) {
        yield* createTokens(c.g, c.you, 'Elf Warrior', 1);
      }, {
        condition: (c) => elfosDe(c.g, c.you).some((id) => id !== c.source),
        text: 'Quando esta criatura entra, se você controla outro Elfo, crie uma ficha de criatura Elfo Guerreiro verde 1/1.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com outro Elfo cria a ficha; sem, não dispara',
  },
});

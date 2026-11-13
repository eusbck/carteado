// Springleaf Parade
// When this enchantment enters, create X 1/1 colorless Shapeshifter creature tokens with changeling. (They're every
// creature type.)
// Creature tokens you control have "{T}: Add one mana of any color."
import { and, anthem, asEnters, createTokens, defineAbility, defineCard, etb, is, lkiObj, mana } from '../../motor/api.ts';

const MANA = defineAbility('Springleaf Parade:mana', mana('any'));

export default defineCard({
  name: 'Springleaf Parade',
  faces: [{
    abilities: [
      // o X da mágica fica guardado no permanente para o gatilho de entrar (CR 107.3m: fora da pilha, X é 0)
      asEnters(function* (_c, ev) { ev.choices.x = Number(ev.spell?.x ?? 0); }),
      etb(function* (c) {
        const x = Number((c.g.state.objects[c.source] ?? lkiObj(c.g, c.source))?.choices.x ?? 0);
        if (x > 0) yield* createTokens(c.g, c.you, 'Shapeshifter', x);
      }, { text: 'Quando este encantamento entra, crie X fichas de criatura Metamorfo 1/1 incolores com polimorfo.' }),
      anthem(and(is.creature, is.token, is.yours), () => [{ k: 'addAbility', id: MANA.id! }], 'As fichas de criatura que você controla têm "{T}: Adicione uma mana de qualquer cor."'),
    ],
  }],
  rulings: {},
});

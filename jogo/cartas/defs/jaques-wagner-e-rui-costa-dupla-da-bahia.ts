// Jaques Wagner e Rui Costa, Dupla da Bahia (carta própria da mesa)
// When Jaques Wagner e Rui Costa enters, search your library for an Aura card and a non-Aura enchantment card, reveal
// them, put them into your hand, then shuffle.
import { chars, defineCard, etb, searchTo } from '../../motor/api.ts';

export default defineCard({
  name: 'Jaques Wagner e Rui Costa, Dupla da Bahia',
  faces: [{
    abilities: [
      etb(function* (c) {
        const encantamento = (id: number) => chars(c.g, id).types.includes('Enchantment');
        const aura = (id: number) => chars(c.g, id).subtypes.includes('Aura');
        yield* searchTo(c, c.you, (id) => encantamento(id) && aura(id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de Aura' });
        yield* searchTo(c, c.you, (id) => encantamento(id) && !aura(id), 1, 'hand', { reveal: true, prompt: 'Procure uma carta de encantamento que não seja Aura' });
      }, { text: 'Quando Jaques Wagner e Rui Costa entram, procure no seu grimório uma carta de Aura e uma carta de encantamento que não seja Aura, revele-as, coloque-as na sua mão e depois embaralhe.' }),
    ],
  }],
  rulings: {},
});

// Strix Serenade
// Counter target artifact, creature, or planeswalker spell. Its controller creates a 2/2 blue Bird creature token with
// flying.
import { defineCard, is, or, t, tgt } from '../../motor/api.ts';
import { anulaComPassaro } from '../twitch.ts';

export default defineCard({
  name: 'Strix Serenade',
  faces: [{
    spell: {
      targets: [t.spell(or(is.artifact, is.creature, is.planeswalker), 'mágica de artefato, criatura ou planeswalker alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* anulaComPassaro(c, id); },
    },
  }],
  rulings: { 1: 'teste: a mágica que não pode ser anulada continua na pilha, mas quem a controla ganha o Bird' },
});

// Swan Song
// Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with
// flying.
import { defineCard, is, or, t, tgt } from '../../motor/api.ts';
import { anulaComPassaro } from '../twitch.ts';

export default defineCard({
  name: 'Swan Song',
  faces: [{
    spell: {
      targets: [t.spell(or(is.enchantment, is.instantOrSorcery), 'mágica de encantamento, instantânea ou feitiço alvo')],
      *effect(c) { const id = tgt(c); if (id !== null) yield* anulaComPassaro(c, id); },
    },
  }],
  rulings: { 1: 'teste: a mágica que não pode ser anulada continua na pilha, mas quem a controla ganha o Bird' },
});

// Troll of Khazad-dûm
// This creature can't be blocked except by three or more creatures.
// Swampcycling {1} ({1}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then
// shuffle.)
import { defineCard, staticAbility, typecycling } from '../../motor/api.ts';

export default defineCard({
  name: 'Troll of Khazad-dûm',
  faces: [{
    abilities: [
      // restrição de bloqueio (CR 509.1b)
      staticAbility({ rules: { minBlockers: (c, atacante) => (atacante === c.source ? 3 : 0) }, text: 'Esta criatura não pode ser bloqueada exceto por três ou mais criaturas.' }),
      // CR 702.29e
      typecycling('Swamp', '{1}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 702.29e — a ciclagem de tipo é uma ciclagem: o que dispara ou proíbe ciclar vale para ela (motor/criaturas.ts typecycling)',
    2: 'teste: ciclagem de pântano {1}: descarta e busca uma carta de Swamp',
  },
});

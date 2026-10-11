// Scavenger Grounds
// {T}: Add {C}.
// {2}, {T}, Sacrifice a Desert: Exile all graveyards.
import { activated, defineCard, exile, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Scavenger Grounds',
  faces: [{ abilities: [
    mana('C'),
    // ruling 1: pode sacrificar a si mesmo (é um Desert); ruling 2: o Desert sacrificado já está no cemitério na resolução
    activated('{2}, {T}, Sacrifice a Desert', function* (c) {
      const todos = c.g.state.zones.graveyard.flat();
      if (todos.length) yield* exile(c.g, todos);
    }, { text: '{2}, {T}, Sacrifique um Desert: Exile todos os cemitérios.' }),
  ] }],
  rulings: {
    1: 'teste: pode sacrificar a si mesmo para pagar o custo',
    2: 'teste: o Desert sacrificado também é exilado',
    3: 'teste: CR 205.3i: Desert não dá habilidade de mana intrínseca (só a impressa, {C})',
  },
});

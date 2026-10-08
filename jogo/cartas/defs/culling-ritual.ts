// Culling Ritual
// Destroy each nonland permanent with mana value 2 or less. Add {B} or {G} for each permanent destroyed this way.
import { addMana, chooseNumber, defineCard, destroy, isLand, manaValue, permanentsMatching } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Culling Ritual',
  faces: [{
    spell: {
      *effect(c) {
        const alvos = permanentsMatching(c.g, (id) => !isLand(c.g, id) && manaValue(c.g, id) <= 2);
        yield* destroy(c.g, alvos);
        const n = alvos.filter((id) => !c.g.state.objects[id]).length;
        if (n === 0) return;
        // ruling 1: cada mana pode ser {B} ou {G}, misturando
        const pretas = yield* chooseNumber(c.g, c.you, `Culling Ritual: quantas das ${n} manas serão {B}? (as outras serão {G})`, 0, n);
        addMana(c.g, c.you, [...Array(pretas).fill('B'), ...Array(n - pretas).fill('G')] as ManaType[], { source: c.source });
      },
    },
  }],
  rulings: { 1: 'teste: pode misturar {B} e {G}' },
});

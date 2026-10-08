// Flourishing Defenses
// Whenever a -1/-1 counter is put on a creature, you may create a 1/1 green Elf Warrior creature token.
import { createTokens, defineCard, isCreature, on, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Flourishing Defenses',
  faces: [{
    abilities: [triggered(on.custom((e, c) => {
      if (e.type !== 'counters' || e.kind !== '-1/-1' || e.target.kind !== 'obj' || !c.g.state.objects[e.target.id] || !isCreature(c.g, e.target.id)) return false;
      // ruling 1: dispara uma vez para cada marcador
      return Array.from({ length: e.amount }, () => ({}));
    }), function* (c) {
      if (yield* yesNo(c.g, c.you, 'Flourishing Defenses: criar uma ficha Elf Warrior?')) yield* createTokens(c.g, c.you, 'Elf Warrior', 1);
    }, { text: 'Sempre que um marcador -1/-1 é colocado numa criatura, você pode criar uma ficha de criatura Elf Warrior verde 1/1.' })],
  }],
  rulings: {
    1: 'teste: dispara uma vez para cada marcador',
    2: 'teste: CR 122.6: entrar com marcadores -1/-1 também conta',
  },
});

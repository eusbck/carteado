// Strip Mine
// {T}: Add {C}.
// {T}, Sacrifice this land: Destroy target land.
import { activated, defineCard, destroy, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Strip Mine',
  faces: [{
    abilities: [
      mana('C'),
      activated('{T}, Sacrifice this land', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, { targets: [t.land()], text: '{T}, Sacrifique este terreno: Destrua o terreno alvo.' }),
    ],
  }],
  rulings: {},
});

// Rupture Spire
// This land enters tapped.
// When this land enters, sacrifice it unless you pay {1}.
// {T}: Add one mana of any color.
import { defineCard, etb, land, mana, mayPay, sacrifice } from '../../motor/api.ts';

export default defineCard({
  name: 'Rupture Spire',
  faces: [{ abilities: [
    land.tapped(),
    etb(function* (c) {
      if (c.g.state.objects[c.source]?.zone !== 'battlefield') return;
      if (yield* mayPay(c, c.you, '{1}', 'manter Rupture Spire')) return;
      yield* sacrifice(c.g, [c.source]);
    }, { text: 'Quando este terreno entra, sacrifique-o a menos que você pague {1}.' }),
    mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
  ] }],
  rulings: {},
});

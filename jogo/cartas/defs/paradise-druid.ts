// Paradise Druid
// This creature has hexproof as long as it's untapped. (It can't be the target of spells or abilities your opponents
// control.)
// {T}: Add one mana of any color.
import { defineCard, mana, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Paradise Druid',
  faces: [{
    abilities: [
      selfGets((_c, o) => (o.tapped ? [] : [{ k: 'addKeyword', kw: 'hexproof' }]), 'Esta criatura tem resistência a magia enquanto estiver desvirada.'),
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
    ],
  }],
  rulings: {},
});

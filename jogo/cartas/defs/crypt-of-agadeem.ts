// Crypt of Agadeem
// This land enters tapped.
// {T}: Add {B}.
// {2}, {T}: Add {B} for each black creature card in your graveyard.
import { chars, defineCard, land, mana } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Crypt of Agadeem',
  faces: [{
    abilities: [
      land.tapped(),
      mana('B'),
      mana((c) => {
        const n = c.g.state.zones.graveyard[c.you].filter((id) => { const ch = chars(c.g, id); return ch.types.includes('Creature') && ch.colors.includes('B'); }).length;
        return [Array<ManaType>(n).fill('B')];
      }, { cost: '{2}, {T}', text: '{2}, {T}: Adicione {B} para cada carta de criatura preta no seu cemitério.' }),
    ],
  }],
  rulings: {},
});

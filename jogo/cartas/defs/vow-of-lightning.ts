// Vow of Lightning
// Enchant creature
// Enchanted creature gets +2/+2, has first strike, and can't attack you or planeswalkers you control.
import { defineCard, t } from '../../motor/api.ts';
import { voto } from '../inferno.ts';

export default defineCard({
  name: 'Vow of Lightning',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [...voto('first strike', 'A criatura encantada recebe +2/+2, tem primeiro golpe e não pode atacar você nem planeswalkers que você controla.')],
  }],
  rulings: {},
});
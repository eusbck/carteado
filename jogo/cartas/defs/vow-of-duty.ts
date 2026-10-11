// Vow of Duty
// Enchant creature
// Enchanted creature gets +2/+2, has vigilance, and can't attack you or planeswalkers you control.
import { defineCard, t } from '../../motor/api.ts';
import { voto } from '../inferno.ts';

export default defineCard({
  name: 'Vow of Duty',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [...voto('vigilance', 'A criatura encantada recebe +2/+2, tem vigilância e não pode atacar você nem planeswalkers que você controla.')],
  }],
  rulings: {},
});
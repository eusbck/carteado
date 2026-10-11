// Vow of Malice
// Enchant creature
// Enchanted creature gets +2/+2, has intimidate, and can't attack you or planeswalkers you control. (A creature with intimidate can't be blocked except by artifact creatures and/or creatures that share a color with it.)
import { defineCard, t } from '../../motor/api.ts';
import { voto } from '../inferno.ts';

export default defineCard({
  name: 'Vow of Malice',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    abilities: [...voto('intimidate', 'A criatura encantada recebe +2/+2, tem intimidar e não pode atacar você nem planeswalkers que você controla.')],
  }],
  rulings: {},
});
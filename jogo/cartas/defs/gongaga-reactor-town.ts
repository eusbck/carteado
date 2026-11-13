// Gongaga, Reactor Town
// This land enters tapped.
// {T}: Add {R} or {G}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Gongaga, Reactor Town',
  faces: [{ abilities: [
    land.tapped(),
    mana(['R', 'G']),
  ] }],
  rulings: {
    1: 'teste: Town é um tipo de terreno sem regras próprias (CR 205.3i)',
  },
});

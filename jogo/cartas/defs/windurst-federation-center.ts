// Windurst, Federation Center
// This land enters tapped.
// {T}: Add {G} or {W}.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Windurst, Federation Center',
  faces: [{ abilities: [
    land.tapped(),
    mana(['G', 'W']),
  ] }],
  rulings: {
    1: 'teste: Town é um tipo de terreno sem regras próprias (CR 205.3i)',
  },
});

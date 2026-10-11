// Forgotten Cave
// This land enters tapped.
// {T}: Add {R}.
// Cycling {R} ({R}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Forgotten Cave",
  faces: [{ abilities: [
    land.tapped(),
    mana('R'),
    cycling('{R}'),
  ] }],
  rulings: {},
});

// Polluted Mire
// This land enters tapped.
// {T}: Add {B}.
// Cycling {2} ({2}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Polluted Mire",
  faces: [{ abilities: [
    land.tapped(),
    mana('B'),
    cycling('{2}'),
  ] }],
  rulings: {},
});

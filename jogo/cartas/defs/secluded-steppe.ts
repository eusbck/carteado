// Secluded Steppe
// This land enters tapped.
// {T}: Add {W}.
// Cycling {W} ({W}, Discard this card: Draw a card.)
// (gerado por ferramentas/rascunho.ts e revisado)
import { cycling, defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Secluded Steppe",
  faces: [{ abilities: [
    land.tapped(),
    mana('W'),
    cycling('{W}'),
  ] }],
  rulings: {},
});

// Isolated Chapel
// This land enters tapped unless you control a Plains or a Swamp.
// {T}: Add {W} or {B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Isolated Chapel",
  faces: [{ abilities: [
    land.tappedUnlessControl('Plains', 'Swamp'),
    mana(['W', 'B']),
  ] }],
  rulings: {},
});

// Sandsteppe Citadel
// This land enters tapped.
// {T}: Add {W}, {B}, or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sandsteppe Citadel",
  faces: [{ abilities: [
    land.tapped(),
    mana(['W', 'B', 'G']),
  ] }],
});

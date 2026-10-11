// Mystic Monastery
// This land enters tapped.
// {T}: Add {U}, {R}, or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Mystic Monastery",
  faces: [{ abilities: [
    land.tapped(),
    mana(['U', 'R', 'W']),
  ] }],
  rulings: {},
});

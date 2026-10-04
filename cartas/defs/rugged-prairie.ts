// Rugged Prairie
// {T}: Add {C}.
// {R/W}, {T}: Add {R}{R}, {R}{W}, or {W}{W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Rugged Prairie",
  faces: [{ abilities: [
    mana('C'),
    land.filter('R', 'W'),
  ] }],
});

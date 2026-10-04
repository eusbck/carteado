// Clifftop Retreat
// This land enters tapped unless you control a Mountain or a Plains.
// {T}: Add {R} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Clifftop Retreat",
  faces: [{ abilities: [
    land.tappedUnlessControl('Mountain', 'Plains'),
    mana(['R', 'W']),
  ] }],
  rulings: {},
});

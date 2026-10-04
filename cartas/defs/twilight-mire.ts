// Twilight Mire
// {T}: Add {C}.
// {B/G}, {T}: Add {B}{B}, {B}{G}, or {G}{G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Twilight Mire",
  faces: [{ abilities: [
    mana('C'),
    land.filter('B', 'G'),
  ] }],
});

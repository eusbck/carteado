// Fetid Heath
// {T}: Add {C}.
// {W/B}, {T}: Add {W}{W}, {W}{B}, or {B}{B}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Fetid Heath",
  faces: [{ abilities: [
    mana('C'),
    land.filter('W', 'B'),
  ] }],
  rulings: {},
});

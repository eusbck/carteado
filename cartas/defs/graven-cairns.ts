// Graven Cairns
// {T}: Add {C}.
// {B/R}, {T}: Add {B}{B}, {B}{R}, or {R}{R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Graven Cairns",
  faces: [{ abilities: [
    mana('C'),
    land.filter('B', 'R'),
  ] }],
});

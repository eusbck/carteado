// Cascade Bluffs
// {T}: Add {C}.
// {U/R}, {T}: Add {U}{U}, {U}{R}, or {R}{R}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Cascade Bluffs",
  faces: [{ abilities: [
    mana('C'),
    land.filter('U', 'R'),
  ] }],
});

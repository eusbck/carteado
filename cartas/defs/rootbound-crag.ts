// Rootbound Crag
// This land enters tapped unless you control a Mountain or a Forest.
// {T}: Add {R} or {G}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Rootbound Crag",
  faces: [{ abilities: [
    land.tappedUnlessControl('Mountain', 'Forest'),
    mana(['R', 'G']),
  ] }],
});

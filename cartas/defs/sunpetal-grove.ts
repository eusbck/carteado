// Sunpetal Grove
// This land enters tapped unless you control a Forest or a Plains.
// {T}: Add {G} or {W}.
// (gerado por ferramentas/rascunho.ts e revisado)
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: "Sunpetal Grove",
  faces: [{ abilities: [
    land.tappedUnlessControl('Forest', 'Plains'),
    mana(['G', 'W']),
  ] }],
});

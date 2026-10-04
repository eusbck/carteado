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
  rulings: {
    1: "regra geral: CR 614.12 — só vê terrenos que já estão no campo",
    2: "teste: entra desvirado com o tipo de terreno (qualquer terreno com o subtipo, básico ou não)",
  },
});

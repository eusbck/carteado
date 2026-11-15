// Blooming Marsh
// This land enters tapped unless you control two or fewer other lands.
// {T}: Add {B} or {G}.
import { controlledBy, defineCard, entersTapped, isLand, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Blooming Marsh',
  faces: [{ abilities: [
    // CR 614.12: os terrenos que entram no mesmo lote ainda não estão no campo.
    { ...entersTapped((c, ev) => controlledBy(c.g, c.you, (id) => id !== ev.obj && isLand(c.g, id)).length <= 2), text: 'Este terreno entra virado a menos que você controle dois ou menos outros terrenos.' },
    mana(['B', 'G']),
  ] }],
  rulings: {
    1: 'teste: CR 614.12: ignora terrenos que entram ao mesmo tempo',
    2: 'teste: entra desvirado como primeiro, segundo ou terceiro terreno; depois entra virado',
  },
});

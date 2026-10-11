// Razorverge Thicket
// This land enters tapped unless you control two or fewer other lands.
// {T}: Add {G} or {W}.
import { controlledBy, defineCard, entersTapped, isLand, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Razorverge Thicket',
  faces: [{ abilities: [
    // CR 614.12: conta só os terrenos que já estão no campo antes de ele entrar
    { ...entersTapped((c, ev) => controlledBy(c.g, c.you, (id) => id !== ev.obj && isLand(c.g, id)).length <= 2), text: 'Entra virado a menos que você controle dois ou menos outros terrenos.' },
    mana(['G', 'W']),
  ] }],
  rulings: {
    1: 'teste: com zero, um ou dois outros terrenos entra desvirado; com três ou mais, virado',
    2: 'teste: CR 614.12: não conta terrenos que entram ao mesmo tempo',
  },
});

// Sea of Clouds
// This land enters tapped unless you have two or more opponents.
// {T}: Add {W} or {U}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Sea of Clouds',
  faces: [{ abilities: [
    // CR 614.1c; os oponentes são os que ainda estão na partida (CR 800.4a: quem saiu não é mais oponente)
    { ...entersTapped((c) => c.g.opponents(c.you).length >= 2), text: 'Entra virado a menos que você tenha dois ou mais oponentes.' },
    mana(['W', 'U']),
  ] }],
  rulings: {
    1: 'teste: CR 800.4a: conta os oponentes de agora: com só um oponente restante, entra virado',
  },
});

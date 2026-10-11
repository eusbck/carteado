// Luxury Suite
// This land enters tapped unless you have two or more opponents.
// {T}: Add {B} or {R}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Luxury Suite',
  faces: [{ abilities: [
    // CR 614.1c; os oponentes são os que ainda estão na partida (CR 800.4a: quem saiu não é mais oponente)
    { ...entersTapped((c) => c.g.opponents(c.you).length >= 2), text: 'Entra virado a menos que você tenha dois ou mais oponentes.' },
    mana(['B', 'R']),
  ] }],
  rulings: {
    1: 'teste: CR 800.4a: conta os oponentes de agora: com só um oponente restante, entra virado',
  },
});

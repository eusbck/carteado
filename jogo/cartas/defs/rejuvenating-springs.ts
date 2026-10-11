// Rejuvenating Springs
// This land enters tapped unless you have two or more opponents.
// {T}: Add {G} or {U}.
import { defineCard, entersTapped, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Rejuvenating Springs',
  faces: [{ abilities: [
    // CR 614.1c; os oponentes são os que ainda estão na partida (CR 800.4a: quem saiu não é mais oponente)
    { ...entersTapped((c) => c.g.opponents(c.you).length >= 2), text: 'Entra virado a menos que você tenha dois ou mais oponentes.' },
    mana(['G', 'U']),
  ] }],
  rulings: {
    1: 'teste: CR 800.4a: conta os oponentes de agora: com só um oponente restante, entra virado',
    2: 'teste: posto no campo virado por um efeito, continua virado mesmo com dois oponentes',
  },
});

// Blood Crypt — ({T}: Add {B} or {R}.) As this land enters, you may pay 2 life. If you don't, it enters tapped.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Blood Crypt',
  faces: [{ abilities: [land.payLifeOrTapped(2), mana(['B', 'R'])] }],
  rulings: {
    1: 'regra geral: CR 305.6 — tem os dois tipos básicos e é achado por buscas desses tipos',
    2: 'regra geral: CR 119.4 — só paga 2 de vida quem tem 2 ou mais',
    3: 'regra geral: CR 614.12 — a escolha é feita conforme ele entra, de qualquer zona',
    4: 'regra geral: CR 305.7 — continua não básico',
  },
});

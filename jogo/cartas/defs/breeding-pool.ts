// Breeding Pool — ({T}: Add {G} or {U}.) As this land enters, you may pay 2 life. If you don't, it enters tapped.
import { defineCard, land, mana } from '../../motor/api.ts';

export default defineCard({
  name: 'Breeding Pool',
  faces: [{ abilities: [land.payLifeOrTapped(2), mana(['G', 'U'])] }],
  rulings: {
    1: 'regra geral: CR 305.6 — é Forest e Island e é achada por buscas desses tipos',
    2: 'regra geral: CR 119.4 — só paga 2 de vida quem tem 2 ou mais',
  },
});

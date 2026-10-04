// Zetalpa, Primal Dawn — Flying, double strike, vigilance, trample, indestructible
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Zetalpa, Primal Dawn',
  faces: [{ abilities: keywords('flying', 'double strike', 'vigilance', 'trample', 'indestructible') }],
  rulings: {
    1: "teste: CR 702.4b, 702.19d: se o primeiro golpe mata os bloqueadores, todo o dano normal vai ao jogador",
  },
});

// Zetalpa, Primal Dawn — Flying, double strike, vigilance, trample, indestructible
import { defineCard, keywords } from '../../motor/api.ts';

export default defineCard({
  name: 'Zetalpa, Primal Dawn',
  faces: [{ abilities: keywords('flying', 'double strike', 'vigilance', 'trample', 'indestructible') }],
});

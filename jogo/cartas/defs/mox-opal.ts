// Mox Opal
// Metalcraft — {T}: Add one mana of any color. Activate only if you control three or more artifacts.
import { defineCard, mana } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Mox Opal',
  faces: [{
    abilities: [
      mana('any', { condition: (c) => artefatosDe(c.g, c.you).length >= 3, text: 'Metalcraft — {T}: Adicione uma mana de qualquer cor. Ative somente se você controla três ou mais artefatos.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 704.5j — com dois Mox Opal, a regra da lenda leva um ao cemitério antes de você receber prioridade para gerar mana (motor/sba.ts)' },
});
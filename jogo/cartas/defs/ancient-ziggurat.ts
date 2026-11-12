// Ancient Ziggurat
// {T}: Add one mana of any color. Spend this mana only to cast a creature spell.
import { defineCard, mana } from '../../motor/api.ts';
import { NOTAS, SO_MAGICA_DE_CRIATURA } from '../voja.ts';

export default defineCard({
  name: 'Ancient Ziggurat',
  faces: [{
    abilities: [
      mana('any', { restriction: SO_MAGICA_DE_CRIATURA, text: '{T}: Adicione uma mana de qualquer cor. Gaste essa mana apenas para conjurar uma mágica de criatura.' }),
    ],
  }],
  rulings: {
    1: NOTAS.manaCriatura,
    2: 'teste: paga uma mágica de criatura, mas não uma de outro tipo',
  },
});

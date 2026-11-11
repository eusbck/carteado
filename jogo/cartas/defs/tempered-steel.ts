// Tempered Steel
// Artifact creatures you control get +2/+2.
import { defineCard } from '../../motor/api.ts';
import { artefatosRecebem } from '../borg.ts';

export default defineCard({
  name: 'Tempered Steel',
  faces: [{ abilities: [artefatosRecebem([{ k: 'pt', p: 2, t: 2 }], 'As criaturas artefato que você controla recebem +2/+2.')] }],
  rulings: {
    1: 'teste: o dano não letal fica marcado e passa a ser letal se Tempered Steel sai do campo',
  },
});

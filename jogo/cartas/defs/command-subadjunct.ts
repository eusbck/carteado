// Command Subadjunct
// Artifact creatures you control have vigilance.
import { defineCard } from '../../motor/api.ts';
import { artefatosRecebem } from '../borg.ts';

export default defineCard({
  name: 'Command Subadjunct',
  faces: [{ abilities: [artefatosRecebem([{ k: 'addKeyword', kw: 'vigilance' }], 'As criaturas artefato que você controla têm vigilância.')] }],
  rulings: {},
});

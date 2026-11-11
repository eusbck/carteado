// Exploration
// You may play an additional land on each of your turns.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Exploration',
  faces: [{ abilities: [staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you ? 1 : 0) }, text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' })] }],
  rulings: { 1: 'regra geral: CR 305.2 — vários efeitos assim se somam' },
});

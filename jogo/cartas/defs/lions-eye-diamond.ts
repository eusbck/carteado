// Lion's Eye Diamond
// Discard your hand, Sacrifice this artifact: Add three mana of any one color. Activate only as an instant.
import { defineCard, discard, type ManaAbilityDef } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

const LED: ManaAbilityDef = {
  kind: 'mana',
  cost: [
    // "Descarte a sua mão" (CR 701.9): pode pagar com a mão vazia
    {
      k: 'custom', label: 'descartar a mão', canPay: () => true,
      *pay(c) { const n = c.g.state.zones.hand[c.you].length; return { discarded: n ? yield* discard(c.g, c.you, n) : [] }; },
    },
    { k: 'sacrificeSelf' },
  ],
  produce: () => (['W', 'U', 'B', 'R', 'G'] as ManaType[]).map((x) => [x, x, x]),
  // ruling 1: habilidade de mana, mas só quando poderia conjurar uma instantânea (nunca no meio de um pagamento)
  notWhilePaying: true,
  text: 'Descarte a sua mão, Sacrifique este artefato: Adicione três manas de uma mesma cor qualquer. Ative somente como uma instantânea.',
};

export default defineCard({
  name: "Lion's Eye Diamond",
  faces: [{ abilities: [LED] }],
  rulings: { 1: 'teste: é habilidade de mana, mas não pode ser ativada enquanto se paga uma mágica' },
});

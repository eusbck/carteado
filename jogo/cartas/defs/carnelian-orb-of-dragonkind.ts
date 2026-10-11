// Carnelian Orb of Dragonkind
// {T}: Add {R}. If that mana is spent on a Dragon creature spell, it gains haste until end of turn.
import { chars, defineCard, defineFn, mana, spellGainsUntilEndOfTurn, type G } from '../../motor/api.ts';
import type { ManaUnit, PlayerId } from '../../motor/types.ts';

// CR 106.6: efeito preso à mana, aplicado na hora em que ela é gasta (não usa a pilha)
const IMPETO = 'Carnelian Orb of Dragonkind:impeto';
defineFn(IMPETO, (g: G, u: ManaUnit, purpose: { kind: string; obj?: number }, player: PlayerId) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return;
  // rulings 3-4: só mágica de criatura que é Dragon na hora em que a mana é gasta
  const c = chars(g, purpose.obj);
  if (!c.types.includes('Creature') || !c.subtypes.includes('Dragon')) return;
  spellGainsUntilEndOfTurn(g, player, u.source ?? purpose.obj, purpose.obj, [{ k: 'addKeyword', kw: 'haste' }]);
});

export default defineCard({
  name: 'Carnelian Orb of Dragonkind',
  faces: [{
    abilities: [
      mana('R', { rider: IMPETO, text: '{T}: Adicione {R}. Se essa mana for gasta numa mágica de criatura Dragon, ela ganha ímpeto até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mana pode ser gasta em qualquer coisa; fora de mágica de criatura Dragon, não dá ímpeto',
    2: 'teste: gasta em qualquer parte do custo de uma mágica de criatura Dragon, ela ganha ímpeto até o fim do turno',
    3: 'teste: a mana pode ser gasta em qualquer coisa; fora de mágica de criatura Dragon, não dá ímpeto',
    4: 'regra geral: CR 106.6 — o efeito olha a mágica na hora em que a mana é gasta (motor/costs.ts rider)',
  },
});

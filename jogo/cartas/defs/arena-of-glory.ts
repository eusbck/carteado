// Arena of Glory
// This land enters tapped unless you control a Mountain.
// {T}: Add {R}.
// {R}, {T}, Exert this land: Add {R}{R}. If any of that mana is spent on a creature spell, it gains haste until end of
// turn. (An exerted permanent won't untap during your next untap step.)
import { chars, defineCard, defineFn, exert, land, mana, spellGainsUntilEndOfTurn, type G } from '../../motor/api.ts';
import type { ManaUnit, PlayerId } from '../../motor/types.ts';

// CR 106.6: efeito preso à mana, na hora em que ela é gasta; rulings 4-8: só mágica de criatura, cada uma em que for gasta
const IMPETO = 'Arena of Glory:impeto';
defineFn(IMPETO, (g: G, u: ManaUnit, purpose: { kind: string; obj?: number }, player: PlayerId) => {
  if (purpose.kind !== 'spell' || purpose.obj === undefined) return;
  if (!chars(g, purpose.obj).types.includes('Creature')) return;
  spellGainsUntilEndOfTurn(g, player, u.source ?? purpose.obj, purpose.obj, [{ k: 'addKeyword', kw: 'haste' }]);
});

export default defineCard({
  name: 'Arena of Glory',
  faces: [{
    abilities: [
      // ruling 1: precisa já controlar uma Mountain
      land.tappedUnlessControl('Mountain'),
      mana('R'),
      // exaurir (CR 701.43a) faz parte do custo; numa habilidade de mana, junto com a mana
      mana('RR', {
        cost: '{R}, {T}',
        rider: IMPETO,
        *extra(c) { exert(c.g, c.source); },
        text: '{R}, {T}, Exaura este terreno: Adicione {R}{R}. Se alguma dessa mana for gasta numa mágica de criatura, ela ganha ímpeto até o fim do turno. (Um permanente exaurido não desvira na sua próxima etapa de desvirar.)',
      }),
    ],
  }],
  rulings: {
    1: 'teste: entra virado sem uma Mountain; desvirado com uma',
    2: 'regra geral: CR 701.43a — exaurido e já desvirado na etapa de desvirar, nada acontece (motor/turn.ts)',
    3: 'não se aplica: nenhuma carta dos decks dá controle de terrenos até o fim do turno',
    4: 'teste: a mana pode ser gasta em qualquer coisa; numa mágica de criatura, ela ganha ímpeto',
    5: 'teste: a mana pode ser gasta em qualquer coisa; numa mágica de criatura, ela ganha ímpeto',
    6: 'regra geral: CR 106.6 — vale para qualquer parte do custo da mágica (motor/costs.ts rider)',
    7: 'regra geral: CR 106.6 — só a mágica de criatura em que foi gasta ganha ímpeto (motor/costs.ts rider)',
    8: 'regra geral: CR 106.6 — só a mágica de criatura em que foi gasta ganha ímpeto (motor/costs.ts rider)',
  },
});

// Forsaken Monument
// Colorless creatures you control get +2/+2.
// Whenever you tap a permanent for {C}, add an additional {C}.
// Whenever you cast a colorless spell, you gain 2 life.
import { addMana, and, anthem, chars, defineCard, gainLife, is, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Forsaken Monument",
  faces: [{
    abilities: [
      anthem(and(is.yours, is.creature, (c, id) => chars(c.g, id).colors.length === 0), () => [{ k: 'pt', p: 2, t: 2 }], 'Criaturas incolores que você controla recebem +2/+2.'),
      staticAbility({ rules: { extraManaForPlanning: (c, player, _source, produced, tapped) => player === c.you && tapped && produced.includes('C') ? ['C'] : [] } }),
      triggered(on.custom((e, c) => e.type === 'mana' && e.player === c.you && !!e.tappedForMana && e.produced.includes('C')), function*(c) { addMana(c.g, c.you, ['C'], { source: c.source }); }, { mana: true, text: 'Sempre que vira um permanente para gerar {C}, adicione mais {C}.' }),
      triggered(on.youCast((c, id) => chars(c.g, id).colors.length === 0), function*(c) { gainLife(c.g, c.you, 2, c.source); }, { text: 'Sempre que conjura uma mágica incolor, ganhe 2 de vida.' }),
    ]
  }],
  rulings: {
    "1": "CR 106.12, 605.1b: teste: exige ativação de habilidade com símbolo {T} produzindo {C}; improvisar não dispara.",
    "2": "teste: produzir {C}{C} adiciona só mais um {C}, imediatamente e sem pilha.",
    "3": "CR 603.3: ganho de vida é gatilho de conjuração e resolve antes da mágica, mesmo se ela for anulada.",
    "4": "CR 305.9: jogar terreno não dispara o ganho de vida.",
    "5": "CR 202.2: produzir cores não confere cor; criatura terreno incolor recebe o bônus."
  },
});

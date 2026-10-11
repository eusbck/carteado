// Soul of Eternity
// Soul of Eternity's power and toughness are each equal to your life total.
// Encore {7}{W}{W} ({7}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks
// that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only
// as a sorcery.)
import { defineCard, encore, selfGets } from '../../motor/api.ts';

export default defineCard({
  name: 'Soul of Eternity',
  faces: [{
    abilities: [
      // ruling 5: habilidade que define característica (CR 604.3): vale em todas as zonas
      selfGets((c) => { const n = c.g.state.players[c.you].life; return [{ k: 'setPT', p: n, t: n }]; }, 'A força e a resistência de Soul of Eternity são iguais ao seu total de vida.', { cda: true }),
      encore('{7}{W}{W}'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 508.1d — a ficha impedida de atacar aquele jogador pode atacar outro ou não atacar (motor/combat.ts requirements)',
    2: 'regra geral: CR 602.2 — exilar a carta é custo do bis (motor/criaturas.ts encore)',
    3: 'regra geral: CR 702.141a — só os oponentes que ainda estão na partida contam (motor/criaturas.ts encore)',
    4: 'regra geral: CR 707.2 — as fichas copiam só o que está na carta (motor/criaturas.ts encore)',
    5: 'teste: a força e a resistência são iguais ao seu total de vida',
    6: 'regra geral: CR 508.1d — a exigência de atacar não vale para quem não pode atacar nem obriga a pagar custos (motor/combat.ts requirements)',
    7: 'regra geral: CR 701.21a — você só sacrifica o que controla (motor/actions.ts sacrifice)',
    8: 'teste: bis: uma ficha cópia para cada oponente, com ímpeto, sacrificada na etapa final',
  },
});
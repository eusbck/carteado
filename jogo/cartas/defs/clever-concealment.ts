// Clever Concealment
// Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one
// mana of that creature's color.)
// Any number of target nonland permanents you control phase out. (Treat them and anything attached to them as though
// they don't exist until your next turn.)
import { and, defineCard, is, phaseOut, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Clever Concealment',
  faces: [{
    convoke: true,
    spell: {
      targets: [{ ...t.nonlandPermanent(and(is.yours), 'qualquer número de permanentes não terrenos alvo que você controla'), min: 0, max: 99 }],
      *effect(c) {
        // as criaturas viradas para a convocação podem ser alvo e saem de fase viradas
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' && c.g.state.objects[r.id]?.zone === 'battlefield' ? [r.id] : []));
        phaseOut(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 702.51b — convocar não é custo alternativo nem adicional (motor/stack.ts)',
    2: 'regra geral: CR 702.51a — a criatura multicolorida paga {1} ou uma mana de uma das cores dela (motor/stack.ts)',
    3: 'regra geral: CR 702.51a — criatura com enjoo de invocação também ajuda (cartas/defs/bloodline-bidding.test.ts)',
    4: 'regra geral: CR 506.4 — virar a criatura não a tira do combate',
    5: 'regra geral: CR 702.51b — a convocação vem depois do custo total (motor/stack.ts)',
    6: 'regra geral: CR 702.51a — só criatura desvirada ajuda; a que já foi virada por mana não ajuda (cartas/defs/bloodline-bidding.test.ts)',
    7: 'regra geral: CR 506.4 — atacante ou bloqueadora que sai de fase é removida do combate (motor/mecanicas.ts phaseOut)',
    8: 'regra geral: CR 702.26b — efeitos "enquanto" ignoram objetos fora de fase',
    9: 'regra geral: CR 702.26g — Auras e Equipamentos anexados saem e voltam junto (cartas/defs/guardian-of-faith.test.ts)',
    10: 'regra geral: CR 702.26b — fora de fase, o permanente é tratado como se não existisse (motor/mecanicas.ts phaseOut)',
    11: 'regra geral: CR 702.26d — sair e voltar de fase não é mudança de zona, não dispara entrar nem sair do campo',
    12: 'regra geral: CR 702.26d — sem mudança de zona, as escolhas feitas ao entrar continuam valendo',
    13: 'teste: qualquer número de permanentes não terrenos seus saem de fase e voltam no seu próximo turno',
  },
});

// Sevinne's Reclamation
// Return target permanent card with mana value 3 or less from your graveyard to the battlefield. If this spell was cast
// from a graveyard, you may copy this spell and may choose a new target for the copy.
// Flashback {4}{W}
import { and, copySpell, defineCard, flashback, is, putOntoBattlefield, t, tgt, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Sevinne's Reclamation",
  faces: [{
    altCosts: [flashback('{4}{W}')],
    spell: {
      targets: [t.card('graveyard', and(is.permanentCard, is.mvAtMost(3)), 'carta de permanente alvo com valor de mana 3 ou menos no seu cemitério')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        yield* putOntoBattlefield(c.g, [{ id, controller: c.you }], 'effect');
        // ruling 2: a cópia não foi conjurada de um cemitério, então não copia de novo
        if (c.castFrom === 'graveyard' && (yield* yesNo(c.g, c.you, "Sevinne's Reclamation: copiar esta mágica?"))) yield* copySpell(c.g, c.source, c.you, { newTargets: true });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — com o alvo ilegal não resolve e não copia',
    2: 'teste: a cópia não copia de novo',
    3: 'regra geral: CR 603.3 — gatilhos do permanente que volta resolvem antes da cópia',
    4: 'regra geral: CR 107.3g — X vale 0 no cemitério',
    5: 'regra geral: CR 110.4a — isPermanentCard',
    6: 'regra geral: CR 702.34a — recapitular respeita o tempo de feitiço',
    7: 'regra geral: CR 702.34a — recapitular não exige ter sido conjurada antes',
    8: 'regra geral: CR 702.34a (motor: flashback)',
    9: 'regra geral: CR 702.34a — exilada ao sair da pilha (motor: exileOnLeave)',
    10: 'regra geral: CR 601.2f — custo total',
    11: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro',
  },
});

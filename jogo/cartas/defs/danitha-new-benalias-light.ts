// Danitha, New Benalia's Light
// Vigilance, trample, lifelink
// Once during each of your turns, you may cast an Aura or Equipment spell from your graveyard.
import { chars, defineCard, keywords, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: "Danitha, New Benalia's Light",
  faces: [{
    abilities: [
      ...keywords('vigilance', 'trample', 'lifelink'),
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            // ruling 5: a marca fica na Danitha; outra Danitha (objeto novo) dá outra vez
            if (!eu || p !== c.you || s.turn.active !== c.you || eu.data.danithaTurno === s.turn.number) return null;
            const o = s.objects[carta];
            if (!o || o.zone !== 'graveyard' || o.owner !== c.you || !chars(c.g, carta).subtypes.some((t) => t === 'Aura' || t === 'Equipment')) return null;
            const fonte = c.source;
            // rulings 1-2: paga os custos (ou um alternativo) e segue o tempo normal; ruling 3: depois de começar, perder
            // Danitha não muda nada
            return { key: `danitha:${fonte}`, label: 'Danitha (do cemitério)', onUse: (u) => { const d = u.g.state.objects[fonte]; if (d) { d.data.danithaTurno = u.g.state.turn.number; u.g.bump(); } } };
          },
        },
        text: 'Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de Aura ou de Equipamento do seu cemitério.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: conjura um Equipamento do cemitério pagando o custo, só uma vez por turno e só no seu turno',
    2: 'regra geral: CR 601.2f — paga os custos normais, ou um custo alternativo que a carta tenha (motor/priority.ts)',
    3: 'regra geral: CR 601.2 — depois de começar a conjurar, perder Danitha não muda a mágica (motor/stack.ts)',
    4: 'regra geral: CR 601.2a — conjurar por outra permissão não gasta a de Danitha (motor/priority.ts permissionsFor)',
    5: 'regra geral: CR 400.7 — uma nova Danitha é outro objeto e dá outra vez (a marca fica no objeto)',
    6: 'regra geral: CR 117.3a — o jogador ativo recebe prioridade primeiro, antes de alguém poder tirar a carta do cemitério (motor/priority.ts)',
  },
});

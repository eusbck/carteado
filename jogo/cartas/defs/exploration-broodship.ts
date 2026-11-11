// Exploration Broodship
// Station (It's an artifact creature at 8+.)
// 3+ | You may play an additional land on each of your turns.
// 8+ | Flying
// Once during each of your turns, you may cast a permanent spell from your graveyard by sacrificing a land in addition
// to paying its other costs.
import { defineCard, is, isLand, staticAbility } from '../../motor/api.ts';
import { cargas, estacao, nivelDeEstacao } from '../estacao.ts';
import { sacrificaTerrenoCusto } from '../terras.ts';

const CHAVE = 'Exploration Broodship:cemiterio';

export default defineCard({
  name: 'Exploration Broodship',
  faces: [{
    abilities: [
      estacao(),
      staticAbility({ rules: { extraLandPlays: (c, p) => (p === c.you && cargas(c.g, c.source) >= 3 ? 1 : 0) }, text: '3+ | Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      nivelDeEstacao(8, { criatura: true, mods: [{ k: 'addKeyword', kw: 'flying' }] }, '8+ | Voar. É uma criatura-artefato.'),
      // a linha fica na caixa de 8+
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            const o = s.objects[carta];
            if (p !== c.you || s.turn.active !== p || !eu || cargas(c.g, c.source) < 8 || eu.usedThisTurn[CHAVE] === s.turn.number) return null;
            if (!o || o.zone !== 'graveyard' || o.owner !== p || isLand(c.g, carta) || !is.permanentCard(c, carta)) return null;
            const id = c.source;
            return {
              key: `broodship:${id}`, label: 'conjurar do cemitério sacrificando um terreno (Exploration Broodship)', parts: [sacrificaTerrenoCusto],
              onUse: (cc) => { const x = cc.g.state.objects[id]; if (x) { x.usedThisTurn[CHAVE] = cc.g.state.turn.number; cc.g.bump(); } },
            };
          },
        },
        text: '8+ | Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de permanente do seu cemitério sacrificando um terreno além dos outros custos.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 601.2 — o tempo e os outros custos continuam os normais' },
});

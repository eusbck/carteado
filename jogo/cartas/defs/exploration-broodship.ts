// Exploration Broodship
// Station (Tap another creature you control: Put charge counters equal to its power on this Spacecraft. Station only as a
// sorcery. It's an artifact creature at 8+.)
// 3+ | You may play an additional land on each of your turns.
// 8+ | Flying
// Once during each of your turns, you may cast a permanent spell from your graveyard by sacrificing a land in addition to
// paying its other costs.
// 4/4 (no quadro da faixa 8+)
import { cost, defineCard, isLand, isPermanentCard, staticAbility, station, stationLevel } from '../../motor/api.ts';
import { terrenoAdicional } from '../terras.ts';

const SACRIFICAR_TERRENO = cost('Sacrifice a land');

export default defineCard({
  name: 'Exploration Broodship',
  faces: [{
    abilities: [
      station(),
      ...stationLevel(3, { statics: [terrenoAdicional('3+ | Você pode jogar um terreno adicional em cada um dos seus turnos.')], text: 'Você pode jogar um terreno adicional em cada um dos seus turnos.' }),
      // CR 721.2: a linha depois de "8+ | Voar" está na mesma faixa
      ...stationLevel(8, {
        creature: true, keywords: ['flying'],
        statics: [staticAbility({
          rules: {
            mayPlayFrom: (c, p, carta) => {
              const s = c.g.state;
              const eu = s.objects[c.source];
              // uma vez durante cada um dos seus turnos (por Broodship)
              if (!eu || p !== c.you || s.turn.active !== c.you || eu.data.broodshipTurno === s.turn.number) return null;
              const o = s.objects[carta];
              // ruling 1: custos e momento normais; só mágicas de permanente (terreno não se conjura)
              if (!o || o.zone !== 'graveyard' || o.owner !== c.you || isLand(c.g, carta) || !isPermanentCard(c.g, carta)) return null;
              const fonte = c.source;
              return {
                key: `broodship:${fonte}`, label: 'Exploration Broodship (sacrificando um terreno)', parts: SACRIFICAR_TERRENO,
                onUse: (u) => {
                  const b = u.g.state.objects[fonte];
                  if (b) { b.data.broodshipTurno = u.g.state.turn.number; u.g.bump(); }
                },
              };
            },
          },
          text: '8+ | Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de permanente do seu cemitério sacrificando um terreno além de pagar os outros custos.',
        })],
        text: 'Voar. Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica de permanente do seu cemitério sacrificando um terreno além de pagar os outros custos. É uma criatura artefato 4/4.',
      }),
    ],
  }],
  rulings: { 1: 'teste: com 8+, conjura uma mágica de permanente do cemitério pagando o custo e sacrificando um terreno, uma vez por turno' },
});

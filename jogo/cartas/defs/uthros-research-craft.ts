// Uthros Research Craft
// Station (It's an artifact creature at 12+.)
// 3+ | Whenever you cast an artifact spell, draw a card. Put a charge counter on this Spacecraft.
// 12+ | Flying
// This Spacecraft gets +1/+0 for each artifact you control.
import { addCounters, controlledBy, defineCard, draw, is, isType, on, selfGets, triggered } from '../../motor/api.ts';
import { comCargas, estacao, nivelDeEstacao } from '../estacao.ts';

export default defineCard({
  name: 'Uthros Research Craft',
  faces: [{
    abilities: [
      estacao(),
      triggered(on.youCast(is.artifact), function* (c) {
        yield* draw(c.g, c.you, 1);
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { condition: comCargas(3), text: '3+ | Sempre que você conjura uma mágica de artefato, compre uma carta. Coloque um marcador de carga nesta Espaçonave.' }),
      nivelDeEstacao(12, { criatura: true, mods: [{ k: 'addKeyword', kw: 'flying' }] }, '12+ | Voar. É uma criatura-artefato.'),
      selfGets((c) => [{ k: 'pt', p: controlledBy(c.g, c.you, (id) => isType(c.g, id, 'Artifact')).length, t: 0 }], 'Esta Espaçonave recebe +1/+0 para cada artefato que você controla.'),
    ],
  }],
  rulings: { 1: 'regra geral: CR 721.2b — com menos de 12 marcadores não é criatura, e o +1/+0 não importa' },
});

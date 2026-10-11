// Rampaging War Mammoth
// Trample
// Cycling {X}{2}{R} ({X}{2}{R}, Discard this card: Draw a card.)
// When you cycle this card, destroy up to X target artifacts.
import { cycling, defineCard, destroy, keyword, lkiObj, on, t, triggered } from '../../motor/api.ts';

const ciclagem = cycling('{X}{2}{R}');

export default defineCard({
  name: 'Rampaging War Mammoth',
  faces: [{
    abilities: [
      keyword('trample'),
      ciclagem,
      // CR 702.29c: dispara da zona em que a carta foi parar; o X é o do custo de ciclagem (ruling 3: com X = 0, sem alvos)
      triggered(on.custom((e, c) => {
        if (e.type !== 'activate' || e.abilityId !== ciclagem.id) return false;
        const antes = lkiObj(c.g, e.source);
        if (!antes || antes.card === null || antes.card !== c.obj.card) return false;
        return { x: c.g.state.objects[e.obj]?.stack?.x ?? 0 };
      }), function* (c) {
        const ids = (c.targets[0] ?? []).flatMap((r) => (r && r.kind === 'obj' ? [r.id] : []));
        if (ids.length) yield* destroy(c.g, ids);
      }, {
        zones: ['graveyard', 'exile'],
        targets: [{ ...t.artifact(undefined, 'até X artefatos alvo'), min: 0, max: (c) => Number((c as { event?: Record<string, unknown> }).event?.x ?? 0) }],
        text: 'Quando você cicla esta carta, destrua até X artefatos alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ciclando com X = 2, destrói até dois artefatos antes de você comprar a carta',
    2: 'regra geral: CR 702.29c — a ciclagem e o gatilho dela são habilidades, não mágicas',
    3: 'teste: com X = 0, o gatilho não tem alvos e você só compra a carta',
    4: 'regra geral: CR 702.29c — a ciclagem e o gatilho são independentes: dá para ciclar sem alvo legal para o gatilho',
  },
});

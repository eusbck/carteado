// Wickersmith's Tools
// Whenever one or more -1/-1 counters are put on a creature, put a charge counter on this artifact.
// {T}: Add one mana of any color.
// {5}, {T}, Sacrifice this artifact: Create X tapped 2/2 colorless Scarecrow artifact creature tokens, where X is the
// number of charge counters on this artifact.
import { activated, addCounters, createTokens, defineCard, isCreature, lkiObj, mana, on, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Wickersmith's Tools",
  faces: [{
    abilities: [
      triggered(on.custom((e, c) => e.type === 'counters' && e.kind === '-1/-1' && e.amount > 0 && e.target.kind === 'obj' && !!c.g.state.objects[e.target.id] && isCreature(c.g, e.target.id)), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'charge', 1, c.you);
      }, { text: 'Sempre que um ou mais marcadores -1/-1 são colocados numa criatura, coloque um marcador de carga neste artefato.' }),
      mana('any', { text: '{T}: Adicione uma mana de qualquer cor.' }),
      activated('{5}, {T}, Sacrifice this artifact', function* (c) {
        // ruling 1: X calculado na resolução, pelos marcadores da última vez no campo
        const x = lkiObj(c.g, c.source)?.counters.charge ?? 0;
        if (x > 0) yield* createTokens(c.g, c.you, 'Scarecrow', x, { tapped: true });
      }, { text: '{5}, {T}, Sacrifique este artefato: Crie X fichas de criatura artefato Scarecrow incolores 2/2 viradas, onde X é o número de marcadores de carga neste artefato.' }),
    ],
  }],
  rulings: { 1: 'teste: X pelos marcadores de carga' },
});

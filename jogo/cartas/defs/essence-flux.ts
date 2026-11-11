// Essence Flux
// Exile target creature you control, then return that card to the battlefield under its owner's control. If it's a
// Spirit, put a +1/+1 counter on it.
import { addCounters, chars, defineCard, exile, is, putOntoBattlefield, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Essence Flux',
  faces: [{
    spell: {
      targets: [t.creature(is.yours, 'criatura alvo que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const [ex] = yield* exile(c.g, [id]);
        // ruling 3: ficha exilada deixa de existir e não volta (CR 111.8)
        if (ex === null || ex === undefined || c.g.state.objects[ex]?.zone !== 'exile') return;
        const dono = c.g.state.objects[ex].owner;
        // ruling 4: carta de duas faces volta com a frente para cima (CR 712.14)
        const [volta] = yield* putOntoBattlefield(c.g, [{ id: ex, controller: dono }], 'effect');
        // ruling 1: confere se é Espírito depois de voltar
        if (volta !== undefined && chars(c.g, volta).subtypes.includes('Spirit')) addCounters(c.g, { kind: 'obj', id: volta }, '+1/+1', 1, c.you);
      },
    },
  }],
  rulings: {
    1: 'teste: um Espírito volta com um marcador +1/+1',
    2: 'teste: volta sem os marcadores, como um objeto novo',
    3: 'regra geral: CR 111.8 — ficha exilada deixa de existir e não volta (motor/actions.ts putOntoBattlefield)',
    4: 'regra geral: CR 712.14 — carta de duas faces volta com a frente para cima (motor/actions.ts)',
  },
});

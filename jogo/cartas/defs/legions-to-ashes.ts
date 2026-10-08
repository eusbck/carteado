// Legions to Ashes
// Exile target nonland permanent an opponent controls and all tokens that player controls with the same name as
// that permanent.
import { and, controllerOf, defineCard, exile, is, nameOf, permanentsMatching, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Legions to Ashes',
  faces: [{
    spell: {
      targets: [t.nonlandPermanent(and(is.nonland, is.opponents), 'permanente não terreno alvo que um oponente controla')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const p = controllerOf(c.g, id);
        const nome = nameOf(c.g, id);
        const fichas = permanentsMatching(c.g, (x) => x !== id && c.g.state.objects[x].isToken && controllerOf(c.g, x) === p && nameOf(c.g, x) === nome);
        yield* exile(c.g, [id, ...fichas]);
      },
    },
  }],
  rulings: {
    1: 'teste: o alvo não precisa ser ficha',
    2: 'regra geral: CR 608.2b — alvo ilegal, nada acontece, nem com as fichas de mesmo nome',
  },
});

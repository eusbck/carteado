// Avoid Fate
// Counter target instant or Aura spell that targets a permanent you control.
import { chars, controllerOf, counter, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Avoid Fate',
  faces: [{
    spell: {
      // ruling 1: confere ao conjurar e ao resolver (CR 608.2b); serve instantânea ou Aura, mesmo que mude de uma para outra
      targets: [t.spell((c, id) => {
        const o = c.g.state.objects[id];
        const ch = chars(c.g, id);
        if (!o?.stack || !(ch.types.includes('Instant') || ch.subtypes.includes('Aura'))) return false;
        return o.stack.targets.flat().some((x) => x.kind === 'obj' && c.g.state.objects[x.id]?.zone === 'battlefield' && controllerOf(c.g, x.id) === c.you);
      }, 'mágica de instantânea ou de Aura alvo que tem como alvo um permanente que você controla')],
      *effect(c) {
        const id = tgt(c);
        if (id !== null) yield* counter(c.g, id);
      },
    },
  }],
  rulings: {
    1: 'teste: anula a instantânea que tem como alvo uma criatura sua; não serve contra uma que mira a do oponente',
  },
});

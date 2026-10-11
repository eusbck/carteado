// Sundering Growth
// Destroy target artifact or enchantment, then populate. (Create a token that's a copy of a creature token you control.)
import { defineCard, destroy, is, or, populate, t, tgt } from '../../motor/api.ts';
import { POPULAR } from '../miku.ts';

export default defineCard({
  name: 'Sundering Growth',
  faces: [{
    spell: {
      // ruling 7: sem o alvo, a mágica não resolve e você não popula
      targets: [t.permanent(or(is.artifact, is.enchantment), 'artefato ou encantamento alvo')],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        yield* destroy(c.g, [id]);
        yield* populate(c.g, c.you);
      },
    },
  }],
  rulings: {
    1: POPULAR.copia,
    2: POPULAR.naoMira,
    3: POPULAR.copiaDeCopia,
    4: POPULAR.semFicha,
    5: POPULAR.semEstado,
    6: POPULAR.entrar,
    7: 'regra geral: CR 608.2b — com o único alvo ilegal, a mágica não resolve e você não popula (motor/stack.ts)',
  },
});
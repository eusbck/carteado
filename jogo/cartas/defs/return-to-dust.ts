// Return to Dust
// Exile target artifact or enchantment. If you cast this spell during your main phase, you may exile up to one other
// target artifact or enchantment.
import { defineCard, exile, is, or, t, tgt, upTo } from '../../motor/api.ts';
import { conjuradaNaSuaFasePrincipal } from '../inferno.ts';

const ALVO = or(is.artifact, is.enchantment);

export default defineCard({
  name: 'Return to Dust',
  faces: [{
    spell: {
      // ruling 1: o segundo alvo pode ser escolhido sempre; só é exilado se a mágica foi conjurada na sua fase principal
      targets: [t.permanent(ALVO, 'artefato ou encantamento alvo'), { ...upTo(1, t.permanent(ALVO, 'outro artefato ou encantamento alvo')), differentFrom: [0] }],
      *effect(c) {
        const ids: number[] = [];
        const primeiro = tgt(c, 0);
        if (primeiro !== null) ids.push(primeiro);
        // ruling 2: a cópia não foi conjurada e só exila o primeiro alvo
        const segundo = conjuradaNaSuaFasePrincipal(c) ? tgt(c, 1) : null;
        if (segundo !== null) ids.push(segundo);
        if (ids.length) yield* exile(c.g, ids);
      },
    },
  }],
  rulings: {
    1: 'teste: fora da sua fase principal, só o primeiro alvo é exilado',
    2: 'regra geral: CR 707.10 — a cópia não foi conjurada: só exila o primeiro alvo (cartas/inferno.ts conjuradaNaSuaFasePrincipal)',
  },
});
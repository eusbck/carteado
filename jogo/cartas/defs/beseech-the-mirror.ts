// Beseech the Mirror
// Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)
// Search your library for a card, exile it face down, then shuffle. If this spell was bargained, you may cast the
// exiled card without paying its mana cost if that spell's mana value is 4 or less. Put the exiled card into your hand
// if it wasn't cast this way.
import { bargain, bargained, castSpell, defineCard, isLand, manaValue, moveObjects, nameOf, searchLibrary, shuffleLibrary, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Beseech the Mirror',
  faces: [{
    additionalCosts: [bargain()],
    spell: {
      *effect(c) {
        const g = c.g;
        const [achada] = yield* searchLibrary(g, c.you, c.you, { max: 1, prompt: 'Procure uma carta para exilar virada para baixo' });
        let ex: number | null = null;
        if (achada !== undefined) [ex] = (yield* moveObjects(g, [{ id: achada, to: 'exile', faceDown: true, visibleTo: [c.you] }], 'exile')) as (number | null)[];
        shuffleLibrary(g, c.you);
        if (ex === null || ex === undefined || g.state.objects[ex]?.zone !== 'exile') return;
        let conjurou = false;
        // CR 702.166b: barganhada, pode conjurar sem pagar o custo de mana se o valor de mana da mágica for 4 ou menos
        if (bargained(c) && !isLand(g, ex) && manaValue(g, ex) <= 4 && (yield* yesNo(g, c.you, `Beseech the Mirror: conjurar ${nameOf(g, ex)} sem pagar o custo de mana?`))) {
          conjurou = (yield* castSpell(g, c.you, ex, { key: 'free', label: 'sem pagar o custo de mana', zone: 'exile', free: true, duringResolution: true })) !== null;
        }
        if (!conjurou && g.state.objects[ex]?.zone === 'exile') yield* moveObjects(g, [{ id: ex, to: 'hand' }], 'effect');
      },
    },
  }],
  rulings: {
    1: 'teste: barganhada, conjura a carta de valor 4 ou menos sem pagar; senão ela vai para a mão',
    2: 'teste: barganhada, conjura a carta de valor 4 ou menos sem pagar; senão ela vai para a mão',
    3: 'regra geral: CR 702.166a — barganha sacrifica um só artefato, encantamento ou ficha (motor/cedh.ts bargain)',
    4: 'regra geral: CR 707.10 — a cópia tem os mesmos custos pagos (motor/stack.ts copySpell)',
    5: 'não se aplica: Beseech the Mirror não tem alvos que dependem da barganha',
  },
});

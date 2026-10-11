// Planeswalker's Mischief
// {3}{U}: Target opponent reveals a card at random from their hand. If it's an instant or sorcery card, exile it. You may
// cast it without paying its mana cost for as long as it remains exiled. At the beginning of the next end step, if you
// haven't cast it, return it to its owner's hand. Activate only as a sorcery.
import { activated, allowPlay, defineAbility, defineCard, delayed, exile, is, moveObjects, nameOf, nextEndStepTrigger, t, tgtPlayer } from '../../motor/api.ts';
import { shuffle } from '../../motor/rng.ts';
import type { ObjId } from '../../motor/types.ts';

// ruling 2: o gatilho atrasado não depende de Planeswalker's Mischief continuar no campo
const DEVOLVE = defineAbility("Planeswalker's Mischief:devolve", nextEndStepTrigger(function* (c) {
  const carta = c.data.carta as ObjId;
  if (c.g.state.objects[carta]?.zone === 'exile') yield* moveObjects(c.g, [{ id: carta, to: 'hand' }], 'effect');
}, "No início da próxima etapa final, se você não conjurou a carta exilada com Planeswalker's Mischief, devolva-a para a mão do dono."));

export default defineCard({
  name: "Planeswalker's Mischief",
  faces: [{
    abilities: [
      activated('{3}{U}', function* (c) {
        const s = c.g.state;
        const p = tgtPlayer(c);
        // ruling 1: sem cartas na mão, nada acontece
        if (p === null || !s.zones.hand[p].length) return;
        const [carta] = shuffle(s.rng, [...s.zones.hand[p]]);
        c.g.log(`${s.players[p].name} revela ${nameOf(c.g, carta)} ao acaso.`, { rule: '701.20' });
        if (!is.instantOrSorcery({ g: c.g, you: c.you, source: c.source }, carta)) return;
        const [ex] = yield* exile(c.g, [carta]);
        if (ex === null || ex === undefined || s.objects[ex]?.zone !== 'exile') return;
        allowPlay(c.g, c.you, c.source, [ex], { kind: 'permanent' }, { free: true, spellsOnly: true });
        delayed(c, DEVOLVE.id!, { data: { carta: ex } });
      }, {
        targets: [t.opponent()],
        timing: 'sorcery',
        text: '{3}{U}: O oponente alvo revela uma carta ao acaso da mão dele. Se for uma carta instantânea ou de feitiço, exile-a. Você pode conjurá-la sem pagar o custo de mana enquanto ela continuar exilada. No início da próxima etapa final, se você não a conjurou, devolva-a para a mão do dono. Ative somente como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com o oponente sem cartas na mão, nada acontece',
    2: 'teste: sem conjurar, a carta volta para a mão do dono na próxima etapa final, mesmo sem Planeswalker\'s Mischief no campo',
    3: 'teste: conjurada de graça, a carta resolve e vai para o cemitério do dono',
  },
});

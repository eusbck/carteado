// Misdirection
// You may exile a blue card from your hand rather than pay this spell's mana cost.
// Change the target of target spell with a single target.
import { changeTargets, chars, defineCard, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Misdirection',
  faces: [{
    // custo alternativo (CR 118.9): exilar uma carta azul da mão
    altCosts: [{
      key: 'desvio', label: 'exilando uma carta azul da mão', zone: 'hand', mana: '',
      parts: [{ k: 'exileFromHand', n: 1, label: 'carta azul', filter: (c, id) => chars(c.g, id).colors.includes('U') }],
    }],
    spell: {
      // ruling 7: só confere que a mágica tem um alvo só, não se ele é legal; ruling 2: mira só a mágica
      targets: [t.spell((c, id) => (c.g.state.objects[id]?.stack?.targets.flat().length ?? 0) === 1, 'mágica alvo com um único alvo')],
      *effect(c) {
        const id = tgt(c);
        // ruling 8: o alvo novo é escolhido na resolução; ruling 5: pode ser a própria Misdirection, que ainda está na
        // pilha; ruling 4: a mágica não pode mirar a si mesma (CR 115.5); ruling 6: sem outro alvo legal, nada muda
        if (id !== null) yield* changeTargets(c.g, id, c.you, { mustChange: true });
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 115.7 — a mudança gera o evento de "virar alvo" (motor/stack.ts changeTargets)',
    2: 'teste: muda o alvo de uma mágica do oponente para outra criatura',
    3: 'regra geral: CR 115.7 — o alvo novo de uma mágica que mira mágica pode ser qualquer outra mágica na pilha (motor/stack.ts)',
    4: 'regra geral: CR 115.5 — a mágica não pode mirar a si mesma (motor/stack.ts isLegalTarget)',
    5: 'teste: a mágica que mira mágica pode passar a mirar a própria Misdirection',
    6: 'teste: sem outro alvo legal, o alvo não muda',
    7: 'teste: só mira mágica com exatamente um alvo',
    8: 'teste: muda o alvo de uma mágica do oponente para outra criatura',
  },
});

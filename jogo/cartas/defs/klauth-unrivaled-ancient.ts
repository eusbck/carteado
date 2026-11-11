// Klauth, Unrivaled Ancient
// Flying, haste
// Whenever Klauth attacks, add X mana in any combination of colors, where X is the total power of attacking creatures.
// Spend this mana only to cast spells. Until end of turn, you don't lose this mana as steps and phases end.
import { addMana, defineCard, defineFn, keywords, on, power, triggered, type G } from '../../motor/api.ts';
import { manaEmCombinacao } from '../dragoes.ts';

// CR 106.6: só para conjurar mágicas
const SO_MAGICAS = 'Klauth, Unrivaled Ancient:soMagicas';
defineFn(SO_MAGICAS, (_g: G, purpose: { kind: string }) => purpose.kind === 'spell');

export default defineCard({
  name: 'Klauth, Unrivaled Ancient',
  faces: [{
    abilities: [
      ...keywords('flying', 'haste'),
      // ruling 1: não é habilidade de mana (dispara no ataque): usa a pilha; a força é a da resolução
      triggered(on.selfAttacks(), function* (c) {
        const atac = (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && c.g.state.objects[a.id]?.zone === 'battlefield');
        const x = atac.reduce((n, a) => n + Math.max(0, power(c.g, a.id)), 0);
        if (x <= 0) return;
        const tipos = yield* manaEmCombinacao(c.g, c.you, x, 'Klauth');
        // CR 106.4, 500.5: não se perde ao fim das etapas e fases deste turno
        addMana(c.g, c.you, tipos, { source: c.source, restriction: SO_MAGICAS, untilEndOfTurn: true });
      }, { text: 'Sempre que Klauth ataca, adicione X manas em qualquer combinação de cores, onde X é a força total das criaturas atacantes. Gaste essa mana só para conjurar mágicas. Até o fim do turno, você não perde essa mana quando as etapas e fases terminam.' }),
    ],
  }],
  rulings: {
    1: 'teste: dispara no ataque, pela pilha; X é a força total das atacantes',
  },
});

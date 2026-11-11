// Echo of Eons
// Each player shuffles their hand and graveyard into their library, then draws seven cards.
// Flashback {2}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)
import { defineCard, draw, flashback, moveObjects, shuffleLibrary } from '../../motor/api.ts';

export default defineCard({
  name: 'Echo of Eons',
  faces: [{
    altCosts: [flashback('{2}{U}')],
    spell: {
      *effect(c) {
        const s = c.g.state;
        // ruling 7: a própria mágica está na pilha e não vai junto
        const ordem = c.g.apnap();
        const cartas = ordem.flatMap((p) => [...s.zones.hand[p], ...s.zones.graveyard[p]]);
        if (cartas.length) yield* moveObjects(c.g, cartas.map((id) => ({ id, to: 'library' as const })), 'shuffle');
        for (const p of ordem) shuffleLibrary(c.g, p);
        for (const p of ordem) yield* draw(c.g, p, 7);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 118.9d — o valor de mana é o do custo impresso, qualquer que seja o custo pago',
    2: 'teste: com retrospectiva, é conjurada do cemitério por {2}{U} e exilada depois',
    3: 'regra geral: CR 702.34a — o momento de conjurar continua o de feitiço (motor/priority.ts)',
    4: 'regra geral: CR 702.34a — a retrospectiva vale assim que a carta está no cemitério',
    5: 'regra geral: CR 702.34a — exilada ao sair da pilha de qualquer jeito (motor/stack.ts exileAfter)',
    6: 'regra geral: CR 702.34a — vale mesmo para carta que foi ao cemitério sem ser conjurada',
    7: 'teste: cada jogador embaralha mão e cemitério no grimório e compra sete; a própria Echo vai para o cemitério',
  },
});

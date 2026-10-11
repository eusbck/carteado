// Approach of the Second Sun
// If this spell was cast from your hand and you've cast another spell named Approach of the Second Sun this game, you
// win the game. Otherwise, put Approach of the Second Sun into its owner's library seventh from the top and you gain 7
// life.
import { defineCard, gainLife, moveObjects, winGame } from '../../motor/api.ts';

const NOME = 'Approach of the Second Sun';

export default defineCard({
  name: NOME,
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const o = s.objects[c.source];
        // ruling 3: a cópia não foi conjurada; não conta como primeira nem como segunda
        const conjurada = !!o && !o.isCopy && !o.stack?.isCopy;
        // rulings 2, 4 e 6: conta as que você conjurou na partida, de onde for, tenham resolvido ou não; esta é uma delas
        const outras = (s.castNames?.[`${c.you}:${NOME}`] ?? 0) - (conjurada ? 1 : 0);
        if (conjurada && o.stack?.castFrom === 'hand' && outras >= 1) {
          winGame(c.g, c.you, 'Approach of the Second Sun');
          return;
        }
        // ruling 5: sétima a partir do topo; com menos de seis cartas no grimório, fica no fundo
        if (o && o.zone === 'stack' && !o.isCopy) yield* moveObjects(c.g, [{ id: c.source, to: 'library', position: 6 }], 'effect');
        gainLife(c.g, c.you, 7, c.source);
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 701.6a — a mágica anulada não resolve e nenhum efeito dela acontece (motor/stack.ts counter)',
    2: 'teste: a segunda precisa ter sido conjurada da mão',
    3: 'regra geral: CR 707.10 — a cópia de uma mágica não é conjurada (motor/stack.ts copySpell não conta em castNames)',
    4: 'teste: conjurando outra da mão depois da primeira, você vence a partida, mesmo que a primeira tenha sido anulada',
    5: 'teste: com menos de seis cartas no grimório, vai para o fundo',
    6: 'teste: conjurando outra da mão depois da primeira, você vence a partida, mesmo que a primeira tenha sido anulada',
  },
});

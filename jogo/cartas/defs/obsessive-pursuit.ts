// Obsessive Pursuit
// When this enchantment enters and at the beginning of your upkeep, you lose 1 life and create a Clue token.
// (It's an artifact with "{2}, Sacrifice this token: Draw a card.")
// Whenever you attack, put X +1/+1 counters on target attacking creature, where X is the number of permanents
// you've sacrificed this turn. If X is three or more, that creature gains lifelink until end of turn.
import { addCounters, createTokens, defineCard, etb, isAttacking, loseLife, on, permanentsSacrificedThisTurn, t, tgt, triggered, untilEndOfTurn, type EffectFn } from '../../motor/api.ts';

const pista: EffectFn = function* (c) {
  loseLife(c.g, c.you, 1, c.source);
  // CR 111.10f: criar uma Pista diretamente não é investigar (CR 701.16).
  yield* createTokens(c.g, c.you, 'Clue', 1);
};

export default defineCard({
  name: 'Obsessive Pursuit',
  faces: [{ abilities: [
    etb(pista, { text: 'Quando este encantamento entra, você perde 1 de vida e cria uma ficha de Pista.' }),
    triggered(on.upkeep('you'), pista, { text: 'No início da sua manutenção, você perde 1 de vida e cria uma ficha de Pista.' }),
    triggered(on.youAttack(), function* (c) {
      const id = tgt(c);
      if (id === null) return;
      // CR 608.2h: calcula X na resolução, inclusive sacrifícios em resposta ao gatilho.
      const x = permanentsSacrificedThisTurn(c.g, c.you);
      addCounters(c.g, { kind: 'obj', id }, '+1/+1', x, c.you);
      if (x >= 3) untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'lifelink' }]);
    }, {
      targets: [t.creature((c, id) => isAttacking(c.g, id), 'criatura atacante alvo')],
      text: 'Sempre que você ataca, coloque X marcadores +1/+1 na criatura atacante alvo, sendo X o número de permanentes que você sacrificou neste turno. Se X for três ou mais, ela ganha vínculo com a vida até o fim do turno.',
    }),
  ] }],
  rulings: {
    1: 'teste: ao entrar cria uma Pista que pode ser sacrificada por {2} para comprar uma carta',
    2: 'teste: cria a Pista diretamente, sem realizar a ação de investigar',
  },
});

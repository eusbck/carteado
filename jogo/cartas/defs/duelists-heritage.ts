// Duelist's Heritage
// Whenever one or more creatures attack, you may have target attacking creature gain double strike until end of turn.
import { defineCard, isAttacking, on, t, tgt, triggered, untilEndOfTurn, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: "Duelist's Heritage",
  faces: [{
    abilities: [
      // ruling 1: dispara quando qualquer jogador ataca; o alvo é escolhido já sabendo quem é atacado
      triggered(on.custom((e) => e.type === 'attackers' && e.attackers.length > 0), function* (c) {
        const id = tgt(c);
        if (id === null) return;
        if (yield* yesNo(c.g, c.you, "Duelist's Heritage: dar golpe duplo à criatura atacante alvo até o fim do turno?")) {
          untilEndOfTurn(c, [id], [{ k: 'addKeyword', kw: 'double strike' }]);
        }
      }, { targets: [t.creature((c, id) => isAttacking(c.g, id), 'criatura atacante alvo')], text: 'Sempre que uma ou mais criaturas atacam, você pode fazer a criatura atacante alvo ganhar golpe duplo até o fim do turno.' }),
    ],
  }],
  rulings: {
    1: 'teste: quando o oponente ataca, você pode dar golpe duplo a uma criatura atacante dele',
  },
});

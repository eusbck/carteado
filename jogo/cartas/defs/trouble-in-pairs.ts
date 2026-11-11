// Trouble in Pairs
// If an opponent would begin an extra turn, that player skips that turn instead.
// Whenever an opponent attacks you with two or more creatures, draws their second card each turn, or casts their second
// spell each turn, you draw a card.
import { defineCard, draw, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Trouble in Pairs',
  faces: [{
    abilities: [
      // CR 614.10: o turno extra do oponente é pulado quando começaria (motor/turn.ts)
      staticAbility({ rules: { skipsExtraTurn: (c, p) => c.g.isOpponent(c.you, p) }, text: 'Se um oponente fosse começar um turno extra, em vez disso esse jogador pula esse turno.' }),
      // ruling 5: cada um dos três acontecimentos dispara separadamente
      triggered(on.custom((e, c) => {
        if (e.type === 'attackers') return c.g.isOpponent(c.you, e.player) && e.attackers.filter((a) => a.target.kind === 'player' && a.target.id === c.you).length >= 2;
        if (e.type === 'draw') return c.g.isOpponent(c.you, e.player) && e.nth === 2;
        // ruling 2: conta mágicas anuladas; a contagem já inclui a mágica que acabou de ser conjurada
        if (e.type === 'cast') return c.g.isOpponent(c.you, e.player) && !e.copy && c.g.state.turnStats[e.player]?.spellsCast === 2;
        return false;
      }), function* (c) { yield* draw(c.g, c.you, 1); }, {
        text: 'Sempre que um oponente ataca você com duas ou mais criaturas, compra a segunda carta dele no turno ou conjura a segunda mágica dele no turno, você compra uma carta.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 500.7 — turno extra é o criado por mágica ou habilidade (motor/cedh.ts takeExtraTurn)',
    2: 'teste: a segunda mágica do oponente no turno faz você comprar; a primeira e a terceira não',
    3: 'regra geral: CR 614.10 — o turno extra só é pulado quando começaria (motor/turn.ts; testes/regras-turno-extra.test.ts)',
    4: 'teste: a segunda compra do oponente no turno faz você comprar, mesmo com Trouble in Pairs entrando depois da primeira',
    5: 'teste: Bruno ataca você com duas criaturas: você compra uma carta',
    6: 'regra geral: CR 506.1 — cada declaração de ataque (num combate adicional também) é um acontecimento novo',
  },
});

// Priest of Forgotten Gods
// {T}, Sacrifice two other creatures: Any number of target players each lose 2 life and sacrifice a creature of their
// choice. You add {B}{B} and draw a card. (Activate only as an instant.)
import { activated, addMana, anyNumber, defineCard, draw, eachSacrifices, isCreature, loseLife, t } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

export default defineCard({
  name: 'Priest of Forgotten Gods',
  faces: [{
    abilities: [activated('{T}, Sacrifice two other creatures', function* (c) {
      const jogadores = (c.targets[0] ?? []).filter((r) => r?.kind === 'player' && !c.g.state.players[r.id].left).map((r) => r!.id as PlayerId);
      for (const p of jogadores) loseLife(c.g, p, 2, c.source);
      // ruling 3: quem não tem criatura só perde a vida
      yield* eachSacrifices(c, jogadores, (id) => isCreature(c.g, id), 1, 'uma criatura');
      addMana(c.g, c.you, ['B', 'B'], { source: c.source });
      yield* draw(c.g, c.you, 1);
    }, {
      // ruling 2: tem alvos, então não é habilidade de mana e usa a pilha (CR 605.1a)
      targets: [anyNumber(t.player(undefined, 'jogadores alvo'))], timing: 'instant',
      text: '{T}, Sacrifique duas outras criaturas: Qualquer número de jogadores alvo perdem 2 de vida e sacrificam uma criatura à escolha deles. Você adiciona {B}{B} e compra uma carta. (Ative só como instantânea.)',
    })],
  }],
  rulings: {
    1: 'teste: sem alvos, ainda adiciona {B}{B} e compra',
    2: 'regra geral: CR 605.1a — habilidade com alvo não é de mana e usa a pilha',
    3: 'teste: jogador sem criatura ainda perde 2 de vida',
  },
});

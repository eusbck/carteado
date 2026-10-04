// Arcane Denial
// Counter target spell. Its controller may draw up to two cards at the beginning of the next turn's upkeep.
// You draw a card at the beginning of the next turn's upkeep.
import { chooseNumber, controllerOf, counter, defineAbility, defineCard, delayed, draw, nextUpkeepTrigger, t, tgt } from '../../motor/api.ts';

// CR 603.7: gatilhos atrasados criados na resolução
const ateDois = defineAbility('Arcane Denial:compraDoAnulado', nextUpkeepTrigger(function* (c) {
  const p = c.data.player as number;
  if (c.g.state.players[p].left) return;
  // ruling 1: o jogador escolhe quantas (0, 1 ou 2) quando a habilidade resolve
  const n = yield* chooseNumber(c.g, p, 'Arcane Denial: quantas cartas comprar (até duas)?', 0, 2);
  yield* draw(c.g, p, n);
}, 'No início da manutenção do próximo turno, o controlador da mágica anulada pode comprar até duas cartas.'));

const uma = defineAbility('Arcane Denial:compraSua', nextUpkeepTrigger(function* (c) {
  yield* draw(c.g, c.you, 1);
}, 'No início da manutenção do próximo turno, você compra uma carta.'));

export default defineCard({
  name: 'Arcane Denial',
  faces: [{
    spell: {
      targets: [t.spell()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const owner = controllerOf(c.g, id);
        yield* counter(c.g, id);
        delayed(c, ateDois.id!, { data: { player: owner } });
        delayed(c, uma.id!);
      },
    },
  }],
  rulings: { 1: 'teste: o controlador da mágica anulada escolhe de 0 a 2 na manutenção seguinte' },
});

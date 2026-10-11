// Jazal Goldmane
// First strike (This creature deals combat damage before creatures without first strike.)
// {3}{W}{W}: Attacking creatures you control get +X/+X until end of turn, where X is the number of attacking creatures.
import { activated, controllerOf, defineCard, keyword, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Jazal Goldmane',
  faces: [{
    abilities: [
      keyword('first strike'),
      activated('{3}{W}{W}', function* (c) {
        // X conta todas as criaturas atacantes na resolução; o bônus vai para as suas (CR 611.2c)
        const atacantes = (c.g.state.combat?.attackers ?? []).filter((a) => !a.removed && c.g.state.objects[a.id]?.zone === 'battlefield').map((a) => a.id);
        const suas = atacantes.filter((id) => controllerOf(c.g, id) === c.you);
        if (suas.length) untilEndOfTurn(c, suas, [{ k: 'pt', p: atacantes.length, t: atacantes.length }]);
      }, { text: '{3}{W}{W}: As criaturas atacantes que você controla recebem +X/+X até o fim do turno, onde X é o número de criaturas atacantes.' }),
    ],
  }],
  rulings: {},
});

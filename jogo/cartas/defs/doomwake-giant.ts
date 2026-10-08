// Doomwake Giant
// Constellation — Whenever this creature or another enchantment you control enters, creatures your opponents control
// get -1/-1 until end of turn.
import { allCreatures, and, controllerOf, defineCard, is, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'Doomwake Giant',
  faces: [{
    abilities: [triggered(on.enters(and(is.enchantment, is.yours)), function* (c) {
      // conjunto fixado na resolução (CR 611.2c)
      untilEndOfTurn(c, allCreatures(c.g).filter((id) => c.g.isOpponent(c.you, controllerOf(c.g, id))), [{ k: 'pt', p: -1, t: -1 }]);
    }, { text: 'Constelação — Sempre que esta criatura ou outro encantamento que você controla entra, as criaturas que seus oponentes controlam recebem -1/-1 até o fim do turno.' })],
  }],
  rulings: {
    1: 'teste: a própria Doomwake Giant (encantamento criatura) dispara',
    2: 'regra geral: CR 608.2b — Aura com alvo ilegal não resolve nem entra',
    3: 'regra geral: CR 603.3b — o controlador ordena os próprios gatilhos',
  },
});

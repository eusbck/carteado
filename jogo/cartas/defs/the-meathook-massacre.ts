// The Meathook Massacre
// When The Meathook Massacre enters, each creature gets -X/-X until end of turn.
// Whenever a creature you control dies, each opponent loses 1 life.
// Whenever a creature an opponent controls dies, you gain 1 life.
import { allCreatures, defineCard, etb, gainLife, loseLife, on, triggered, untilEndOfTurn } from '../../motor/api.ts';

export default defineCard({
  name: 'The Meathook Massacre',
  faces: [{
    abilities: [
      etb(function* (c) {
        const x = (c.g.state.objects[c.source]?.data.spell as { x?: number } | undefined)?.x ?? 0;
        const ids = allCreatures(c.g);
        if (x > 0 && ids.length) untilEndOfTurn(c, ids, [{ k: 'pt', p: -x, t: -x }]);
      }, { text: 'Quando The Meathook Massacre entra, cada criatura recebe -X/-X até o fim do turno.' }),
      triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
        for (const p of c.g.opponents(c.you)) loseLife(c.g, p, 1, c.source);
      }, { text: 'Sempre que uma criatura que você controla morre, cada oponente perde 1 de vida.' }),
      triggered(on.dies((c, l) => c.g.isOpponent(c.you, l.controller)), function* (c) {
        gainLife(c.g, c.you, 1, c.source);
      }, { text: 'Sempre que uma criatura que um oponente controla morre, você ganha 1 de vida.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 107.3m — X é o valor pago ao conjurar; se entrar de outro jeito, X é 0' },
});

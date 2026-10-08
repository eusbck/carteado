// Vengeful Bloodwitch
// Whenever this creature or another creature you control dies, target opponent loses 1 life and you gain 1 life.
import { defineCard, gainLife, loseLife, on, t, tgtPlayer, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Vengeful Bloodwitch',
  faces: [{
    abilities: [triggered(on.dies((c, l) => l.controller === c.you), function* (c) {
      const p = tgtPlayer(c);
      if (p === null) return;
      loseLife(c.g, p, 1, c.source);
      gainLife(c.g, c.you, 1, c.source);
    }, { targets: [t.opponent()], text: 'Sempre que esta criatura ou outra criatura que você controla morre, o oponente alvo perde 1 de vida e você ganha 1 de vida.' })],
  }],
  rulings: { 1: 'teste: CR 603.10a: morrendo junto, dispara para cada uma, inclusive ela' },
});

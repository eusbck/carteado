// Finale of Revelation
// Draw X cards. If X is 10 or more, instead shuffle your graveyard into your library, draw X cards, untap up to five
// lands, and you have no maximum hand size for the rest of the game.
// Exile Finale of Revelation.
import { chooseItems, defineCard, draw, isLand, moveObjects, nameOf, objItem, ruleEffect, shuffleLibrary, untap } from '../../motor/api.ts';
import { SEM_LIMITE_DE_MAO } from '../saque.ts';

export default defineCard({
  name: 'Finale of Revelation',
  faces: [{
    spell: {
      *effect(c) {
        const g = c.g;
        const x = c.x;
        if (x >= 10) {
          const cem = [...g.state.zones.graveyard[c.you]];
          if (cem.length) yield* moveObjects(g, cem.map((id) => ({ id, to: 'library' as const })), 'shuffle');
          shuffleLibrary(g, c.you);
          yield* draw(g, c.you, x);
          // "desvire até cinco terrenos": quaisquer terrenos virados, de qualquer jogador
          const virados = g.state.zones.battlefield.filter((id) => isLand(g, id) && g.state.objects[id].tapped && !g.state.objects[id].phasedOut);
          if (virados.length) {
            const esc = yield* chooseItems(g, c.you, 'Finale of Revelation: desvire até cinco terrenos', virados.map((id) => objItem(g, id, nameOf(g, id))), 0, Math.min(5, virados.length));
            for (const id of esc) untap(g, Number(id));
          }
          // CR 402.2: sem tamanho máximo de mão pelo resto da partida
          ruleEffect(c, SEM_LIMITE_DE_MAO.id!, { kind: 'permanent' }, { params: { player: c.you } });
        } else if (x > 0) yield* draw(g, c.you, x);
        // no fim da resolução, a carta vai para o exílio em vez do cemitério
        if (g.state.objects[c.source]?.zone === 'stack') yield* moveObjects(g, [{ id: c.source, to: 'exile' }], 'effect');
      },
    },
  }],
  rulings: {},
});

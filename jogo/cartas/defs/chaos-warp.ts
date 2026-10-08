// Chaos Warp
// The owner of target permanent shuffles it into their library, then reveals the top card of their library.
// If it's a permanent card, they put it onto the battlefield.
import { defineCard, isPermanentCard, moveObjects, nameOf, putOntoBattlefield, shuffleLibrary, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Chaos Warp',
  faces: [{
    spell: {
      targets: [t.permanent()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const owner = c.g.state.objects[id].owner;
        // CR 701.24c: embaralha mesmo que o objeto não chegue ao grimório (ficha deixa de existir)
        yield* moveObjects(c.g, [{ id, to: 'library' }], 'shuffle');
        shuffleLibrary(c.g, owner);
        // a ficha embaralhada não é carta (CR 111.8: fica lá até as SBAs); revela a primeira carta de verdade
        const top = c.g.state.zones.library[owner].find((id) => !c.g.state.objects[id].isToken);
        if (top === undefined) return;
        c.g.log(`${c.g.state.players[owner].name} revela ${nameOf(c.g, top)} do topo do grimório.`, { rule: '701.20' });
        // ruling 1, 3: só entra se for card de permanente e puder entrar; senão fica no topo
        if (isPermanentCard(c.g, top)) yield* putOntoBattlefield(c.g, [{ id: top, controller: owner }], 'chaos');
      },
    },
  }],
  rulings: {
    1: 'teste: se a carta revelada não é de permanente, fica no topo',
    2: 'teste: ficha embaralhada deixa de existir e o dono embaralha antes de revelar',
    3: 'regra geral: CR 303.4g — Aura sem o que encantar não entra e fica onde está (putOntoBattlefield)',
    4: 'regra geral: CR 608.2b — alvo ilegal, nada acontece',
    5: 'regra geral: CR 110.4a — isPermanentCard usa os tipos de permanente',
  },
});

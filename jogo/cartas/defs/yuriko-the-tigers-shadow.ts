// Yuriko, the Tiger's Shadow
// Commander ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the
// battlefield from your hand or the command zone tapped and attacking.)
// Whenever a Ninja you control deals combat damage to a player, reveal the top card of your library and put that card
// into your hand. Each opponent loses life equal to that card's mana value.
import { defineCard, lkiChars, loseLife, moveObjects, nameOf, ninjutsu, on, printedChars, triggered } from '../../motor/api.ts';

export default defineCard({
  name: "Yuriko, the Tiger's Shadow",
  faces: [{
    abilities: [
      // CR 702.49d: funciona da mão e da zona de comando; não é conjurar (sem imposto, ruling 3)
      ninjutsu('{U}{B}', { commander: true }),
      triggered(on.custom((e, c) => e.type === 'damage' && e.combat && e.target.kind === 'player' && e.controller === c.you
        && !!lkiChars(c.g, e.source)?.subtypes.includes('Ninja')), function* (c) {
        const topo = c.g.state.zones.library[c.you][0];
        if (topo === undefined) return;
        const o = c.g.state.objects[topo];
        // ruling 4: o valor de mana da carta no grimório (X = 0)
        const mv = printedChars(o.def, 0, o.owner).manaValue;
        c.g.log(`${c.g.state.players[c.you].name} revela ${nameOf(c.g, topo)} (valor de mana ${mv}) e a põe na mão.`);
        yield* moveObjects(c.g, [{ id: topo, to: 'hand' }], 'effect');
        for (const op of c.g.opponents(c.you)) loseLife(c.g, op, mv, c.source);
      }, { text: 'Sempre que um Ninja que você controla causa dano de combate a um jogador, revele a carta do topo do seu grimório e ponha-a na sua mão. Cada oponente perde vida igual ao valor de mana dela.' }),
    ],
  }],
  rulings: {
    1: 'teste: o ninjutsu de comandante funciona da zona de comando e entra atacando quem o devolvido atacava',
    2: 'teste: não foi declarada atacante: gatilhos de atacar não disparam',
    3: 'teste: não paga nem aumenta o imposto de comandante',
    4: 'teste: X do custo da carta revelada vale 0',
  },
});

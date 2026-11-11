// Glacial Chasm
// Cumulative upkeep—Pay 2 life.
// When this land enters, sacrifice a land.
// Creatures you control can't attack.
// Prevent all damage that would be dealt to you.
import { addCounters, controllerOf, defineCard, etb, isLand, loseLife, on, sacrifice, sacrificeYours, staticAbility, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Glacial Chasm',
  faces: [{
    abilities: [
      // CR 702.24a: põe um marcador de idade e paga o custo por marcador, ou sacrifica
      triggered(on.upkeep('you'), function* (c) {
        const eu = c.g.state.objects[c.source];
        if (!eu || eu.zone !== 'battlefield') return;
        addCounters(c.g, { kind: 'obj', id: c.source }, 'age', 1, c.you);
        const vida = 2 * (c.g.state.objects[c.source].counters.age ?? 0);
        if (c.g.state.players[c.you].life >= vida && (yield* yesNo(c.g, c.you, `Glacial Chasm: pagar ${vida} de vida para mantê-lo?`, `Pagar ${vida} de vida`, 'Sacrificar'))) loseLife(c.g, c.you, vida, c.source);
        else yield* sacrifice(c.g, [c.source]);
      }, { kw: 'cumulative upkeep', text: 'Manutenção cumulativa — Pague 2 de vida.' }),
      etb(function* (c) { yield* sacrificeYours(c, c.you, (id) => isLand(c.g, id), 1, 'um terreno'); }, { text: 'Quando este terreno entra, sacrifique um terreno.' }),
      staticAbility({
        rules: {
          canAttack: (c, atacante) => controllerOf(c.g, atacante) !== c.you,
          preventsDamage: (c, alvo) => alvo.kind === 'player' && alvo.id === c.you,
        },
        text: 'As criaturas que você controla não podem atacar. Previna todo o dano que seria causado a você.',
      }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 702.24a — o custo cresce a cada manutenção (2 de vida por marcador de idade)' },
});

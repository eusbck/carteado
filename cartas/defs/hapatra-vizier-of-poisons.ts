// Hapatra, Vizier of Poisons
// Whenever Hapatra deals combat damage to a player, you may put a -1/-1 counter on target creature.
// Whenever you put one or more -1/-1 counters on a creature, create a 1/1 green Snake creature token with deathtouch.
import { addCounters, createTokens, defineCard, isCreature, on, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Hapatra, Vizier of Poisons',
  faces: [{
    abilities: [
      triggered(on.selfDealsCombatDamageToPlayer(), function* (c) {
        const id = tgt(c);
        if (id !== null && (yield* yesNo(c.g, c.you, 'Hapatra: colocar um marcador -1/-1 na criatura alvo?'))) addCounters(c.g, { kind: 'obj', id }, '-1/-1', 1, c.you);
      }, { targets: [t.creature(undefined, 'criatura alvo para o marcador -1/-1')], text: 'Sempre que Hapatra causa dano de combate a um jogador, você pode colocar um marcador -1/-1 na criatura alvo.' }),
      // ruling 2: um gatilho por criatura (um evento de marcadores por criatura)
      triggered(on.custom((e, c) => e.type === 'counters' && e.kind === '-1/-1' && e.amount > 0 && e.by === c.you && e.target.kind === 'obj' && !!c.g.state.objects[e.target.id] && isCreature(c.g, e.target.id)), function* (c) {
        yield* createTokens(c.g, c.you, 'Snake verde', 1);
      }, { text: 'Sempre que você coloca um ou mais marcadores -1/-1 numa criatura, crie uma ficha de criatura Snake verde 1/1 com toque mortífero.' }),
    ],
  }],
  rulings: {
    1: 'teste: marcadores que matam Hapatra ainda disparam',
    2: 'teste: marcadores em criaturas diferentes disparam uma vez por criatura',
  },
});

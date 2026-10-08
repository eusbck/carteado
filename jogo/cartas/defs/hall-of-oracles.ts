// Hall of Oracles
// {T}: Add {C}.
// {1}, {T}: Add one mana of any color.
// {T}: Put a +1/+1 counter on target creature. Activate only as a sorcery and only if you've cast an instant or sorcery
// spell this turn.
import { activated, addCounters, defineCard, mana, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Hall of Oracles',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      mana('any', { cost: '{1}, {T}', text: '{1}, {T}: Adicione uma mana de qualquer cor.' }),
      activated('{T}', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 1, c.you);
      }, {
        timing: 'sorcery',
        condition: (c) => c.g.state.turnStats[c.you].instantSorceryCast > 0,
        targets: [t.creature()],
        text: '{T}: Coloque um marcador +1/+1 na criatura alvo. Ative só como feitiço e só se você tiver conjurado uma mágica instantânea ou de feitiço neste turno.',
      }),
    ],
  }],
});

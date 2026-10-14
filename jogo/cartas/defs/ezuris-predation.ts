// Ezuri's Predation
// For each creature your opponents control, create a 4/4 green Phyrexian Beast creature token. Each of those tokens
// fights a different one of those creatures.
import { chars, controllerOf, createTokens, dealDamage, defineCard, power } from '../../motor/api.ts';

export default defineCard({
  name: "Ezuri's Predation",
  faces: [{
    spell: {
      *effect(c) {
        const s = c.g.state;
        const delas = s.zones.battlefield.filter((id) => !s.objects[id].phasedOut && c.g.isOpponent(c.you, controllerOf(c.g, id)) && chars(c.g, id).types.includes('Creature'));
        if (!delas.length) return;
        const fichas = (yield* createTokens(c.g, c.you, 'Phyrexian Beast', delas.length)).filter((id) => c.g.state.objects[id]?.zone === 'battlefield');
        // CR 701.14a-b: as lutas acontecem ao mesmo tempo (ruling 3); fichas a mais (Doubling Season) não lutam (ruling 4).
        // As fichas são iguais, então o par de cada uma não muda o resultado (ruling 2)
        const pares = fichas.slice(0, delas.length).map((f, i) => [f, delas[i]] as const)
          .filter(([f, d]) => c.g.state.objects[f]?.zone === 'battlefield' && c.g.state.objects[d]?.zone === 'battlefield');
        if (!pares.length) return;
        dealDamage(c.g, pares.flatMap(([f, d]) => [
          { source: f, target: { kind: 'obj' as const, id: d }, amount: power(c.g, f), combat: false },
          { source: d, target: { kind: 'obj' as const, id: f }, amount: power(c.g, d), combat: false },
        ]));
      },
    },
  }],
  rulings: {
    1: 'regra geral: CR 608.2 — ninguém age entre criar as fichas e as lutas; os gatilhos de entrar vão para a pilha depois (motor/triggers.ts)',
    2: 'teste: uma Phyrexian Beast 4/4 por criatura dos oponentes, cada uma luta com uma delas ao mesmo tempo',
    3: 'teste: uma Phyrexian Beast 4/4 por criatura dos oponentes, cada uma luta com uma delas ao mesmo tempo',
    4: 'regra geral: CR 701.14a — só as fichas criadas para as criaturas lutam; as a mais ficam sem par (fichas.slice)',
  },
});

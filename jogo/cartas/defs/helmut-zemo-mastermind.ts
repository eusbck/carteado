// Helmut Zemo, Mastermind
// Whenever Helmut Zemo attacks, you may cast target instant or sorcery card with mana value less than or equal to his
// power from your graveyard. If that spell would be put into your graveyard, exile it instead. If you cast a spell this
// way, put a +1/+1 counter on Helmut Zemo.
import { addCounters, and, castSpell, defineCard, is, manaValue, nameOf, on, power, t, tgt, triggered, yesNo } from '../../motor/api.ts';

export default defineCard({
  name: 'Helmut Zemo, Mastermind',
  faces: [{
    abilities: [
      triggered(on.selfAttacks(), function* (c) {
        const carta = tgt(c);
        if (carta === null || c.g.state.objects[carta]?.zone !== 'graveyard') return;
        if (!(yield* yesNo(c.g, c.you, `Helmut Zemo: conjurar ${nameOf(c.g, carta)} do seu cemitério?`))) return;
        // conjurada durante a resolução (CR 608.2g), pagando os custos; se fosse para o seu cemitério, é exilada
        const magica = yield* castSpell(c.g, c.you, carta, {
          key: 'zemo', label: 'Helmut Zemo', zone: 'graveyard', duringResolution: true,
          permission: { key: `zemo:${carta}`, label: 'Helmut Zemo', exileInstead: true },
        });
        if (magica !== null && c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, {
        // o valor de mana é comparado com a força de Zemo ao escolher o alvo e de novo ao resolver (CR 608.2b)
        targets: [t.card('graveyard', and(is.instantOrSorcery, (c, id) => manaValue(c.g, id) <= (c.g.state.objects[c.source]?.zone === 'battlefield' ? power(c.g, c.source) : 0)), 'carta instantânea ou de feitiço alvo com valor de mana menor ou igual à força de Helmut Zemo no seu cemitério')],
        text: 'Sempre que Helmut Zemo ataca, você pode conjurar a carta instantânea ou de feitiço alvo com valor de mana menor ou igual à força dele do seu cemitério. Se essa mágica fosse para o seu cemitério, exile-a em vez disso. Se você conjurar uma mágica assim, coloque um marcador +1/+1 em Helmut Zemo.',
      }),
    ],
  }],
  rulings: {},
});

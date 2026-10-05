// Nesting Grounds
// {T}: Add {C}.
// {1}, {T}: Move a counter from target permanent you control onto a second target permanent. Activate only as a sorcery.
import { activated, addCounters, chooseItems, defineCard, is, mana, removeCounters, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Nesting Grounds',
  faces: [{
    abilities: [
      mana('C', { text: '{T}: Adicione {C}.' }),
      activated('{1}, {T}', function* (c) {
        // ruling 3: com um alvo ilegal, nada acontece
        const de = tgt(c, 0);
        const para = tgt(c, 1);
        if (de === null || para === null) return;
        const tipos = Object.entries(c.g.state.objects[de].counters).filter(([, n]) => n > 0).map(([k]) => k);
        if (!tipos.length) return;
        // ruling 2: o tipo de marcador é escolhido na resolução
        const [tipo] = yield* chooseItems(c.g, c.you, 'Nesting Grounds: escolha o tipo de marcador a mover', tipos.map((k) => ({ id: k, label: `marcador ${k}` })), 1, 1);
        // ruling 1: remove de um e coloca no outro
        if (removeCounters(c.g, { kind: 'obj', id: de }, tipo, 1) > 0) addCounters(c.g, { kind: 'obj', id: para }, tipo, 1, c.you);
      }, {
        timing: 'sorcery',
        targets: [t.permanent(is.yours, 'permanente alvo que você controla (de onde sai o marcador)'), { ...t.permanent(undefined, 'segundo permanente alvo (para onde vai o marcador)'), differentFrom: [0] }],
        text: '{1}, {T}: Mova um marcador do permanente alvo que você controla para um segundo permanente alvo. Ative só como feitiço.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: o marcador é removido e colocado (efeitos de "colocar" se aplicam)',
    2: 'teste: escolhe o tipo de marcador na resolução',
    3: 'regra geral: CR 608.2b — com alvo ilegal, nada acontece',
    4: 'regra geral: CR 122.1 — marcadores podem ir para qualquer permanente',
  },
});

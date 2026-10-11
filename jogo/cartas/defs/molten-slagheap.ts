// Molten Slagheap
// {T}: Add {C}.
// {1}, {T}: Put a storage counter on this land.
// {1}, Remove X storage counters from this land: Add X mana in any combination of {B} and/or {R}.
import { activated, addCounters, addMana, chooseNumber, defineCard, mana, removeCounters } from '../../motor/api.ts';
import type { ManaType } from '../../motor/types.ts';

export default defineCard({
  name: 'Molten Slagheap',
  faces: [{
    abilities: [
      mana('C'),
      activated('{1}, {T}', function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, 'storage', 1, c.you);
      }, { text: '{1}, {T}: Coloque um marcador de armazenamento neste terreno.' }),
      // simplificação: é ativada como habilidade comum (passa pela pilha), e o X e os marcadores removidos são escolhidos
      // na resolução; pela regra é habilidade de mana, com os marcadores removidos como custo
      activated('{1}', function* (c) {
        const o = c.g.state.objects[c.source];
        const tem = o?.zone === 'battlefield' ? (o.counters.storage ?? 0) : 0;
        if (tem <= 0) return;
        const x = yield* chooseNumber(c.g, c.you, 'Molten Slagheap: quantos marcadores de armazenamento remover? (uma mana por marcador)', 0, tem);
        if (x <= 0) return;
        removeCounters(c.g, { kind: 'obj', id: c.source }, 'storage', x);
        const pretas = yield* chooseNumber(c.g, c.you, `Molten Slagheap: das ${x} manas, quantas são pretas? (as outras são vermelhas)`, 0, x);
        addMana(c.g, c.you, [...Array<ManaType>(pretas).fill('B'), ...Array<ManaType>(x - pretas).fill('R')], { source: c.source });
      }, {
        condition: (c) => (c.g.state.objects[c.source]?.counters.storage ?? 0) > 0,
        text: '{1}, Remova X marcadores de armazenamento deste terreno: Adicione X manas em qualquer combinação de {B} e/ou {R}.',
      }),
    ],
  }],
  rulings: {},
});
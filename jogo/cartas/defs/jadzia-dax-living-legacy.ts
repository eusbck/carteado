// Jadzia Dax, Living Legacy
// At the beginning of your first main phase, put a +1/+1 counter on Jadzia Dax, then add an amount of {G}
// equal to the number of counters on her.
// Transfer Symbiont — {2}{G}, Discard this card: Put two +1/+1 counters on target creature.
import { activated, addCounters, addMana, defineCard, lkiObj, on, t, tgt, triggered, type ManaType } from '../../motor/api.ts';

export default defineCard({
  name: 'Jadzia Dax, Living Legacy',
  faces: [{
    abilities: [
      // CR 505.1a e 605.1b: só a primeira fase principal; o gatilho usa a pilha, mesmo adicionando mana.
      triggered(on.firstMain(), function* (c) {
        const fonte = c.g.state.objects[c.source];
        if (fonte?.zone === 'battlefield' && !fonte.phasedOut) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
        // CR 608.2h: conta todos os tipos de marcador, usando a última informação conhecida se ela saiu.
        const n = Object.values(lkiObj(c.g, c.source)?.counters ?? {}).reduce((soma, quantidade) => soma + quantidade, 0);
        if (n > 0) addMana(c.g, c.you, Array<ManaType>(n).fill('G'), { source: c.source });
      }, {
        text: 'No início da sua primeira fase principal, coloque um marcador +1/+1 em Jadzia Dax e depois adicione uma quantidade de {G} igual ao número de marcadores nela.',
      }),
      // CR 113.6j: o custo de descartar esta carta só pode ser pago da mão.
      activated('{2}{G}, Discard this card', function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you);
      }, {
        zones: ['hand'],
        targets: [t.creature()],
        text: 'Transferir simbionte — {2}{G}, Descarte esta carta: Coloque dois marcadores +1/+1 na criatura alvo.',
      }),
    ],
  }],
  rulings: {},
});

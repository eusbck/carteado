// Gorma, the Gullet
// Lifelink
// Whenever another creature you control dies, put a +1/+1 counter on Gorma.
// Nontoken creatures you control enter with an additional +1/+1 counter on them for each creature that died under your
// control this turn.
import { addCounters, defineCard, keywords, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Gorma, the Gullet',
  faces: [{
    abilities: [
      ...keywords('lifelink'),
      triggered(on.dies((c, l, o) => o.id !== c.source && l.controller === c.you), function* (c) {
        if (c.g.state.objects[c.source]) addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que outra criatura que você controla morre, coloque um marcador +1/+1 em Gorma.' }),
      staticAbility({
        rules: {
          // ruling 1: só vale para quem entra depois de Gorma já estar no campo (CR 614.12)
          enterModifier: (c, ev, wc) => {
            if (ev.controller !== c.you || !wc.types.includes('Creature') || ev.obj === -1 || c.g.state.objects[ev.obj]?.isToken) return;
            const n = c.g.state.turnStats[c.you].creaturesDied;
            if (n > 0) ev.counters['+1/+1'] = (ev.counters['+1/+1'] ?? 0) + n;
          },
        },
        text: 'As criaturas que não são fichas que você controla entram com um marcador +1/+1 adicional para cada criatura que morreu sob seu controle neste turno.',
      }),
    ],
  }],
  rulings: { 1: 'teste: entrando junto com Gorma, não ganha marcadores' },
});

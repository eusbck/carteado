// Voice of the Blessed
// Whenever you gain life, put a +1/+1 counter on this creature.
// As long as this creature has four or more +1/+1 counters on it, it has flying and vigilance.
// As long as this creature has ten or more +1/+1 counters on it, it has indestructible.
import { addCounters, defineCard, on, selfGets, triggered, type Mod } from '../../motor/api.ts';
import { GANHO_DE_VIDA } from '../miku.ts';

export default defineCard({
  name: 'Voice of the Blessed',
  faces: [{
    abilities: [
      triggered(on.youGainLife(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que você ganha vida, coloque um marcador +1/+1 nesta criatura.' }),
      // a lista nunca volta vazia para a própria fonte: o motor descobre a camada chamando isto (camada 6)
      selfGets((_c, o) => {
        const n = o.counters['+1/+1'] ?? 0;
        const mods: Mod[] = [];
        if (n >= 4) mods.push({ k: 'addKeyword', kw: 'flying' }, { k: 'addKeyword', kw: 'vigilance' });
        if (n >= 10) mods.push({ k: 'addKeyword', kw: 'indestructible' });
        return mods.length ? mods : [{ k: 'loseKeyword', kw: 'nenhuma' }];
      }, 'Enquanto esta criatura tiver quatro ou mais marcadores +1/+1, ela tem voar e vigilância. Enquanto tiver dez ou mais marcadores +1/+1, ela tem indestrutível.'),
    ],
  }],
  rulings: {
    1: GANHO_DE_VIDA.umPorEvento,
    2: GANHO_DE_VIDA.danoLetal,
    3: GANHO_DE_VIDA.vinculo,
    4: GANHO_DE_VIDA.paraCada,
    5: GANHO_DE_VIDA.duasCabecas,
    6: 'regra geral: CR 509.1h — ganhar voar depois de bloqueada não desfaz o bloqueio (motor/combat.ts)',
  },
});
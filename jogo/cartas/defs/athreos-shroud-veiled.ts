// Athreos, Shroud-Veiled
// Indestructible
// As long as your devotion to white and black is less than seven, Athreos isn't a creature.
// At the beginning of your end step, put a coin counter on another target creature.
// Whenever a creature with a coin counter on it dies or is put into exile, return that card to the battlefield under
// your control.
import { addCounters, and, defineCard, is, keyword, on, putOntoBattlefield, staticAbility, t, tgt, triggered } from '../../motor/api.ts';
import type { ObjId, ZoneName } from '../../motor/types.ts';
import { devocao, DEVOCAO } from '../milagres.ts';

export default defineCard({
  name: 'Athreos, Shroud-Veiled',
  faces: [{
    abilities: [
      keyword('indestructible'),
      staticAbility({
        affects: (c, o) => o.id === c.source && o.zone === 'battlefield' && devocao(c.g, c.you, ['W', 'B']) < 7,
        // ruling 20: deixa de ser criatura e perde o tipo God; continua encantamento lendário
        mods: () => [{ k: 'setTypes', types: ['Enchantment'], subtypes: [], keepSupertypes: true }],
        text: 'Enquanto a sua devoção ao branco e ao preto for menor que sete, Athreos não é uma criatura.',
      }),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) addCounters(c.g, { kind: 'obj', id }, 'coin', 1, c.you);
      }, {
        targets: [t.creature(and(is.other), 'outra criatura alvo')],
        text: 'No começo da sua etapa final, coloque um marcador de moeda em outra criatura alvo.',
      }),
      // ruling 8: precisa ser criatura com marcador de moeda ao sair; ruling 5: olha para trás junto com Athreos
      triggered(on.custom((e, c) => {
        if (e.type !== 'zone' || e.from !== 'battlefield' || (e.to !== 'graveyard' && e.to !== 'exile')) return false;
        const l = c.g.state.lki[e.old];
        if (!l || !l.chars.types.includes('Creature') || (l.obj.counters.coin ?? 0) <= 0) return false;
        return { carta: e.obj, zona: e.to, ficha: e.token };
      }), function* (c) {
        const { carta, zona, ficha } = c.event as { carta: ObjId; zona: ZoneName; ficha: boolean };
        // ruling 1: ficha não volta; ruling 4: a carta que já saiu dessa zona fica onde está
        if (ficha || c.g.state.objects[carta]?.zone !== zona) return;
        // ruling 2: volta sem marcador de moeda; ruling 9: sob o seu controle
        yield* putOntoBattlefield(c.g, [{ id: carta, controller: c.you }], 'effect');
      }, { text: 'Sempre que uma criatura com um marcador de moeda morre ou é exilada, devolva essa carta ao campo sob o seu controle.' }),
    ],
  }],
  rulings: {
    1: 'teste: ficha com marcador de moeda dispara, mas não volta',
    2: 'teste: a criatura do oponente com marcador de moeda que morre volta sob o seu controle, sem o marcador',
    3: 'regra geral: CR 400.7 — exilada e devolvida na hora, é outro objeto: a carta já saiu do exílio e nada acontece',
    4: 'regra geral: a carta que saiu do cemitério ou do exílio antes da resolução fica onde está (conferido no efeito)',
    5: 'regra geral: CR 603.10a — saindo junto com Athreos, o gatilho olha para trás e a criatura volta',
    6: 'regra geral: o gatilho vale para qualquer criatura com moeda, até a própria Athreos',
    7: 'regra geral: CR 122.1 — os marcadores ficam na criatura sem Athreos; sem ela, nada dispara',
    8: 'regra geral: CR 603.10a — olha a criatura como ela era no campo: precisa ser criatura com marcador de moeda',
    9: 'teste: a criatura do oponente com marcador de moeda que morre volta sob o seu controle, sem o marcador',
    10: 'regra geral: CR 603.3b — com duas Athreos, os gatilhos vão para a pilha na ordem APNAP; o último a resolver fica com ela',
    11: DEVOCAO.semGenerico,
    12: DEVOCAO.soCusto,
    13: DEVOCAO.hibridos,
    14: DEVOCAO.naResolucao,
    15: DEVOCAO.aura,
    16: 'regra geral: CR 700.5a — o híbrido das duas cores conta uma vez (cartas/milagres.ts devocao: cada símbolo é contado uma vez)',
    17: 'regra geral: CR 113.6 — fora do campo é uma carta de criatura (a estática só vale no campo)',
    18: 'regra geral: CR 614.12 — substituições de entrar olham Athreos antes de ela estar no campo',
    19: 'regra geral: CR 603.6a — gatilhos de criatura entrando olham a devoção já com Athreos no campo',
    20: 'teste: com devoção menor que sete, Athreos é encantamento lendário sem o tipo God',
    21: 'regra geral: CR 113.6 — as habilidades funcionam no campo, criatura ou não',
    22: 'regra geral: CR 506.4 — se deixar de ser criatura, sai do combate',
    23: 'regra geral: CR 122.1 — os marcadores ficam mesmo sem ser criatura',
    24: 'regra geral: CR 613.6 — a mudança de tipo (camada 4) já se aplicou antes da perda de habilidades (camada 6)',
  },
});

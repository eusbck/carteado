// Feline Sovereign
// Other Cats you control get +1/+1 and have protection from Dogs.
// Whenever one or more Cats you control deal combat damage to a player, destroy up to one target artifact or enchantment
// that player controls.
import { and, anthem, controllerOf, defineCard, destroy, is, isSubtype, or, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';
import { seusCausamDanoDeCombate } from '../gatos.ts';

export default defineCard({
  name: 'Feline Sovereign',
  faces: [{
    abilities: [
      // CR 702.16a: proteção contra um subtipo
      anthem(and(is.subtype('Cat'), is.yours, is.other), () => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'protection', param: 'subtype:Dog' }], 'Os outros Cats que você controla recebem +1/+1 e têm proteção contra Dogs.'),
      triggered(seusCausamDanoDeCombate((c, id) => isSubtype(c.g, id, 'Cat')), function* (c) {
        const id = tgt(c);
        if (id !== null) yield* destroy(c.g, [id]);
      }, {
        targets: [upTo(1, t.permanent(and(or(is.artifact, is.enchantment), (c, id) => controllerOf(c.g, id) === (c.event?.jogador as PlayerId | undefined)), 'até um artefato ou encantamento alvo que esse jogador controla'))],
        text: 'Sempre que um ou mais Cats que você controla causam dano de combate a um jogador, destrua até um artefato ou encantamento alvo que esse jogador controla.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 120.6 — o dano fica marcado até a limpeza; sem o bônus, pode virar letal (motor/sba.ts)',
  },
});

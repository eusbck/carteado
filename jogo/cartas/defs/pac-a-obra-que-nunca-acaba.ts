// PAC, a Obra que Nunca Acaba (carta própria da mesa)
// Creature tokens you control have haste.
// At the beginning of your end step, if you control five or more creature tokens, gain control of target nonland
// permanent an opponent controls with mana value 3 or less.
import { and, anthem, creaturesOf, defineCard, gainControl, is, on, t, tgt, triggered } from '../../motor/api.ts';
import type { G } from '../../motor/api.ts';
import type { PlayerId } from '../../motor/types.ts';

const fichas = (g: G, p: PlayerId) => creaturesOf(g, p).filter((id) => g.state.objects[id]?.isToken).length;

export default defineCard({
  name: 'PAC, a Obra que Nunca Acaba',
  faces: [{
    abilities: [
      anthem(and(is.creature, is.token, is.yours), () => [{ k: 'addKeyword', kw: 'haste' }], 'As fichas de criatura que você controla têm ímpeto.'),
      triggered(on.endStep('you'), function* (c) {
        const id = tgt(c);
        if (id !== null) gainControl(c.g, id, c.you, { kind: 'permanent' }, c.source);
      }, {
        // CR 603.4: sem as cinco fichas ao disparar ou ao resolver, nada acontece
        condition: (c) => fichas(c.g, c.you) >= 5,
        targets: [t.nonlandPermanent(and(is.opponents, is.mvAtMost(3)), 'permanente alvo que não seja terreno, com valor de mana 3 ou menos, que um oponente controla')],
        text: 'No início da sua etapa final, se você controla cinco ou mais fichas de criatura, ganhe o controle da permanente alvo que não seja terreno, com valor de mana 3 ou menos, que um oponente controla.',
      }),
    ],
  }],
  rulings: {},
});

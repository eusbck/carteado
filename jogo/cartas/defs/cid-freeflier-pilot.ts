// Cid, Freeflier Pilot
// Equipment and Vehicle spells you cast cost {1} less to cast.
// Jump — During your turn, Cid has flying.
// {2}, {T}: Return target Equipment or Vehicle card from your graveyard to your hand.
import { activated, chars, defineCard, moveObjects, selfGets, staticAbility, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

const equipamentoOuVeiculo = (c: SCtx, id: ObjId) => { const s = chars(c.g, id).subtypes; return s.includes('Equipment') || s.includes('Vehicle'); };

export default defineCard({
  name: 'Cid, Freeflier Pilot',
  faces: [{
    abilities: [
      // CR 601.2f: a redução vale só para a mana genérica do custo total
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && (sp.chars.subtypes.includes('Equipment') || sp.chars.subtypes.includes('Vehicle')) ? { reduce: 1 } : null) },
        text: 'As mágicas de Equipment e de Vehicle que você conjura custam {1} a menos para serem conjuradas.',
      }),
      // "Jump" é palavra de habilidade (CR 207.2c)
      selfGets(() => [{ k: 'addKeyword', kw: 'flying' }], 'Jump — Durante o seu turno, Cid tem voar.', { condition: (c) => c.g.state.turn.active === c.you }),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', equipamentoOuVeiculo, 'carta de Equipment ou Vehicle alvo do seu cemitério', 'you')],
        text: '{2}, {T}: Devolva a carta de Equipment ou Vehicle alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: um Equipment de {2} custa {1}, um Vehicle de {2} custa {1} e um Equipment de {1} custa {0}',
    2: 'teste: o valor de mana não muda com a redução',
  },
});

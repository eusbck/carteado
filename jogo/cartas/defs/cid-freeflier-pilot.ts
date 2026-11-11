// Cid, Freeflier Pilot
// Equipment and Vehicle spells you cast cost {1} less to cast.
// Jump — During your turn, Cid has flying.
// {2}, {T}: Return target Equipment or Vehicle card from your graveyard to your hand.
import { activated, chars, defineCard, moveObjects, selfGets, staticAbility, t, tgt } from '../../motor/api.ts';
import type { SCtx } from '../../motor/defs.ts';
import type { ObjId } from '../../motor/types.ts';

const equipOuVeiculo = (s: string[]) => s.includes('Equipment') || s.includes('Vehicle');

export default defineCard({
  name: 'Cid, Freeflier Pilot',
  faces: [{
    abilities: [
      // ruling 1: só a mana genérica é reduzida (motor reduz genérica)
      staticAbility({
        rules: { costModifier: (c, sp) => (sp.controller === c.you && equipOuVeiculo(sp.chars.subtypes) ? { reduce: 1 } : null) },
        text: 'Mágicas de Equipamento e de Veículo que você conjura custam {1} a menos para serem conjuradas.',
      }),
      selfGets(() => [{ k: 'addKeyword', kw: 'flying' }], 'Pular — Durante o seu turno, Cid tem voar.', {
        affects: (c: SCtx, o: { id: ObjId }) => o.id === c.source && c.g.state.turn.active === c.you,
      }),
      activated('{2}, {T}', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* moveObjects(c.g, [{ id, to: 'hand' }], 'effect');
      }, {
        targets: [t.card('graveyard', (c, id) => equipOuVeiculo(chars(c.g, id).subtypes), 'carta de Equipamento ou Veículo alvo do seu cemitério', 'you')],
        text: '{2}, {T}: Devolva a carta de Equipamento ou Veículo alvo do seu cemitério para a sua mão.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ruling 1 e 2: reduz {1} da parte genérica do custo total',
    2: 'teste: ruling 1 e 2: reduz {1} da parte genérica do custo total',
  },
});

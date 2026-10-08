// Razorlash Transmogrant
// This creature can't block.
// {4}{B}{B}: Return this card from your graveyard to the battlefield with a +1/+1 counter on it. This ability costs
// {4} less to activate if an opponent controls four or more nonbasic lands.
import { activated, chars, controlledBy, defineCard, isLand, keyword, putOntoBattlefield } from '../../motor/api.ts';
import type { Ctx, SCtx } from '../../motor/api.ts';

// um mesmo oponente com quatro ou mais terrenos não básicos (não a soma entre oponentes)
const reduzido = (c: SCtx) => c.g.opponents(c.you).some((p) => controlledBy(c.g, p, (id) => isLand(c.g, id) && !chars(c.g, id).supertypes.includes('Basic')).length >= 4);

function* voltar(c: Ctx) {
  if (c.g.state.objects[c.source]?.zone !== 'graveyard') return;
  yield* putOntoBattlefield(c.g, [{ id: c.source, controller: c.you, counters: { '+1/+1': 1 } }], 'effect');
}

const TEXTO = '{4}{B}{B}: Devolva esta carta do seu cemitério ao campo com um marcador +1/+1. Esta habilidade custa {4} a menos para ativar se um oponente controlar quatro ou mais terrenos não básicos.';

export default defineCard({
  name: 'Razorlash Transmogrant',
  faces: [{
    abilities: [
      { ...keyword('cantBlock'), text: 'Esta criatura não pode bloquear.' },
      // CR 602.2b, 601.2f: o custo de ativação é determinado ao ativar; as duas versões se excluem pela condição
      activated('{4}{B}{B}', voltar, { zones: ['graveyard'], condition: (c) => !reduzido(c), text: TEXTO }),
      activated('{B}{B}', voltar, { zones: ['graveyard'], condition: reduzido, text: `${TEXTO} (Custo reduzido: {B}{B}.)` }),
    ],
  }],
  rulings: {},
});

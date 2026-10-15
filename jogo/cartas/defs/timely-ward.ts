// Timely Ward
// You may cast this spell as though it had flash if it targets a commander.
// Enchant creature
// Enchanted creature has indestructible.
import { attachedGets, defineCard, isCreature, t } from '../../motor/api.ts';
import type { AltCastDef, SCtx } from '../../motor/defs.ts';
import { ehComandante } from '../vingadores.ts';

/** tempo de feitiço (CR 307.5): fase principal do próprio turno com a pilha vazia */
function tempoDeFeitico(c: SCtx): boolean {
  const tn = c.g.state.turn;
  return (tn.step === 'main1' || tn.step === 'main2') && tn.active === c.you && c.g.state.zones.stack.length === 0;
}

/**
 * "Como se tivesse lampejo se mirar um comandante": fora do tempo de feitiço, a carta tem esta forma de conjurar, que
 * paga o custo de mana normal (não é custo alternativo de verdade) e marca a mágica, cujo alvo então só pode ser um
 * comandante. Simplificação: por usar o caminho dos custos alternativos, não se junta a outro custo alternativo.
 */
const LAMPEJO: AltCastDef = {
  key: 'timely-ward', label: 'como se tivesse lampejo, mirando um comandante', zone: 'hand', mana: null, useManaCost: true,
  timing: (c) => !tempoDeFeitico(c),
  condition: (c) => c.g.state.zones.battlefield.some((id) => isCreature(c.g, id) && ehComandante(c.g, id)),
};

export default defineCard({
  name: 'Timely Ward',
  faces: [{
    altCosts: [LAMPEJO],
    enchant: t.creature((c, id) => {
      const o = c.g.state.objects[c.source];
      return !(o?.zone === 'stack' && o.stack?.method === LAMPEJO.key) || ehComandante(c.g, id);
    }, 'criatura'),
    abilities: [
      attachedGets(() => [{ k: 'addKeyword', kw: 'indestructible' }], 'A criatura encantada tem indestrutível.'),
    ],
  }],
  rulings: {},
});

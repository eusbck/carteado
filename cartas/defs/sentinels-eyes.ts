// Sentinel's Eyes
// Enchant creature
// Enchanted creature gets +1/+1 and has vigilance.
// Escape—{W}, Exile two other cards from your graveyard.
import { attachedGets, defineCard, escape, t } from '../../motor/api.ts';

export default defineCard({
  name: "Sentinel's Eyes",
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    // rulings 2-4, 6-7: fuga é um custo alternativo de conjurar do cemitério, no tempo normal da carta
    altCosts: [escape('{W}', 2)],
    abilities: [attachedGets(() => [{ k: 'pt', p: 1, t: 1 }, { k: 'addKeyword', kw: 'vigilance' }], 'A criatura encantada recebe +1/+1 e tem vigilância.')],
  }],
  rulings: {
    1: 'regra geral: CR 117.3 — o jogador ativo recebe prioridade primeiro',
    2: 'regra geral: CR 601.2b — escolhe uma permissão só',
    3: 'regra geral: CR 601.2f — custo total; valor de mana não muda',
    4: 'regra geral: CR 118.9a — sem outro custo alternativo',
    5: 'teste: depois de fugir, volta ao cemitério ao morrer a criatura',
    6: 'regra geral: CR 601.2 — vai para a pilha ao começar a conjurar',
    7: 'regra geral: CR 702.138a — respeita o tempo da carta',
  },
});

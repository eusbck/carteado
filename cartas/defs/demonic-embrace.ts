// Demonic Embrace
// Enchant creature
// Enchanted creature gets +3/+1, has flying, and is a Demon in addition to its other types.
// You may cast this card from your graveyard by paying 3 life and discarding a card in addition to paying its other
// costs.
import { attachedGets, defineCard, t } from '../../motor/api.ts';

export default defineCard({
  name: 'Demonic Embrace',
  faces: [{
    enchant: t.creature(undefined, 'criatura'),
    // a permissão do cemitério cobra o custo de mana normal mais 3 de vida e um descarte (CR 601.2f)
    altCosts: [{ key: 'cemiterio', label: 'do cemitério (3 de vida e descartar uma carta)', zone: 'graveyard', mana: '{1}{B}{B}', parts: [{ k: 'life', n: 3 }, { k: 'discard', n: 1 }] }],
    abilities: [
      attachedGets(() => [{ k: 'pt', p: 3, t: 1 }, { k: 'addKeyword', kw: 'flying' }, { k: 'addTypes', subtypes: ['Demon'] }], 'A criatura encantada recebe +3/+1, tem voar e é um Demon além dos outros tipos.'),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 117.3a — no seu turno você recebe prioridade primeiro',
    2: 'não se aplica: nenhuma outra carta dos decks dá permissão de conjurar do cemitério que alcance esta',
    3: 'teste: do cemitério continua sendo no tempo de feitiço',
  },
});

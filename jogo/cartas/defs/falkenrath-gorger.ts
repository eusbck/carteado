// Falkenrath Gorger
// Each Vampire creature card you own that isn't on the battlefield has madness. The madness cost is equal to its mana
// cost. (If you discard a card with madness, discard it into exile. When you do, cast it for its madness cost or put it
// into your graveyard.)
import { defineCard, printedChars } from '../../motor/api.ts';
import type { StaticDef } from '../../motor/defs.ts';
import { formatCost } from '../../motor/mana.ts';

// ruling 12: só vale com Falkenrath Gorger no campo; fora do campo o tipo impresso da carta decide
const daLoucura: StaticDef = {
  kind: 'static',
  offField: true,
  text: 'Cada carta de criatura Vampire de que você é dono que não está no campo de batalha tem loucura. O custo de loucura é igual ao custo de mana dela.',
  affects: (c, o) => {
    if (o.zone === 'battlefield' || o.owner !== c.you || !o.def) return false;
    const ch = printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face, o.owner);
    return ch.types.includes('Creature') && ch.subtypes.includes('Vampire') && ch.manaCost !== null;
  },
  mods: (_c, o) => {
    const ch = printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face, o.owner);
    return [{ k: 'addKeyword', kw: 'madness', param: { mana: formatCost(ch.manaCost ?? []), life: 0 } }];
  },
};

export default defineCard({
  name: 'Falkenrath Gorger',
  faces: [{ abilities: [daLoucura] }],
  rulings: {
    1: 'regra geral: CR 702.35a — descartada durante uma resolução, a carta vai para o exílio e a loucura vem depois (motor/actions.ts moveObjects)',
    2: 'regra geral: CR 601.2f — o custo de loucura é o custo alternativo; aumentos e reduções se aplicam a ele (motor/stack.ts totalSpellCost)',
    3: 'regra geral: CR 702.35a — sem conjurar, a carta vai para o cemitério (motor/conjurar-alternativo.ts)',
    4: 'regra geral: CR 603.3 — o gatilho da loucura vai para a pilha acima do que o descarte pagou (testes/regras-conjurar.test.ts)',
    5: 'regra geral: CR 701.9a — só se descarta da mão (motor/actions.ts)',
    6: 'regra geral: CR 702.35a — vale para qualquer descarte (motor/actions.ts moveObjects)',
    7: 'regra geral: CR 702.35a — continua sendo descarte (testes/regras-conjurar.test.ts)',
    8: 'teste: o Vampire descartado vai para o exílio e pode ser conjurado pelo próprio custo de mana',
    9: 'regra geral: CR 702.35a — a loucura ignora o tempo do tipo da carta (motor/conjurar-alternativo.ts)',
    10: 'regra geral: CR 113.7a — o gatilho da loucura já na pilha não depende de Falkenrath Gorger continuar no campo',
    11: 'regra geral: CR 702.35a — com duas loucuras, vale a primeira que o motor encontra; nenhum Vampire dos decks tem loucura impressa',
    12: 'teste: sem Falkenrath Gorger no campo, ou com carta que não é Vampire, o descarte vai direto para o cemitério',
  },
});

// Samut, Tyrant of Naktamun
// Instant and sorcery spells you control have split second. (As long as a spell with split second is on the stack,
// players can't cast spells or activate abilities that aren't mana abilities.)
import { defineCard, printedChars, SPLIT_SECOND, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Samut, Tyrant of Naktamun',
  faces: [{
    abilities: [
      // CR 702.61 (motor/controle-base.ts): a palavra-chave é dada às mágicas na pilha; quem consulta são as ações legais
      staticAbility({
        offField: true,
        affects: (c, o) => {
          if (o.zone !== 'stack' || o.stack?.kind !== 'spell' || o.stack.controller !== c.you) return false;
          const tipos = printedChars(o.copyOf?.def ?? o.def, o.copyOf?.face ?? o.face ?? 0, o.owner).types;
          return tipos.includes('Instant') || tipos.includes('Sorcery');
        },
        mods: () => [{ k: 'addKeyword', kw: SPLIT_SECOND }],
        text: 'As mágicas instantâneas e de feitiço que você controla têm segundo dividido (enquanto uma mágica com segundo dividido estiver na pilha, os jogadores não podem conjurar mágicas nem ativar habilidades que não sejam de mana).',
      }),
    ],
  }],
  rulings: {
    1: 'teste: com a mágica com segundo dividido na pilha, o oponente só tem habilidades de mana e passar',
    2: 'teste: gatilhos disparam e vão para a pilha normalmente',
    3: 'regra geral: CR 702.61a — não dá para conjurar durante a resolução de um gatilho (motor/stack.ts castSpell, testes/regras-controle.test.ts)',
    4: 'teste: o que já estava na pilha continua lá e resolve normalmente',
    5: 'teste: depois que a mágica sai da pilha, todos podem conjurar de novo antes do próximo objeto resolver',
  },
});

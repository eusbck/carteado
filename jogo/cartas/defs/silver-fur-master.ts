// Silver-Fur Master
// Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from
// your hand tapped and attacking.)
// Ninjutsu abilities you activate cost {1} less to activate.
// Other Ninja and Rogue creatures you control get +1/+1.
import { and, anthem, defineCard, is, ninjutsu, or, staticAbility } from '../../motor/api.ts';
import { NINJUTSU } from '../ninjas.ts';

export default defineCard({
  name: 'Silver-Fur Master',
  faces: [{
    abilities: [
      ninjutsu('{U}{B}'),
      // CR 601.2f, 602.2b: reduz só a parte genérica do custo total (ninjutsu e ninjutsu de comandante)
      staticAbility({
        rules: {
          abilityCostModifier: (c, jogador, _fonte, def) => (jogador === c.you && (def.kw === 'ninjutsu' || def.kw === 'commander ninjutsu') ? { reduce: 1 } : null),
        },
        text: 'As habilidades de ninjutsu que você ativa custam {1} a menos para ativar.',
      }),
      anthem(and(is.creature, is.yours, is.other, or(is.subtype('Ninja'), is.subtype('Rogue'))), () => [{ k: 'pt', p: 1, t: 1 }], 'As outras criaturas Ninja e Rogue que você controla recebem +1/+1.'),
    ],
  }],
  rulings: {
    1: NINJUTSU.depoisDosBloqueios,
    2: NINJUTSU.revela,
    3: NINJUTSU.mesmoJogador,
    4: NINJUTSU.naoDeclarada,
    5: NINJUTSU.etapas,
    6: NINJUTSU.primeiroGolpe,
    7: 'não se aplica: piada da carta (sem regra)',
  },
});

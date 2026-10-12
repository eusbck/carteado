// Convergence of Dominion
// Dynastic Command Node — As long as you control your commander, activated abilities of cards in your graveyard cost {2}
// less to activate. This effect can't reduce the mana in that ability's activation cost to less than one mana.
// Translocation Protocols — {3}, {T}: Mill three cards.
import { activated, defineCard, mill, staticAbility } from '../../motor/api.ts';
import { controlaComandante } from '../wakanda.ts';

export default defineCard({
  name: 'Convergence of Dominion',
  faces: [{
    abilities: [
      // ruling 1: só barateia; não dá permissão de ativar o que você não poderia ativar
      staticAbility({
        rules: {
          abilityCostModifier: (c, jogador, fonte) => {
            const o = c.g.state.objects[fonte];
            return jogador === c.you && !!o && o.zone === 'graveyard' && o.owner === c.you && controlaComandante(c.g, c.you) ? { reduce: 2, minMana: 1 } : null;
          },
        },
        text: 'Dynastic Command Node — Enquanto você controla o seu comandante, as habilidades ativadas das cartas no seu cemitério custam {2} a menos para ativar. Este efeito não pode reduzir a mana do custo de ativação a menos de uma mana.',
      }),
      activated('{3}, {T}', function* (c) { yield* mill(c.g, c.you, 3); }, { text: 'Translocation Protocols — {3}, {T}: Triture três cartas.' }),
    ],
  }],
  rulings: { 1: 'regra geral: CR 602.2 — só o custo muda; a carta precisa já ter uma habilidade que funcione no cemitério (motor/stack.ts totalAbilityCost)' },
});
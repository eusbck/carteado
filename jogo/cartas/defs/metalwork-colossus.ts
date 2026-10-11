// Metalwork Colossus
// This spell costs {X} less to cast, where X is the total mana value of noncreature artifacts you control.
// Sacrifice two artifacts: Return this card from your graveyard to your hand.
import { activated, defineCard, isCreature, manaValue, moveObjects } from '../../motor/api.ts';
import { artefatosDe } from '../wakanda.ts';

export default defineCard({
  name: 'Metalwork Colossus',
  faces: [{
    // rulings 1-4: o custo é fechado antes de pagar; o X das permanentes conta 0; com 11 ou mais, custa {0}
    selfCost: (c) => ({ reduce: artefatosDe(c.g, c.you).filter((id) => !isCreature(c.g, id)).reduce((n, id) => n + manaValue(c.g, id), 0) }),
    abilities: [
      // ruling 5: só do cemitério
      activated([{ k: 'sacrifice', n: 2, filter: (c, id) => c.g.state.objects[id] !== undefined && artefatosDe(c.g, c.you).includes(id), label: 'dois artefatos' }], function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'graveyard') yield* moveObjects(c.g, [{ id: c.source, to: 'hand' }], 'effect');
      }, { zones: ['graveyard'], text: 'Sacrifique dois artefatos: Devolva esta carta do seu cemitério para a sua mão.' }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 107.3g — fora da pilha, o X do custo de mana conta 0 (motor/chars.ts)',
    2: 'regra geral: CR 601.2f — o custo total é fechado antes do pagamento (motor/stack.ts totalSpellCost)',
    3: 'teste: custa {X} a menos, X igual ao valor de mana total dos seus artefatos que não são criaturas',
    4: 'regra geral: CR 601.2f — ninguém age entre anunciar a mágica e fechar o custo (motor/stack.ts)',
    5: 'teste: do cemitério, sacrificando dois artefatos, volta para a mão',
  },
});
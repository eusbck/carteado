// Omnath, Locus of the Void
// Omnath gets +1/+1 for each unspent mana you have.
// If you would lose unspent mana, that mana becomes colorless instead.
// Landfall — Whenever a land you control enters, add {C}{C}.
import { addMana, defineCard, on, selfGets, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Omnath, Locus of the Void',
  faces: [{
    abilities: [
      selfGets((c) => {
        const n = c.g.state.players[c.you].manaPool.length;
        return [{ k: 'pt', p: n, t: n }];
      }, 'Omnath recebe +1/+1 para cada mana não gasta que você tem.'),
      // substituição sobre o esvaziamento da reserva (CR 106.4, 500.5): no motor, loseUnspentMana nas etapas e fases
      staticAbility({
        rules: { unspentManaBecomesColorless: (c, p) => p === c.you },
        text: 'Se você fosse perder mana não gasta, essa mana se torna incolor em vez disso.',
      }),
      // não é habilidade de mana (CR 605.1b: não dispara de uma habilidade de mana), então usa a pilha
      triggered(on.landfall(), function* (c) {
        addMana(c.g, c.you, ['C', 'C'], { source: c.source });
      }, { text: 'Queda de terreno — Sempre que um terreno que você controla entra, adicione {C}{C}.' }),
    ],
  }],
  rulings: {
    1: 'teste: a mana fica, incolor, de uma etapa para outra e de um turno para outro; sem Omnath, se perde no fim da etapa',
    2: 'teste: a mana que vira incolor mantém a restrição de uso',
  },
});

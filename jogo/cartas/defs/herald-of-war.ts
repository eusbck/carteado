// Herald of War
// Flying
// Whenever this creature attacks, put a +1/+1 counter on it.
// Angel spells and Human spells you cast cost {1} less to cast for each +1/+1 counter on this creature.
import { addCounters, defineCard, keyword, on, staticAbility, triggered } from '../../motor/api.ts';

export default defineCard({
  name: 'Herald of War',
  faces: [{
    abilities: [
      keyword('flying'),
      // ruling 1: o marcador entra antes dos bloqueios e do dano
      triggered(on.selfAttacks(), function* (c) {
        if (c.g.state.objects[c.source]?.zone === 'battlefield') addCounters(c.g, { kind: 'obj', id: c.source }, '+1/+1', 1, c.you);
      }, { text: 'Sempre que esta criatura ataca, coloque um marcador +1/+1 nela.' }),
      // rulings 2-5: todos os marcadores +1/+1 dela; uma mágica que é Angel e Human reduz uma vez só; só o genérico
      staticAbility({
        rules: {
          costModifier: (c, sp) => {
            if (sp.controller !== c.you || !sp.chars.types.includes('Creature') || !sp.chars.subtypes.some((s) => s === 'Angel' || s === 'Human')) return null;
            const n = c.g.state.objects[c.source]?.counters['+1/+1'] ?? 0;
            return n > 0 ? { reduce: n } : null;
          },
        },
        text: 'As mágicas de Angel e de Human que você conjura custam {1} a menos para cada marcador +1/+1 nesta criatura.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: ao atacar, recebe um marcador +1/+1 antes dos bloqueios',
    2: 'teste: conta todos os marcadores +1/+1 dela, não só os do ataque',
    3: 'regra geral: CR 601.2f — aumentos antes das reduções (motor/stack.ts totalSpellCost)',
    4: 'regra geral: CR 601.2f — uma mágica que é Angel e Human tem a redução uma vez só (o gancho devolve um valor por mágica)',
    5: 'regra geral: CR 601.2f — muda só o custo total, não o valor de mana (motor/stack.ts totalSpellCost)',
  },
});

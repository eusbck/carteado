// Dawnhand Dissident
// {T}, Blight 1: Surveil 1.
// {T}, Blight 2: Exile target card from a graveyard.
// During your turn, you may cast creature spells from among cards you own exiled with this creature by removing three
// counters from among creatures you control in addition to paying their other costs.
import { activated, defineCard, exile, isCreature, lookAndArrange, staticAbility, t, tgt } from '../../motor/api.ts';

const CHAVE = 'dissidente';

export default defineCard({
  name: 'Dawnhand Dissident',
  faces: [{
    abilities: [
      // rulings 2, 4-8: blight é custo; todos os marcadores numa só criatura
      activated('{T}, Blight 1', function* (c) { yield* lookAndArrange(c.g, c.you, 1, 'surveil'); }, { text: '{T}, Blight 1: Vigie 1.' }),
      activated('{T}, Blight 2', function* (c) {
        const id = tgt(c);
        if (id !== null) yield* exile(c.g, [id], { linkTo: { obj: c.source, key: CHAVE } });
      }, { targets: [t.card('graveyard', undefined, 'carta alvo num cemitério', 'any')], text: '{T}, Blight 2: Exile a carta alvo de um cemitério.' }),
      // rulings 1, 3: precisa controlar a Dissident ao começar a conjurar; custos e tempo normais
      staticAbility({
        rules: {
          mayPlayFrom: (c, p, carta) => {
            const s = c.g.state;
            const eu = s.objects[c.source];
            if (!eu || p !== c.you || s.turn.active !== c.you) return null;
            const o = s.objects[carta];
            if (!o || o.zone !== 'exile' || o.owner !== c.you || !(eu.linked[CHAVE] ?? []).includes(carta) || !isCreature(c.g, carta)) return null;
            return { key: `dissidente:${c.source}`, label: 'Dawnhand Dissident (remova três marcadores)', parts: [{ k: 'removeCountersAmong', n: 3 }] };
          },
        },
        text: 'Durante o seu turno, você pode conjurar mágicas de criatura dentre as cartas suas exiladas com esta criatura removendo três marcadores de criaturas que você controla, além de pagar os outros custos.',
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 601.2 — basta controlá-la ao começar a conjurar',
    2: 'regra geral: CR 701.68 — todos os marcadores numa só criatura',
    3: 'teste: paga o custo de mana normal e remove três marcadores',
    4: 'regra geral: CR 704.5q — marcadores vistos ao morrer',
    5: 'regra geral: CR 601.2h — ninguém age no meio do pagamento',
    6: 'regra geral: CR 704.5q — +1/+1 e -1/-1 se anulam',
    7: 'regra geral: CR 701.68 — a criatura não precisa sobreviver',
    8: 'regra geral: CR 701.68 — sem criatura, não dá para fazer blight',
  },
});

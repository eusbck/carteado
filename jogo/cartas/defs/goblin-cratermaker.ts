// Goblin Cratermaker
// {1}, Sacrifice this creature: Choose one —
// • This creature deals 2 damage to target creature.
// • Destroy target colorless nonland permanent.
import { activated, chars, dealDamage, defineCard, destroy, modal, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Goblin Cratermaker',
  faces: [{
    abilities: [
      activated('{1}, Sacrifice this creature', function* () { /* os modos fazem tudo */ }, {
        modes: modal(1, 1, [
          {
            text: 'Esta criatura causa 2 de dano à criatura alvo', targets: [t.creature()],
            // a fonte do dano é ela mesma, pela última informação (já foi sacrificada)
            *effect(c) { const id = tgt(c); if (id !== null) dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 2, combat: false }]); },
          },
          {
            text: 'Destrua o permanente não terreno incolor alvo', targets: [t.nonlandPermanent((c, id) => chars(c.g, id).colors.length === 0, 'permanente não terreno incolor alvo')],
            *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); },
          },
        ]),
        text: '{1}, Sacrifique esta criatura: Escolha um — Esta criatura causa 2 de dano à criatura alvo; ou destrua o permanente não terreno incolor alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: a nota oficial é só o crédito da prévia da carta',
  },
});

// Dimension X Pizzasaur
// When this creature enters, put two +1/+1 counters on target creature. When you do, destroy up to one target creature
// with mana value less than or equal to the number of counters among permanents you control.
// {2}, {T}, Sacrifice this creature: You gain 3 life and each opponent loses 3 life.
import { activated, addCounters, controllerOf, defineAbility, defineCard, destroy, etb, gainLife, loseLife, manaValue, reflexive, t, tgt, triggered, upTo } from '../../motor/api.ts';
import type { G } from '../../motor/game-context.ts';
import { COMIDA } from '../tartarugas.ts';

function marcadoresSeus(g: G, p: number): number {
  let n = 0;
  for (const id of g.state.zones.battlefield) if (controllerOf(g, id) === p) for (const v of Object.values(g.state.objects[id].counters)) n += Math.max(0, v);
  return n;
}

// ruling 1: o segundo alvo só é escolhido quando a habilidade reflexiva vai para a pilha (CR 603.12)
const DESTROI = defineAbility('Dimension X Pizzasaur:destroi', triggered({ kind: 'event', match: () => false }, function* (c) {
  const id = tgt(c);
  if (id !== null) yield* destroy(c.g, [id]);
}, {
  targets: [upTo(1, t.creature((c, id) => manaValue(c.g, id) <= marcadoresSeus(c.g, c.you), 'criatura alvo com valor de mana até o número de marcadores nas suas permanentes'))],
  text: 'Quando você fizer isso, destrua até uma criatura alvo com valor de mana menor ou igual ao número de marcadores entre as permanentes que você controla.',
}));

export default defineCard({
  name: 'Dimension X Pizzasaur',
  faces: [{
    abilities: [
      etb(function* (c) {
        const id = tgt(c);
        if (id !== null && addCounters(c.g, { kind: 'obj', id }, '+1/+1', 2, c.you) > 0) reflexive(c, DESTROI.id!);
      }, { targets: [t.creature()], text: 'Quando esta criatura entra, coloque dois marcadores +1/+1 na criatura alvo. Quando você fizer isso, destrua até uma criatura alvo com valor de mana menor ou igual ao número de marcadores entre as permanentes que você controla.' }),
      activated('{2}, {T}, Sacrifice this creature', function* (c) {
        gainLife(c.g, c.you, 3, c.source);
        for (const p of c.g.apnap()) if (c.g.isOpponent(c.you, p)) loseLife(c.g, p, 3, c.source);
      }, { text: '{2}, {T}, Sacrifique esta criatura: Você ganha 3 pontos de vida e cada oponente perde 3 pontos de vida.' }),
    ],
  }],
  rulings: {
    1: 'teste: ao entrar põe dois marcadores na criatura alvo e, ao fazer isso, destrói até uma criatura de valor de mana baixo',
    2: COMIDA.qualquer,
    3: COMIDA.tipo,
    4: COMIDA.alvos,
    5: COMIDA.naoComa,
  },
});
// Shellshock
// For each opponent, choose up to one target creature that player controls. Shellshock deals X damage to each of those
// creatures. You create a Mutagen token for each creature dealt damage this way. (They're artifacts with "{1}, {T},
// Sacrifice this token: Put a +1/+1 counter on target creature. Activate only as a sorcery.")
import { controllerOf, createTokens, dealDamage, defineCard, is, t, upTo } from '../../motor/api.ts';
import { MUTAGEN } from '../tartarugas.ts';

export default defineCard({
  name: 'Shellshock',
  faces: [{
    spell: {
      // até uma criatura de cada oponente: no máximo três oponentes numa mesa de quatro
      targets: [{
        ...upTo(3, t.creature(is.opponents, 'criatura alvo de cada oponente (até uma por oponente)')),
        validateSet: (c, alvos) => {
          const donos = alvos.map((r) => (r.kind === 'obj' ? controllerOf(c.g, r.id) : -1));
          return new Set(donos).size === donos.length;
        },
      }],
      *effect(c) {
        let feridas = 0;
        for (const r of c.targets[0] ?? []) {
          if (!r || r.kind !== 'obj' || c.g.state.objects[r.id]?.zone !== 'battlefield') continue;
          const antes = c.g.state.objects[r.id].damage;
          dealDamage(c.g, [{ source: c.source, target: r, amount: c.x, combat: false }]);
          // só conta a criatura que realmente recebeu dano (o dano prevenido não cria ficha)
          if ((c.g.state.objects[r.id]?.damage ?? 0) > antes) feridas++;
        }
        if (feridas > 0) yield* createTokens(c.g, c.you, 'Mutagen', feridas);
      },
    },
  }],
  rulings: {
    1: MUTAGEN.predefinida,
    2: MUTAGEN.alvos,
  },
});
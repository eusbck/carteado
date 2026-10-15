// Cramped Vents // Access Maze (Sala: carta dividida com linha de tipo compartilhada, CR 709.5)
// Cramped Vents {3}{B} — Enchantment — Room
// When you unlock this door, this Room deals 6 damage to target creature an opponent controls. You gain life equal to
// the excess damage dealt this way.
// Access Maze {5}{B}{B} — Enchantment — Room
// Once during each of your turns, you may cast a spell from your hand by paying life equal to its mana value rather
// than paying its mana cost.
// (You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked
// door to unlock it.)
import { controllerOf, dealDamage, defineCard, gainLife, hasKw, t, tgt, toughness, triggered } from '../../motor/api.ts';
import { aoDestrancar, SALA, vidaEmVezDeMana } from '../milagres.ts';

export default defineCard({
  name: 'Cramped Vents // Access Maze',
  faces: [
    {
      abilities: [
        triggered(aoDestrancar(0), function* (c) {
          const id = tgt(c);
          if (id === null) return;
          // rulings 1-2: o excedente é o que passa do dano letal (resistência menos o dano marcado; com toque mortífero, 1)
          const base = Math.max(0, toughness(c.g, id) - (c.g.state.objects[id].damage ?? 0));
          const letal = c.g.state.objects[c.source] && hasKw(c.g, c.source, 'deathtouch') ? Math.min(1, base) : base;
          const [r] = dealDamage(c.g, [{ source: c.source, target: { kind: 'obj', id }, amount: 6, combat: false }]);
          const excedente = Math.max(0, (r?.dealt ?? 0) - letal);
          if (excedente > 0) gainLife(c.g, c.you, excedente, c.source);
        }, {
          targets: [t.creature((c, id) => c.g.isOpponent(c.you, controllerOf(c.g, id)), 'criatura alvo que um oponente controla')],
          text: 'Quando você destrancar esta porta, esta Sala causa 6 pontos de dano à criatura alvo que um oponente controla. Você ganha vida igual ao dano excedente causado assim.',
        }),
      ],
    },
    {
      abilities: [
        vidaEmVezDeMana('Access Maze:vida', 'Uma vez durante cada um dos seus turnos, você pode conjurar uma mágica da sua mão pagando vida igual ao valor de mana dela em vez de pagar o custo de mana.'),
      ],
    },
  ],
  rulings: {
    1: 'teste: Cramped Vents: 6 de dano numa criatura 2/10 com 7 marcados ganha 3 de vida',
    2: 'regra geral: CR 702.2c — com toque mortífero, 1 de dano já é letal (calculado no efeito)',
    3: 'regra geral: a permissão de Access Maze só troca o custo; o tempo da mágica continua (motor/priority.ts canStartCast)',
    4: 'teste: Access Maze: uma vez por turno, conjura da mão pagando vida igual ao valor de mana',
    5: SALA.conjurarUmaPorta,
    6: SALA.portaNaoConjurada,
    7: SALA.cartaSo,
    8: SALA.doisNomes,
    9: SALA.caracteristicasDaPorta,
    10: SALA.foraDaPilha,
    11: SALA.noCampo,
    12: SALA.copia,
    13: SALA.vindaDeFora,
    14: SALA.semPorta,
    15: SALA.destrancar,
    16: 'teste: Cramped Vents: 6 de dano numa criatura 2/10 com 7 marcados ganha 3 de vida',
    17: SALA.mandaDestrancar,
    18: SALA.mandaTrancar,
    19: SALA.semAlvo,
    20: SALA.totalmente,
  },
});

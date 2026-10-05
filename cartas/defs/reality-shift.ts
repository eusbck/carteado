// Reality Shift
// Exile target creature. Its controller manifests the top card of their library. (That player puts the top card of their
// library onto the battlefield face down as a 2/2 creature. If it's a creature card, it can be turned face up any time
// for its mana cost.)
import { controllerOf, defineCard, exile, manifest, t, tgt } from '../../motor/api.ts';

export default defineCard({
  name: 'Reality Shift',
  faces: [{
    spell: {
      targets: [t.creature()],
      *effect(c) {
        const id = tgt(c);
        if (id === null) return;
        const quem = controllerOf(c.g, id);
        yield* exile(c.g, [id]);
        // rulings 1-13: manifestar (CR 701.40) — 2/2 sem nome, tipo de criatura nem habilidades; vira para cima pelo custo se for criatura
        yield* manifest(c.g, quem);
      },
    },
  }],
  rulings: {
    1: 'teste: a manifestada é uma criatura 2/2 incolor sem nome',
    2: 'regra geral: CR 701.40b — dupla face entra virada para baixo e vira pela frente',
    3: 'regra geral: CR 701.40a — vira para cima mesmo sem habilidades',
    4: 'regra geral: CR 708.6 — a ordem de entrada fica visível na mesa',
    5: 'regra geral: CR 708.8 — virar não muda se está virada (de lado)',
    6: 'teste: carta de criatura vira para cima pagando o custo de mana (ação especial)',
    7: 'regra geral: CR 708.8 — é o mesmo permanente; alvos e anexos continuam',
    8: 'regra geral: CR 708.2 — sem nome',
    9: 'não se aplica: nenhuma carta com metamorfose nos decks',
    10: 'regra geral: CR 701.40a — instantânea ou feitiço não vira para cima',
    11: 'regra geral: CR 708.9 — revela ao sair do campo (motor/view.ts)',
    12: 'regra geral: CR 708.5 — só o controlador vê (motor/view.ts)',
    13: 'teste: virar para cima não dispara "ao entrar"',
  },
});

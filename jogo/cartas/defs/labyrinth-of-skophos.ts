// Labyrinth of Skophos
// {T}: Add {C}.
// {4}, {T}: Remove target attacking or blocking creature from combat.
import { activated, defineCard, isAttacking, mana, t, tgt } from '../../motor/api.ts';
import { removeFromCombat } from '../../motor/actions.ts';

export default defineCard({
  name: 'Labyrinth of Skophos',
  faces: [{
    abilities: [
      mana('C'),
      activated('{4}, {T}', function* (c) {
        const id = tgt(c);
        // CR 506.4: sai do combate; continua virada ou desvirada como estava (ruling 1)
        if (id !== null) { removeFromCombat(c.g, id); c.g.bump(); }
      }, {
        targets: [t.creature((c, id) => isAttacking(c.g, id) || !!c.g.state.combat?.blockers.some((b) => b.id === id), 'criatura atacante ou bloqueadora alvo')],
        text: '{4}, {T}: Remova do combate a criatura atacante ou bloqueadora alvo.',
      }),
    ],
  }],
  rulings: {
    1: 'teste: {4}, {T}: tira do combate a criatura atacante, que continua virada e não causa dano',
    2: 'teste: tirar o bloqueador do combate: a atacante continua bloqueada e não causa dano',
    3: 'regra geral: CR 506.4 — a criatura só sai do combate removida por um efeito (motor/actions.ts removeFromCombat)',
  },
});

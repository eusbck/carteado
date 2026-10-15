import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const SL = 'Soaring Lightbringer';

describe(SL, () => {
  it('as outras criaturas encantamento que você controla têm voar', () => {
    const tg = setup({ battlefield: [[SL, 'Archetype of Imagination', 'Wall of Omens'], ['Demon of Fate\'s Design']] });
    expect(hasKw(tg.g, tg.bf(SL), 'flying')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Archetype of Imagination'), 'flying')).toBe(true);
  });

  it('atacando dois jogadores, cria uma ficha atacando cada um', () => {
    const tg = setup({ players: 3, step: 'beginCombat', battlefield: [[SL, 'Indomitable Ancients'], [], []], library: [['Island'], ['Island'], ['Island']] });
    tg.attack([[SL, 1], ['Indomitable Ancients', 2]]).passTo('declareAttackers');
    tg.resolveAll();
    const fichas = tg.all('Glimmer');
    expect(fichas).toHaveLength(2);
    expect(fichas.every((id) => tg.state.objects[id].tapped)).toBe(true);
    const alvos = tg.state.combat!.attackers.filter((a) => fichas.includes(a.id)).map((a) => (a.target.kind === 'player' ? a.target.id : -1)).sort();
    expect(alvos).toEqual([1, 2]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40 - 4 - 1);
    expect(tg.life(2)).toBe(40 - 2 - 1);
  });
});

import { describe, expect, it } from 'vitest';
import { enterCard, fixture } from '../../testes/artefatos.ts';

const N = 'Pugnacious Hammerskull';

describe(N, () => {
  it('atacando sem outro Dinosaur, recebe um marcador de atordoamento, mesmo que um Dinosaur entre antes de resolver', () => {
    const tg = fixture({ battlefield: [[N], []] });
    tg.attack([[N, 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length === 1);
    expect(tg.state.zones.stack).toHaveLength(1);
    enterCard(tg, 'Ripjaw Raptor', 0);
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.stun).toBe(1);
  });

  it('com outro Dinosaur, não recebe', () => {
    const tg = fixture({ battlefield: [[N, 'Ripjaw Raptor'], []] });
    tg.attack([[N, 1]]).passTo('combatDamage');
    expect(tg.state.objects[tg.bf(N)].counters.stun ?? 0).toBe(0);
  });
});

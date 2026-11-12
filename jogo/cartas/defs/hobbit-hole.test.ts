import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hobbit Hole';

describe(N, () => {
  it('sacrifica e busca um terreno básico virado', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Island'], []] });
    tg.choose('terreno básico', ['Island']).activate(N).resolve();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
  it('ciclagem de Halfling {4}: acha uma carta com polimorfo', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Island', 'Irregular Cohort'], []] });
    tg.choose('Halfling', ['Irregular Cohort']).activate(N).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Irregular Cohort']);
  });
});

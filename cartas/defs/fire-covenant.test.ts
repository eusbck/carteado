import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Fire Covenant', () => {
  it('paga X de vida e divide X de dano; pelo menos 1 de dano por alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Mountain', 'Swamp'], ['Elvish Mystic', 'Wall of Omens']], hand: [['Fire Covenant'], []] });
    let minimo = -1;
    tg.number('valor de X', 5).choose('criaturas alvo do dano dividido', ['Elvish Mystic', 'Wall of Omens']);
    tg.script.push((d) => (d.kind === 'number' && d.prompt.includes('quanto para') ? (minimo = d.min, { kind: 'number', value: 1 }) : null));
    tg.cast('Fire Covenant');
    expect(tg.life(0)).toBe(35);
    tg.resolve();
    expect(minimo).toBe(1);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});

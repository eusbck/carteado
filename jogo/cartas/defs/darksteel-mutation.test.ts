import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';

describe('Darksteel Mutation', () => {
  it('só artefato e criatura, só Insect; troca a força e resistência impressas; marcadores continuam valendo; continua lendária; perde as habilidades; as cores continuam', () => {
    const tg = setup({ battlefield: [[], [{ name: 'Zetalpa, Primal Dawn', counters: { '+1/+1': 1 } }, { name: 'Darksteel Mutation', attachTo: 'Zetalpa, Primal Dawn' }]] });
    const z = tg.bf('Zetalpa, Primal Dawn');
    const c = chars(tg.g, z);
    expect(c.types.sort()).toEqual(['Artifact', 'Creature']);
    expect(c.subtypes).toEqual(['Insect']);
    expect(c.supertypes).toContain('Legendary');
    expect(c.colors).toEqual(['W']);
    expect(tg.pt(z)).toEqual([1, 2]);
    expect(hasKw(tg.g, z, 'indestructible')).toBe(true);
    expect(hasKw(tg.g, z, 'flying')).toBe(false);
    expect(hasKw(tg.g, z, 'double strike')).toBe(false);
  });
});

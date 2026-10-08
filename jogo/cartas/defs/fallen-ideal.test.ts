import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';
import { destroy } from '../../motor/api.ts';

describe('Fallen Ideal', () => {
  it('quem ativa é o controlador da criatura; voar; volta à mão ao ir para o cemitério', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: 'Fallen Ideal', attachTo: 'Indomitable Ancients' }], ['Indomitable Ancients', 'Elvish Mystic']] });
    const anc = tg.bf('Indomitable Ancients');
    expect(hasKw(tg.g, anc, 'flying')).toBe(true);
    tg.choose('Sacrifique', ['Elvish Mystic']).activate('Indomitable Ancients').resolve();
    expect(tg.pt(anc)).toEqual([4, 11]);
    tg.run(destroy(tg.g, [anc]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Fallen Ideal']);
  });
});

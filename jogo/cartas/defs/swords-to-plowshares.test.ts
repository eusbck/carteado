import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Swords to Plowshares', () => {
  it('exila a criatura e o controlador dela ganha vida igual à força', () => {
    const tg = setup({ battlefield: [['Plains'], ['Zetalpa, Primal Dawn']], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).cast('Swords to Plowshares').resolve();
    expect(tg.names(1, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.life(1)).toBe(44);
  });
  it('usa a força da criatura como estava no campo (marcadores contam)', () => {
    const tg = setup({ battlefield: [['Plains'], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 3 } }]], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares').resolve();
    expect(tg.life(1)).toBe(45);
  });
});

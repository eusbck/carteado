import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Gristle Glutton', () => {
  it('descarta e compra; pode fazer blight na própria criatura', () => {
    const tg = setup({ battlefield: [['Gristle Glutton'], []], hand: [['Plains'], []], library: [['Island'], []] });
    tg.choose('blight 1', ['Gristle Glutton']).choose('escarte', ['Plains']);
    tg.activate('Gristle Glutton').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.pt(tg.bf('Gristle Glutton'))).toEqual([0, 2]);
  });
  it('sem carta para descartar, não compra', () => {
    const tg = setup({ battlefield: [['Gristle Glutton'], []], library: [['Island'], []] });
    tg.choose('blight 1', ['Gristle Glutton']);
    tg.activate('Gristle Glutton').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});

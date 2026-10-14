import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Fateful Absence';

describe(N, () => {
  it('destrói a criatura alvo e o controlador dela investiga', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Baleful Strix']], hand: [[N], []] });
    tg.choose('criatura ou planeswalker alvo', ['Baleful Strix']).cast(N).resolveAll();
    expect(tg.find('Baleful Strix')).toBeNull();
    const pista = tg.bf('Clue');
    expect(controllerOf(tg.g, pista)).toBe(1);
  });
});

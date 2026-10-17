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

  it('alvo indestrutível não é destruído, mas o controlador dele investiga mesmo assim', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Toski, Bearer of Secrets']], hand: [[N], []] });
    tg.choose('criatura ou planeswalker alvo', ['Toski, Bearer of Secrets']).cast(N).resolveAll();
    expect(tg.find('Toski, Bearer of Secrets')).not.toBeNull();
    expect(controllerOf(tg.g, tg.bf('Clue'))).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

void hasKw; void isCreature;
const C = "Krosan Grip";

describe(C, () => {
  it('destrói um artefato', () => {
    const tg = setup({ battlefield: [[...Array(3).fill('Forest')], ['Sol Ring']], hand: [[C], []] });
    tg.choose('artefato ou encantamento', ['Sol Ring']).cast(C).resolve();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});

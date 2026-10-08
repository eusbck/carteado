import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Putrefy', () => {
  it('destrói artefato ou criatura alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest', 'Sol Ring'], ['Millikin']], hand: [['Putrefy'], []] });
    tg.choose('artefato ou criatura', ['Millikin']).cast('Putrefy').resolve();
    expect(tg.find('Millikin')).toBeNull();
  });
});

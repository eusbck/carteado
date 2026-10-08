import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Selesnya Signet', () => {
  it('{1}, {T}: adiciona {G}{W}', () => {
    const tg = setup({ battlefield: [['Selesnya Signet', 'Swamp', 'Swamp'], []], hand: [['Faeburrow Elder'], []] });
    tg.cast('Faeburrow Elder').resolve();
    expect(tg.find('Faeburrow Elder')).not.toBeNull();
  });
});

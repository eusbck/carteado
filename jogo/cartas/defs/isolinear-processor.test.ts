import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Isolinear Processor', () => {
  it('compra e descarta', () => {
    const tg = setup({ battlefield: [['Isolinear Processor', 'Island', 'Island'], []], hand: [['Forest'], []], library: [['Opt'], []] });
    tg.choose('descarte', ['Forest']).activate('Isolinear Processor', 'Compre').resolve();
    expect(tg.names(0, 'graveyard')).toContain('Forest');
    expect(tg.names(0, 'hand')).toContain('Opt');
  });
});

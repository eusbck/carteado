import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = 'Open the Armory';

describe(C, () => {
  it('busca um Equipamento e põe na mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[C], []], library: [['Basilisk Collar', 'Elvish Mystic'], []] });
    tg.choose('Procure', ['Basilisk Collar']);
    tg.cast(C).resolve();
    expect(tg.names(0, 'hand')).toContain('Basilisk Collar');
  });
});

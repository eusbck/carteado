import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Icetill Explorer';

describe(N, () => {
  it('com Exploration, você joga três terrenos no turno, inclusive do cemitério; cada um moi uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Exploration'], []], hand: [['Forest'], []], graveyard: [['Mountain', 'Swamp'], []], library: [['Island', 'Plains', 'Island', 'Plains'], []] });
    tg.play('Forest').resolve();
    tg.play('Mountain').resolve();
    tg.play('Swamp').resolve();
    expect(tg.find('Swamp')).not.toBeNull();
    expect(tg.names(0, 'library').length).toBe(1);
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
});

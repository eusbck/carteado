import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Tragic Arrogance', () => {
  it('você escolhe para cada jogador; uma criatura artefato pode ser o artefato e a criatura ao mesmo tempo', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Plains'), 'Wall of Omens', 'Elvish Mystic'], ['The Reaper, King No More', 'Gau, Feral Youth', 'Sol Ring', 'Ghostly Prison', 'Forest']],
      hand: [['Tragic Arrogance'], []],
    });
    tg.choose('uma criatura de Ana', ['Wall of Omens']);
    tg.choose('um artefato de Bruno', ['The Reaper, King No More']).choose('uma criatura de Bruno', ['The Reaper, King No More']);
    tg.cast('Tragic Arrogance').resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('The Reaper, King No More')).not.toBeNull();
    expect(tg.find('Ghostly Prison')).not.toBeNull();
    expect(tg.find('Gau, Feral Youth')).toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Forest')).not.toBeNull();
  });
});

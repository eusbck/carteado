import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe("Archon of Sun's Grace", () => {
  it('encantamento criatura também dispara a constelação; Pegasus têm vínculo com a vida', () => {
    const tg = setup({ battlefield: [["Archon of Sun's Grace", 'Plains', 'Plains'], [{ name: 'Pegasus', token: true }]], hand: [['Nyx-Fleece Ram'], []] });
    tg.cast('Nyx-Fleece Ram').resolve().resolve();
    const meus = tg.all('Pegasus').filter((id) => tg.state.objects[id].controller === 0);
    expect(meus.length).toBe(1);
    expect(hasKw(tg.g, meus[0], 'lifelink')).toBe(true);
    expect(hasKw(tg.g, meus[0], 'flying')).toBe(true);
    const deBruno = tg.all('Pegasus').find((id) => tg.state.objects[id].controller === 1)!;
    expect(hasKw(tg.g, deBruno, 'lifelink')).toBe(false);
  });
});

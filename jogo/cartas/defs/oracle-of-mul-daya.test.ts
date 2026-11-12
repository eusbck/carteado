import { describe, expect, it } from 'vitest';
import { buildView } from '../../motor/view.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Oracle of Mul Daya';

describe(N, () => {
  it('com duas Oracle of Mul Daya, você joga três terrenos no turno', () => {
    const tg = setup({ battlefield: [[N, N], []], hand: [['Forest'], []], library: [['Mountain', 'Swamp', 'Island'], []] });
    tg.play('Forest').play('Mountain').play('Swamp');
    expect(tg.find('Swamp')).not.toBeNull();
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
  it('jogando o terreno do topo, o novo topo pode ser jogado também', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Mountain', 'Swamp', 'Island'], []] });
    tg.play('Mountain').play('Swamp');
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });
  it('o topo fica revelado para os oponentes', () => {
    const tg = setup({ battlefield: [[N], []], library: [["Night's Whisper"], []] });
    const v = buildView(tg.g, 1, null) as unknown as { players: { topCard?: { name: string } }[] };
    expect(v.players[0].topCard?.name).toBe("Night's Whisper");
  });
});

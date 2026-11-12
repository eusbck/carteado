import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ND = "Night's Whisper";

describe('Unwind', () => {
  it('anula a mágica não criatura e desvira até três terrenos', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Island', 'Island', 'Island', 'Island']], hand: [[ND], ['Unwind']] });
    tg.cast(ND).pass();
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('desvirar') ? { kind: 'select', ids: d.items.filter((i) => i.label === 'Island').slice(0, 3).map((i) => i.id) } : null));
    tg.choose('não criatura', [ND]).cast('Unwind').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([ND]);
    const ilhas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island');
    expect(ilhas.filter((id) => !tg.state.objects[id].tapped).length).toBe(4);
  });
});

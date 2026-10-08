import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Lightning Greaves', () => {
  it('ímpeto e manto; com manto, não pode ser alvo nem para mover o equipamento de volta', () => {
    const tg = setup({ battlefield: [['Lightning Greaves', 'Wall of Omens', 'Elvish Mystic'], []] });
    tg.choose('alvo', ['Wall of Omens']).activate('Lightning Greaves').resolve();
    const w = tg.bf('Wall of Omens');
    expect(hasKw(tg.g, w, 'haste')).toBe(true);
    expect(hasKw(tg.g, w, 'shroud')).toBe(true);
    let alvos: number[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('alvo') ? (alvos = d.items.map((i) => i.obj!), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate('Lightning Greaves').resolve();
    expect(alvos).not.toContain(w);
    expect(tg.state.objects[tg.bf('Lightning Greaves')].attachedTo).toBe(tg.bf('Elvish Mystic'));
  });
});

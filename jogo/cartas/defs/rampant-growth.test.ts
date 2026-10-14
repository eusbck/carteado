import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Rampant Growth';

describe(N, () => {
  it('o terreno entra virado e não gasta a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N, 'Island'], []], library: [['Wall of Omens', 'Plains', 'Swamp'], []] });
    tg.choose('Procure uma carta de terreno básico', ['Plains']);
    tg.cast(N).resolve();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    expect(tg.names(0, 'library').sort()).toEqual(['Swamp', 'Wall of Omens']);
    tg.play('Island');
    expect(tg.find('Island')).not.toBeNull();
  });
  it('pode não achar a carta', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest'], []], hand: [[N], []], library: [['Plains'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Procure') ? { kind: 'select', ids: [] } : null));
    tg.cast(N).resolve();
    expect(tg.names(0, 'library')).toEqual(['Plains']);
  });
});

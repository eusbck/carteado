import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Growth Spiral';

describe(N, () => {
  it('compra uma carta e põe um terreno da mão no campo, mesmo já tendo jogado terreno no turno', () => {
    const tg = setup({ battlefield: [['Forest', 'Island'], []], hand: [[N, 'Swamp'], []], library: [['Plains'], []] });
    tg.play('Swamp');
    tg.choose('Growth Spiral', ['Plains']);
    tg.cast(N).resolveAll();
    expect(tg.find('Plains', 'battlefield')).not.toBeNull();
    expect(tg.state.zones.hand[0].length).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Essence Flux';

describe(NOME, () => {
  it('volta sem os marcadores, como um objeto novo', () => {
    const tg = setup({ battlefield: [['Island', { name: 'Wall of Omens', counters: { '+1/+1': 2 } }], []], hand: [[NOME], []], library: [['Island', 'Island'], []] });
    const antes = tg.bf('Wall of Omens');
    tg.choose('criatura alvo', ['Wall of Omens']).cast(NOME).resolveAll();
    const depois = tg.bf('Wall of Omens');
    expect(depois).not.toBe(antes);
    expect(tg.state.objects[depois].counters['+1/+1'] ?? 0).toBe(0);
  });

  it('um Espírito volta com um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Island', 'Simian Spirit Guide'], []], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Simian Spirit Guide']).cast(NOME).resolveAll();
    expect(tg.state.objects[tg.bf('Simian Spirit Guide')].counters['+1/+1']).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Cloudshift', () => {
  it('pisca a criatura: volta como objeto novo, sem dano', () => {
    const tg = setup({ battlefield: [['Plains', { name: 'Wall of Omens', damage: 3 }], []], hand: [['Cloudshift'], []], library: [['Opt', 'Opt'], []] });
    const antes = tg.bf('Wall of Omens');
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Cloudshift').resolve().resolveAll();
    const depois = tg.bf('Wall of Omens');
    expect(depois).not.toBe(antes);
    expect(tg.state.objects[depois].damage).toBe(0);
    expect(tg.names(0, 'hand')).toContain('Opt'); // o Wall of Omens comprou de novo
  });
});

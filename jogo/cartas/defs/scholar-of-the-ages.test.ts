import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Scholar of the Ages';

describe(NOME, () => {
  it('devolve até duas cartas de instantânea e/ou feitiço no total', () => {
    let max = 0;
    const tg = setup({ battlefield: [Array(7).fill('Island'), []], hand: [[NOME], []], graveyard: [['Dark Ritual', 'Gamble', 'Entomb', 'Wall of Omens'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('instantânea ou feitiço') ? ((max = d.max), { kind: 'select', ids: d.items.filter((i) => i.label === 'Dark Ritual' || i.label === 'Gamble').map((i) => i.id) }) : null));
    tg.cast(NOME).resolveAll();
    expect(max).toBe(2);
    expect(tg.names(0, 'hand').sort()).toEqual(['Dark Ritual', 'Gamble']);
  });
});

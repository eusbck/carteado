import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

describe('Nether Traitor', () => {
  it('duas criaturas ao mesmo tempo disparam duas vezes; volta só uma vez', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic', 'Wall of Omens'], []], graveyard: [['Nether Traitor'], []], library: [['Island'], []] });
    let perguntas = 0;
    const paga = (d: { kind: string; prompt?: string }) => (d.kind === 'select' && d.prompt?.includes('Nether Traitor') ? (perguntas++, { kind: 'select' as const, ids: ['yes'] }) : null);
    tg.script.push(paga, paga);
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic'), tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.find('Nether Traitor')).not.toBeNull();
    expect(perguntas).toBe(1); // o segundo gatilho não acha mais a carta no cemitério
  });
  it('morrendo junto com outra criatura, não dispara', () => {
    const tg = setup({ battlefield: [['Swamp', 'Nether Traitor', 'Elvish Mystic'], []] });
    tg.run(destroy(tg.g, [tg.bf('Nether Traitor'), tg.bf('Elvish Mystic')]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Elvish Mystic', 'Nether Traitor']);
    expect(tg.state.zones.stack.length).toBe(0);
  });
});

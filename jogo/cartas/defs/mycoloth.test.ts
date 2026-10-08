import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Mycoloth', () => {
  it('só devora criaturas que já estavam no campo, nunca a si mesma; Saprolings por marcador', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Elvish Mystic', 'Wall of Omens'], []], hand: [['Mycoloth'], []], library: [['Island', 'Island'], ['Island']] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Devorar 2') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: d.items.map((i) => i.id) }) : null));
    tg.cast('Mycoloth').resolve();
    expect(opcoes.sort()).toEqual(['Elvish Mystic', 'Wall of Omens']);
    const m = tg.bf('Mycoloth');
    expect(tg.state.objects[m].counters['+1/+1']).toBe(4);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep').resolve();
    expect(tg.all('Saproling').length).toBe(4);
  });
  it('pode não sacrificar nenhuma', () => {
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Elvish Mystic'], []], hand: [['Mycoloth'], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Devorar 2') ? { kind: 'select', ids: [] } : null));
    tg.cast('Mycoloth').resolve();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Mycoloth')].counters['+1/+1'] ?? 0).toBe(0);
  });
});

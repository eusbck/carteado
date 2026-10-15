import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Bloodthirsty Adversary';
const CONJURAR = 'escolha uma mágica para conjurar';

describe(N, () => {
  it('pagando duas vezes, ganha dois marcadores e conjura cópias das duas cartas exiladas', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Island', 'Island', 'Island', 'Island'], []],
      hand: [[N], []], graveyard: [['Opt', 'Serum Visions', "Baral's Expertise"], []], library: [Array(6).fill('Plains'), []],
    });
    let maxAlvos = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('valor de mana 3 ou menos')) return null;
      maxAlvos = d.max;
      // Baral's Expertise custa 5: não é alvo possível
      expect(d.items.map((i) => i.label).sort()).toEqual(['Opt', 'Serum Visions']);
      return { kind: 'select', ids: d.items.map((i) => i.id) };
    });
    tg.number('quantas vezes', 2);
    tg.choose(CONJURAR, ['Opt']).choose(CONJURAR, ['Serum Visions']);
    tg.cast(N).resolve();
    // o gatilho de entrar
    tg.resolve();
    // o gatilho reflexivo, com os alvos
    expect(maxAlvos).toBe(2);
    tg.resolve();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1']).toBe(2);
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(2);
    tg.resolveAll();
    expect(tg.names(0, 'exile').sort()).toEqual(['Opt', 'Serum Visions']);
    expect(tg.names(0, 'hand')).toHaveLength(2);
  });

  it('sem pagar, nada acontece', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt'], []] });
    tg.number('quantas vezes', 0);
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual(['Opt']);
  });
});

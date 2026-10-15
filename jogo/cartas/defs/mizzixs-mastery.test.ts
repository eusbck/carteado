import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Mizzix's Mastery";
const CONJURAR = 'escolha uma mágica para conjurar';

describe(N, () => {
  it('exila a carta alvo, conjura uma cópia dela de graça e a Mastery vai para o exílio', () => {
    const tg = setup({ battlefield: [['Mountain', 'Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt'], []], library: [['Plains', 'Swamp'], []] });
    tg.choose('carta de instantânea ou de feitiço alvo', ['Opt']).choose(CONJURAR, ['Opt']).cast(N).resolve();
    // a cópia da Opt está na pilha
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].isCopy)).toHaveLength(1);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'exile').sort()).toEqual([N, 'Opt'].sort());
    expect(tg.names(0, 'graveyard')).toEqual([]);
    // conjurar a cópia conta como mágica conjurada
    expect(tg.state.turnStats[0].spellsCast).toBe(2);
  });

  it('com sobrecarga, exila todas as instantâneas e feitiços do cemitério e conjura cópias de graça', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Mountain', 'Mountain', 'Island', 'Island', 'Island', 'Island', 'Island'], []],
      hand: [[N], []], graveyard: [['Opt', 'Serum Visions', 'Forest'], []], library: [['Plains', 'Swamp', 'Island', 'Island'], []],
    });
    tg.choose(CONJURAR, ['Serum Visions']).choose(CONJURAR, ['Opt']).cast(N, 'overload').resolve();
    // as duas cópias na pilha, a última conjurada em cima
    const pilha = tg.state.zones.stack.map((id) => tg.state.objects[id]);
    expect(pilha.filter((o) => o.isCopy).map((o) => o.copyOf?.def)).toEqual(['Serum Visions', 'Opt']);
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(2);
    expect(tg.names(0, 'exile').sort()).toEqual([N, 'Opt', 'Serum Visions'].sort());
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });

  it('a cópia que não for conjurada deixa de existir', () => {
    const tg = setup({ battlefield: [['Mountain', 'Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Opt'], []] });
    tg.choose('carta de instantânea ou de feitiço alvo', ['Opt']).choose(CONJURAR, ['Não conjurar']).cast(N).resolveAll();
    expect(tg.names(0, 'exile').sort()).toEqual([N, 'Opt'].sort());
    expect(tg.state.zones.exile.filter((id) => tg.state.objects[id].isCopy)).toEqual([]);
  });
});

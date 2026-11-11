import { describe, expect, it } from 'vitest';
import { copySpell } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Venser, Shaper Savant';
const ilhas = ['Island', 'Island', 'Island', 'Island'];

describe(N, () => {
  it('ao entrar, devolve o permanente alvo para a mão do dono', () => {
    const tg = setup({ battlefield: [ilhas, ['Sol Ring']], hand: [[N], []] });
    tg.choose('mágica ou permanente alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Sol Ring']);
  });
  it('devolve para a mão a mágica que não pode ser anulada', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Island', 'Chimil, the Inner Sun']], hand: [[N], ['Brainstorm']], library: [[], ['Forest', 'Forest', 'Forest']] });
    tg.cast('Brainstorm').pass().choose('mágica ou permanente alvo', ['Brainstorm']).cast(N).resolve().resolve();
    expect(tg.names(1, 'hand')).toEqual(['Brainstorm']);
    expect(tg.state.zones.stack).toHaveLength(0);
  });
  it('a mágica conjurada com retrospectiva vai para o exílio em vez da mão', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Island', 'Island']], hand: [[N], []], graveyard: [[], ['Deep Analysis']], library: [[], ['Forest', 'Forest']] });
    tg.cast('Deep Analysis', 'flashback').pass().choose('mágica ou permanente alvo', ['Deep Analysis']).cast(N).resolve().resolve();
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.names(1, 'exile')).toEqual(['Deep Analysis']);
  });
  it('a cópia de uma mágica devolvida deixa de existir', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, ['Island']], hand: [[N], ['Brainstorm']], library: [[], Array(6).fill('Forest')] });
    tg.cast('Brainstorm');
    const original = tg.find('Brainstorm', 'stack')!;
    tg.run(copySpell(tg.g, original, 1));
    const copia = tg.state.zones.stack.find((id) => id !== original && tg.state.objects[id].isCopy)!;
    tg.pass().choose('mágica ou permanente alvo', [copia]).cast(N).resolve().resolve();
    expect(tg.state.objects[copia]).toBeUndefined();
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.find('Brainstorm', 'stack')).toBe(original);
  });
});

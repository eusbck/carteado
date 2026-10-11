import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Path of Discovery';

describe(N, () => {
  it('terreno no topo vai para a mão; carta que não é terreno dá um marcador +1/+1 e pode ir para o cemitério', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Elvish Mystic'], []], library: [['Island', 'Preordain', 'Sol Ring'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Elvish Mystic', 'Island']);
    const [primeiro] = tg.all('Elvish Mystic');
    expect(tg.state.objects[primeiro].counters['+1/+1'] ?? 0).toBe(0);
    tg.yes('Explorar', true);
    tg.cast('Elvish Mystic').resolveAll();
    const segundo = tg.all('Elvish Mystic').find((id) => id !== primeiro)!;
    expect(tg.state.objects[segundo].counters['+1/+1']).toBe(1);
    expect(tg.names(0, 'graveyard')).toEqual(['Preordain']);
    expect(tg.names(0, 'library')).toEqual(['Sol Ring']);
  });

  it('a carta que não é terreno pode ficar no topo; a criatura do oponente não explora', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Forest']], hand: [[], ['Elvish Mystic']], library: [['Preordain'], ['Preordain']] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1'] ?? 0).toBe(0);
    const meu = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [['Preordain'], []] });
    meu.yes('Explorar', false);
    meu.cast('Elvish Mystic').resolveAll();
    expect(meu.state.objects[meu.bf('Elvish Mystic')].counters['+1/+1']).toBe(1);
    expect(meu.names(0, 'library')).toEqual(['Preordain']);
  });

  it('sem carta no grimório, a criatura recebe o marcador', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [[], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].counters['+1/+1']).toBe(1);
  });
});

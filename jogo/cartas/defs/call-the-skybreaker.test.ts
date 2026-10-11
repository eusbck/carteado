import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Call the Skybreaker';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('cria uma ficha de criatura Elemental 5/5 azul e vermelha com voar', () => {
    const tg = setup({ battlefield: [ilhas(7), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf('Elemental');
    expect(tg.pt(id)).toEqual([5, 5]);
    expect([...chars(tg.g, id).colors].sort()).toEqual(['R', 'U']);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('do cemitério, paga o custo de mana e descarta uma carta de terreno', () => {
    const tg = setup({ battlefield: [ilhas(7), []], hand: [['Mountain', 'Sol Ring'], []], graveyard: [[N], []] });
    tg.cast(N, 'retrace').resolveAll();
    expect(tg.all('Elemental')).toHaveLength(1);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Mountain']);
    expect(tg.all('Island').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });

  it('sem carta de terreno na mão, não dá para retraçar', () => {
    const tg = setup({ battlefield: [ilhas(7), []], hand: [['Sol Ring'], []], graveyard: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });

  it('do cemitério, só no tempo de um feitiço', () => {
    const forests = Array(10).fill('Forest');
    const tg = setup({ active: 1, battlefield: [ilhas(7), []], hand: [['Mountain'], []], graveyard: [[N], []], library: [forests, forests] });
    expect(tg.canCast(N)).toBe(false);
    tg.passTo('upkeep', 0);
    expect(tg.canCast(N)).toBe(false);
    tg.passTo('main1', 0);
    expect(tg.canCast(N)).toBe(true);
  });

  it('ao resolver volta para o cemitério e pode ser conjurada de novo com outro terreno', () => {
    const tg = setup({ battlefield: [ilhas(14), []], hand: [['Mountain', 'Forest'], []], graveyard: [[N], []] });
    tg.cast(N, 'retrace').resolveAll();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.cast(N, 'retrace').resolveAll();
    expect(tg.all('Elemental')).toHaveLength(2);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Titania, Protector of Argoth';
const elementais = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Elemental 5/3');

describe(N, () => {
  it('ao entrar, devolve a carta de terreno alvo do seu cemitério para o campo', () => {
    const tg = setup({ battlefield: [Array<string>(5).fill('Forest'), []], hand: [[N], []], graveyard: [['Island', 'Hex'], []] });
    tg.choose('carta de terreno alvo', ['Island']).cast(N).resolveAll();
    expect(tg.find('Island')).not.toBeNull();
  });
  it('cada terreno seu que vai do campo para o cemitério cria um Elemental 5/3; o do oponente não', () => {
    const tg = setup({ battlefield: [[N, 'Strip Mine', 'Forest'], ['Island']] });
    tg.choose('terreno alvo', ['Forest']).activate('Strip Mine', 'Destrua').resolveAll();
    // o Strip Mine sacrificado e a Forest destruída
    expect(elementais(tg).length).toBe(2);
    expect(tg.pt(elementais(tg)[0])).toEqual([5, 3]);
  });
  it('terreno do oponente destruído não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Strip Mine'], ['Island']] });
    tg.choose('terreno alvo', ['Island']).activate('Strip Mine', 'Destrua').resolveAll();
    expect(elementais(tg).length).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Elanor Gardner';
const florestas = Array(6).fill('Forest');

describe(N, () => {
  it('a Food sacrificada antes de Elanor entrar conta; na etapa final, busca um terreno básico virado', () => {
    const tg = setup({ battlefield: [[...florestas, { name: 'Food', token: true }], []], hand: [[N], []] });
    tg.activate('Food').resolveAll();
    tg.cast(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
    tg.yes('Procurar um terreno básico', true).choose('Procure uma carta de terreno básico', ['Forest']);
    expect(tg.state.turnStats[0].foodsSacrificed).toBe(1);
    tg.passTo('end', 0);
    tg.resolveAll();
    const florestasNoCampo = tg.all('Forest');
    expect(florestasNoCampo).toHaveLength(7);
    expect(tg.state.objects[florestasNoCampo.at(-1)!].tapped).toBe(true);
  });

  it('sem Food sacrificada no turno, não dispara', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt.includes('Procurar um terreno')) perguntou = true; return null; });
    tg.passTo('end', 0);
    tg.resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.all('Forest')).toHaveLength(1);
  });
});

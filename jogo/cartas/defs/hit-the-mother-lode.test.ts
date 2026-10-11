import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Hit the Mother Lode';
const montanhas = Array(7).fill('Mountain');
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('descobre 10, conjura a carta de graça e depois cria os Treasures virados pela diferença', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Island', 'Sol Ring', ...forests], forests] });
    tg.yes('Descobrir', true).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // Sol Ring tem valor de mana 1: nove Treasures, todos virados
    const tesouros = tg.all('Treasure');
    expect(tesouros).toHaveLength(9);
    expect(tesouros.every((id) => tg.state.objects[id].tapped)).toBe(true);
    // o terreno exilado antes foi para o fundo do grimório
    const lib = tg.state.zones.library[0].map((id) => tg.state.objects[id].def);
    expect(lib).toHaveLength(11);
    expect(lib[10]).toBe('Island');
  });

  it('sem conjurar, a carta descoberta vai para a mão e os Treasures são criados do mesmo jeito', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [['Rapacious Dragon', ...forests], forests] });
    tg.yes('Descobrir', false).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Rapacious Dragon']);
    // Rapacious Dragon tem valor de mana 5: cinco Treasures
    expect(tg.all('Treasure')).toHaveLength(5);
  });

  it('sem carta que não seja terreno no grimório, nada é descoberto e nenhum Treasure é criado', () => {
    const tg = setup({ battlefield: [montanhas, []], hand: [[N], []], library: [forests, forests] });
    tg.cast(N).resolveAll();
    expect(tg.all('Treasure')).toHaveLength(0);
    expect(tg.state.zones.library[0]).toHaveLength(10);
  });
});

import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Jace, Architect of Thought';
const lib = Array(20).fill('Forest');

describe(N, () => {
  it('+1: até o seu próximo turno, cada criatura de um oponente que ataca recebe -1/-0', () => {
    const tg = setup({ battlefield: [[N], ['Ripjaw Raptor']], library: [lib, lib] });
    tg.activate(N, '+1').resolve();
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(5);
    tg.passTo('main1', 1);
    tg.attack([['Ripjaw Raptor', 0]]).passTo('declareBlockers', 1);
    expect(tg.pt(tg.bf('Ripjaw Raptor'))).toEqual([3, 5]);
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(37);
    // no seu turno seguinte o efeito acabou: no próximo ataque dele, não diminui
    tg.passTo('main1', 0);
    tg.passTo('main1', 1);
    tg.attack([['Ripjaw Raptor', 0]]).passTo('declareBlockers', 1);
    expect(tg.pt(tg.bf('Ripjaw Raptor'))).toEqual([4, 5]);
  });

  it('−2: o oponente separa as três em pilhas; uma vai para a mão e a outra para o fundo', () => {
    const tg = fixture({ battlefield: [[N], []], library: [['Sol Ring', 'Island', 'Ripjaw Raptor', 'Plains', 'Swamp'], lib] });
    tg.choose('separe as cartas', ['Sol Ring']);
    tg.choose('escolha a pilha', ['Pilha 2: Island, Ripjaw Raptor']);
    tg.activate(N, '−2').resolveAll();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Ripjaw Raptor']);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Swamp', 'Sol Ring']);
    expect(tg.state.objects[tg.find('Sol Ring', 'library', 0)!].visibleTo).toBeNull();
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(2);
  });

  it('−8: exila uma carta que não é terreno de cada grimório e conjura de graça as que quiser', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { loyalty: 8 } }], []], library: [['Forest', 'Sol Ring'], ['Island', 'Gigantosaurus']] });
    tg.choose('grimório de Ana', ['Sol Ring']);
    tg.choose('grimório de Bruno', ['Gigantosaurus']);
    tg.choose('escolha uma carta exilada', ['Gigantosaurus']);
    tg.choose('escolha uma carta exilada', ['Não conjurar mais nenhuma']);
    tg.activate(N, '−8').resolveAll();
    expect(tg.find('Gigantosaurus', 'battlefield', 0)).not.toBeNull();
    expect(tg.find('Sol Ring', 'exile')).not.toBeNull();
    expect(tg.find(N)).toBeNull();
  });
});

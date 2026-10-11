import { describe, expect, it } from 'vitest';
import { destroy, exile, gainControl } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Enigma Sphinx';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('CR 702.85a: ao ser conjurada, a cascata conjura de graça a primeira carta não terreno que custa menos', () => {
    const terrenos = ['Plains', 'Plains', 'Island', 'Island', 'Swamp', 'Swamp', 'Island'];
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []], library: [['Forest', 'Sol Ring', ...forests], forests] });
    tg.yes('Cascata', true).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 4]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });

  it('indo do campo para o seu cemitério, vai para o grimório como a terceira carta a partir do topo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Plains', 'Island', 'Swamp', 'Mountain'], forests] });
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Island', N, 'Swamp', 'Mountain']);
  });

  it('com menos de duas cartas no grimório, vai para o fundo', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Plains'], forests] });
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains', N]);
  });

  it('sob o controle de outro jogador, vai para o cemitério do dono e o gatilho não dispara', () => {
    const tg = setup({ battlefield: [[N], ['Indomitable Ancients']], library: [['Plains', 'Island', 'Swamp'], forests] });
    gainControl(tg.g, tg.bf(N), 1, { kind: 'permanent' }, tg.bf('Indomitable Ancients'));
    tg.refresh();
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Island', 'Swamp']);
  });

  it('se sair do cemitério em resposta, não vai para o grimório', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Plains', 'Island', 'Swamp'], forests] });
    tg.run(destroy(tg.g, [tg.bf(N)]));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.run(exile(tg.g, [tg.find(N, 'graveyard', 0)!]));
    tg.resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Island', 'Swamp']);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });
});

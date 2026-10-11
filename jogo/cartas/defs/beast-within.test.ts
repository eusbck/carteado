import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Beast Within';
const terrenos = ['Forest', 'Forest', 'Plains', 'Plains'];

describe(N, () => {
  it('destrói a permanente alvo e o controlador dela cria um Beast 3/3 verde', () => {
    const tg = setup({ battlefield: [terrenos, ['Sol Ring']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Sol Ring']).cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    const ficha = tg.bf('Beast');
    expect(tg.pt(ficha)).toEqual([3, 3]);
    expect(tg.state.objects[ficha].controller).toBe(1);
  });

  it('com a permanente indestrutível, ela fica e o controlador cria a ficha mesmo assim', () => {
    const tg = setup({ battlefield: [terrenos, ['Darksteel Ingot']], hand: [[N], []] });
    tg.choose('permanente alvo', ['Darksteel Ingot']).cast(N).resolveAll();
    expect(tg.find('Darksteel Ingot')).not.toBeNull();
    expect(tg.find('Beast')).not.toBeNull();
  });
});
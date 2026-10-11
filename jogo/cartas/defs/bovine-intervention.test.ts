import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bovine Intervention';

describe(N, () => {
  it('destrói o artefato ou criatura alvo e o controlador dele cria um Ox 2/2 branco', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('artefato ou criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    const boi = tg.bf('Ox');
    expect(tg.state.objects[boi].controller).toBe(1);
    expect(tg.pt(boi)).toEqual([2, 2]);
  });

  it('o controlador cria o Ox mesmo que o alvo seja indestrutível; com o alvo ilegal, ninguém cria', () => {
    // Zetalpa é indestrutível
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('artefato ou criatura alvo', ['Zetalpa, Primal Dawn']).cast(N).resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.all('Ox')).toHaveLength(1);

    const ilegal = setup({ battlefield: [['Plains', 'Plains'], ['Sol Ring']], hand: [[N], []] });
    ilegal.choose('artefato ou criatura alvo', ['Sol Ring']).cast(N);
    ilegal.run(exile(ilegal.g, [ilegal.bf('Sol Ring')]));
    ilegal.resolveAll();
    expect(ilegal.all('Ox')).toHaveLength(0);
  });
});

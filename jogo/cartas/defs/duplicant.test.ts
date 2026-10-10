import { describe, expect, it } from 'vitest';
import { addCounters, addPending, chars, hasKw } from '../../motor/api.ts';
import { removeCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Duplicant";
describe(N, () => {
  it('entradas copiadas preservam os vínculos anteriores e usam a última criatura que continua no exílio', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Elvish Mystic', 'Zetalpa, Primal Dawn']], hand: [[N], []] });
    tg.choose('criatura não ficha', ['Elvish Mystic']).yes('Duplicant:').cast(N).resolveAll();
    const id = tg.bf(N);
    tg.choose('criatura não ficha', ['Zetalpa, Primal Dawn']).yes('Duplicant:');
    addPending(tg.g, `${N}#0.0`, id, 0, {}, {}); tg.refresh(); tg.settle(); tg.resolveAll();
    expect(tg.state.objects[id].linked.imprint).toHaveLength(2);
    expect(tg.pt(id)).toEqual([4, 8]);
    removeCard(tg, tg.find('Zetalpa, Primal Dawn', 'exile')!);
    expect(tg.pt(id)).toEqual([1, 1]);
  });
  it("exila sem copiar habilidades e mantém Shapeshifter e bônus de marcadores", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Zetalpa, Primal Dawn']], hand: [[N], []] }); tg.choose('criatura não ficha', ['Zetalpa, Primal Dawn']).yes('Duplicant:').cast(N).resolveAll();
    const id = tg.bf(N); expect(tg.pt(id)).toEqual([4, 8]); expect(chars(tg.g, id).subtypes).toEqual(expect.arrayContaining(['Shapeshifter', 'Elder', 'Dinosaur'])); expect(hasKw(tg.g, id, 'flying')).toBe(false);
    addCounters(tg.g, { kind: 'obj', id }, '+1/+1', 1, 0); expect(tg.pt(id)).toEqual([5, 9]);
  });

  it("CDA no exílio acompanha a quantidade de artefatos do dono original", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring'], ['Master of Etherium', 'Silver Myr', 'Sol Ring']], hand: [[N], []] }); tg.choose('criatura não ficha', ['Master of Etherium']).yes('Duplicant:').cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]); removeCard(tg, tg.bf('Silver Myr')); expect(tg.pt(tg.bf(N))).toEqual([1, 1]);
  });
});

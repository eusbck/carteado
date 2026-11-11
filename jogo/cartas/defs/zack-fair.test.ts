import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Zack Fair';

describe(N, () => {
  it('entra com um marcador +1/+1', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
  });

  it('{1}, sacrifique: a criatura alvo ganha indestrutível, recebe os marcadores e o Equipamento de Zack', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 1 } }, { name: 'Shadowspear', attachTo: N }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate(N, 'sacrifique').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.find(N)).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain(N);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(true);
    expect(tg.state.objects[a].counters['+1/+1']).toBe(1);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBe(a);
    // 2/10 + marcador + Shadowspear
    expect(tg.pt(a)).toEqual([4, 12]);
    tg.passTo('main1', 1);
    expect(hasKw(tg.g, a, 'indestructible')).toBe(false);
  });

  it('põe todos os marcadores de Zack (não só os +1/+1) na criatura alvo', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2, flying: 1, oil: 3 } }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).activate(N, 'sacrifique').resolveAll();
    const a = tg.state.objects[tg.bf('Indomitable Ancients')];
    expect(a.counters).toMatchObject({ '+1/+1': 2, flying: 1, oil: 3 });
    expect(hasKw(tg.g, a.id, 'flying')).toBe(true);
  });

  it('com dois Equipamentos, você escolhe qual anexar; o outro fica solto', () => {
    const tg = setup({ battlefield: [[N, { name: 'Shadowspear', attachTo: N }, { name: 'Swiftfoot Boots', attachTo: N }, 'Indomitable Ancients', 'Plains'], []] });
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']).choose('escolha o Equipamento', ['Swiftfoot Boots']).activate(N, 'sacrifique').resolveAll();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[tg.bf('Swiftfoot Boots')].attachedTo).toBe(a);
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { exile } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Erode';

describe(N, () => {
  it('destrói a criatura e o controlador dela decide a busca e escolhe o básico virado', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [[N], []], library: [[], ['Forest', 'Temple Garden', 'Sol Ring']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Procurar um terreno básico')) return null;
      expect(d.player).toBe(1);
      return { kind: 'select', ids: ['yes'] };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Procure uma carta de terreno básico')) return null;
      expect(d.player).toBe(1);
      expect(d.items.filter((item) => !item.disabled).map((item) => item.label)).toEqual(['Forest']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.state.objects[tg.bf('Forest', 1)].tapped).toBe(true);
    expect(tg.script).toHaveLength(0);
  });

  it('também destrói um planeswalker', () => {
    const tg = setup({ battlefield: [['Plains'], ['Jace, Architect of Thought']], hand: [[N], []] });
    tg.yes('Procurar um terreno básico', false).choose('criatura ou planeswalker alvo', ['Jace, Architect of Thought']).cast(N).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Jace, Architect of Thought']);
  });

  it('pode destruir uma criatura sua e você decide a busca', () => {
    const tg = setup({ battlefield: [['Plains', 'Indomitable Ancients'], []], hand: [[N], []], library: [['Forest'], []] });
    tg.yes('Procurar um terreno básico', true).choose('terreno básico', ['Forest']);
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Indomitable Ancients', N]);
    expect(tg.state.objects[tg.bf('Forest', 0)].tapped).toBe(true);
  });

  it('o controlador pode recusar a busca e não embaralha', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [[N], []], library: [[], ['Sol Ring', 'Forest', 'Island']] });
    const rng = structuredClone(tg.state.rng);
    tg.yes('Procurar um terreno básico', false).choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.names(1, 'library')).toEqual(['Sol Ring', 'Forest', 'Island']);
    expect(tg.state.rng).toEqual(rng);
  });

  it('com alvo indestrutível, o controlador ainda pode procurar', () => {
    const tg = setup({ battlefield: [['Plains'], ['Zetalpa, Primal Dawn']], hand: [[N], []], library: [[], ['Forest']] });
    tg.yes('Procurar um terreno básico', true).choose('terreno básico', ['Forest']);
    tg.choose('criatura ou planeswalker alvo', ['Zetalpa, Primal Dawn']).cast(N).resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Forest', 1)].tapped).toBe(true);
  });

  it('CR 608.2b: com o alvo ilegal, ninguém procura nem embaralha', () => {
    const tg = setup({ battlefield: [['Plains'], ['Indomitable Ancients']], hand: [[N], []], library: [[], ['Sol Ring', 'Forest', 'Island']] });
    const rng = structuredClone(tg.state.rng);
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N);
    tg.run(exile(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.script.push((d) => {
      if (d.kind === 'select' && /Procurar|Procure/.test(d.prompt)) throw new Error('Alvo ilegal não permite busca');
      return null;
    });
    tg.resolve();
    expect(tg.names(1, 'library')).toEqual(['Sol Ring', 'Forest', 'Island']);
    expect(tg.state.rng).toEqual(rng);
    expect(tg.find('Forest')).toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});

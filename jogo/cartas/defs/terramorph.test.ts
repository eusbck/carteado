import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Terramorph';
const forests = Array(4).fill('Forest');
const grimorio = ['Sol Ring', 'Dragonskull Summit', 'Island', 'Plains', ...Array(10).fill('Sol Ring')];
const dele = Array(10).fill('Forest');

describe(N, () => {
  it('busca uma carta de terreno básico e a põe no campo desvirada', () => {
    const tg = setup({ battlefield: [forests, []], hand: [[N], []], library: [grimorio, dele] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('terreno básico')) return null;
      opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Island' && !i.disabled)!.id] };
    });
    tg.cast(N).resolveAll();
    // só os básicos: nem o artefato nem o terreno não básico
    expect([...new Set(opcoes)].sort()).toEqual(['Island', 'Plains']);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
    expect(tg.state.zones.library[0]).toHaveLength(grimorio.length - 1);
  });

  it('CR 702.88a: ricochete — na sua próxima manutenção busca outro terreno, sem pagar, e vai para o cemitério', () => {
    const tg = setup({ battlefield: [forests, []], hand: [[N], []], library: [grimorio, dele] });
    tg.choose('terreno básico', ['Island']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.yes('Ricochete', true).choose('terreno básico', ['Plains']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    expect(tg.find('Plains')).not.toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.all('Forest').every((id) => !tg.state.objects[id].tapped)).toBe(true);
  });
});

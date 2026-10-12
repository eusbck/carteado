import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stoneforge Mystic';

describe(N, () => {
  it('ao entrar, pode buscar um Equipamento para a mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Island', 'Shadowspear', 'Island'], ['Island']] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Procure uma carta de Equipamento')) return null;
      const i = d.items.find((x) => x.label === 'Shadowspear')!;
      return { kind: 'select', ids: [i.id] };
    });
    tg.yes('Stoneforge Mystic', true).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Shadowspear']);
  });

  it('{1}{W}, {T}: põe no campo um Equipamento da mão, desanexado', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains'], []], hand: [['Shadowspear', 'Island'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Stoneforge Mystic: você pode pôr')) return null;
      expect(d.items).toHaveLength(1);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    expect(tg.state.objects[tg.bf('Shadowspear')].attachedTo).toBeNull();
  });
});
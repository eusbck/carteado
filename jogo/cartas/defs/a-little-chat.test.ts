import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'A Little Chat';
const BAIXA = 'Pagar: baixa 1 (sacrifique uma criatura com força 1 ou mais)';

describe(N, () => {
  it('olha as duas do topo: uma vai para a mão e a outra para o fundo do grimório', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring', 'Plains', 'Forest', 'Swamp'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose(N, ['Plains']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.names(0, 'library')).toEqual(['Forest', 'Swamp', 'Sol Ring']);
  });

  it('com uma carta só no grimório, ela vai para a mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island'], []], hand: [[N], []], library: [['Sol Ring'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'library')).toEqual([]);
  });

  it('CR 702.153a: com a baixa paga, a cópia resolve primeiro e as duas mágicas olham o grimório', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Elvish Mystic'], []], hand: [[N], []], library: [['Sol Ring', 'Plains', 'Forest', 'Swamp', 'Mountain'], []] });
    tg.choose('custo adicional opcional', [BAIXA]);
    // a cópia fica com o Sol Ring (Plains vai para o fundo); a original olha Forest e Swamp
    tg.choose(N, ['Sol Ring']).choose(N, ['Forest']);
    tg.cast(N);
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Elvish Mystic', 'graveyard', 0)).not.toBeNull();
    tg.resolve();
    // o gatilho da baixa criou a cópia acima da original
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring', 'Forest']);
    expect(tg.names(0, 'library')).toEqual(['Mountain', 'Plains', 'Swamp']);
  });

  it('sem criatura com força 1 ou mais, a baixa não pode ser paga', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Wall of Omens'], []], hand: [[N], []], library: [['Sol Ring', 'Plains'], []] });
    let desabilitada = false;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('custo adicional opcional')) return null;
      desabilitada = !!d.items.find((i) => i.id === 'yes')?.disabled;
      return { kind: 'select', ids: ['no'] };
    });
    tg.cast(N).resolveAll();
    expect(desabilitada).toBe(true);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
});

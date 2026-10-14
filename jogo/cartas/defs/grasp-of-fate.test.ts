import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Grasp of Fate';

describe(N, () => {
  it('exila até um permanente de cada oponente; quando ele sai do campo, elas voltam', () => {
    const tg = setup({ players: 3, battlefield: [['Plains', 'Plains', 'Plains'], ['Sol Ring', 'Baleful Strix', 'Forest'], ['Thieving Amalgam']], hand: [[N], [], []] });
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      max = d.max;
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Baleful Strix')!.id, d.items.find((i) => i.label === 'Thieving Amalgam')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(max).toBe(2);
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Thieving Amalgam')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(controllerOf(tg.g, tg.bf('Baleful Strix'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf('Thieving Amalgam'))).toBe(2);
  });

  it('com um oponente só, no máximo um alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Sol Ring', 'Baleful Strix']], hand: [[N], []] });
    let max = 0;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      max = d.max;
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.cast(N).resolveAll();
    expect(max).toBe(1);
  });

  it('se Grasp of Fate sai do campo antes de o gatilho resolver, nada é exilado', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], ['Baleful Strix']], hand: [[N], []] });
    tg.choose('permanente não terreno alvo', ['Baleful Strix']);
    tg.cast(N);
    tg.resolve();
    // o gatilho está na pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.find('Baleful Strix')).not.toBeNull();
  });
});

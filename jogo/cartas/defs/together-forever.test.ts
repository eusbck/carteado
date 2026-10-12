import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Together Forever';

describe(N, () => {
  it('suporte 2: um marcador +1/+1 em cada uma de até duas criaturas alvo, de qualquer jogador', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Silver Myr', 'Elvish Mystic']).cast(N).resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
  });

  it('{1}: a criatura com marcador que morrer neste turno volta para a mão do dono', () => {
    const tg = setup({ battlefield: [[N, 'Island', { name: 'Silver Myr', counters: { '+1/+1': 1 } }, 'Elvish Mystic'], []] });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura alvo com um marcador')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Silver Myr']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    removeCard(tg, tg.bf('Silver Myr'));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Silver Myr']);
  });
});
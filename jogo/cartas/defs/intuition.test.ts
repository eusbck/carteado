import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Intuition';

describe(N, () => {
  it('o oponente alvo escolhe a carta que vai para a mão; as outras vão para o cemitério', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Forest', 'Ponder', 'Sol Ring', 'Opt', 'Swamp'], []] });
    tg.choose('Procure três cartas', ['Ponder', 'Sol Ring', 'Opt']);
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('vai para a mão')) return null;
      quem = d.player;
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Opt')!.id] };
    });
    tg.cast(N).resolve();
    expect(quem).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Ponder', 'Sol Ring'].sort());
    expect(tg.names(0, 'library').sort()).toEqual(['Forest', 'Swamp']);
  });
});

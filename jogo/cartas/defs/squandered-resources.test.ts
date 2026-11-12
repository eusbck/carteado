import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Squandered Resources';

function ativa(tg: ReturnType<typeof setup>, rotulo?: string): void {
  const d = tg.pending!;
  if (d.kind !== 'priority') throw new Error('sem prioridade');
  const a = d.actions.find((x) => x.obj === tg.bf(N) && (!rotulo || x.label.includes(rotulo)));
  if (!a) throw new Error(`sem ação: ${d.actions.map((x) => x.label).join(' | ')}`);
  tg.answer({ kind: 'priority', action: a.id });
  tg.settle();
}

describe(N, () => {
  it('sacrificando um terreno, dá uma mana que ele poderia produzir (mesmo virado)', () => {
    const tg = setup({ battlefield: [[N, { name: 'Karplusan Forest', tapped: true }, 'Swamp'], []] });
    tg.choose('Sacrifique um terreno', ['Karplusan Forest']).choose('escolha a mana', ['{R}']);
    ativa(tg);
    expect(tg.find('Karplusan Forest')).toBeNull();
    expect(tg.state.players[0].manaPool.length).toBe(1);
    expect(tg.state.players[0].manaPool[0].type).toBe('R');
    expect(tg.find('Swamp')).not.toBeNull();
  });
  it('um terreno que não produz mana pode ser sacrificado, mas não dá mana', () => {
    const tg = setup({ battlefield: [[N, 'Glacial Chasm'], []] });
    tg.choose('Sacrifique um terreno', ['Glacial Chasm']);
    ativa(tg);
    expect(tg.find('Glacial Chasm')).toBeNull();
    expect(tg.state.players[0].manaPool.length).toBe(0);
  });
});

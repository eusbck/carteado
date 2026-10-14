import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Savvy Trader';

describe(N, () => {
  it('exila uma carta de permanente do seu cemitério; você a conjura do exílio por {1} a menos', () => {
    // Prismatic Lens ({2}) com uma Island: precisa da redução
    const tg = setup({ battlefield: [['Island'], []], graveyard: [['Prismatic Lens', 'Faithless Looting'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de permanente alvo')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(opcoes).toEqual(['Prismatic Lens']);
    const lente = tg.find('Prismatic Lens', 'exile')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(lente)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.find('Prismatic Lens')).not.toBeNull();
  });

  it('a redução não paga mana colorida', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], graveyard: [['Faithless Looting'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':flashback'))).toBe(false);
  });
});

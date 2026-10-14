import { describe, expect, it } from 'vitest';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Oblivion Sower';

describe(N, () => {
  it('põe no campo terrenos dele que já estavam no exílio, além dos que acabaram de ser exilados', () => {
    const tg = setup({
      battlefield: [['Sol Ring', 'Sol Ring', 'Island', 'Island'], []], hand: [[N], []],
      exile: [['Plains'], ['Mountain']], library: [Array(8).fill('Island'), ['Swamp', 'Baleful Strix', 'Forest', 'Sol Ring', 'Island']],
    });
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Oblivion Sower: escolha')) return null;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: d.items.map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    // a Plains de Ana não serve; a Mountain de Bruno, já exilada, serve
    expect(opcoes).toEqual(['Forest', 'Mountain', 'Swamp']);
    for (const nome of ['Forest', 'Mountain', 'Swamp']) expect(controllerOf(tg.g, tg.bf(nome))).toBe(0);
    expect(tg.names(1, 'library')).toEqual(['Island']);
    expect(tg.find(N)).not.toBeNull();
  });

  it('cartas viradas para baixo no exílio não podem ser postas no campo', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Island', 'Island'], []], hand: [[N], []], exile: [[], ['Mountain']], library: [Array(8).fill('Island'), Array(8).fill('Baleful Strix')] });
    tg.state.objects[tg.state.zones.exile[0]].faceDown = true;
    tg.refresh();
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Oblivion Sower: escolha') ? ((perguntou = true), { kind: 'select', ids: [] }) : null));
    tg.cast(N).resolveAll();
    expect(perguntou).toBe(false);
  });
});

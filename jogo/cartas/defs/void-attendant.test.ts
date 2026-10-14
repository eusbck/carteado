import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/chars.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Void Attendant';

describe(N, () => {
  it('põe no cemitério do dono uma carta exilada de um oponente e cria um Eldrazi Scion', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Island'], []], exile: [['Prismatic Lens'], ['Sol Ring']] });
    expect(chars(tg.g, tg.bf(N)).colors).toEqual([]);
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Void Attendant: escolha')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    // a carta de que você é dono não serve
    expect(opcoes).toEqual(['Sol Ring (de Bruno)']);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    expect(tg.find('Eldrazi Scion')).not.toBeNull();
  });

  it('uma carta virada para baixo é escolhida pelo dono, ao acaso, sem ser olhada', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Island'], []], exile: [[], ['Sol Ring', 'Prismatic Lens']] });
    for (const id of tg.state.zones.exile) tg.state.objects[id].faceDown = true;
    tg.refresh();
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Void Attendant: escolha')) return null;
      opcoes = d.items.map((i) => i.label);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.activate(N).resolveAll();
    expect(opcoes).toEqual(['Uma carta virada para baixo de Bruno (ao acaso)']);
    expect(tg.names(1, 'graveyard')).toHaveLength(1);
    expect(tg.state.zones.exile).toHaveLength(1);
  });

  it('sem carta exilada de oponente, não dá para ativar', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Island'], []], exile: [['Sol Ring'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sever the Bloodline';
const pantanos = (n: number) => Array(n).fill('Swamp');
const gato = { name: 'Cat verde 1/1', token: true };

describe(N, () => {
  it('exila a criatura alvo e todas as outras com o mesmo nome, de qualquer jogador', () => {
    const tg = setup({
      players: 3, hand: [[N], [], []], graveyard: [['Elvish Mystic'], [], []],
      battlefield: [[...pantanos(4), 'Elvish Mystic'], ['Elvish Mystic', 'Wall of Omens'], ['Elvish Mystic']],
    });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criatura alvo') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Elvish Mystic' && !i.disabled)!.id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.all('Elvish Mystic')).toHaveLength(0);
    expect(tg.state.zones.exile.filter((id) => tg.state.objects[id].def === 'Elvish Mystic')).toHaveLength(3);
    // a de outro nome fica, e a carta do cemitério (que não é uma criatura no campo) também
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Elvish Mystic', 'graveyard', 0)).not.toBeNull();
  });

  it('fichas com o mesmo nome também são exiladas', () => {
    const tg = setup({ battlefield: [pantanos(4), [gato, gato, gato, 'Wall of Omens']], hand: [[N], []] });
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('criatura alvo') ? { kind: 'select', ids: [d.items.find((i) => i.label === 'Cat' && !i.disabled)!.id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.all('Cat verde 1/1')).toHaveLength(0);
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });

  it('se o alvo fica ilegal, nenhuma criatura é exilada', () => {
    const tg = setup({ battlefield: [pantanos(4), ['Elvish Mystic', 'Elvish Mystic']], hand: [[N], []] });
    let alvo = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('criatura alvo')) return null;
      const it = d.items.find((i) => !i.disabled)!;
      alvo = it.obj!;
      return { kind: 'select', ids: [it.id] };
    });
    tg.cast(N);
    tg.run(destroy(tg.g, [alvo]));
    tg.resolveAll();
    expect(tg.all('Elvish Mystic')).toHaveLength(1);
    expect(tg.state.zones.exile).toHaveLength(0);
  });

  it('CR 702.34a: pela retrospectiva, é conjurada do cemitério por {5}{B}{B} e exilada depois', () => {
    const tg = setup({ battlefield: [pantanos(7), ['Elvish Mystic']], graveyard: [[N], []] });
    tg.choose('criatura alvo', ['Elvish Mystic']).cast(N, 'flashback').resolveAll();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.all('Swamp').every((id) => tg.state.objects[id].tapped)).toBe(true);
  });
});

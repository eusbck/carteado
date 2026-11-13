import { describe, expect, it } from 'vitest';
import { setup, type TestGame } from '../../testes/harness.ts';

const N = 'Disallow';

/** escolhe como alvo o primeiro objeto da pilha oferecido */
function alvoPrimeiro(tg: TestGame): void {
  tg.script.push((d) => {
    if (d.kind !== 'select' || !d.prompt.includes('mágica, habilidade')) return null;
    const i = d.items.find((x) => !x.disabled);
    return i ? { kind: 'select', ids: [i.id] } : null;
  });
}

describe(N, () => {
  it('anula uma mágica', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Plains', 'Plains']], hand: [[N], ['Wall of Omens']], active: 1 });
    tg.cast('Wall of Omens').pass();
    alvoPrimeiro(tg);
    tg.cast(N).resolve();
    expect(tg.find('Wall of Omens', 'graveyard', 1)).not.toBeNull();
  });

  it('anula uma habilidade ativada (equipar) e o efeito não acontece', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Plains', 'Plains', 'Darksteel Plate', 'Wall of Omens']], hand: [[N], []], active: 1 });
    tg.choose('criatura alvo', ['Wall of Omens']).activate('Darksteel Plate', 'Equipar').pass();
    alvoPrimeiro(tg);
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.state.zones.stack).toEqual([]);
    expect(tg.state.objects[tg.bf('Darksteel Plate')].attachedTo ?? null).toBeNull();
  });

  it('anula uma habilidade desencadeada', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Plains', 'Plains']], hand: [[N], ['Wall of Omens']], active: 1, library: [['Island'], ['Island', 'Island']] });
    tg.cast('Wall of Omens').resolve();
    // o gatilho de entrar do Muro está na pilha
    expect(tg.state.zones.stack).toHaveLength(1);
    const mao = tg.state.zones.hand[1].length;
    tg.pass();
    alvoPrimeiro(tg);
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.state.zones.stack).toEqual([]);
    expect(tg.state.zones.hand[1].length).toBe(mao);
  });
});

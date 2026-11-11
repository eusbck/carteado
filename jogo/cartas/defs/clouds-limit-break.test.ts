import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const C = "Cloud's Limit Break";

describe(C, () => {
  it('Cross-Slash ({1}{W}): destrói a criatura virada alvo', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], [{ name: 'Wall of Omens', tapped: true }, 'Indomitable Ancients']], hand: [[C], []] });
    tg.choose('modo', ['Cross-Slash — {0} — Destrua a criatura virada alvo']).choose('alvo', ['Wall of Omens']);
    tg.cast(C).resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('Omnislash custa {1}{W} + {3}{W} e destrói todas as criaturas viradas', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Plains'), { name: 'Elvish Mystic', tapped: true }], [{ name: 'Wall of Omens', tapped: true }, 'Indomitable Ancients']], hand: [[C], []] });
    tg.choose('modo', ['Omnislash — {3}{W} — Destrua todas as criaturas viradas']);
    tg.cast(C);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Plains' && tg.state.objects[id].tapped).length).toBe(6);
    tg.resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Elvish Mystic')).toBeNull();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
  it('sem mana para o custo do modo, não dá para conjurar Omnislash', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], [{ name: 'Wall of Omens', tapped: true }]], hand: [[C], []] });
    tg.choose('modo', ['Omnislash — {3}{W} — Destrua todas as criaturas viradas']);
    expect(() => tg.cast(C)).toThrow();
  });
});

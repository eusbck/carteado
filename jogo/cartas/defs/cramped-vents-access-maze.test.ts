import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const SALA = 'Cramped Vents // Access Maze';

describe(SALA, () => {
  it('Cramped Vents: 6 de dano numa criatura 2/10 com 7 marcados ganha 3 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], [{ name: 'Indomitable Ancients', damage: 7 }]], hand: [[SALA], []] });
    tg.cast(SALA, 'hand').resolve().resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.life(0)).toBe(43);
  });

  it('Access Maze: uma vez por turno, conjura da mão pagando vida igual ao valor de mana', () => {
    const tg = setup({
      battlefield: [[SALA], []], hand: [['Wall of Omens', 'Sol Ring'], []], library: [['Island'], []],
      onStart: (t) => { const id = t.bf(SALA); t.state.objects[id].face = 1; t.g.bump(); t.refresh(); },
    });
    const pagandoVida = (nome: string) => tg.actionIds().find((a) => a.includes('Access Maze:vida') && a.split(':')[1] === String(tg.find(nome, 'hand', 0)));
    tg.answer({ kind: 'priority', action: pagandoVida('Wall of Omens')! });
    tg.settle();
    expect(tg.life(0)).toBe(38);
    tg.resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(pagandoVida('Sol Ring')).toBeUndefined();
  });
});

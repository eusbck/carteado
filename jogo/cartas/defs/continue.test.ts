import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Continue?';

describe(N, () => {
  it('devolve ao campo até quatro cartas de criatura que foram do campo para o seu cemitério neste turno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Silver Myr', 'Elvish Mystic'], []], hand: [[N], []], graveyard: [['Serra Angel'], []] });
    removeCard(tg, tg.bf('Silver Myr'));
    removeCard(tg, tg.bf('Elvish Mystic'));
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('veio do campo')) return null;
      expect(d.items.map((i) => i.label).sort()).toEqual(['Elvish Mystic', 'Silver Myr']);
      return { kind: 'select', ids: d.items.map((i) => i.id) };
    });
    tg.cast(N).resolveAll();
    expect(tg.find('Silver Myr')).not.toBeNull();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual([N, 'Serra Angel'].sort());
  });
});
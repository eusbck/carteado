import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const MG = 'Majestic Genesis';
const FLORESTAS = Array(8).fill('Forest');

describe(MG, () => {
  it('X é o maior valor de mana entre os seus comandantes no campo ou na zona de comando, mesmo controlado por outro', () => {
    // Kinnan (valor 2) na zona de comando: revela 2
    const tg = setup({
      battlefield: [FLORESTAS, []], command: [[{ name: 'Kinnan, Bonder Prodigy', commander: true }], []], hand: [[MG], []],
      library: [['Sol Ring', 'Demonic Tutor', 'Elvish Mystic'], []],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('cartas de permanente')) return null;
      oferecidas = d.items.map((i) => i.label);
      return { kind: 'select', ids: d.items.map((i) => i.id) };
    });
    tg.cast(MG).resolve();
    expect(oferecidas).toEqual(['Sol Ring']);
    expect(tg.find('Sol Ring', 'battlefield', 0)).not.toBeNull();
    // o resto (Demonic Tutor) vai para o fundo; Elvish Mystic não foi revelada
    expect(tg.names(0, 'library')).toEqual(['Elvish Mystic', 'Demonic Tutor']);
  });
});

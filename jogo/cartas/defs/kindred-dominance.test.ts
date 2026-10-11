import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Kindred Dominance';
const pantanos = Array(7).fill('Swamp');

describe(N, () => {
  it('destrói todas as criaturas que não são do tipo escolhido na resolução', () => {
    // Elvish Mystic é Elf Druid; Silver Myr é Myr; Indomitable Ancients é Treefolk Warrior
    const tg = setup({ battlefield: [[...pantanos, 'Elvish Mystic', 'Silver Myr'], ['Indomitable Ancients', 'Elvish Mystic']], hand: [[N], []] });
    tg.choose('tipo de criatura', ['Elf']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n !== 'Swamp')).toEqual(['Elvish Mystic']);
    expect(tg.names(1, 'battlefield')).toEqual(['Elvish Mystic']);
  });

  it('a criatura de dois tipos sobrevive se um deles for o escolhido', () => {
    const tg = setup({ battlefield: [[...pantanos, 'Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('tipo de criatura', ['Druid']).cast(N).resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

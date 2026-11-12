import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Victimize';

describe(NOME, () => {
  it('sacrifica uma criatura e devolve as duas cartas viradas', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], hand: [[NOME], []], graveyard: [['Indomitable Ancients', 'Burnished Hart'], []] });
    tg.choose('alvo', ['Indomitable Ancients', 'Burnished Hart']);
    tg.cast(NOME).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens', NOME]);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Burnished Hart')].tapped).toBe(true);
  });

  it('com um alvo que saiu do cemitério, ainda sacrifica e devolve o outro', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], hand: [[NOME], []], graveyard: [['Indomitable Ancients', 'Burnished Hart'], []] });
    tg.choose('alvo', ['Indomitable Ancients', 'Burnished Hart']);
    tg.cast(NOME);
    const hart = tg.find('Burnished Hart', 'graveyard')!;
    tg.state.zones.graveyard[0] = tg.state.zones.graveyard[0].filter((x) => x !== hart);
    tg.state.objects[hart].zone = 'exile';
    tg.state.zones.exile.push(hart);
    tg.g.bump();
    tg.refresh();
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Wall of Omens');
  });

  it('sem criatura para sacrificar, nada volta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [['Indomitable Ancients', 'Burnished Hart'], []] });
    tg.choose('alvo', ['Indomitable Ancients', 'Burnished Hart']);
    tg.cast(NOME).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { isOutlaw, untilEndOfTurn } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shoot the Sheriff';
describe(N, () => {
  it('destrói uma criatura que não seja fora da lei', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });
  it('um Mercenary também é fora da lei e não pode ser alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Cloud, Midgar Mercenary']], hand: [[N], []] });
    expect(isOutlaw(tg.g, tg.bf('Cloud, Midgar Mercenary'))).toBe(true);
    expect(tg.canCast(N)).toBe(false);
  });
  it('polimorfo impede que a criatura seja alvo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Mothdust Changeling']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
  });
  it('CR 608.2b: se o alvo vira fora da lei, não é destruído', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    const id = tg.bf('Indomitable Ancients');
    tg.cast(N);
    untilEndOfTurn({ g: tg.g, you: 1, source: id }, [id], [{ k: 'addTypes', subtypes: ['Rogue'] }]);
    tg.refresh();
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBe(id);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});

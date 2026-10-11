import { describe, expect, it } from 'vitest';
import { destroy, isRingBearer } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as artefatos } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Sauron, Lord of the Rings';

describe(N, () => {
  it('ao ser conjurado, reúne Orcs 5, moi cinco cartas e devolve uma criatura do seu cemitério, que já podia estar lá', () => {
    const tg = setup({
      battlefield: [[...Array(4).fill('Island'), 'Swamp', 'Swamp', 'Mountain', 'Mountain'], []], hand: [[N], []],
      graveyard: [['Knollspine Dragon'], []], library: [[...Array(5).fill('Island'), 'Swamp'], []],
    });
    tg.choose('oponente alvo', ['Bruno']).yes('Knollspine Dragon', false);
    tg.cast(N);
    // o gatilho de conjuração resolve antes de Sauron
    tg.resolve();
    expect(tg.pt(tg.bf('Orc Army'))).toEqual([5, 5]);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
    expect(tg.find('Knollspine Dragon')).not.toBeNull();
    expect(tg.find(N)).toBeNull();
    tg.resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([9, 9]);
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
  });

  it('quando morre um comandante de um oponente, o Anel tenta você', () => {
    const tg = artefatos({ battlefield: [[N], ['Elvish Mystic', 'Silver Myr']] });
    const elfo = tg.bf('Elvish Mystic');
    tg.state.cards[tg.state.objects[elfo].card!].isCommander = true;
    tg.refresh();
    // criatura que não é comandante não dispara
    tg.run(destroy(tg.g, [tg.bf('Silver Myr')]));
    tg.resolveAll();
    expect(isRingBearer(tg.g, tg.bf(N))).toBe(false);
    tg.run(destroy(tg.g, [elfo]));
    tg.resolveAll();
    expect(isRingBearer(tg.g, tg.bf(N))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';

const NOME = 'Tragic Slip';

describe(NOME, () => {
  it('sem morte no turno: a criatura alvo recebe -1/-1 até o fim do turno', () => {
    const tg = setup({ battlefield: [['Swamp'], ['Indomitable Ancients']], hand: [[NOME], []], library: [['Island'], ['Island']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.pt(a)).toEqual([1, 9]);
    tg.passTo('upkeep', 1);
    expect(tg.pt(a)).toEqual([2, 10]);
  });

  it('mórbido: se uma criatura (de qualquer jogador, até ficha) morreu neste turno, recebe -13/-13', () => {
    const tg = setup({ battlefield: [['Swamp', { name: 'Zombie 2/2', token: true }], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.run(destroy(tg.g, [tg.bf('Zombie')]));
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
  });

  it('mórbido é checado na resolução: a criatura que morre em resposta conta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Viscera Seer'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(NOME);
    tg.run(destroy(tg.g, [tg.bf('Viscera Seer')]));
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

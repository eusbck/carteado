import { describe, expect, it } from 'vitest';
import { controllerOf, gainControl } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Alicia Masters, Skilled Sculptor';

describe(N, () => {
  it('no início do combate, cria um Treasure se você conjurou uma mágica que não é de criatura neste turno', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([0, 4]);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(tg.all('Treasure')).toHaveLength(1);
    const sem = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []] });
    sem.cast('Elvish Mystic').resolveAll();
    sem.passTo('declareAttackers');
    expect(sem.all('Treasure')).toHaveLength(0);
  });

  it('na sua etapa final, cada jogador recupera o controle das criaturas de que é dono', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic'], ['Indomitable Ancients']] });
    // você roubou a criatura dele e ele roubou a sua
    gainControl(tg.g, tg.find('Indomitable Ancients')!, 0, { kind: 'permanent' }, tg.bf(N));
    gainControl(tg.g, tg.find('Elvish Mystic')!, 1, { kind: 'permanent' }, tg.bf(N));
    tg.refresh();
    const anciao = tg.find('Indomitable Ancients')!;
    const elfo = tg.find('Elvish Mystic')!;
    expect([controllerOf(tg.g, anciao), controllerOf(tg.g, elfo)]).toEqual([0, 1]);
    tg.passTo('upkeep', 1);
    expect([controllerOf(tg.g, anciao), controllerOf(tg.g, elfo)]).toEqual([1, 0]);
  });
});

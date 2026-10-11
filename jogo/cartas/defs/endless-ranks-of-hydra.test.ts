import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Endless Ranks of HYDRA';

describe(N, () => {
  it('cria um Villain 2/1 com ameaçar para cada oponente', () => {
    const tg = setup({ players: 3, battlefield: [[...Array(4).fill('Swamp')], [], []], hand: [[N], [], []] });
    tg.cast(N).resolveAll();
    expect(tg.all('Villain')).toHaveLength(2);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });

  it('do cemitério: quando o seu comandante ataca, pagando {1}{B} ela volta para a mão', () => {
    const tg = setup({ battlefield: [['The Frightful Four', 'Elvish Mystic', 'Swamp', 'Swamp'], []], graveyard: [[N], []] });
    const cmd = tg.bf('The Frightful Four');
    tg.state.cards[tg.state.objects[cmd].card!].isCommander = true;
    tg.refresh();
    tg.yes('Pagar', true);
    tg.attack([['The Frightful Four', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'hand')).toEqual([N]);
  });

  it('criatura que não é o comandante não dispara; na mão, a habilidade não funciona', () => {
    const tg = setup({ battlefield: [['The Frightful Four', 'Elvish Mystic', 'Swamp', 'Swamp'], []], graveyard: [[N], []] });
    const cmd = tg.bf('The Frightful Four');
    tg.state.cards[tg.state.objects[cmd].card!].isCommander = true;
    tg.refresh();
    tg.yes('Pagar', true);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2', 0);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});

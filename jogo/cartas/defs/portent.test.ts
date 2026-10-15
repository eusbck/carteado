import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Portent', () => {
  it('reordena as três do topo do grimório do jogador alvo e compra uma carta na manutenção seguinte', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Portent'], []], library: [['Island', 'Island', 'Island', 'Island'], ['Forest', 'Swamp', 'Plains', 'Mountain']] });
    tg.choose('jogador alvo', ['Bruno']).choose('Portent: ponha as cartas', ['Plains', 'Forest', 'Swamp']).yes('embaralhar', false);
    tg.cast('Portent').resolve();
    expect(tg.names(1, 'library')).toEqual(['Plains', 'Forest', 'Swamp', 'Mountain']);
    expect(tg.names(0, 'hand')).toEqual([]);
    // na manutenção de Bruno, Ana compra uma carta
    tg.passTo('upkeep', 1);
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('com menos de três cartas no grimório, reordena o que houver e ninguém perde', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [['Portent'], []], library: [['Island', 'Island'], ['Forest', 'Swamp']] });
    tg.choose('jogador alvo', ['Bruno']).choose('Portent: ponha as cartas', ['Swamp', 'Forest']).yes('embaralhar', false);
    tg.cast('Portent').resolve();
    expect(tg.names(1, 'library')).toEqual(['Swamp', 'Forest']);
    expect(tg.state.gameOver).toBeFalsy();
  });
});

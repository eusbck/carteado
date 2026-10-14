import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Fallen Shinobi';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('entra pelo ninjutsu atacando o mesmo jogador', () => {
    const tg = setup({ players: 3, battlefield: [['Slither Blade', 'Island', 'Island', 'Swamp', 'Swamp'], [], []], hand: [[N], []] });
    tg.attack([['Slither Blade', 2]]).passTo('declareBlockers');
    tg.activate(N, 'Ninjutsu').resolveAll();
    const id = tg.bf(N);
    const atk = tg.state.combat!.attackers.find((a) => a.id === id && !a.removed)!;
    expect(atk.target).toEqual({ kind: 'player', id: 2 });
    expect(tg.find('Slither Blade', 'hand', 0)).not.toBeNull();
  });

  it('conjura de graça uma das cartas exiladas no mesmo turno; a outra continua exilada no turno seguinte', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Prismatic Lens', 'Baleful Strix', ...ilhas]] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
    const lente = tg.find('Prismatic Lens', 'exile')!;
    const strix = tg.find('Baleful Strix', 'exile')!;
    // sem terrenos: só de graça
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(lente)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Prismatic Lens')].controller).toBe(0);
    tg.passTo('main1', 1);
    expect(tg.state.objects[strix].zone).toBe('exile');
    tg.passTo('main1', 0);
    expect(tg.actionIds().some((a) => a.split(':').includes(String(strix)))).toBe(false);
  });
});

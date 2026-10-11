import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Halo Fountain';
const virada = (name: string) => ({ name, tapped: true });

describe(N, () => {
  it('{W}, {T}, desvire uma criatura virada: cria um Citizen 1/1 verde e branco', () => {
    const tg = setup({ battlefield: [[N, 'Plains', virada('Silver Myr')], []] });
    tg.activate(N, 'Citizen').resolveAll();
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(false);
    expect(tg.pt(tg.bf('Citizen'))).toEqual([1, 1]);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });

  it('{W}{W}, {T}, desvire duas criaturas viradas: compra uma carta; sem criaturas viradas bastantes, não pode', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', virada('Silver Myr'), virada('Elvish Mystic')], []], library: [['Island'], []] });
    tg.activate(N, 'Compre uma carta').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    const sem = setup({ battlefield: [[N, 'Plains', 'Plains', virada('Silver Myr'), 'Elvish Mystic'], []] });
    expect(sem.actionIds().filter((a) => a.startsWith('act:'))).toHaveLength(1);
  });

  it('{W}{W}{W}{W}{W}, {T}, desvire quinze criaturas viradas: você vence o jogo', () => {
    const fichas = Array.from({ length: 15 }, () => ({ name: 'Citizen', token: true, tapped: true }));
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Plains'), ...fichas], []] });
    tg.activate(N, 'vence o jogo').resolveAll();
    expect(tg.state.gameOver?.winners).toEqual([0]);
  });
});
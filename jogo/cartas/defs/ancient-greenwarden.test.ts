import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ancient Greenwarden';
const clues = (tg: ReturnType<typeof setup>) => tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Clue').length;

describe(N, () => {
  it('você joga um terreno do seu cemitério, como a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Island'], []], graveyard: [['Forest'], []] });
    const floresta = tg.find('Forest', 'graveyard')!;
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(floresta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.find('Forest')).not.toBeNull();
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('com um terreno entrando, a aterragem de outra permanente sua e o gatilho do próprio terreno disparam duas vezes', () => {
    const tg = setup({ battlefield: [[N, 'Tireless Tracker'], []], hand: [['Jungle Hollow'], []] });
    tg.play('Jungle Hollow').resolveAll();
    expect(clues(tg)).toBe(2);
    expect(tg.life(0)).toBe(42);
  });

  it('com duas Ancient Greenwarden, a aterragem dispara três vezes', () => {
    const tg = setup({ battlefield: [[N, N, 'Tireless Tracker'], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(clues(tg)).toBe(3);
  });

  it('gatilhos que não vêm de um terreno entrando não dobram', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Satyr Wayfinder'], []], library: [['Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring', 'Sol Ring'], []] });
    tg.cast('Satyr Wayfinder').resolveAll();
    expect(tg.names(0, 'graveyard').length).toBe(4);
  });
});

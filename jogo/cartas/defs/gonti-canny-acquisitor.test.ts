import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Gonti, Canny Acquisitor';
const ilhas = Array(8).fill('Island');
const acaoDe = (tg: ReturnType<typeof setup>, carta: number, tipo: 'cast' | 'play') =>
  tg.actionIds().find((a) => a.startsWith(`${tipo}:`) && a.split(':').includes(String(carta)));

describe(N, () => {
  it('você joga a carta exilada com mana de qualquer tipo, mesmo depois de Gonti sair do campo', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [ilhas, ['Elvish Mystic', ...ilhas]] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(35);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    removeCard(tg, tg.bf(N));
    tg.refresh();
    tg.answer({ kind: 'priority', action: acaoDe(tg, carta, 'cast')! });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('as mágicas que você conjura mas não possui custam {1} a menos', () => {
    // Prismatic Lens ({2}) com uma Island só: precisa da redução
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [ilhas, ['Prismatic Lens', ...ilhas]], hand: [['Baleful Strix'], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    // a sua própria mágica não fica mais barata
    expect(tg.canCast('Baleful Strix')).toBe(false);
    tg.answer({ kind: 'priority', action: acaoDe(tg, carta, 'cast')! });
    tg.resolveAll();
    expect(tg.find('Prismatic Lens')).not.toBeNull();
  });

  it('um terreno exilado assim se joga como a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Swamp', ...ilhas]], hand: [['Forest'], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    tg.answer({ kind: 'priority', action: acaoDe(tg, carta, 'play')! });
    tg.settle();
    expect(tg.state.objects[tg.bf('Swamp')].controller).toBe(0);
    // já usou a jogada de terreno do turno
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });
});

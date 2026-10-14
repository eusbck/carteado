import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Nashi, Moon Sage's Scion";
const ilhas = Array(8).fill('Island');
const acoesDe = (tg: ReturnType<typeof setup>, carta: number) => tg.actionIds().filter((a) => a.split(':').includes(String(carta)));

describe(N, () => {
  it('conjura uma das cartas pagando vida igual ao valor de mana; depois, as outras não podem mais ser jogadas', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Baleful Strix', ...ilhas], ['Prismatic Lens', ...ilhas]] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.life(1)).toBe(37);
    const lente = tg.find('Prismatic Lens', 'exile')!;
    const strix = tg.find('Baleful Strix', 'exile')!;
    expect(lente).not.toBeNull();
    expect(strix).not.toBeNull();
    const acao = acoesDe(tg, lente).find((a) => a.startsWith('cast:'))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Prismatic Lens')].controller).toBe(0);
    // pagou 2 de vida (valor de mana da Lens)
    expect(tg.life(0)).toBe(38);
    expect(acoesDe(tg, strix)).toEqual([]);
  });

  it('um terreno exilado assim se joga como a jogada de terreno do turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Swamp', ...ilhas]], hand: [['Forest'], []] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const pantano = tg.find('Swamp', 'exile')!;
    expect(acoesDe(tg, pantano).some((a) => a.startsWith('play:'))).toBe(true);
    tg.play('Forest');
    expect(acoesDe(tg, pantano)).toEqual([]);
  });
});

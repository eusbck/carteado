import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sage of the Beyond';
const ilhas = (n: number) => Array(n).fill('Island');

describe(N, () => {
  it('uma mágica conjurada do cemitério custa {2} a menos; da mão, não', () => {
    // Faithless Looting: retrospectiva {2}{R} vira {R}; Kodama's Reach ({2}{G}) da mão continua custando 3
    const tg = setup({ battlefield: [[N, 'Mountain', 'Forest'], []], graveyard: [['Faithless Looting'], []], hand: [["Kodama's Reach"], []] });
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
    expect(tg.canCast("Kodama's Reach")).toBe(false);
    tg.cast('Faithless Looting', 'flashback').resolve();
    expect(tg.find('Faithless Looting', 'exile')).not.toBeNull();
  });

  it('a redução não paga mana colorida', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], graveyard: [['Faithless Looting'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.endsWith(':flashback'))).toBe(false);
  });

  it('a carta predita só pode ser conjurada depois do turno em que foi predita, pelo custo de predizer', () => {
    const tg = setup({ battlefield: [[...ilhas(7)], []], hand: [[N], []] });
    const naMao = tg.find(N, 'hand', 0)!;
    tg.answer({ kind: 'priority', action: `foretell:${naMao}` });
    tg.settle();
    const ex = tg.find(N, 'exile')!;
    expect(tg.state.objects[ex].faceDown).toBe(true);
    expect(tg.state.objects[ex].visibleTo).toEqual([0]);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(2);
    // no mesmo turno, não dá para conjurar
    expect(tg.actionIds().some((a) => a.startsWith('cast:') && a.split(':').includes(String(ex)))).toBe(false);
    tg.passTo('main1', 1).passTo('main1', 0);
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(ex)) && a.endsWith(':foretell'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolveAll();
    expect(tg.find(N)).not.toBeNull();
    // {4}{U}: cinco das sete Islands
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Island' && tg.state.objects[id].tapped)).toHaveLength(5);
  });
});

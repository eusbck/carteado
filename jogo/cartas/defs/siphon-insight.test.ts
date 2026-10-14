import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Siphon Insight';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('exila uma das duas virada para baixo (só você vê) e põe a outra no fundo', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Island'], []], hand: [[N], []], library: [ilhas, ['Elvish Mystic', 'Sol Ring', ...ilhas]] });
    tg.choose('Siphon Insight: escolha a carta', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    expect(tg.names(1, 'library').at(-1)).toBe('Sol Ring');
    // Elvish Mystic ({G}) com a Island que sobrou
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('um terreno exilado assim pode ser jogado', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], hand: [[N], []], library: [ilhas, ['Swamp', 'Sol Ring', ...ilhas]] });
    tg.choose('Siphon Insight: escolha a carta', ['Swamp']);
    tg.cast(N).resolveAll();
    const carta = tg.state.zones.exile[0];
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.state.objects[tg.bf('Swamp', 0)].controller).toBe(0);
  });

  it('pela retrospectiva, a carta é exilada depois de resolver', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp', 'Island'], []], graveyard: [[N], []], library: [ilhas, ['Elvish Mystic', 'Sol Ring', ...ilhas]] });
    tg.choose('Siphon Insight: escolha a carta', ['Sol Ring']);
    tg.cast(N, 'flashback').resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});

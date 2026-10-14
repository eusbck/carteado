import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Gonti, Lord of Luxury';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('você conjura a carta exilada com mana de qualquer tipo, mesmo depois de Gonti sair do campo', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Island'], []], hand: [[N], []],
      library: [ilhas, ['Swamp', 'Elvish Mystic', 'Sol Ring', 'Forest', ...ilhas]],
    });
    tg.choose('Gonti: escolha a carta', ['Elvish Mystic']);
    tg.cast(N).resolveAll();
    expect(hasKw(tg.g, tg.bf(N), 'deathtouch')).toBe(true);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    // as outras três vão para o fundo
    const lib = tg.names(1, 'library');
    expect(lib.slice(0, 8)).toEqual(ilhas);
    expect(lib.slice(-3).sort()).toEqual(['Forest', 'Sol Ring', 'Swamp']);
    removeCard(tg, tg.bf(N));
    tg.refresh();
    // só a Island desvirada sobrou: Elvish Mystic ({G}) com mana de qualquer tipo
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('um terreno exilado assim não pode ser jogado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [ilhas, ['Forest', ...ilhas]] });
    tg.choose('Gonti: escolha a carta', ['Forest']);
    tg.cast(N).resolveAll();
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Forest');
    expect(tg.actionIds().some((a) => a.split(':').includes(String(carta)))).toBe(false);
  });
});

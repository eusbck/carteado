import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Thief of Sanity';
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('você conjura a carta exilada com mana de qualquer tipo, mesmo depois de Thief of Sanity sair do campo', () => {
    // Elvish Mystic custa {G}: com uma Island só dá porque qualquer tipo de mana serve
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [ilhas, ['Swamp', 'Elvish Mystic', 'Sol Ring', ...ilhas]] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    tg.choose('Thief of Sanity', ['Elvish Mystic']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    expect(tg.state.objects[carta].visibleTo).toEqual([0]);
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Sol Ring', 'Swamp']);
    expect(tg.names(1, 'library')).toHaveLength(8);
    removeCard(tg, id);
    tg.refresh();
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('um terreno exilado assim não pode ser jogado', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Swamp', ...ilhas]] });
    tg.choose('Thief of Sanity', ['Swamp']);
    tg.attack([[N, 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Swamp');
    expect(tg.actionIds().some((a) => a.split(':').includes(String(carta)))).toBe(false);
  });
});

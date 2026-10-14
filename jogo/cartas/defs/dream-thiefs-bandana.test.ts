import { describe, expect, it } from 'vitest';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = "Dream-Thief's Bandana";
const ilhas = Array(8).fill('Island');

describe(N, () => {
  it('você joga a carta exilada com mana de qualquer tipo, mesmo depois de a Bandana sair do campo', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', 'Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [ilhas, ['Elvish Mystic', ...ilhas]] });
    // conjura e equipa (equipar {1})
    tg.cast(N).resolveAll();
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate(N, 'Equipar').resolveAll();
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBe(tg.bf('Indomitable Ancients'));
    tg.attack([['Indomitable Ancients', 1]]).passTo('main2', 0);
    const carta = tg.state.zones.exile[0];
    expect(tg.state.objects[carta].def).toBe('Elvish Mystic');
    expect(tg.state.objects[carta].faceDown).toBe(true);
    removeCard(tg, tg.bf(N));
    tg.refresh();
    // sobrou uma Island: Elvish Mystic ({G}) com mana de qualquer tipo
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('sem a criatura equipada causar dano, nada é exilado', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients', { name: N, attachTo: 'Indomitable Ancients' }, 'Baleful Strix'], []] });
    tg.attack([['Baleful Strix', 1]]).passTo('main2', 0);
    expect(tg.state.zones.exile).toEqual([]);
  });
});

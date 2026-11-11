import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Augur of Autumn';

describe(N, () => {
  it('joga um terreno do topo do grimório como a jogada do turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Forest', 'Island'], []] });
    const topo = tg.state.zones.library[0][0];
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(topo)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.find('Forest')).not.toBeNull();
    // a Island agora no topo não pode ser jogada: a jogada do turno já foi
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(false);
  });

  it('com três criaturas de forças diferentes, conjura a criatura do topo; com duas forças iguais, não', () => {
    // Augur 2, Elvish Mystic 1, Indomitable Ancients 2: só duas forças diferentes
    const sem = setup({ battlefield: [[N, 'Elvish Mystic', 'Indomitable Ancients', 'Forest'], []], library: [['Elvish Mystic'], []] });
    const topoSem = sem.state.zones.library[0][0];
    expect(sem.actionIds().some((a) => a.startsWith('cast:') && a.split(':').includes(String(topoSem)))).toBe(false);

    // Augur 2, Elvish Mystic 1, Wall of Omens 0
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', 'Wall of Omens', 'Forest'], []], library: [['Elvish Mystic'], []] });
    const topo = tg.state.zones.library[0][0];
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(topo)))!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    tg.resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Elvish Mystic').length).toBe(2);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Imposing Grandeur';
const lib = Array(10).fill('Swamp');

describe(N, () => {
  it('cada jogador pode descartar a mão e comprar cartas iguais ao maior valor de mana de um comandante dele no campo ou na zona de comando', () => {
    // você: Timothar ({4}{B}{B}, valor 6) como comandante no campo; o oponente recusa
    const tg = setup({ battlefield: [[...Array(5).fill('Mountain'), 'Timothar, Baron of Bats'], ['Elvish Mystic']], hand: [[N, 'Hex', 'Hex'], ['Hex']], library: [lib, lib] });
    const cmd = tg.bf('Timothar, Baron of Bats');
    const carta = tg.state.objects[cmd].card!;
    tg.state.cards[carta].isCommander = true;
    tg.state.players[0].commanders = [carta];
    tg.refresh();
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Imposing Grandeur') ? { kind: 'select', ids: [d.player === 0 ? 'yes' : 'no'] } : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Imposing Grandeur') ? { kind: 'select', ids: [d.player === 0 ? 'yes' : 'no'] } : null));
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(6);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Hex', 'Hex', N].sort());
    expect(tg.names(1, 'hand')).toEqual(['Hex']);
  });
});

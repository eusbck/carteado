import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Leadership Vacuum';
const lib = Array(8).fill('Island');

describe(N, () => {
  it('o jogador alvo devolve cada comandante que controla para a zona de comando, e você compra uma carta', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Elvish Mystic', 'Silver Myr']], hand: [[N], []], library: [lib, lib] });
    const elfo = tg.bf('Elvish Mystic');
    tg.state.cards[tg.state.objects[elfo].card!].isCommander = true;
    tg.refresh();
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
    expect(tg.state.zones.command.map((id) => tg.state.objects[id].def)).toContain('Elvish Mystic');
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('sem comandante no campo do jogador, você compra a carta mesmo assim', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Silver Myr']], hand: [[N], []], library: [lib, lib] });
    tg.choose('jogador alvo', ['Bruno']).cast(N).resolveAll();
    expect(tg.names(1, 'battlefield')).toEqual(['Silver Myr']);
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });
});

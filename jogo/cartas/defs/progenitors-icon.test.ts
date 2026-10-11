import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = "Progenitor's Icon";
const lib = Array(8).fill('Swamp');

describe(N, () => {
  it('{T}: adiciona uma mana de qualquer cor', () => {
    const tg = setup({ battlefield: [[N], []] });
    activateMana(tg, N, 'U');
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['U']);
  });

  it('a próxima mágica do tipo escolhido pode ser conjurada como se tivesse lampejo, só a próxima', () => {
    // no turno do oponente: Elvish Mystic (Elf) não poderia ser conjurado
    const tg = setup({ active: 1, battlefield: [[N, 'Forest', 'Forest'], []], hand: [['Elvish Mystic', 'Elvish Mystic'], []], library: [lib, lib] });
    tg.state.objects[tg.bf(N)].choices.creatureType = 'Elf';
    tg.pass(); // o oponente passa: a prioridade é sua, no turno dele
    expect(tg.canCast('Elvish Mystic')).toBe(false);
    tg.activate(N, 'A próxima mágica').resolveAll();
    tg.pass(); // depois da resolução a prioridade volta ao jogador ativo; ele passa de novo
    expect(tg.canCast('Elvish Mystic')).toBe(true);
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.all('Elvish Mystic')).toHaveLength(1);
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });

  it('sem tipo escolhido, a última habilidade não faz nada', () => {
    const tg = setup({ active: 1, battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [lib, lib] });
    tg.pass(); // o oponente passa: a prioridade é sua, no turno dele
    tg.activate(N, 'A próxima mágica').resolveAll();
    tg.pass(); // depois da resolução a prioridade volta ao jogador ativo; ele passa de novo
    expect(tg.canCast('Elvish Mystic')).toBe(false);
  });
});

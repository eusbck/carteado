import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = "Bolas's Citadel";

describe(NOME, () => {
  it('conjura a mágica do topo do grimório pagando vida igual ao valor de mana', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Indomitable Ancients', 'Island'], []] });
    const carta = tg.find('Indomitable Ancients', 'library')!;
    const acao = tg.actionIds().find((a) => a.startsWith('cast:') && a.split(':').includes(String(carta)));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.life(0)).toBe(36);
  });

  it('joga o terreno do topo do grimório como a jogada do turno', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Swamp', 'Island'], []] });
    const carta = tg.find('Swamp', 'library')!;
    const acao = tg.actionIds().find((a) => a.startsWith('play:') && a.split(':').includes(String(carta)));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.find('Swamp')).not.toBeNull();
    expect(tg.life(0)).toBe(40);
  });

  it('sacrificando dez permanentes, inclusive a Citadel, cada oponente perde 10 de vida', () => {
    const tg = setup({ players: 3, battlefield: [[NOME, ...Array(9).fill('Sol Ring')], [], []] });
    tg.choose('Sacrifique', [NOME, ...Array(9).fill('Sol Ring')]);
    tg.activate(NOME).resolve();
    expect(tg.life(1)).toBe(30);
    expect(tg.life(2)).toBe(30);
    expect(tg.find(NOME)).toBeNull();
  });
});

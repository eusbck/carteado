import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Ancient Tomb';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['CC']));
  it('CR 120.3a: ao virar para mana, causa 2 de dano a você, sem usar a pilha', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'))!;
    tg.answer({ kind: 'priority', action: acao });
    expect(tg.life(0)).toBe(38);
    expect(tg.state.zones.stack).toEqual([]);
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['C', 'C']);
  });
  it('paga sozinho um custo de {2} (Sol Ring) e causa o dano', () => {
    const tg = setup({ battlefield: [[NOME], []], hand: [['Sol Ring'], []] });
    tg.cast('Sol Ring').resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.life(0)).toBe(38);
  });
});

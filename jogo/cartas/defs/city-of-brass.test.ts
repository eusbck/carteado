import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { tap } from '../../motor/api.ts';

const NOME = 'City of Brass';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B', 'G', 'R', 'U', 'W']));
  it('virar para mana dispara o gatilho, que causa 1 de dano a você ao resolver', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    const acao = tg.actionIds().find((a) => a.startsWith('mana:'))!;
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(1);
    expect(tg.life(0)).toBe(40);
    tg.resolve();
    expect(tg.life(0)).toBe(39);
  });
  it('CR 603.2e: dispara também quando é virado por um efeito', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tap(tg.g, tg.bf(NOME));
    tg.refresh().settle();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.life(0)).toBe(39);
  });
  it('pode responder ao gatilho usando a mana: a mágica resolve antes do dano', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []], hand: [['Swords to Plowshares'], []] });
    const d = tg.pending!;
    const acao = (d.kind === 'priority' ? d.actions : []).find((a) => a.id.startsWith('mana:') && a.label.includes('{W}'))!.id;
    tg.answer({ kind: 'priority', action: acao });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((m) => m.type)).toEqual(['W']);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    expect(tg.state.zones.stack.length).toBe(2);
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull(); // a mágica resolveu primeiro
    expect(tg.life(0)).toBe(42); // ganhou 2 (Swords) e ainda não levou o dano
    tg.resolve();
    expect(tg.life(0)).toBe(41);
  });
  it('virado para pagar uma mágica, o gatilho vai para a pilha acima dela e resolve primeiro', () => {
    const tg = setup({ battlefield: [[NOME, 'Indomitable Ancients'], []], hand: [['Swords to Plowshares'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Swords to Plowshares');
    const pilha = tg.state.zones.stack;
    expect(pilha.length).toBe(2);
    expect(tg.state.objects[pilha[0]].def).toBe('Swords to Plowshares');
    tg.resolve();
    expect(tg.life(0)).toBe(39);
    expect(tg.find('Indomitable Ancients')).not.toBeNull(); // a mágica ainda espera
    tg.resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

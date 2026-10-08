import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Rousing Refrain', () => {
  it('suspender é ação especial que não usa a pilha; ao sair o último marcador, pode conjurar sem pagar, ignorando o tempo', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], []], hand: [['Rousing Refrain'], ['Plains', 'Plains', 'Island']], library: [Array(6).fill('Island'), Array(6).fill('Island')] });
    const acao = tg.actionIds().find((a) => a.startsWith('suspend:'));
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(0);
    const ex = tg.state.zones.exile[0];
    expect(tg.state.objects[ex].counters.time).toBe(3);
    // três manutenções suas depois, conjura de graça
    tg.choose('oponente alvo', ['Bruno']).yes('Conjurar Rousing Refrain');
    for (let i = 0; i < 3; i++) tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep' && x.state.zones.stack.length > 0).resolveAll();
    expect(tg.state.players[0].manaPool.filter((m) => m.type === 'R').length).toBe(6); // 3 cartas iniciais + 3 compras de Bruno
    const de_novo = tg.state.zones.exile[0];
    expect(tg.state.objects[de_novo].counters.time).toBe(3);
    tg.passTo('draw');
    expect(tg.state.players[0].manaPool.length).toBe(6); // não esvazia entre etapas
  });
});

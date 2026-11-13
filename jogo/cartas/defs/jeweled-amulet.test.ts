import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Jeweled Amulet';

describe(NOME, () => {
  it('marcador posto por outro efeito, sem tipo anotado, não produz mana; anotado, produz esse tipo', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { charge: 1 } }], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(false);

    const tg2 = setup({ battlefield: [[NOME, 'Swamp'], []] });
    tg2.activate(NOME).resolve();
    const id = tg2.bf(NOME);
    expect(tg2.state.objects[id].counters.charge).toBe(1);
    expect(tg2.state.objects[id].data.tipoAnotado).toBe('B');
    // com marcador, a primeira habilidade não pode ser ativada
    expect(tg2.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
    tg2.state.objects[id].tapped = false;
    tg2.refresh();
    const acao = tg2.actionIds().find((a) => a.startsWith('mana:') && a.includes(`${id}|`));
    tg2.answer({ kind: 'priority', action: acao! });
    tg2.settle();
    expect(tg2.state.players[0].manaPool.map((m) => m.type)).toEqual(['B']);
    expect(tg2.state.objects[tg2.bf(NOME)].counters.charge ?? 0).toBe(0);
  });
});

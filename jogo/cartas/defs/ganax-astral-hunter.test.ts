import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const G = 'Ganax, Astral Hunter';

describe(G, () => {
  it('Ganax ou outro Dragon seu entrando cria um Tesouro; outras criaturas não', () => {
    const tg = setup({ battlefield: [[], []], hand: [[G, 'Dragon Whelp', 'Elvish Mystic'], ['Dragon Whelp']] });
    const entra = (nome: string, p: 0 | 1) => tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(nome, 'hand', p)!, controller: p }], 'effect'));
    entra(G, 0);
    tg.resolve();
    entra('Dragon Whelp', 0);
    tg.resolve();
    entra('Elvish Mystic', 0);
    entra('Dragon Whelp', 1);
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.names(0, 'battlefield').filter((x) => x === 'Treasure').length).toBe(2);
  });
});

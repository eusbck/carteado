import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { dealDamage } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Boros Reckoner';

describe(NOME, () => {
  it('bloqueada por uma 7/7, recebe dano letal e mesmo assim causa 7 de dano ao alvo; esse dano não é de combate', () => {
    const tg = setup({ battlefield: [[NOME], ['Indomitable Ancients']] });
    // Indomitable Ancients é 2/10: usamos dano direto de 7 para simular
    tg.choose('qualquer alvo', ['Bruno']);
    dealDamage(tg.g, [{ source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: tg.bf(NOME) }, amount: 7, combat: true }]);
    tg.refresh().resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    expect(tg.life(1)).toBe(33);
    expect(tg.state.players[1].commanderDamage).toEqual({});
  });

  it('dano de duas fontes ao mesmo tempo dispara uma vez só, com o total', () => {
    const tg = setup({ battlefield: [[NOME], ['Indomitable Ancients', 'Wall of Omens']] });
    tg.choose('qualquer alvo', ['Bruno']);
    const r = tg.bf(NOME);
    dealDamage(tg.g, [
      { source: tg.bf('Indomitable Ancients'), target: { kind: 'obj', id: r }, amount: 1, combat: false },
      { source: tg.bf('Wall of Omens'), target: { kind: 'obj', id: r }, amount: 1, combat: false },
    ]);
    tg.refresh();
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });

  it('{R/W}: ganha primeiro golpe até o fim do turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains'], []] });
    tg.activate(NOME, 'primeiro golpe').resolve();
    expect(hasKw(tg.g, tg.bf(NOME), 'first strike')).toBe(true);
  });
});

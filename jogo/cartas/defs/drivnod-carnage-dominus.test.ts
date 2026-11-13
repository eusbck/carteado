import { describe, expect, it } from 'vitest';
import { destroy, sacrifice } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Drivnod, Carnage Dominus';

describe(NOME, () => {
  it('o gatilho de "quando morre" da própria criatura dispara duas vezes', () => {
    const tg = setup({ battlefield: [[NOME, 'Venerated Stormsinger'], []] });
    tg.run(destroy(tg.g, [tg.bf('Venerated Stormsinger')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    expect(tg.life(0)).toBe(42);
  });

  it('Grave Pact dispara duas vezes quando uma criatura sua morre', () => {
    const tg = setup({ battlefield: [[NOME, 'Grave Pact', 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients', 'Burnished Hart']] });
    tg.run(destroy(tg.g, [tg.find('Wall of Omens', 'battlefield', 0)!]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toHaveLength(2);
  });

  it('cada disparo escolhe o alvo separado', () => {
    const tg = setup({ players: 3, battlefield: [[NOME, 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel', 'Wall of Omens'], [], []] });
    tg.choose('oponente alvo', ['Bruno']).choose('oponente alvo', ['Carla']);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
    expect(tg.life(2)).toBe(39);
    expect(tg.life(0)).toBe(42);
  });

  it('"sempre que você sacrifica" não dispara a mais', () => {
    const tg = setup({ battlefield: [[NOME, 'Dina, Essence Brewer', 'Wall of Omens'], []], library: [['Island', 'Island', 'Island'], []] });
    tg.run(sacrifice(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('morrendo junto com Drivnod, ainda dispara a mais', () => {
    const tg = setup({ battlefield: [[NOME, 'Grave Pact', 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients', 'Burnished Hart', 'Sol Ring']] });
    tg.run(destroy(tg.g, [tg.bf(NOME), tg.find('Wall of Omens', 'battlefield', 0)!]));
    tg.resolveAll();
    // duas criaturas suas morreram junto com Drivnod: 2 gatilhos × 2 = 4 sacrifícios (o oponente só tem 3 criaturas)
    expect(tg.names(1, 'graveyard')).toHaveLength(3);
  });
});

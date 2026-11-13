import { describe, expect, it } from 'vitest';
import { chars, destroy, gainLife, isCreature } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Enduring Tenacity';

describe(NOME, () => {
  it('ganhar vida faz o oponente alvo perder essa quantidade', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    gainLife(tg.g, 0, 3, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
  });

  it('ao morrer, volta como encantamento que não é criatura, sem tipos de criatura', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    tg.resolveAll();
    const id = tg.bf(NOME);
    expect(isCreature(tg.g, id)).toBe(false);
    expect(chars(tg.g, id).types).toEqual(['Enchantment']);
    expect(chars(tg.g, id).subtypes).toEqual([]);
    // continua com a primeira habilidade
    gainLife(tg.g, 0, 2, null);
    tg.refresh();
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
    // destruída de novo, não é criatura: não volta
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.find(NOME)).toBeNull();
  });
});

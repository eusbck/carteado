import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Ruthless Technomancer';

describe(NOME, () => {
  it('sacrifica outra criatura e cria Tesouros igual à força dela', () => {
    // Indomitable Ancients é 2/10
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients'], []], hand: [[NOME], []] });
    tg.choose('Ruthless Technomancer: você pode sacrificar', ['Indomitable Ancients']).cast(NOME).resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Treasure')).toHaveLength(2);
    expect(tg.names(0, 'graveyard')).toEqual(['Indomitable Ancients']);
  });

  it('sacrifica X artefatos e devolve uma criatura com força X ou menos', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', NOME, 'Sol Ring', 'Wishclaw Talisman'], []], graveyard: [['Indomitable Ancients'], []] });
    tg.number('valor de X', 2).choose('carta de criatura alvo', ['Indomitable Ancients']).choose('Sacrifique', ['Sol Ring', 'Wishclaw Talisman']).activate(NOME).resolve();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
  });
});

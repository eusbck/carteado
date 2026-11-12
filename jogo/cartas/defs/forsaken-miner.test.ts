import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Forsaken Miner';

describe(NOME, () => {
  it('no cemitério, um crime deixa pagar {B} para voltar ao campo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []], graveyard: [[NOME], []] });
    tg.yes('Pagar {B}');
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolve();
    expect(tg.find(NOME)).not.toBeNull();
  });

  it('sacrificada no custo de uma mágica criminosa, ainda dispara', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Swamp', 'Swamp', NOME], ['Indomitable Ancients']], hand: [['Fling'], []] });
    tg.yes('Pagar {B}');
    tg.choose('Sacrifique', [NOME]).choose('alvo', ['Bruno']).cast('Fling');
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    tg.resolve();
    expect(tg.find(NOME)).not.toBeNull();
  });
});

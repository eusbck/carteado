import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Strike It Rich';

describe(NOME, () => {
  it('cria um Tesouro', () => {
    const tg = setup({ battlefield: [['Mountain'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    expect(tg.find('Treasure')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('com retrospectiva, conjura do cemitério e depois a carta é exilada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], graveyard: [[NOME], []] });
    tg.cast(NOME, 'flashback').resolve();
    expect(tg.find('Treasure')).not.toBeNull();
    expect(tg.names(0, 'exile')).toEqual([NOME]);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Remorseful Cleric', () => {
  it('sacrifique: exila o cemitério do jogador alvo (em resposta, o próprio Cleric já está no cemitério)', () => {
    const tg = setup({ battlefield: [['Remorseful Cleric'], []], graveyard: [['Island'], ['Wall of Omens', 'Plains']] });
    tg.choose('jogador alvo', ['Bruno']).activate('Remorseful Cleric').resolve();
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'exile').sort()).toEqual(['Plains', 'Wall of Omens']);
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Island', 'Remorseful Cleric']);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Shallow Grave';

describe(NOME, () => {
  it('devolve a criatura de cima do cemitério e a exila no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [['Wall of Omens', 'Zetalpa, Primal Dawn', 'Island'], []] });
    tg.cast(NOME).resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Zetalpa, Primal Dawn']);
  });
});

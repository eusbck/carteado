import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Apprentice Necromancer';

describe(NOME, () => {
  it('devolve a criatura com ímpeto e a sacrifica no início da próxima etapa final', () => {
    const tg = setup({ battlefield: [['Swamp', NOME], []], graveyard: [['Zetalpa, Primal Dawn'], []] });
    tg.choose('carta de criatura alvo', ['Zetalpa, Primal Dawn']).activate(NOME).resolve();
    const z = tg.bf('Zetalpa, Primal Dawn');
    expect(tg.g.state.objects[z]).toBeDefined();
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.find('Zetalpa, Primal Dawn')).toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual([NOME, 'Zetalpa, Primal Dawn'].sort());
  });
});

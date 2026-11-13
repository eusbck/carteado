import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Fatestitcher';

describe(NOME, () => {
  it('desvira outro permanente alvo', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Island', tapped: true }], []] });
    tg.choose('outro permanente alvo', ['Island']).choose('Fatestitcher: Island', ['Desvirar Island']).activate(NOME).resolve();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
  });

  it('desenterrar {U}: volta do cemitério com ímpeto', () => {
    const tg = setup({ battlefield: [['Island', 'Swamp'], []], graveyard: [[NOME], []] });
    tg.activate(NOME).resolve();
    expect(tg.find(NOME)).not.toBeNull();
    tg.choose('outro permanente alvo', ['Swamp']).choose('Fatestitcher: Swamp', ['Virar Swamp']).activate(NOME).resolve();
    expect(tg.state.objects[tg.bf('Swamp')].tapped).toBe(true);
  });
});

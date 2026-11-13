import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Beseech the Mirror';

describe(NOME, () => {
  it('barganhada, conjura a carta de valor 4 ou menos sem pagar; senão ela vai para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Sol Ring'], []], hand: [[NOME], []], library: [['Island', 'Wall of Omens', 'Forest'], []] });
    tg.choose('custo adicional opcional', ['Pagar: barganha (sacrifique um artefato, encantamento ou ficha)']).choose('Sacrifique', ['Sol Ring']);
    tg.choose('Procure', ['Wall of Omens']).yes('conjurar Wall of Omens', true);
    tg.cast(NOME).resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.find('Sol Ring')).toBeNull();
  });

  it('sem barganha, a carta vai para a mão', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], library: [['Island', 'Wall of Omens'], []] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('Procure', ['Wall of Omens']);
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Etali, Primal Storm';

describe(NOME, () => {
  it('ao atacar, exila o topo de cada grimório e conjura de graça a mágica de um oponente; o terreno fica no exílio', () => {
    const tg = setup({ battlefield: [[NOME], []], library: [['Island', 'Plains'], ['Wall of Omens', 'Forest']] });
    tg.choose('Etali: conjurar', ['Wall of Omens']);
    tg.choose('Etali: conjurar', ['Não conjurar mais nenhuma']);
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    // a Wall of Omens de Bruno, conjurada por Ana, entra sob o controle de Ana
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
    expect(tg.state.objects[tg.bf('Wall of Omens')].owner).toBe(1);
    expect(tg.names(0, 'exile')).toEqual(['Island']);
    // Wall of Omens: quando entra, quem a controla compra uma carta
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.state.zones.library[1].length).toBe(1);
  });
});

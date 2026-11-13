import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Takenuma, Abandoned Mire';

describe(N, () => {
  it('descartar é parte do custo: a carta vai para o cemitério ao ativar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], library: [['Hex', 'Hex', 'Hex'], []] });
    tg.activate(N, 'Canalizar');
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
  it('a carta devolvida pode ser uma das moídas agora', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], []], hand: [[N], []], graveyard: [['Wall of Omens'], []], library: [['Hex', 'Indomitable Ancients', 'Hex'], []] });
    tg.choose('Takenuma: devolva', ['Indomitable Ancients']).activate(N, 'Canalizar').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Indomitable Ancients']);
    expect(tg.find('Wall of Omens', 'graveyard')).not.toBeNull();
  });
  it('custa {1} a menos por criatura lendária sua', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Teval, the Balanced Scale', 'Zetalpa, Primal Dawn'], []], hand: [[N], []], library: [['Hex', 'Hex', 'Hex'], []] });
    tg.activate(N, 'Canalizar').resolve();
    expect(tg.names(0, 'graveyard').filter((n) => n === 'Hex').length).toBe(3);
  });
});

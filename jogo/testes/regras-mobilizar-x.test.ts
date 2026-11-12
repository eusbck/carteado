// lote4-b: Mobilizar X (CR 702.181a), com X calculado quando a habilidade resolve (ruling 1 de Avenger of the Fallen):
// `mobilize(fn, texto)` em motor/criaturas.ts.
import { describe, expect, it } from 'vitest';
import { mobilize } from '../motor/api.ts';
import { setup } from './harness.ts';

describe('CR 702.181a: Mobilizar X', () => {
  it('a forma com número continua igual; a com função guarda X como parâmetro', () => {
    expect(mobilize(2).param).toBe(2);
    expect(mobilize(() => 3, 'Mobilizar X').param).toBe('X');
  });

  it('CR 702.181a: X é contado na resolução; com X = 0, nenhuma ficha', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Avenger of the Fallen'], []], library: [['Island'], ['Island']] });
    tg.attack([['Avenger of the Fallen', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.all('Warrior')).toHaveLength(0);
  });

  it('CR 702.181a: as fichas entram viradas e atacando e são sacrificadas no início da próxima etapa final', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Avenger of the Fallen'], []], graveyard: [['Wall of Omens'], []], library: [['Island'], ['Island']] });
    tg.attack([['Avenger of the Fallen', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    const [ficha] = tg.all('Warrior');
    expect(tg.state.combat?.attackers.some((a) => a.id === ficha)).toBe(true);
    tg.passTo('end');
    tg.resolveAll();
    expect(tg.all('Warrior')).toHaveLength(0);
  });
});

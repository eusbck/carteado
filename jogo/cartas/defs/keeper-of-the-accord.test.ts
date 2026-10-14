import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Keeper of the Accord';

describe(NOME, () => {
  it('na etapa final de Bruno, com mais criaturas e mais terrenos que você: cria um Soldier e busca uma Plains virada', () => {
    const tg = setup({
      active: 1, step: 'main2',
      battlefield: [[NOME], ['Indomitable Ancients', 'Wall of Omens', 'Forest']],
      library: [['Plains', 'Island'], []],
    });
    tg.yes('Keeper of the Accord', true);
    tg.choose('Plains', ['Plains']);
    tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length === 0);
    expect(tg.all('Soldier').length).toBe(1);
    const p = tg.find('Plains', 'battlefield', 0);
    expect(p).not.toBeNull();
    expect(tg.state.objects[p!].tapped).toBe(true);
  });

  it('sem vantagem do oponente, não dispara', () => {
    const tg = setup({ active: 1, step: 'main2', battlefield: [[NOME, 'Plains'], ['Forest']], library: [['Plains'], []] });
    tg.passTo('cleanup');
    expect(tg.all('Soldier').length).toBe(0);
    expect(tg.state.zones.library[0].length).toBe(1);
  });
});

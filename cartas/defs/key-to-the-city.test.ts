import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Key to the City', () => {
  it('pode ativar sem alvo', () => {
    const tg = setup({ battlefield: [['Key to the City'], []], hand: [['Plains'], []] });
    tg.choose('criatura alvo', []).activate('Key to the City').resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Plains']);
  });

  it('criatura alvo não pode ser bloqueada neste turno', () => {
    const tg = setup({ step: 'beginCombat', battlefield: [['Key to the City', 'Indomitable Ancients'], ['Wall of Omens']], hand: [['Plains'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).activate('Key to the City').resolve();
    tg.attack([['Indomitable Ancients', 1]]);
    tg.passTo('main2');
    expect(tg.life(1)).toBe(38); // nenhuma decisão de bloqueio possível
  });

  it('dispara na etapa de desvirar e vai para a pilha na manutenção', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[{ name: 'Key to the City', tapped: true }, 'Sol Ring'], []], library: [['Plains'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack.length).toBe(1);
  });

  it('paga {2} uma vez e compra uma carta', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[{ name: 'Key to the City', tapped: true }, 'Sol Ring'], []], library: [['Plains', 'Island'], ['Island']] });
    tg.yes('Pagar {2}', true);
    tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
    tg.resolve();
    expect(tg.state.zones.hand[0].length).toBe(1);
  });
});

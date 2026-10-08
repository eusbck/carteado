import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Vanguard of the Restless', () => {
  it('conta as conjurações registradas da zona de comando', () => {
    const tg = setup({ battlefield: [['Vanguard of the Restless'], []], command: [[{ name: 'Gau, Feral Youth', commander: true }], []] });
    tg.state.players[0].commanderCasts[String(tg.state.objects[tg.state.zones.command[0]].card)] = 2;
    tg.refresh();
    expect(tg.pt(tg.bf('Vanguard of the Restless'))).toEqual([4, 4]);
  });
  it('um Spirit entrando: paga {2}{W} e volta do cemitério', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], graveyard: [['Vanguard of the Restless'], []], library: [['Island'], []] });
    tg.yes('Vanguard');
    tg.run(createTokens(tg.g, 0, 'Spirit 1/1', 1));
    tg.resolveAll();
    expect(tg.find('Vanguard of the Restless')).not.toBeNull();
  });
});

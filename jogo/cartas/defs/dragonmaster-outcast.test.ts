import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const D = 'Dragonmaster Outcast';
const montanhas = (n: number) => Array(n).fill('Mountain');
const ateManutencao = (tg: TestGame) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
const fichas = (tg: TestGame) => tg.all('Dragon').filter((id) => tg.state.objects[id].isToken);

describe(D, () => {
  it('na sua manutenção, com seis ou mais terrenos, cria uma ficha Dragon 5/5', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[D, ...montanhas(6)], []], library: [['Island'], ['Island']] });
    ateManutencao(tg).resolve();
    expect(fichas(tg)).toHaveLength(1);
    expect(tg.pt(fichas(tg)[0])).toEqual([5, 5]);
  });
  it('com cinco terrenos, não dispara', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[D, ...montanhas(5)], []], library: [['Island'], ['Island']] });
    ateManutencao(tg);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(fichas(tg)).toHaveLength(0);
  });
  it('CR 603.4: sem seis terrenos na resolução, não cria a ficha', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [[D, ...montanhas(6)], []], library: [['Island'], ['Island']] });
    ateManutencao(tg);
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.run(destroy(tg.g, [tg.bf('Mountain')]));
    tg.resolve();
    expect(fichas(tg)).toHaveLength(0);
  });
  it('não dispara na manutenção do oponente', () => {
    const tg = setup({ step: 'end', battlefield: [[D, ...montanhas(6)], []], library: [['Island'], ['Island']] });
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep');
    expect(tg.state.zones.stack).toHaveLength(0);
  });
});

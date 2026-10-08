import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const Z = { name: 'Zombie 2/2', token: true };
const ateManutencao = (tg: ReturnType<typeof setup>) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe('Endless Ranks of the Dead', () => {
  it('cria metade do número de Zombies que você controla, arredondado para baixo', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Endless Ranks of the Dead', Z, Z, "Stitcher's Supplier", 'Wall of Omens'], [Z, Z]], library: [['Island'], ['Island']] });
    ateManutencao(tg).resolveAll();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Zombie 2/2' && tg.state.objects[id].controller === 0).length).toBe(3);
  });
  it('com um só Zombie, nenhuma ficha', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Endless Ranks of the Dead', Z], [Z, Z, Z]], library: [['Island'], ['Island']] });
    ateManutencao(tg).resolveAll();
    expect(tg.all('Zombie 2/2').length).toBe(4);
  });
  it('dois Endless Ranks: as fichas do primeiro contam para o segundo', () => {
    const tg = setup({ step: 'end', active: 1, battlefield: [['Endless Ranks of the Dead', 'Endless Ranks of the Dead', Z, Z], []], library: [['Island'], ['Island']] });
    ateManutencao(tg).resolveAll();
    // primeiro: 2 Zombies → 1 ficha; segundo: 3 Zombies → 1 ficha
    expect(tg.all('Zombie 2/2').length).toBe(4);
  });
});

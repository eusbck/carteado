import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';
import { destroy } from '../../motor/api.ts';
import type { TestGame } from '../../testes/harness.ts';

const NOME = "Inventors' Fair";
const ILHAS = ['Island', 'Island', 'Island'];

function podeBuscar(tg: TestGame): boolean {
  tg.settle();
  const d = tg.pending;
  const fair = tg.bf(NOME);
  return d?.kind === 'priority' && d.actions.some((a) => a.id.startsWith('act:') && a.obj === fair);
}

/** do turno de Bruno até a primeira prioridade na manutenção de Ana */
function ateManutencao(artefatos: number): TestGame {
  const tg = setup({ active: 1, battlefield: [[NOME, ...Array(artefatos).fill('Sol Ring')], []], library: [ILHAS, ILHAS] });
  return tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');
}

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('no início da sua manutenção, com três artefatos, você ganha 1 de vida', () => {
    const tg = ateManutencao(3);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.life(0)).toBe(41);
  });
  it('CR 603.4: sem três artefatos no início da manutenção, não dispara', () => {
    const tg = ateManutencao(2);
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.life(0)).toBe(40);
  });
  it('CR 603.4: sem três artefatos ao resolver, não ganha vida', () => {
    const tg = ateManutencao(3);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.run(destroy(tg.g, [tg.all('Sol Ring')[0]]));
    tg.resolve();
    expect(tg.life(0)).toBe(40);
  });
  it('{4}, {T}, sacrifique: procura uma carta de artefato e a põe na mão (só com três artefatos)', () => {
    const sem = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Mountain', 'Mountain'], []], library: [['Swiftfoot Boots'], []] });
    expect(podeBuscar(sem)).toBe(false);
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Sol Ring'], []], library: [['Island', 'Swiftfoot Boots'], []] });
    expect(podeBuscar(tg)).toBe(true);
    tg.choose('carta de artefato', ['Swiftfoot Boots']).activate(NOME, 'Procure').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swiftfoot Boots']);
    expect(tg.find(NOME, 'graveyard')).not.toBeNull();
  });
  it('CR 602.5: os artefatos são contados só ao ativar', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring', 'Sol Ring', 'Sol Ring'], []], library: [['Swiftfoot Boots'], []] });
    tg.choose('carta de artefato', ['Swiftfoot Boots']).activate(NOME, 'Procure');
    tg.run(destroy(tg.g, [tg.all('Sol Ring')[0]]));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Swiftfoot Boots']);
  });
});

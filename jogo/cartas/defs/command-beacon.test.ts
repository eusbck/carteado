import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Command Beacon';
const GAU = 'Gau, Feral Youth';

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{T}, sacrifique: põe seu comandante da zona de comando na sua mão', () => {
    const tg = setup({ battlefield: [[NOME], []], command: [[GAU], []] });
    tg.yes('zona de comando', false).activate(NOME, 'comandante').resolve();
    expect(tg.names(0, 'hand')).toEqual([GAU]);
    expect(tg.state.zones.command.length).toBe(0);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });
  it('CR 903.8: conjurado da mão, não paga o imposto de comandante nem aumenta o imposto', () => {
    const tg = setup({ battlefield: [[NOME, 'Mountain', 'Mountain'], []], command: [[GAU], []] });
    const card = String(tg.state.objects[tg.state.zones.command[0]].card);
    tg.state.players[0].commanderCasts[card] = 2; // imposto de {4} se viesse da zona de comando
    tg.yes('zona de comando', false).activate(NOME, 'comandante').resolve();
    // {1}{R} com duas Mountains: sem imposto
    tg.cast(GAU).resolve();
    expect(tg.find(GAU)).not.toBeNull();
    expect(tg.state.players[0].commanderCasts[card]).toBe(2);
  });
  it('com o comandante fora da zona de comando, nada acontece', () => {
    const tg = setup({ battlefield: [[NOME, { name: GAU, commander: true }], []] });
    tg.activate(NOME, 'comandante').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.find(GAU)).not.toBeNull();
  });
  it('com dois comandantes na zona de comando, só um vai para a mão', () => {
    const tg = setup({ battlefield: [[NOME], []], command: [[GAU, 'Zetalpa, Primal Dawn'], []] });
    tg.choose('escolha o comandante', ['Zetalpa, Primal Dawn']).yes('zona de comando', false);
    tg.activate(NOME, 'comandante').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
    expect(tg.names(0, 'command')).toEqual([GAU]);
  });
  it('o comandante do oponente não é afetado', () => {
    const tg = setup({ battlefield: [[NOME], []], command: [[], [GAU]] });
    tg.activate(NOME, 'comandante').resolve();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.names(1, 'command')).toEqual([GAU]);
  });
});

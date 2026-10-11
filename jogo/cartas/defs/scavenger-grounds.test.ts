import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Scavenger Grounds';

describe(NOME, () => {
  it('CR 205.3i: Desert não dá habilidade de mana intrínseca (só a impressa, {C})', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('pode sacrificar a si mesmo para pagar o custo', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], graveyard: [['Island'], ['Wall of Omens']] });
    tg.activate(NOME, 'Exile');
    expect(tg.find(NOME)).toBeNull();
    expect(tg.names(0, 'graveyard')).toContain(NOME);
    tg.resolve();
    expect(tg.names(1, 'graveyard')).toEqual([]);
  });
  it('o Desert sacrificado também é exilado', () => {
    const tg = setup({ battlefield: [[NOME, 'Sol Ring'], []], graveyard: [['Island'], ['Wall of Omens']] });
    tg.activate(NOME, 'Exile').resolve();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(1, 'graveyard')).toEqual([]);
    expect(tg.find(NOME, 'exile')).not.toBeNull();
    expect(tg.find('Island', 'exile')).not.toBeNull();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
  });
  it('pode sacrificar outro Desert e ficar no campo', () => {
    const tg = setup({ battlefield: [[NOME, 'Desert of the Glorified', 'Sol Ring'], []], graveyard: [['Island'], []] });
    tg.choose('Desert', ['Desert of the Glorified']).activate(NOME, 'Exile').resolve();
    expect(tg.find(NOME)).not.toBeNull();
    expect(tg.find('Desert of the Glorified', 'exile')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });
});

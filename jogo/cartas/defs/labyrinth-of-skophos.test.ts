import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana } from '../../testes/padroes.ts';

const NOME = 'Labyrinth of Skophos';
const TERRENOS = ['Plains', 'Plains', 'Plains', 'Plains'];

describe(NOME, () => {
  it('CR 605: produz {C}', () => expect(alternativasDeMana(NOME)).toEqual(['C']));

  it('{4}, {T}: tira do combate a criatura atacante, que continua virada e não causa dano', () => {
    const tg = setup({ active: 1, battlefield: [[NOME, ...TERRENOS], ['Indomitable Ancients']] });
    tg.attack([['Indomitable Ancients', 0]]).passTo('declareBlockers');
    tg.pass(); // Bruno passa; prioridade para Ana
    tg.choose('criatura atacante', ['Indomitable Ancients']).activate(NOME, 'Remova');
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].tapped).toBe(true);
    tg.passTo('main2', 1);
    expect(tg.life(0)).toBe(40);
  });

  it('tirar o bloqueador do combate: a atacante continua bloqueada e não causa dano', () => {
    const tg = setup({ battlefield: [['Indomitable Ancients'], [NOME, ...TERRENOS, 'Wall of Omens']] });
    tg.attack([['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]).passTo('declareBlockers');
    tg.pass(); // Ana passa; prioridade para Bruno
    tg.choose('criatura atacante', ['Wall of Omens']).activate(NOME, 'Remova');
    tg.resolve();
    tg.passTo('main2');
    expect(tg.life(1)).toBe(40);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
  });
});

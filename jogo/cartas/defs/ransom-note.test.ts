import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { manifestFaceUpCost } from '../../motor/api.ts';

const NOME = 'Ransom Note';

describe(NOME, () => {
  it('quando entra, vigiar 1', () => {
    const tg = setup({ battlefield: [['Plains'], []], hand: [[NOME], []], library: [['Island', 'Forest'], []] });
    tg.choose('Vigiar', ['Island']);
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard').length + tg.state.zones.library[0].length).toBe(2);
  });

  it('encobrir: a carta do topo entra virada para baixo, 2/2 sem nome, com resguardo {2}', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains'], []], library: [['Indomitable Ancients'], []] });
    tg.choose('modo(s)', ['Encubra a carta do topo do seu grimório']).activate(NOME).resolve();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(id).toBeDefined();
    const c = chars(tg.g, id);
    expect(c.name).toBe('');
    expect([c.power, c.toughness]).toEqual([2, 2]);
    expect(hasKw(tg.g, id, 'ward')).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual([NOME]);
  });

  it('a encoberta que é carta de criatura vira para cima pagando o custo de mana dela; o resguardo some', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], library: [['Wall of Omens'], []] });
    tg.choose('modo(s)', ['Encubra a carta do topo do seu grimório']).activate(NOME).resolve();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(manifestFaceUpCost(tg.g, id)).not.toBeNull();
    const acao = tg.actionIds().find((a) => a === `faceup:${id}`);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.objects[id].faceDown).toBe(false);
    expect(tg.pt(id)).toEqual([0, 4]);
    expect(hasKw(tg.g, id, 'ward')).toBe(false);
  });

  it('a encoberta que é instantânea ou feitiço não pode ser virada para cima', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains'], []], library: [['Infernal Grasp'], []] });
    tg.choose('modo(s)', ['Encubra a carta do topo do seu grimório']).activate(NOME).resolve();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(manifestFaceUpCost(tg.g, id)).toBeNull();
  });

  it('goade a criatura alvo; ou compre uma carta', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains'], ['Indomitable Ancients']], library: [['Island'], []] });
    tg.choose('modo(s)', ['Goade a criatura alvo']).choose('criatura alvo', ['Indomitable Ancients']).activate(NOME).resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].goadedBy.map((x) => x.player)).toEqual([0]);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Tomb Fortress';
const CAMPO = [NOME, 'Swamp', 'Swamp', 'Swamp', 'Sol Ring'];

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('mói quatro e devolve uma carta de criatura do cemitério para o campo', () => {
    const tg = setup({ battlefield: [CAMPO, []], library: [['Island', 'Wall of Omens', 'Forest', 'Plains', 'Swamp'], []] });
    tg.choose('Tomb Fortress: escolha', ['Wall of Omens']).activate(NOME, 'cemitério').resolve();
    expect(tg.names(0, 'exile')).toEqual([NOME]);
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(tg.names(0, 'graveyard').sort()).toEqual(['Forest', 'Island', 'Plains']);
    expect(tg.names(0, 'library')).toEqual(['Swamp']);
  });
  it('pode devolver uma criatura que já estava no cemitério antes de moer', () => {
    const tg = setup({ battlefield: [CAMPO, []], graveyard: [['Zetalpa, Primal Dawn'], []], library: [['Island', 'Wall of Omens'], []] });
    let cands: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Tomb Fortress: escolha')) return null;
      cands = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Zetalpa, Primal Dawn')!.id] };
    });
    tg.activate(NOME, 'cemitério').resolve();
    expect(cands).toEqual(['Wall of Omens', 'Zetalpa, Primal Dawn']);
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
  });
  it('ative apenas como um feitiço', () => {
    const pode = (tg: ReturnType<typeof setup>) => tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(NOME)}:`));
    expect(pode(setup({ battlefield: [CAMPO, []] }))).toBe(true);
    expect(pode(setup({ battlefield: [CAMPO, []], step: 'beginCombat' }))).toBe(false);
  });
});

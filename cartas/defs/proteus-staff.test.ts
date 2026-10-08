import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const ilhas = ['Island', 'Island', 'Island'];

describe('Proteus Staff', () => {
  it('a criatura alvo vai para o fundo; o controlador revela até uma criatura, que entra, e o resto vai para o fundo na ordem que ele escolher', () => {
    const tg = setup({
      battlefield: [[...ilhas, 'Proteus Staff'], ['Wall of Omens']],
      library: [[], ['Plains', 'Swamp', 'Indomitable Ancients', 'Forest']],
    });
    tg.choose('criatura alvo', ['Wall of Omens']).choose('Ordene as cartas reveladas', ['Swamp', 'Plains']);
    tg.activate('Proteus Staff').resolve();
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).not.toBeNull();
    expect(tg.find('Wall of Omens')).toBeNull();
    // Forest não foi revelada; a Wall foi para o fundo antes; depois Swamp e Plains, na ordem escolhida
    expect(tg.names(1, 'library')).toEqual(['Forest', 'Wall of Omens', 'Swamp', 'Plains']);
    expect(tg.state.objects[tg.bf('Proteus Staff')].tapped).toBe(true);
  });

  it('sem outra carta de criatura, a própria criatura é revelada no fundo e volta ao campo como objeto novo', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Proteus Staff'], [{ name: 'Wall of Omens', counters: { '+1/+1': 2 } }]], library: [[], ['Plains']] });
    const antes = tg.bf('Wall of Omens');
    tg.choose('criatura alvo', ['Wall of Omens']).activate('Proteus Staff').resolve();
    const depois = tg.bf('Wall of Omens', 1);
    expect(depois).not.toBe(antes);
    expect(tg.state.objects[depois].counters['+1/+1'] ?? 0).toBe(0);
    expect(tg.names(1, 'library')).toEqual(['Plains']);
  });

  it('ficha alvo deixa de existir; a revelação só conta cartas', () => {
    const tg = setup({ battlefield: [[...ilhas, 'Proteus Staff', { name: 'Soldier', token: true }], []], library: [['Island', 'Elvish Mystic'], []] });
    tg.choose('criatura alvo', ['Soldier']).activate('Proteus Staff').resolve();
    expect(tg.find('Soldier')).toBeNull();
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Island']);
  });

  it('CR 602.5d: só como feitiço', () => {
    const tg = setup({ active: 1, battlefield: [[...ilhas, 'Proteus Staff'], ['Wall of Omens']] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.startsWith('act:') && tg.state.objects[Number(a.split(':')[1])]?.def === 'Proteus Staff')).toBe(false);
    const meu = setup({ battlefield: [[...ilhas, 'Proteus Staff'], ['Wall of Omens']] });
    expect(meu.actionIds().some((a) => a.startsWith('act:') && meu.state.objects[Number(a.split(':')[1])]?.def === 'Proteus Staff')).toBe(true);
  });
});

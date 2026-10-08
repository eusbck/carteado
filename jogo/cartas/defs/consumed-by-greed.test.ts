import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const CBG = 'Consumed by Greed';
const mana = ['Swamp', 'Swamp', 'Swamp'];

describe('Consumed by Greed', () => {
  it('sem presente: o oponente alvo sacrifica a criatura de maior força', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients', 'Wall of Omens']], hand: [[CBG], []], graveyard: [['Wall of Omens'], []], library: [[], ['Island']] });
    tg.choose('prometer', ['Não prometer']).choose('oponente alvo', ['Bruno']).cast(CBG).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Wall of Omens', 'battlefield', 1)).not.toBeNull();
    expect(tg.names(1, 'hand')).toEqual([]);
    // sem o presente, a carta do cemitério fica lá
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens', CBG]);
  });

  it('com o presente: o presenteado compra antes, e a carta de criatura alvo volta para a sua mão', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients']], hand: [[CBG], []], graveyard: [['Wall of Omens'], []], library: [[], ['Island']] });
    tg.choose('prometer', ['Prometer a Bruno']).choose('oponente alvo', ['Bruno']).choose('carta de criatura do seu cemitério', ['Wall of Omens']).cast(CBG).resolve();
    expect(tg.names(1, 'hand')).toEqual(['Island']);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Wall of Omens']);
    // o presente vem antes dos outros efeitos (CR 702.174j)
    const log = tg.state.log.map((l) => l.text);
    const presente = log.findIndex((l) => l.includes('recebe o presente'));
    const sacrificio = log.findIndex((l) => l.includes('Indomitable Ancients') && /sacrific|cemitério/.test(l));
    expect(presente).toBeGreaterThanOrEqual(0);
    if (sacrificio >= 0) expect(presente).toBeLessThan(sacrificio);
  });

  it('o oponente do presente é escolhido ao conjurar e pode ser outro que não o alvo', () => {
    const tg = setup({ players: 3, battlefield: [mana, ['Indomitable Ancients'], []], hand: [[CBG], [], []], graveyard: [['Wall of Omens'], [], []], library: [[], ['Island'], ['Forest']] });
    tg.choose('prometer', ['Prometer a Carla']).choose('oponente alvo', ['Bruno']).choose('carta de criatura do seu cemitério', ['Wall of Omens']).cast(CBG);
    expect(tg.state.zones.stack.length).toBe(1);
    tg.resolve();
    expect(tg.names(2, 'hand')).toEqual(['Forest']);
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('no empate de maior força, o oponente escolhe qual sacrificar', () => {
    const tg = setup({ battlefield: [mana, ['Wall of Omens', 'Wall of Limbs']], hand: [[CBG], []] });
    tg.choose('maior força', ['Wall of Limbs']).choose('prometer', ['Não prometer']).choose('oponente alvo', ['Bruno']).cast(CBG).resolve();
    expect(tg.find('Wall of Limbs')).toBeNull();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });

  it('anulada, o presente não é dado', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients', 'Island', 'Island']], hand: [[CBG], ['Counterspell']], graveyard: [['Wall of Omens'], []], library: [[], ['Plains']] });
    tg.choose('prometer', ['Prometer a Bruno']).choose('oponente alvo', ['Bruno']).choose('carta de criatura do seu cemitério', ['Wall of Omens']).cast(CBG);
    tg.pass();
    tg.choose('mágica alvo', [CBG]).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'graveyard')).toContain(CBG);
    expect(tg.names(1, 'hand')).toEqual([]);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toContain('Wall of Omens');
  });

  it('CR 702.174m: sem carta de criatura no cemitério, não dá para prometer o presente', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients']], hand: [[CBG], []] });
    let opcoes: { label: string; disabled?: boolean }[] = [];
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('prometer')) opcoes = d.items; return null; });
    tg.choose('oponente alvo', ['Bruno']).cast(CBG).resolve();
    expect(opcoes.find((i) => i.label.startsWith('Prometer a Bruno'))?.disabled).toBe(true);
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });

  it('sem o presente, não se escolhe o alvo do cemitério (dá para conjurar com o cemitério vazio)', () => {
    const tg = setup({ battlefield: [mana, ['Indomitable Ancients']], hand: [[CBG], []] });
    expect(tg.canCast(CBG)).toBe(true);
    tg.choose('prometer', ['Não prometer']).choose('oponente alvo', ['Bruno']).cast(CBG).resolve();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});

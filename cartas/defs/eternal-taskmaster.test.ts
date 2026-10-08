import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Eternal Taskmaster', () => {
  it('entra virado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [['Eternal Taskmaster'], []] });
    tg.cast('Eternal Taskmaster').resolve();
    expect(tg.state.objects[tg.bf('Eternal Taskmaster')].tapped).toBe(true);
  });
  it('paga {2}{B} uma vez e devolve uma carta', () => {
    const tg = setup({ battlefield: [['Eternal Taskmaster', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens', 'Elvish Mystic'], []] });
    let perguntas = 0;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Pagar {2}{B}') ? (perguntas++, { kind: 'select', ids: ['yes'] }) : null));
    tg.choose('carta de criatura alvo', ['Elvish Mystic']);
    tg.attack([['Eternal Taskmaster', 1]]).passTo('declareBlockers');
    expect(perguntas).toBe(1);
    expect(tg.names(0, 'hand')).toEqual(['Elvish Mystic']);
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === 'Swamp' && tg.state.objects[id].tapped).length).toBe(3);
  });
  it('sem pagar, a carta fica no cemitério', () => {
    const tg = setup({ battlefield: [['Eternal Taskmaster', 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens'], []] });
    tg.yes('Pagar {2}{B}', false);
    tg.attack([['Eternal Taskmaster', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
  it('sem mana suficiente, não devolve', () => {
    const tg = setup({ battlefield: [['Eternal Taskmaster', 'Swamp', 'Swamp'], []], graveyard: [['Wall of Omens'], []] });
    tg.yes('Pagar {2}{B}', true);
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', cancel: true } : null));
    tg.attack([['Eternal Taskmaster', 1]]).passTo('declareBlockers');
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';

describe('Zoetic Cavern', () => {
  it('é um terreno que gera {C}', () => {
    const tg = setup({ battlefield: [['Zoetic Cavern'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('mana:'))).toBe(true);
  });

  it('CR 702.37a: conjurada virada para baixo por {3} como mágica de criatura 2/2', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Zoetic Cavern'], []] });
    // também pode ser jogada como terreno
    expect(tg.actionIds().some((a) => a.startsWith('play:'))).toBe(true);
    tg.cast('Zoetic Cavern', 'morph');
    const magia = tg.state.zones.stack[0];
    expect(chars(tg.g, magia).types).toEqual(['Creature']);
    tg.resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(tg.pt(id)).toEqual([2, 2]);
    // jogar o terreno do turno continua disponível: conjurar não é jogar terreno
    expect(tg.state.turn.landsPlayed).toBe(0);
  });

  it('virada para cima, continua com os marcadores e vira terreno', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains'], []], hand: [['Zoetic Cavern'], []] });
    tg.cast('Zoetic Cavern', 'morph').resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    tg.state.objects[id].counters['+1/+1'] = 1;
    tg.refresh();
    tg.answer({ kind: 'priority', action: `morph:${id}` });
    tg.settle();
    expect(tg.state.objects[id].faceDown).toBe(false);
    expect(chars(tg.g, id).types).toEqual(['Land']);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
  });
});

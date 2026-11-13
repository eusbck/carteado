import { describe, expect, it } from 'vitest';
import { chars } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Whim of Volrath';

describe(N, () => {
  it('troca o tipo básico de terreno de uma Island até o fim do turno', () => {
    const tg = setup({ battlefield: [['Island'], ['Island']], hand: [[N], []], library: [[], ['Swamp']] });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('permanente alvo', [tg.find('Island', 'battlefield', 1)!]);
    tg.choose('trocar uma palavra de cor', ['Tipo básico de terreno']).choose('palavra que vai ser trocada', ['Island (ilha)']).choose('palavra nova', ['Swamp (pântano)']);
    tg.cast(N).resolve();
    const ilha = tg.find('Island', 'battlefield', 1)!;
    expect(chars(tg.g, ilha).subtypes).toEqual(['Swamp']);
    expect(chars(tg.g, ilha).abilities.map((a) => a.id)).toEqual(['basic:B']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
    tg.passTo('upkeep', 1);
    expect(chars(tg.g, ilha).subtypes).toEqual(['Island']);
  });
  it('CR 702.27a: com a recompra paga, volta para a mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Island']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: recompra {2}']).choose('permanente alvo', [tg.find('Island', 'battlefield', 1)!]).cast(N).resolve();
    expect(tg.names(0, 'hand')).toEqual([N]);
  });
});

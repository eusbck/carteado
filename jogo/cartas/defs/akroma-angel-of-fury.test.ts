import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars, hasKw } from '../../motor/chars.ts';
import { buildView } from '../../motor/view.ts';

const terrenos = (n: number, cor = 'Mountain') => Array.from({ length: n }, () => cor);

describe('Akroma, Angel of Fury', () => {
  it('virada para baixo, a mágica pode ser anulada', () => {
    const tg = setup({ battlefield: [terrenos(3), ['Island', 'Island']], hand: [['Akroma, Angel of Fury'], ['Counterspell']] });
    tg.cast('Akroma, Angel of Fury', 'morph');
    const magia = tg.state.zones.stack[0];
    expect(tg.state.objects[magia].faceDown).toBe(true);
    tg.pass(); // Bruno com prioridade
    tg.choose('mágica alvo', [magia]).cast('Counterspell');
    tg.resolveAll();
    expect(tg.find('Akroma, Angel of Fury', 'graveyard', 0)).not.toBeNull();
  });

  it('virada para cima, a anulação não a anula', () => {
    const tg = setup({ battlefield: [terrenos(8), ['Island', 'Island']], hand: [['Akroma, Angel of Fury'], ['Counterspell']] });
    tg.cast('Akroma, Angel of Fury');
    const magia = tg.state.zones.stack[0];
    tg.pass();
    tg.choose('mágica alvo', [magia]).cast('Counterspell');
    tg.resolveAll();
    expect(tg.find('Akroma, Angel of Fury')).not.toBeNull();
    expect(tg.find('Counterspell', 'graveyard', 1)).not.toBeNull();
  });

  it('CR 702.37: entra como 2/2 sem nome para os outros e vira para cima pagando a metamorfose', () => {
    const tg = setup({ battlefield: [terrenos(9), []], hand: [['Akroma, Angel of Fury'], []] });
    tg.cast('Akroma, Angel of Fury', 'morph').resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(tg.pt(id)).toEqual([2, 2]);
    expect(chars(tg.g, id).name).toBe('');
    expect(hasKw(tg.g, id, 'flying')).toBe(false);
    // quem não controla vê o verso; quem controla vê a carta
    const outro = buildView(tg.g, 1, null).battlefield.find((o) => o.id === id)!;
    expect(outro.def).toBe('');
    expect(outro.name).toBe('Virada para baixo');
    expect(buildView(tg.g, 0, null).battlefield.find((o) => o.id === id)!.def).toBe('Akroma, Angel of Fury');
    // o registro não conta qual carta foi conjurada
    expect(buildView(tg.g, 1, null).log.some((l) => l.text.includes('Akroma'))).toBe(false);
    // ação especial (CR 702.37e): {3}{R}{R}{R}, sem a pilha
    const acao = tg.actionIds().find((a) => a === `morph:${id}`);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.state.objects[id].faceDown).toBe(false);
    expect(chars(tg.g, id).name).toBe('Akroma, Angel of Fury');
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
  });

  it('como comandante, conjura virada para baixo da zona de comando pagando {3} mais o imposto', () => {
    const tg = setup({
      battlefield: [terrenos(4), []], command: [['Akroma, Angel of Fury'], []],
      onStart: (t) => { const card = t.state.players[0].commanders[0]; t.state.players[0].commanderCasts[String(card)] = 1; },
    });
    tg.refresh();
    // {3} + {2} de imposto = 5: com 4 terrenos não dá
    expect(tg.actionIds().some((a) => a.endsWith(':morph'))).toBe(false);
    const tg2 = setup({
      battlefield: [terrenos(5), []], command: [['Akroma, Angel of Fury'], []],
      onStart: (t) => { const card = t.state.players[0].commanders[0]; t.state.players[0].commanderCasts[String(card)] = 1; },
    });
    tg2.refresh();
    tg2.cast('Akroma, Angel of Fury', 'morph').resolveAll();
    const id = tg2.state.zones.battlefield.find((x) => tg2.state.objects[x].faceDown);
    expect(id).toBeDefined();
    expect(tg2.state.zones.battlefield.filter((x) => tg2.state.objects[x].tapped).length).toBe(5);
    expect(tg2.state.players[0].commanderCasts[String(tg2.state.players[0].commanders[0])]).toBe(2);
  });

  it('{R}: recebe +1/+0 até o fim do turno; voar, atropelar e proteção contra branco e azul', () => {
    const tg = setup({ battlefield: [['Akroma, Angel of Fury', 'Mountain'], []] });
    const id = tg.bf('Akroma, Angel of Fury');
    expect(hasKw(tg.g, id, 'trample')).toBe(true);
    tg.activate('Akroma, Angel of Fury').resolveAll();
    expect(tg.pt(id)).toEqual([7, 6]);
  });
});

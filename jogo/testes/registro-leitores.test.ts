// F3 (estudo do Arena, registro R1): quem lê o registro (a memória dos bots, o desfazer, o texto da janela Registro e
// dos avisos) usa o tipo, o autor e as cartas citadas gravados na linha, não expressões regulares sobre o texto.
// Q7: uma carta com vírgula no nome ("Akiri, Fearless Voyager") revelada é uma carta só na memória do bot.
import { describe, expect, it } from 'vitest';
import { memoriaVazia, observar } from '../bots/memoria.ts';
import { textoDaLinha } from '../cliente/src/cartas.ts';
import { jog, obj, objs, reg } from '../motor/registro.ts';
import { moveRaw } from '../motor/state.ts';
import type { Game } from '../motor/game.ts';
import { buildView } from '../motor/view.ts';
import { linhasDesfeitas } from '../servidor/desfazer.ts';
import { setup } from './harness.ts';

const COM_VIRGULA = ['Akiri, Fearless Voyager', 'Giada, Font of Hope'];

describe('memória dos bots lê as revelações pelas refs (Q7)', () => {
  it('duas cartas com vírgula no nome reveladas e postas na mão são duas cartas, com o nome inteiro', () => {
    const tg = setup({ library: [['Island'], [...COM_VIRGULA, 'Island']] });
    const ids = COM_VIRGULA.map((n) => tg.find(n, 'library', 1)!);
    reg(tg.g, 'revela', { rule: '701.20' })`${jog(1)} revela ${objs(ids)}.`;
    expect(tg.state.log.at(-1)!.text).toBe('Bruno revela Akiri, Fearless Voyager, Giada, Font of Hope.');
    for (const id of ids) moveRaw(tg.g, id, 'hand');
    const m = memoriaVazia();
    observar(m, tg.g, 0);
    expect(m.naMao[1]).toEqual(COM_VIRGULA);
  });

  it('numa linha com vários jogadores (confronto), cada carta é de quem foi citado antes dela', () => {
    const tg = setup({ library: [['Giada, Font of Hope', 'Island'], ['Akiri, Fearless Voyager', 'Island']] });
    const minha = tg.find('Giada, Font of Hope', 'library', 0)!;
    const dele = tg.find('Akiri, Fearless Voyager', 'library', 1)!;
    reg(tg.g, 'revela', { rule: '701.30a', actor: 0 })`Confronto: ${jog(0)} revela ${obj(minha)}; ${jog(1)} revela ${obj(dele)}.`;
    moveRaw(tg.g, dele, 'hand');
    const m = memoriaVazia();
    observar(m, tg.g, 0);
    expect(m.naMao).toEqual({ 1: ['Akiri, Fearless Voyager'] });
  });

  it('o próprio jogador e linhas só com texto (de checkpoint antigo) não entram', () => {
    const tg = setup({ library: [['Island'], [...COM_VIRGULA, 'Island']] });
    const ids = COM_VIRGULA.map((n) => tg.find(n, 'library', 1)!);
    tg.g.log('Bruno revela Akiri, Fearless Voyager.', { rule: '701.20' });
    for (const id of ids) moveRaw(tg.g, id, 'hand');
    const m = memoriaVazia();
    observar(m, tg.g, 0);
    expect(m.naMao[1]).toBeUndefined();
    // o bot que revelou não guarda a própria carta
    const tg2 = setup({ library: [['Island'], [...COM_VIRGULA, 'Island']] });
    const id2 = tg2.find(COM_VIRGULA[0], 'library', 1)!;
    reg(tg2.g, 'revela')`${jog(1)} revela ${obj(id2)}.`;
    moveRaw(tg2.g, id2, 'hand');
    const m2 = memoriaVazia();
    observar(m2, tg2.g, 1);
    expect(m2.naMao[1]).toBeUndefined();
  });
});

describe('desfazer lê o tipo e o autor da linha', () => {
  const comLog = (tg: ReturnType<typeof setup>, n: number) => ({ state: { ...tg.state, log: tg.state.log.slice(0, n) }, pending: null }) as unknown as Game;

  it('pula o começo de turno e marca como de outro jogador pelo `actor`, não pelo começo do texto', () => {
    // "Ana" e "Ana Clara": pelo prefixo do nome, a linha de Ana Clara ia para Ana
    const tg = setup({ battlefield: [['Island'], ['Island']] });
    tg.state.players[1].name = 'Ana Clara';
    const n = tg.state.log.length;
    reg(tg.g, 'turno', { actor: 1 })`Turno 9: ${jog(1)}.`;
    reg(tg.g, 'ativa')`${jog(1)} ativa ${obj(tg.bf('Island', 1))}.`;
    tg.g.log('Ana Clara compra uma carta.', { kind: 'compra', actor: 1 });
    const linhas = linhasDesfeitas(tg.game, comLog(tg, n), { t: 'concede', p: 0 });
    expect(linhas).toEqual([
      { texto: 'Ana Clara ativa Island.', outro: true },
      { texto: 'Ana Clara compra uma carta.', outro: true },
    ]);
  });
});

describe('texto das linhas no cliente', () => {
  it('montado pelas partes, com o seq da vista como chave; linha antiga fica só com o texto', () => {
    const tg = setup({ battlefield: [[COM_VIRGULA[0]], []] });
    reg(tg.g, 'ativa')`${jog(0)} ativa ${obj(tg.bf(COM_VIRGULA[0]))}.`;
    tg.g.log('Linha antiga sem tipo.');
    const v = buildView(tg.g, 0, null);
    const [estruturada, antiga] = v.log.slice(-2);
    expect(antiga.seq).toBe(estruturada.seq + 1);
    expect(textoDaLinha(antiga, v.players)).toBe('Linha antiga sem tipo.');
    expect(textoDaLinha(estruturada, v.players)).toBe(`Ana ativa ${COM_VIRGULA[0]}.`);
    // a mesma montagem a partir de uma linha da vista com partes e refs (como o agente C redige)
    expect(textoDaLinha({ seq: 1, turn: 1, kind: 'revela', actor: 1, text: 'x', parts: [{ ref: 0 }, ' revela ', { ref: 1 }, '.'],
      refs: [{ k: 'jogador', id: 1 }, { k: 'obj', def: COM_VIRGULA[1], name: COM_VIRGULA[1] }] }, v.players)).toBe(`Bruno revela ${COM_VIRGULA[1]}.`);
  });
});

// Onda B (registro R5 a R8, R11): a lógica da janela Registro (cliente/src/mesa/registroLogica.ts), sem Preact.

import { describe, expect, it } from 'vitest';
import type { LogLinhaView } from '../motor/view.ts';
import type { LinhaSistema } from '../servidor/protocolo.ts';
import {
  afetou, agrupar, categoria, envolve, intercalar, normalizar, passa, rotuloEtapa, textoParaCopiar, type Filtros,
} from '../cliente/src/mesa/registroLogica.ts';

const linha = (seq: number, o: Partial<LogLinhaView> = {}): LogLinhaView => ({ seq, turn: 1, round: 1, step: 'main1', text: `linha ${seq}`, ...o });
const sis = (id: number, apos: number, o: Partial<LinhaSistema> = {}): LinhaSistema => ({ id, apos, tipo: 'entrou', texto: `sistema ${id}`, quem: null, em: 0, ...o });
const SEM: Filtros = { categorias: new Set(), jogadores: new Set(), comigo: false, termo: '' };

describe('registro: categorias', () => {
  it('cada tipo de linha vai para um ícone e um filtro', () => {
    expect(categoria({ kind: 'conjura' })).toBe('magia');
    expect(categoria({ kind: 'resolve' })).toBe('magia');
    expect(categoria({ kind: 'gatilho' })).toBe('gatilho');
    expect(categoria({ kind: 'bloqueio' })).toBe('ataque');
    expect(categoria({ kind: 'morte' })).toBe('morte');
    expect(categoria({ kind: 'zona' })).toBe('morte');
    expect(categoria({ kind: 'turno' })).toBe('sistema');
    expect(categoria({ kind: 'fim' })).toBe('sistema');
    expect(categoria({ kind: 'revela' })).toBe('outro');
    // linha de checkpoint antigo, sem tipo
    expect(categoria({})).toBe('outro');
  });

  it('etapas: as do combate viram uma só', () => {
    expect(rotuloEtapa('declareAttackers')).toBe('Combate');
    expect(rotuloEtapa('combatDamage')).toBe('Combate');
    expect(rotuloEtapa('main2')).toBe('Principal 2');
    expect(rotuloEtapa('cleanup')).toBe('Final');
    expect(rotuloEtapa(undefined)).toBeNull();
  });
});

describe('registro: quem a linha afetou', () => {
  it('você ou uma permanente sua como alvo ou vítima', () => {
    const dano = linha(1, { kind: 'dano', actor: 1, refs: [{ k: 'obj', def: 'Lightning Bolt', name: 'Lightning Bolt', papel: 'fonte' }, { k: 'jogador', id: 0, papel: 'vitima' }] });
    expect(afetou(dano, 0)).toBe(true);
    expect(afetou(dano, 2)).toBe(false);
    const morte = linha(2, { kind: 'morte', actor: null, refs: [{ k: 'obj', id: 9, def: 'Wall of Omens', name: 'Wall of Omens', papel: 'vitima', ctl: 2 }] });
    expect(afetou(morte, 2)).toBe(true);
    expect(afetou(morte, 0)).toBe(false);
    // só citado (sem papel) não conta
    expect(afetou(linha(3, { kind: 'outro', refs: [{ k: 'jogador', id: 0 }] }), 0)).toBe(false);
    // espectador
    expect(afetou(dano, null)).toBe(false);
  });

  it('o que você mesmo mirou numa coisa sua não conta; a vida que você perdeu conta', () => {
    const conj = linha(1, { kind: 'conjura', actor: 0, refs: [{ k: 'jogador', id: 0 }, { k: 'obj', id: 3, def: 'X', name: 'X', papel: 'alvo', ctl: 0 }] });
    expect(afetou(conj, 0)).toBe(false);
    const vida = linha(2, { kind: 'vida', actor: 0, refs: [{ k: 'jogador', id: 0, papel: 'vitima' }] });
    expect(afetou(vida, 0)).toBe(true);
  });

  it('o filtro por jogador pega o autor, os citados e as cartas dele', () => {
    const [l] = intercalar([linha(1, { actor: null, refs: [{ k: 'obj', def: 'X', name: 'X', papel: 'vitima', ctl: 3 }] })], [], 4);
    expect(envolve(l, 3)).toBe(true);
    expect(envolve(l, 1)).toBe(false);
    const [s] = intercalar([], [sis(1, -1, { quem: 2 })], 4);
    expect(envolve(s, 2)).toBe(true);
  });
});

describe('registro: filtros e busca', () => {
  it('tipo, jogador, Comigo e busca sem acento', () => {
    const ls = intercalar([
      linha(1, { kind: 'conjura', actor: 0, text: 'Ana conjura Sol Ring.' }),
      linha(2, { kind: 'dano', actor: 1, text: 'Bolt causa 3 de dano a Ana.', refs: [{ k: 'jogador', id: 0, papel: 'vitima' }] }),
      linha(3, { kind: 'compra', actor: 1, text: 'Bruno compra 2 cartas.' }),
    ], [], 2);
    const t = (i: number) => ls[i].log!.text;
    const quais = (f: Filtros, eu: number | null = 0) => ls.filter((l, i) => passa(l, f, eu, t(i))).map((l) => l.chave);
    expect(quais(SEM)).toEqual(['1', '2', '3']);
    expect(quais({ ...SEM, categorias: new Set(['dano', 'compra']) })).toEqual(['2', '3']);
    expect(quais({ ...SEM, jogadores: new Set([1]) })).toEqual(['2', '3']);
    expect(quais({ ...SEM, comigo: true })).toEqual(['2']);
    expect(quais({ ...SEM, comigo: true }, null)).toEqual([]);
    expect(quais({ ...SEM, termo: normalizar('COMPRA') })).toEqual(['3']);
  });
});

describe('registro: linhas de sistema e a árvore', () => {
  it('a linha da sala entra depois da linha do motor com o seq `apos`; antes da janela, no começo; depois, no fim', () => {
    const log = [linha(10), linha(11, { turn: 2, round: 1, step: 'upkeep' }), linha(12, { turn: 2 })];
    const r = intercalar(log, [sis(3, 99), sis(1, 11), sis(2, 4)], 2);
    expect(r.map((l) => l.chave)).toEqual(['s2', '10', '11', 's1', '12', 's3']);
    // a de sistema herda o turno e a etapa da linha anterior (para cair no bloco certo)
    expect(r[3]).toMatchObject({ categoria: 'sistema', turn: 2, step: 'upkeep' });
  });

  it('rodada → vez → etapa; o turno 0 é "antes da 1ª rodada"', () => {
    const ls = intercalar([
      linha(0, { turn: 0, round: 0, step: 'untap' }),
      linha(1, { turn: 1, round: 1, step: 'upkeep' }),
      linha(2, { turn: 1, round: 1, step: 'main1' }),
      linha(3, { turn: 1, round: 1, step: 'declareAttackers' }),
      linha(4, { turn: 1, round: 1, step: 'combatDamage' }),
      linha(5, { turn: 2, round: 1, step: 'main1' }),
      linha(6, { turn: 3, round: 2, step: 'main1' }),
    ], [], 2);
    const vez = new Map([[1, 0], [2, 1], [3, 0]]);
    const a = agrupar(ls, (t) => vez.get(t) ?? null);
    expect(a.map((r) => r.rodada)).toEqual([0, 1, 2]);
    expect(a[1].vezes.map((v) => [v.turno, v.vez])).toEqual([[1, 0], [2, 1]]);
    expect(a[1].vezes[0].etapas.map((e) => [e.etapa, e.linhas.length])).toEqual([['Manutenção', 1], ['Principal 1', 1], ['Combate', 2]]);
    expect(a[0].vezes[0].vez).toBeNull();
    expect(a[0].vezes[0].etapas[0].etapa).toBeNull();
    // chaves únicas
    const chaves = a.flatMap((r) => [r.chave, ...r.vezes.flatMap((v) => [v.chave, ...v.etapas.map((e) => e.chave)])]);
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it('o texto copiado tem os cabeçalhos e as linhas filtradas', () => {
    const ls = intercalar([linha(1, { turn: 1, round: 1, step: 'main1', text: 'Ana joga Island.' }), linha(2, { turn: 2, round: 1, step: 'declareAttackers', text: 'Bruno ataca.' })], [sis(1, 2, { texto: 'Caio entrou na mesa.' })], 2);
    const a = agrupar(ls, (t) => (t === 1 ? 0 : 1));
    const nomes = ['Ana', 'Bruno'];
    const txt = textoParaCopiar(a, (p) => nomes[p] ?? null, (l) => l.sistema?.texto ?? l.log!.text);
    expect(txt).toBe([
      '== Rodada 1 ==',
      '-- Vez de Ana --',
      '[Principal 1]',
      '  Ana joga Island.',
      '-- Vez de Bruno --',
      '[Combate]',
      '  Bruno ataca.',
      '  Caio entrou na mesa.',
      '',
    ].join('\n'));
  });
});

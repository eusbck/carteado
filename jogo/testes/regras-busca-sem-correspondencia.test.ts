// Busca em zona oculta (CR 701.23a–b): olhar todas as cartas e poder não encontrar cartas da qualidade exigida.
import { describe, expect, it } from 'vitest';
import { searchLibrary } from '../motor/api.ts';
import { novoDiario } from '../motor/diario.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

describe('Procurar sem cartas elegíveis (CR 701.23a)', () => {
  it('CR 701.23a: lookWhenNoMatch mostra todo o grimório só a quem procura, sem permitir escolher outra qualidade', () => {
    const tg = setup({ library: [[], ['Forest', 'Plains']] });
    let vistas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Busca de teste')) return null;
      expect(d.player).toBe(0);
      expect([d.min, d.max]).toEqual([0, 0]);
      expect(d.items.every((i) => i.disabled)).toBe(true);
      vistas = d.items.map((i) => i.card!.def);
      return { kind: 'select', ids: [] };
    });
    const diario = novoDiario();
    tg.g.diario = diario;
    expect(runEffect(tg, searchLibrary(tg.g, 0, 1, { filter: () => false, max: 2, prompt: 'Busca de teste', lookWhenNoMatch: true }))).toEqual([]);
    expect(vistas).toEqual(['Forest', 'Plains']);
    expect(diario.entradas.filter((e) => e.ev.type === 'search')).toHaveLength(1);
    expect(tg.names(1, 'library')).toEqual(['Forest', 'Plains']);
  });
  it('CR 101.2: proibir a busca também impede olhar o grimório pela opção nova', () => {
    const tg = setup({ battlefield: [[], ['Stranglehold']], library: [[], ['Forest']] });
    let perguntou = false;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Busca de teste')) return null;
      perguntou = true;
      return { kind: 'select', ids: [] };
    });
    const diario = novoDiario();
    tg.g.diario = diario;
    expect(runEffect(tg, searchLibrary(tg.g, 0, 1, { filter: () => false, max: 1, prompt: 'Busca de teste', lookWhenNoMatch: true }))).toEqual([]);
    expect(perguntou).toBe(false);
    expect(diario.entradas.some((e) => e.ev.type === 'search')).toBe(false);
  });
  it('mantém as chamadas existentes sem a opção e não cria uma pergunta para um grimório vazio', () => {
    for (const library of [[], ['Forest']]) {
      const tg = setup({ library: [[], library] });
      let perguntas = 0;
      tg.script.push((d) => d.kind === 'select' ? (perguntas++, { kind: 'select', ids: [] }) : null);
      runEffect(tg, searchLibrary(tg.g, 0, 1, { filter: () => false, max: 1, prompt: 'Busca de teste' }));
      if (!library.length) runEffect(tg, searchLibrary(tg.g, 0, 1, { filter: () => false, max: 1, prompt: 'Busca de teste', lookWhenNoMatch: true }));
      expect(perguntas).toBe(0);
    }
  });
});

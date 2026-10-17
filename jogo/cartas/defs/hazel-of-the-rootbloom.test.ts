import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Hazel of the Rootbloom';

describe(NOME, () => {
  it('vira três fichas (inclusive com enjoo de invocação) e paga 2 de vida: três manas das cores escolhidas', () => {
    const fichas = [{ name: 'Squirrel', token: true, ready: false }, { name: 'Squirrel', token: true, ready: false }, { name: 'Food', token: true }];
    const tg = setup({ battlefield: [[NOME, ...fichas], []] });
    const d = tg.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const acao = d.actions.find((a) => a.label.startsWith(NOME) && (a.label.match(/\{\*\}/g) ?? []).length === 3);
    expect(acao, d.actions.map((a) => a.label).join(' | ')).toBeDefined();
    tg.script.push((x) => (x.kind === 'select' && x.prompt.includes('cor') ? { kind: 'select', ids: ['B'] } : null));
    tg.script.push((x) => (x.kind === 'select' && x.prompt.includes('cor') ? { kind: 'select', ids: ['G'] } : null));
    tg.script.push((x) => (x.kind === 'select' && x.prompt.includes('cor') ? { kind: 'select', ids: ['G'] } : null));
    tg.answer({ kind: 'priority', action: acao!.id });
    tg.settle();
    expect(tg.state.players[0].manaPool.map((u) => u.type).sort()).toEqual(['B', 'G', 'G']);
    expect(tg.life(0)).toBe(38);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].isToken && tg.state.objects[id].tapped).length).toBe(3);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });

  it('na sua etapa final, copia a ficha alvo; um Squirrel vira dois, sem marcadores e desvirados', () => {
    const tg = setup({ step: 'main2', battlefield: [[NOME, { name: 'Squirrel', token: true, tapped: true, counters: { '+1/+1': 1 } }], []] });
    tg.choose('ficha alvo', ['Squirrel']);
    tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length === 0);
    const esq = tg.all('Squirrel');
    expect(esq.length).toBe(3);
    expect(esq.filter((id) => !tg.state.objects[id].tapped && !(tg.state.objects[id].counters['+1/+1'] > 0)).length).toBe(2);
  });

  it('uma ficha que não é Squirrel vira uma cópia só', () => {
    const tg = setup({ step: 'main2', battlefield: [[NOME, { name: 'Food', token: true }], []] });
    tg.choose('ficha alvo', ['Food']);
    tg.passUntil((x) => x.state.turn.step === 'end' && x.state.zones.stack.length === 0);
    expect(tg.all('Food').length).toBe(2);
  });

  it('no pagamento de uma mágica: escolhe X = 2, vira as duas fichas escolhidas e paga 2 de vida', () => {
    const tg = setup({ battlefield: [[NOME, { name: 'Squirrel', token: true }, { name: 'Squirrel', token: true }, { name: 'Food', token: true }], []], hand: [['Chatterstorm'], []] });
    let pedido = '';
    let feito = false;
    tg.script.push((d) => {
      if (d.kind !== 'payment' || feito) return null;
      feito = true;
      const fonte = d.sources.find((x) => (x.label.match(/\{\*\}/g) ?? []).length === 2);
      return { kind: 'payment', activate: { source: fonte!.id } };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.startsWith('Vire')) return null;
      pedido = d.prompt;
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Squirrel').map((i) => i.id) };
    });
    tg.script.push((x) => (x.kind === 'select' && x.prompt.includes('cor') ? { kind: 'select', ids: ['G'] } : null));
    tg.script.push((x) => (x.kind === 'select' && x.prompt.includes('cor') ? { kind: 'select', ids: ['B'] } : null));
    tg.cast('Chatterstorm');
    expect(pedido).toBe('Vire 2 ficha(s) desvirada(s) que você controla');
    expect(tg.state.zones.stack.some((id) => tg.state.objects[id].def === 'Chatterstorm')).toBe(true);
    expect(tg.life(0)).toBe(38);
    expect(tg.all('Squirrel').every((id) => tg.state.objects[id].tapped)).toBe(true);
    expect(tg.state.objects[tg.bf('Food')].tapped).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const PLAN = 'Plan for All Outcomes';
const quatro = ['Island', 'Island', 'Island', 'Island'];
const lealdadeJace = (tg: ReturnType<typeof setup>) => tg.all('Jace').map((id) => tg.state.objects[id].counters.loyalty ?? 0);

describe('Plan for All Outcomes', () => {
  it('ao entrar, o dono põe o outro permanente não terreno alvo no topo ou no fundo do grimório', () => {
    const tg = setup({ battlefield: [quatro, ['Sol Ring']], hand: [[PLAN], []], library: [[], ['Forest', 'Swamp']] });
    tg.choose('outro permanente não terreno', ['Sol Ring']).choose('topo ou no fundo', ['No fundo']).cast(PLAN).resolveAll();
    expect(tg.names(1, 'library')).toEqual(['Forest', 'Swamp', 'Sol Ring']);
    const tg2 = setup({ battlefield: [quatro, ['Sol Ring']], hand: [[PLAN], []], library: [[], ['Forest']] });
    tg2.choose('outro permanente não terreno', ['Sol Ring']).choose('topo ou no fundo', ['No topo']).cast(PLAN).resolveAll();
    expect(tg2.names(1, 'library')).toEqual(['Sol Ring', 'Forest']);
  });

  it('até um: pode não escolher alvo', () => {
    const tg = setup({ battlefield: [quatro, ['Sol Ring']], hand: [[PLAN], []] });
    tg.choose('outro permanente não terreno', []).cast(PLAN).resolveAll();
    expect(tg.find('Sol Ring')).not.toBeNull();
  });

  it('no turno em que Plan é conjurado, a segunda habilidade não dispara (Plan foi a primeira)', () => {
    const tg = setup({ battlefield: [[...quatro, 'Island'], []], hand: [[PLAN, 'Sol Ring'], []] });
    tg.cast(PLAN).resolveAll();
    tg.cast('Sol Ring').resolveAll();
    expect(tg.all('Jace')).toEqual([]);
  });

  it('sem ficha de Jace, cria uma e põe 1 marcador de lealdade — só na primeira mágica não criatura do turno', () => {
    const tg = setup({ battlefield: [[PLAN, 'Island', 'Island', 'Island'], []], hand: [['Sol Ring', 'Mind Stone', 'Fellwar Stone'], []], library: [['Forest'], ['Forest']] });
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack.length).toBe(2); // o gatilho em cima do Sol Ring
    tg.resolveAll();
    expect(lealdadeJace(tg)).toEqual([1]);
    tg.cast('Mind Stone').resolveAll();
    expect(lealdadeJace(tg)).toEqual([1]);
    // no próximo turno seu, de novo
    tg.passTo('upkeep', 1).passTo('main1', 0);
    tg.cast('Fellwar Stone').resolveAll();
    expect(lealdadeJace(tg)).toEqual([2]);
  });

  it('mágica de criatura não dispara', () => {
    const tg = setup({ battlefield: [[PLAN, 'Plains', 'Plains'], []], hand: [['Wall of Omens'], []], library: [['Forest'], []] });
    tg.cast('Wall of Omens').resolveAll();
    expect(tg.all('Jace')).toEqual([]);
  });

  it('o gatilho resolve antes da mágica e mesmo se ela for anulada', () => {
    const tg = setup({ battlefield: [[PLAN, 'Island'], ['Island', 'Island']], hand: [['Sol Ring'], ['Counterspell']] });
    tg.cast('Sol Ring');
    // Bruno anula o Sol Ring por cima do gatilho
    tg.pass();
    tg.choose('mágica alvo', ['Sol Ring']).cast('Counterspell').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Sol Ring']);
    expect(lealdadeJace(tg)).toEqual([1]);
  });
});

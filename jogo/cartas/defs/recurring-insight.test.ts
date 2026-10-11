import { describe, expect, it } from 'vitest';
import { counter } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Recurring Insight';
const ilhas = Array(6).fill('Island');
const forests = Array(20).fill('Forest');
const mao = ['Plains', 'Plains', 'Plains'];

describe(N, () => {
  it('CR 702.88a: conjurada da mão, é exilada ao resolver em vez de ir para o cemitério', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], mao], library: [forests, forests] });
    tg.choose('oponente alvo', ['Bruno']).cast(N).resolveAll();
    // comprou três, o tamanho da mão do oponente
    expect(tg.names(0, 'hand')).toHaveLength(3);
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.find(N, 'graveyard', 0)).toBeNull();
  });

  it('conjurada do exílio pelo ricochete, vai para o cemitério e não ricocheteia de novo', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], mao], library: [forests, forests] });
    tg.choose('oponente alvo', ['Bruno']).cast(N).resolveAll();
    tg.yes('Ricochete', true).choose('oponente alvo', ['Bruno']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    // conjurada na manutenção, mesmo sendo um feitiço, e sem pagar: as 3 de antes mais as 4 da mão do oponente
    // (ele comprou uma no turno dele); a sua compra do turno ainda não aconteceu
    expect(tg.names(1, 'hand')).toHaveLength(4);
    expect(tg.names(0, 'hand')).toHaveLength(3 + 4);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.find(N, 'exile')).toBeNull();
    expect(tg.all('Island').every((id) => !tg.state.objects[id].tapped)).toBe(true);
    // no turno seguinte não há outro ricochete
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 0);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });

  it('recusando o ricochete, a carta fica exilada e não há outra chance', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], mao], library: [forests, forests] });
    tg.choose('oponente alvo', ['Bruno']).cast(N).resolveAll();
    tg.yes('Ricochete', false);
    tg.passTo('main1', 0);
    expect(tg.find(N, 'exile')).not.toBeNull();
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 0);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(N, 'exile')).not.toBeNull();
  });

  it('anulada, vai para o cemitério e o ricochete não acontece', () => {
    const tg = setup({ battlefield: [ilhas, []], hand: [[N], mao], library: [forests, forests] });
    tg.choose('oponente alvo', ['Bruno']).cast(N);
    tg.run(counter(tg.g, tg.state.zones.stack[0]));
    tg.settle();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    tg.passTo('upkeep', 1);
    tg.passTo('upkeep', 0);
    expect(tg.state.zones.stack).toHaveLength(0);
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});

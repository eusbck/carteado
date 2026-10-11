import { describe, expect, it } from 'vitest';
import { gainControl } from '../../motor/actions.ts';
import { controllerOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Aminatou, the Fateshifter';
const aminatou = (n: number) => ({ name: N, counters: { loyalty: n } });
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('+1: você compra uma carta e depois coloca uma carta da mão no topo do grimório', () => {
    const tg = setup({ battlefield: [[aminatou(3)], []], hand: [['Sol Ring'], []], library: [ilhas, ilhas] });
    tg.choose('coloque uma carta da sua mão no topo', ['Sol Ring']);
    tg.activate(N, '+1').resolve();
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(4);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'library')[0]).toBe('Sol Ring');
    expect(tg.names(0, 'library')).toHaveLength(6);
  });

  it('−1: a permanente volta como objeto novo, sem os marcadores', () => {
    const tg = setup({ battlefield: [[aminatou(3), { name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }], []] });
    const antes = tg.bf('Indomitable Ancients');
    expect(tg.pt(antes)).toEqual([4, 12]);
    tg.choose('outra permanente alvo', ['Indomitable Ancients']);
    tg.activate(N, '−1').resolve();
    const depois = tg.bf('Indomitable Ancients');
    expect(depois).not.toBe(antes);
    expect(tg.pt(depois)).toEqual([2, 10]);
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(2);
  });

  it('−1: uma permanente sua que outro jogador controla volta sob o seu controle', () => {
    const tg = setup({ battlefield: [[aminatou(3), 'Sol Ring'], ['Silver Myr']] });
    const anel = tg.bf('Sol Ring');
    gainControl(tg.g, anel, 1, { kind: 'permanent' }, anel);
    tg.refresh();
    expect(controllerOf(tg.g, anel)).toBe(1);
    // a permanente do oponente não é alvo: você não é o dono
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('outra permanente alvo')) return null;
      expect(d.items.filter((i) => !i.disabled).map((i) => i.label)).toEqual(['Sol Ring']);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] };
    });
    tg.activate(N, '−1').resolve();
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(0);
  });

  it('−6: com três jogadores, cada um fica com as permanentes do próximo jogador na direção escolhida, menos Aminatou', () => {
    // assentos Ana, Bruno, Carla; à esquerda de Ana está Bruno
    const esq = setup({ players: 3, battlefield: [[aminatou(7), 'Sol Ring', 'Island'], ['Silver Myr'], ['Elvish Mystic']] });
    esq.choose('escolha a direção', ['Esquerda']);
    esq.activate(N, '−6').resolve();
    expect(controllerOf(esq.g, esq.bf('Silver Myr'))).toBe(0);
    expect(controllerOf(esq.g, esq.bf('Elvish Mystic'))).toBe(1);
    expect(controllerOf(esq.g, esq.bf('Sol Ring'))).toBe(2);
    expect(controllerOf(esq.g, esq.bf(N))).toBe(0);
    expect(controllerOf(esq.g, esq.bf('Island'))).toBe(0);
    const dir = setup({ players: 3, battlefield: [[aminatou(7), 'Sol Ring', 'Island'], ['Silver Myr'], ['Elvish Mystic']] });
    dir.choose('escolha a direção', ['Direita']);
    dir.activate(N, '−6').resolve();
    expect(controllerOf(dir.g, dir.bf('Elvish Mystic'))).toBe(0);
    expect(controllerOf(dir.g, dir.bf('Sol Ring'))).toBe(1);
    expect(controllerOf(dir.g, dir.bf('Silver Myr'))).toBe(2);
  });

  it('−6: com dois jogadores, vocês trocam tudo o que não é terreno, menos Aminatou', () => {
    const tg = setup({ battlefield: [[aminatou(7), 'Sol Ring'], ['Silver Myr', 'Elvish Mystic']] });
    tg.choose('escolha a direção', ['Direita']);
    tg.activate(N, '−6').resolve();
    expect(controllerOf(tg.g, tg.bf('Silver Myr'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Elvish Mystic'))).toBe(0);
    expect(controllerOf(tg.g, tg.bf('Sol Ring'))).toBe(1);
    expect(controllerOf(tg.g, tg.bf(N))).toBe(0);
    expect(tg.state.objects[tg.bf(N)].counters.loyalty).toBe(1);
  });
});

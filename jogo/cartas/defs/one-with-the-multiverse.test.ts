import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const OWTM = 'One with the Multiverse';
const acao = (tg: ReturnType<typeof setup>, pref: string, chave: string, nome: string) =>
  tg.actionIds().find((a) => a.startsWith(pref) && a.includes(chave) && a.split(':').includes(String(tg.find(nome, 'library', 0) ?? tg.find(nome, 'hand', 0))));

describe(OWTM, () => {
  it('joga o terreno do topo e conjura a mágica do topo pagando o custo dela', () => {
    const tg = setup({ battlefield: [[OWTM, 'Plains', 'Plains', 'Plains'], []], library: [['Island', 'Wall of Omens', 'Forest'], []] });
    tg.answer({ kind: 'priority', action: acao(tg, 'play:', 'perm:owtm:', 'Island')! });
    tg.settle();
    expect(tg.find('Island')).not.toBeNull();
    tg.answer({ kind: 'priority', action: acao(tg, 'cast:', 'perm:owtm:', 'Wall of Omens')! });
    tg.settle();
    expect(tg.find('Wall of Omens', 'stack')).not.toBeNull();
    expect(tg.all('Plains').filter((x) => tg.state.objects[x].tapped)).toHaveLength(2);
  });

  it('conjura uma mágica da mão sem pagar, uma vez por turno; a segunda tem de ser paga', () => {
    const tg = setup({ battlefield: [[OWTM], []], hand: [['Wall of Omens', 'Sol Ring'], []], library: [['Forest'], []] });
    tg.answer({ kind: 'priority', action: acao(tg, 'cast:', 'perm:owtm-gratis:', 'Wall of Omens')! });
    tg.settle();
    tg.resolve();
    expect(tg.find('Wall of Omens')).not.toBeNull();
    expect(acao(tg, 'cast:', 'perm:owtm-gratis:', 'Sol Ring')).toBeUndefined();
    expect(tg.canCast('Sol Ring')).toBe(false);
  });

  it('no turno do oponente não conjura de graça', () => {
    const tg = setup({ active: 1, battlefield: [[OWTM], []], hand: [['Dream Eater'], []], library: [['Forest'], ['Forest']] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    expect(tg.actionIds().some((a) => a.includes('owtm-gratis'))).toBe(false);
  });
});

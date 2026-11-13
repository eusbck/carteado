import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const DG = 'Dracogenesis';
const acao = (tg: ReturnType<typeof setup>, nome: string, zona: 'hand' | 'command') =>
  tg.actionIds().find((a) => a.startsWith('cast:') && a.includes(':perm:dracogenesis') && a.split(':').includes(String(tg.find(nome, zona))));

describe(DG, () => {
  it('conjura mágica de Dragon da mão sem pagar o custo de mana; outras não', () => {
    const tg = setup({ battlefield: [[DG], []], hand: [['Dragon Whelp', 'Indomitable Ancients'], []] });
    const a = acao(tg, 'Dragon Whelp', 'hand');
    expect(a).toBeDefined();
    expect(acao(tg, 'Indomitable Ancients', 'hand')).toBeUndefined();
    tg.answer({ kind: 'priority', action: a! });
    tg.resolve();
    expect(tg.find('Dragon Whelp', 'battlefield', 0)).not.toBeNull();
  });

  it('o comandante Dragon na zona de comando: sem o custo de mana, mas com o imposto', () => {
    const tg = setup({ battlefield: [[DG], []], command: [[{ name: 'The Ur-Dragon', commander: true }], []] });
    // primeira vez, sem imposto: de graça
    const a = acao(tg, 'The Ur-Dragon', 'command');
    expect(a).toBeDefined();
    tg.answer({ kind: 'priority', action: a! });
    tg.resolve();
    expect(tg.find('The Ur-Dragon', 'battlefield', 0)).not.toBeNull();
  });

  it('o momento de conjurar continua o normal', () => {
    const tg = setup({ battlefield: [[DG], []], hand: [['Dragon Whelp'], []], step: 'upkeep' });
    expect(acao(tg, 'Dragon Whelp', 'hand')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mister Fantastic';
const QUATRO = ['Mountain', 'Forest', 'Plains', 'Island'];
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('alcance e vigilância; no início do combate, compra uma carta se você conjurou uma mágica que não é de criatura', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []], library: [lib, lib] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 4]);
    expect(hasKw(tg.g, id, 'reach') && hasKw(tg.g, id, 'vigilance')).toBe(true);
    tg.cast('Sol Ring').resolveAll();
    tg.passTo('declareAttackers');
    expect(tg.names(0, 'hand')).toHaveLength(1);
  });

  it('copia duas vezes uma habilidade desencadeada sua que está na pilha', () => {
    // o gatilho de Medusa (um marcador +1/+1) resolve três vezes
    const tg = setup({ battlefield: [[N, 'Medusa, Inhuman Queen', 'Island', ...QUATRO], []], hand: [['Sol Ring'], []], library: [lib, lib] });
    const medusa = tg.bf('Medusa, Inhuman Queen');
    tg.cast('Sol Ring');
    const gatilho = tg.state.zones.stack.find((id) => tg.state.objects[id].stack?.kind === 'triggered')!;
    tg.choose('habilidade desencadeada alvo', [gatilho]);
    tg.activate(N, 'Copie duas vezes');
    tg.resolve();
    expect(tg.state.zones.stack.filter((id) => tg.state.objects[id].stack?.kind === 'triggered')).toHaveLength(3);
    tg.resolveAll();
    expect(tg.state.objects[medusa].counters['+1/+1']).toBe(3);
  });

  it('a habilidade de um oponente não é alvo legal', () => {
    const tg = setup({ battlefield: [[N, ...QUATRO, 'Island'], ['Medusa, Inhuman Queen']], hand: [['Sol Ring'], []], library: [lib, lib] });
    tg.cast('Sol Ring');
    expect(tg.state.zones.stack.some((id) => tg.state.objects[id].stack?.kind === 'triggered')).toBe(true);
    expect(() => tg.activate(N, 'Copie duas vezes')).toThrow();
  });
});

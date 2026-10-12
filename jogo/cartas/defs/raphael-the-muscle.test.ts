import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Raphael, the Muscle';

describe(N, () => {
  it('dobra o dano das suas criaturas com marcadores, com a mesma fonte; sem marcador, não dobra', () => {
    const tg = setup({ battlefield: [[N, { name: 'Silver Myr', counters: { '+1/+1': 1 } }], ['Indomitable Ancients', { name: 'Elvish Mystic', counters: { '+1/+1': 5 } }]] });
    const alvo = tg.bf('Indomitable Ancients');
    dealDamage(tg.g, [{ source: tg.bf('Silver Myr'), target: { kind: 'obj', id: alvo }, amount: 2, combat: false }]);
    expect(tg.state.objects[alvo].damage).toBe(4);
    expect(tg.state.damagedBy?.pairs[String(tg.bf('Silver Myr'))] ?? [alvo]).toContain(alvo);
    dealDamage(tg.g, [{ source: tg.bf(N), target: { kind: 'obj', id: alvo }, amount: 2, combat: false }]);
    expect(tg.state.objects[alvo].damage).toBe(6);
    // criatura de oponente com marcadores não dobra
    dealDamage(tg.g, [{ source: tg.bf('Elvish Mystic'), target: { kind: 'obj', id: alvo }, amount: 1, combat: false }]);
    expect(tg.state.objects[alvo].damage).toBe(7);
  });

  it('quando entra, cria uma ficha Mutagen', () => {
    const tg = setup({ battlefield: [Array(5).fill('Mountain'), []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(tg.all('Mutagen')).toHaveLength(1);
  });
});
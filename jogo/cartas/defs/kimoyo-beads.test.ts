import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Kimoyo Beads';
const ilhas = Array(12).fill('Island');

describe(N, () => {
  it('a cada etapa final sua, uma conta que ainda não foi escolhida; a Conta Principal faz o artefato sair e voltar', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ilhas] });
    const primeiro = tg.bf(N);
    tg.choose('escolha', ['Conta AV — Compre uma carta']);
    tg.passTo('upkeep', 1);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    // no turno seguinte, a Conta AV já não aparece
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.items.some((i) => i.label.startsWith('Conta'))) return null;
      expect(d.items.filter((i) => !i.disabled).map((i) => i.label.split(' — ')[0])).toEqual(['Conta de Comunicação', 'Conta Principal']);
      return { kind: 'select', ids: [d.items.find((i) => i.label.startsWith('Conta de Comunicação'))!.id] };
    });
    tg.passTo('upkeep', 0).passTo('upkeep', 1);
    expect(tg.all('Soldier')).toHaveLength(2);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.items.some((i) => i.label.startsWith('Conta'))) return null;
      return { kind: 'select', ids: [d.items.find((i) => i.label.startsWith('Conta Principal'))!.id] };
    });
    tg.passTo('upkeep', 0).passTo('upkeep', 1);
    expect(tg.life(0)).toBe(43);
    const novo = tg.bf(N);
    expect(novo).not.toBe(primeiro);
    expect(tg.state.objects[novo].data.contasEscolhidas).toBeUndefined();
  });
});
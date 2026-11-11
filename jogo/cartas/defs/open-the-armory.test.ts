import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Open the Armory';

function busca(escolha: string) {
  return (d: { kind: string; prompt: string; items?: { id: unknown; label: string; disabled?: boolean }[] }) => {
    if (d.kind !== 'select' || !d.prompt.includes('Aura ou de Equipamento')) return null;
    const ativos = d.items!.filter((i) => !i.disabled);
    expect(ativos.map((i) => i.label).sort()).toEqual(['Angelic Gift', 'Swiftfoot Boots']);
    return { kind: 'select', ids: [ativos.find((i) => i.label === escolha)!.id] };
  };
}

describe(N, () => {
  it('busca uma carta de Aura para a mão (só Auras e Equipamentos são oferecidos)', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Island', 'Angelic Gift', 'Sol Ring', 'Swiftfoot Boots'], ['Island']] });
    tg.script.push(busca('Angelic Gift') as never);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Angelic Gift']);
    expect(tg.names(0, 'library')).toHaveLength(3);
  });

  it('ou uma carta de Equipamento', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], []], hand: [[N], []], library: [['Island', 'Angelic Gift', 'Sol Ring', 'Swiftfoot Boots'], ['Island']] });
    tg.script.push(busca('Swiftfoot Boots') as never);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Swiftfoot Boots']);
  });
});

import { describe, expect, it } from 'vitest';
import { gainLife } from '../../motor/actions.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Cleric Class';
const planicies = (n: number) => Array(n).fill('Plains');
const niveis = (tg: ReturnType<typeof setup>) => {
  const d = tg.pending;
  return d?.kind === 'priority' ? d.actions.filter((a) => a.id.startsWith('act:') && a.label.includes('Nível')).map((a) => a.label) : [];
};

describe(N, () => {
  it('nível 1: você ganha 1 de vida a mais', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(gainLife(tg.g, 0, 3, null)).toBe(4);
    expect(gainLife(tg.g, 1, 3, null)).toBe(3);
  });

  it('no nível 1 só dá para ganhar o nível 2, e só como feitiço', () => {
    const tg = setup({ battlefield: [[N, ...planicies(10)], []] });
    expect(niveis(tg)).toHaveLength(1);
    expect(niveis(tg)[0]).toContain('Nível 2');
    const outro = setup({ active: 1, battlefield: [[N, ...planicies(10)], []] });
    outro.pass();
    expect(outro.pending?.player).toBe(0);
    expect(niveis(outro)).toHaveLength(0);
  });

  it('nível 2: a cada ganho de vida, um marcador +1/+1 na criatura alvo que você controla', () => {
    const tg = setup({ battlefield: [[N, ...planicies(4), 'Silver Myr'], ['Elvish Mystic']] });
    // no nível 1 o ganho de vida não dispara nada
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([1, 1]);
    tg.activate(N, 'Nível 2').resolveAll();
    expect(tg.state.objects[tg.bf(N)].classLevel).toBe(2);
    tg.choose('criatura alvo que você controla', ['Silver Myr']);
    gainLife(tg.g, 0, 1, null);
    tg.refresh().resolveAll();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([2, 2]);
  });

  it('nível 3: devolve uma carta de criatura do cemitério ao campo e você ganha vida igual à resistência dela, mais 1', () => {
    const tg = setup({ battlefield: [[N, ...planicies(5)], []], graveyard: [['Indomitable Ancients', 'Sol Ring'], []] });
    tg.state.objects[tg.bf(N)].classLevel = 2;
    tg.refresh();
    expect(niveis(tg)[0]).toContain('Nível 3');
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de criatura alvo do seu cemitério')) return null;
      expect(d.items.map((i) => i.label)).toEqual(['Indomitable Ancients']);
      return { kind: 'select', ids: [d.items[0].id] };
    });
    // o gatilho do nível 2 (ganho de vida) mira a criatura que voltou
    tg.choose('criatura alvo que você controla', ['Indomitable Ancients']);
    tg.activate(N, 'Nível 3').resolveAll();
    expect(tg.state.objects[tg.bf(N)].classLevel).toBe(3);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
    // resistência 10, mais 1 do nível 1
    expect(tg.life(0)).toBe(51);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([3, 11]);
  });
});
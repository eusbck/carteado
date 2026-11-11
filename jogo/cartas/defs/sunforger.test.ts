import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sunforger';

describe(N, () => {
  it('a equipada recebe +4/+0; {R}{W} e desanexar: conjura de graça uma instantânea vermelha ou branca de valor até 4 do grimório', () => {
    const tg = setup({
      battlefield: [['Mountain', 'Plains', 'Silver Myr', { name: N, attachTo: 'Silver Myr' }], []],
      library: [['Forest', 'Lightning Bolt', 'Counterspell', 'Forest'], ['Island']],
    });
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([5, 1]);
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea vermelha ou branca')) return null;
      oferecidas = d.items.filter((i) => !(i as { disabled?: boolean }).disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Lightning Bolt')!.id] };
    });
    tg.choose('alvo', ['Bruno']).activate(N, 'Desanexe').resolve();
    expect(oferecidas).toEqual(['Lightning Bolt']);
    expect(tg.state.objects[tg.bf(N)].attachedTo).toBeNull();
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'graveyard')).toEqual(['Lightning Bolt']);
  });

  it('sem estar anexada a uma criatura, a habilidade não pode ser ativada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Plains', N], []] });
    expect(tg.pending?.kind === 'priority' && tg.pending.actions.some((a) => a.label.includes('Desanexe'))).toBe(false);
  });
});

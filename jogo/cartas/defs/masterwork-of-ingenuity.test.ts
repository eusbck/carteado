import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Masterwork of Ingenuity';

describe(N, () => {
  it('entra como cópia do Equipamento, sem estar anexado a nada', () => {
    const tg = setup({ battlefield: [['Plains', 'Silver Myr'], [{ name: 'Loxodon Warhammer' }, 'Wall of Omens']], hand: [[N], []] });
    tg.state.objects[tg.bf('Loxodon Warhammer')].attachedTo = tg.bf('Wall of Omens');
    tg.refresh();
    let oferecidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('entrar como cópia') ? (oferecidos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Loxodon Warhammer')!.id] }) : null));
    tg.cast(N).resolveAll();
    expect(oferecidos).toEqual(['Não copiar', 'Loxodon Warhammer']);
    const meu = tg.all('Loxodon Warhammer').find((id) => tg.state.objects[id].controller === 0)!;
    expect(tg.state.objects[meu].attachedTo).toBeNull();
    // é o martelo: anexado, dá +3/+0
    tg.state.objects[meu].attachedTo = tg.bf('Silver Myr');
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 1]);
  });
});

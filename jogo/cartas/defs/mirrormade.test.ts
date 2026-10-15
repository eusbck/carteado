import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Mirrormade', () => {
  it('entra como cópia de um artefato do oponente, sem os marcadores dele', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Wall of Omens'], [{ name: 'Sol Ring', counters: { charge: 2 } }]], hand: [['Mirrormade'], []] });
    let oferecidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('entrar como cópia') ? (oferecidos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.cast('Mirrormade').resolve();
    expect(oferecidos).toEqual(['Não copiar', 'Sol Ring']);
    const ids = tg.all('Sol Ring');
    expect(ids).toHaveLength(2);
    const meu = ids.find((id) => tg.state.objects[id].controller === 0)!;
    expect(nameOf(tg.g, meu)).toBe('Sol Ring');
    expect(tg.state.objects[meu].counters.charge ?? 0).toBe(0);
  });
});

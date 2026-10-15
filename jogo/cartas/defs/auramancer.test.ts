import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Auramancer', () => {
  it('ao entrar, devolve a carta de encantamento alvo do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains'], []], hand: [['Auramancer'], []], graveyard: [['Ghostly Prison', 'Wall of Omens'], ['Ghostly Prison']] });
    const gp = tg.find('Ghostly Prison', 'graveyard', 0);
    let oferecidas: number[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de encantamento alvo') ? (oferecidas = d.items.map((i) => i.obj!), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.cast('Auramancer').resolve().resolve();
    expect(oferecidas).toEqual([gp]);
    expect(tg.names(0, 'hand')).toEqual(['Ghostly Prison']);
    expect(tg.names(1, 'graveyard')).toEqual(['Ghostly Prison']);
  });
});

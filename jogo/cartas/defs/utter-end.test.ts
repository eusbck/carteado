import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Utter End', () => {
  it('exila a permanente não terreno alvo; terrenos não são alvos válidos', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Swamp', 'Swamp'], ['Sol Ring', 'Forest']], hand: [['Utter End'], []] });
    let oferecidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('alvo') ? (oferecidos = d.items.map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.cast('Utter End').resolve();
    expect(oferecidos).not.toContain('Forest');
    expect(tg.names(1, 'exile')).toEqual(['Sol Ring']);
  });
});

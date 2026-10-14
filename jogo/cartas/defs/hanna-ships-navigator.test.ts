import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Hanna, Ship's Navigator";

describe(N, () => {
  it('devolve um artefato ou encantamento do seu cemitério para a mão; outra carta não pode ser alvo', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Island', 'Island'], []], graveyard: [['Sol Ring', 'Ripjaw Raptor'], []] });
    let alvos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('artefato ou encantamento alvo') ? (alvos = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Sol Ring')!.id] }) : null));
    tg.activate(N).resolve();
    expect(alvos).toEqual(['Sol Ring']);
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring']);
  });
});

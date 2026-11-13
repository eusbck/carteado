import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = 'Lush Portico';

describe(NOME, () => {
  it('CR 305.6: mana dos tipos Forest Plains', () => expect(alternativasDeMana(NOME)).toEqual(['G', 'W'].sort()));
  it('CR 701.25: entra virado e vigia 1 (pode pôr o topo no cemitério)', () => {
    const tg = setup({ hand: [[NOME], []], library: [['Zetalpa, Primal Dawn', 'Island'], []] });
    tg.script.push((d) => (d.kind === 'arrange' ? { kind: 'arrange', order: d.items.map((i) => i.id), placement: Object.fromEntries(d.items.map((i) => [i.id, 'graveyard'])) } : null));
    tg.play(NOME).resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
    expect(tg.names(0, 'graveyard')).toEqual(['Zetalpa, Primal Dawn']);
  });
});

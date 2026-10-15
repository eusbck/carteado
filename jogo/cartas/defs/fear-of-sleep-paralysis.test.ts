import { describe, expect, it } from 'vitest';
import { putOntoBattlefield } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const FEAR = 'Fear of Sleep Paralysis';
const ilhas = Array(6).fill('Island');

describe(FEAR, () => {
  it('a criatura do oponente com marcador de atordoamento não desvira e o marcador fica', () => {
    const tg = setup({ battlefield: [ilhas, ['Indomitable Ancients']], hand: [[FEAR], []], library: [['Island', 'Island'], ['Forest', 'Forest']] });
    tg.choose('criatura alvo', ['Indomitable Ancients']);
    tg.cast(FEAR).resolve().resolve();
    const id = tg.bf('Indomitable Ancients');
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.objects[id].counters.stun).toBe(1);
    tg.passTo('main1', 1);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(tg.state.objects[id].counters.stun).toBe(1);
  });

  it('entrando junto com outros encantamentos, dispara uma vez por encantamento', () => {
    const tg = setup({ battlefield: [[FEAR], ['Indomitable Ancients']], graveyard: [['Ghostly Prison', 'Sphere of Safety'], []] });
    const ids = [tg.find('Ghostly Prison', 'graveyard', 0)!, tg.find('Sphere of Safety', 'graveyard', 0)!];
    runEffect(tg, putOntoBattlefield(tg.g, ids.map((id) => ({ id, controller: 0 })), 'effect'));
    expect(tg.state.zones.stack).toHaveLength(2);
  });

  it('destrancar a segunda porta de uma Sala dispara', () => {
    const tg = setup({
      battlefield: [[FEAR, 'Bottomless Pool // Locker Room', ...ilhas], ['Indomitable Ancients']],
      onStart: (t) => { const id = t.bf('Bottomless Pool // Locker Room'); t.state.objects[id].face = 0; t.g.bump(); t.refresh(); },
    });
    const sala = tg.bf('Bottomless Pool // Locker Room');
    tg.choose('vire até uma criatura alvo', ['Indomitable Ancients']);
    tg.answer({ kind: 'priority', action: tg.actionIds().find((a) => a.startsWith(`unlock:${sala}:1`))! });
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolve();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].counters.stun).toBe(1);
  });
});

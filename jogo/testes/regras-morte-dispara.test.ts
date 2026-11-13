// lote4-b: "se uma criatura morrer e isso fizer disparar uma habilidade, ela dispara uma vez a mais" (motor/morte-dispara.ts):
// a morte é ir do campo para o cemitério (CR 700.4), vista como estava no campo (CR 603.10a); estáticas com `lookBack`
// valem no lote em que a própria permanente sai do campo.
import { describe, expect, it } from 'vitest';
import { destroy, ehMorteDeCriatura, exile } from '../motor/api.ts';
import type { GameEvent } from '../motor/events.ts';
import { setup } from './harness.ts';

const mudanca = (old: number, to: string): GameEvent => ({ type: 'zone', old, from: 'battlefield', to } as unknown as GameEvent);

describe('morte de criatura que faz disparar (Drivnod, The Masamune)', () => {
  it('CR 700.4: só ir do campo para o cemitério é morrer; o exílio não é, nem a morte de quem não era criatura', () => {
    const tg = setup({ battlefield: [['Wall of Omens', 'Indomitable Ancients', 'Sol Ring'], []] });
    const wall = tg.bf('Wall of Omens');
    const ancients = tg.bf('Indomitable Ancients');
    const anel = tg.bf('Sol Ring');
    tg.run(destroy(tg.g, [wall, anel]));
    tg.run(exile(tg.g, [ancients]));
    expect(ehMorteDeCriatura(tg.g, mudanca(wall, 'graveyard'))).toBe(true);
    expect(ehMorteDeCriatura(tg.g, mudanca(ancients, 'exile'))).toBe(false);
    expect(ehMorteDeCriatura(tg.g, mudanca(anel, 'graveyard'))).toBe(false);
  });

  it('CR 603.10a: estática com lookBack vale quando a própria permanente morre (Drivnod e Grave Pact)', () => {
    const tg = setup({ battlefield: [['Drivnod, Carnage Dominus', 'Grave Pact'], ['Wall of Omens', 'Indomitable Ancients', 'Burnished Hart']] });
    tg.run(destroy(tg.g, [tg.bf('Drivnod, Carnage Dominus')]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toHaveLength(2);
  });

  it('a criatura que morre depois, sem Drivnod no campo, dispara uma vez só', () => {
    const tg = setup({ battlefield: [['Drivnod, Carnage Dominus', 'Grave Pact', 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients', 'Burnished Hart']] });
    tg.run(destroy(tg.g, [tg.bf('Drivnod, Carnage Dominus')]));
    tg.resolveAll();
    tg.run(destroy(tg.g, [tg.find('Wall of Omens', 'battlefield', 0)!]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toHaveLength(3);
  });
});

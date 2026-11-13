import { describe, expect, it } from 'vitest';
import { destroy } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

describe('Grave Pact', () => {
  it('quando uma criatura sua morre, cada outro jogador sacrifica uma criatura', () => {
    const tg = setup({ players: 3, battlefield: [['Grave Pact', 'Wall of Omens'], ['Indomitable Ancients'], ['Wall of Omens']] });
    tg.run(destroy(tg.g, [tg.find('Wall of Omens', 'battlefield', 0)!]));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard')).toEqual(['Indomitable Ancients']);
    expect(tg.names(2, 'graveyard')).toEqual(['Wall of Omens']);
  });

  it('duas criaturas suas morrendo juntas disparam duas vezes', () => {
    const tg = setup({ battlefield: [['Grave Pact', 'Wall of Omens', 'Wall of Omens'], ['Indomitable Ancients', 'Wall of Omens']] });
    tg.run(destroy(tg.g, tg.state.zones.battlefield.filter((id) => tg.state.objects[id].controller === 0 && tg.state.objects[id].def === 'Wall of Omens')));
    tg.resolveAll();
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Indomitable Ancients', 'Wall of Omens']);
  });
});

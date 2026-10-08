import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Meteor Golem', () => {
  it('ao entrar, destrói permanente não terreno de um oponente', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Sol Ring', 'Plains'], ['Arcane Signet', 'Forest']], hand: [['Meteor Golem'], []] });
    tg.choose('oponente controla', ['Arcane Signet']).cast('Meteor Golem').resolve().resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Arcane Signet']);
  });
});

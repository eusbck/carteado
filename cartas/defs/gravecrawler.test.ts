import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Gravecrawler', () => {
  it('não pode bloquear', () => {
    const tg = setup({ battlefield: [['Gravecrawler'], []] });
    expect(hasKw(tg.g, tg.bf('Gravecrawler'), 'cantBlock')).toBe(true);
  });

  it('conjura do cemitério controlando um Zombie; sem Zombie, não', () => {
    const sem = setup({ battlefield: [['Swamp', 'Viscera Seer'], []], graveyard: [['Gravecrawler'], []] });
    expect(sem.canCast('Gravecrawler')).toBe(false);
    const tg = setup({ battlefield: [['Swamp', { name: 'Zombie 2/2', token: true }], []], graveyard: [['Gravecrawler'], []] });
    expect(tg.canCast('Gravecrawler')).toBe(true);
    tg.cast('Gravecrawler', '*').resolve();
    expect(tg.find('Gravecrawler')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual([]);
  });

  it('do cemitério, só no tempo de uma criatura (não com a pilha ocupada nem no turno do oponente)', () => {
    const turnoDoOponente = setup({ active: 1, battlefield: [['Swamp', 'Wall of Limbs'], []], graveyard: [['Gravecrawler'], []] });
    turnoDoOponente.pass(); // prioridade de Ana no turno de Bruno
    expect(turnoDoOponente.canCast('Gravecrawler')).toBe(false);
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Wall of Limbs'], []], graveyard: [['Gravecrawler'], []], hand: [['Sign in Blood'], []], library: [['Island', 'Island'], []] });
    tg.choose('jogador alvo', ['Ana']).cast('Sign in Blood');
    expect(tg.canCast('Gravecrawler')).toBe(false);
  });

  it('depois de conjurada, perder o Zombie não importa', () => {
    const tg = setup({ battlefield: [['Swamp', 'Wall of Limbs'], []], graveyard: [['Gravecrawler'], []] });
    tg.cast('Gravecrawler', '*');
    tg.run(destroy(tg.g, [tg.bf('Wall of Limbs')]));
    tg.resolve();
    expect(tg.find('Gravecrawler')).not.toBeNull();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Limbs']);
  });
});

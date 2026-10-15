import { describe, expect, it } from 'vitest';
import { draw } from '../../motor/api.ts';
import { runEffect } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

describe('Terminus', () => {
  it('comprada no turno do oponente, revelada e conjurada pelo milagre {W}: todas as criaturas vão para o fundo dos grimórios', () => {
    const tg = setup({
      active: 1,
      battlefield: [['Plains', 'Wall of Omens'], ['Indomitable Ancients']],
      library: [['Terminus', 'Island'], ['Forest', 'Forest']],
    });
    tg.yes('Milagre: revelar', true).yes('Milagre: conjurar', true);
    runEffect(tg, draw(tg.g, 0, 1));
    expect(tg.state.objects[tg.find('Terminus', 'hand')!].visibleTo).toBe('all');
    tg.resolve(); // o gatilho de milagre: Terminus vai para a pilha pagando {W}
    expect(tg.find('Terminus', 'stack')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
    tg.resolve();
    expect(tg.find('Wall of Omens')).toBeNull();
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Wall of Omens']);
    expect(tg.names(1, 'library')).toEqual(['Forest', 'Forest', 'Indomitable Ancients']);
    expect(tg.names(0, 'graveyard')).toEqual(['Terminus']);
  });

  it('cada dono escolhe a ordem das suas criaturas no fundo do grimório', () => {
    const tg = setup({
      battlefield: [['Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Plains', 'Wall of Omens', 'Indomitable Ancients'], ['Zetalpa, Primal Dawn']],
      hand: [['Terminus'], []],
      library: [['Island'], ['Forest']],
    });
    tg.choose('Ordene as suas permanentes', ['Indomitable Ancients', 'Wall of Omens']);
    tg.cast('Terminus').resolve();
    expect(tg.names(0, 'library')).toEqual(['Island', 'Indomitable Ancients', 'Wall of Omens']);
    expect(tg.names(1, 'library')).toEqual(['Forest', 'Zetalpa, Primal Dawn']);
  });
});

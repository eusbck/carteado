import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Slaughter Pact';

describe(NOME, () => {
  it('destrói a criatura que não é preta e, na sua próxima manutenção, quem não paga {2}{B} perde o jogo', () => {
    const tg = setup({ battlefield: [[], ['Wall of Omens']], hand: [[NOME], []], library: [['Island'], ['Island']] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast(NOME).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Wall of Omens']);
    tg.yes('Pagar {2}{B}', false);
    tg.passUntil((t) => t.state.players[0].lost === true || t.state.gameOver !== null);
    expect(tg.state.players[0].lost).toBe(true);
  });

  it('com o alvo ilegal na resolução, a mágica não resolve e não há gatilho', () => {
    const tg = setup({ battlefield: [['Island'], []], hand: [[NOME, 'Essence Flux'], []], library: [['Island'], []] });
    // a Pact mira a criatura; em resposta, Essence Flux a faz sair e voltar: é outro objeto (CR 400.7)
    const tg2 = setup({ battlefield: [['Island', 'Wall of Omens'], []], hand: [[NOME, 'Essence Flux'], []], library: [['Island', 'Island'], []] });
    tg2.choose('criatura alvo', ['Wall of Omens']).cast(NOME);
    tg2.choose('criatura alvo', ['Wall of Omens']).cast('Essence Flux');
    tg2.resolveAll();
    expect(tg2.find('Wall of Omens')).not.toBeNull();
    expect(tg2.names(0, 'graveyard')).toContain(NOME);
    expect(tg2.state.delayedTriggers.filter((d) => d.abilityId === 'Slaughter Pact:manutencao')).toHaveLength(0);
    void tg;
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Pact of Negation';

describe(NOME, () => {
  it('anula a mágica; na sua próxima manutenção, quem não paga {3}{U}{U} perde o jogo', () => {
    const tg = setup({ battlefield: [[], ['Swamp']], hand: [[NOME], ['Dark Ritual']], library: [['Island'], ['Island']], active: 1 });
    tg.cast('Dark Ritual');
    tg.pass();
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Dark Ritual']);
    // não dispara na manutenção de Bruno: só na próxima manutenção de Ana
    tg.yes('Pagar {3}{U}{U}', false);
    tg.passUntil((t) => t.state.players[0].lost === true || (t.state.turn.active === 0 && t.state.turn.step === 'draw'));
    expect(tg.state.players[0].lost).toBe(true);
  });

  it('pagando {3}{U}{U}, você continua no jogo', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Island', 'Swamp'], []], hand: [[NOME, 'Dark Ritual'], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.cast('Dark Ritual');
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME).resolveAll();
    tg.yes('Pagar {3}{U}{U}', true);
    tg.passTo('draw', 0);
    expect(tg.state.players[0].lost).toBeFalsy();
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].tapped)).toHaveLength(5);
  });

  it('se a Pact não resolve (alvo ilegal), não há gatilho na manutenção', () => {
    const tg = setup({ battlefield: [['Swamp'], []], hand: [[NOME, 'Dark Ritual', 'Pact of Negation'], []] });
    tg.cast('Dark Ritual');
    // a primeira Pact mira o Dark Ritual; a segunda anula a primeira
    tg.choose('mágica alvo', ['Dark Ritual']).cast(NOME);
    tg.choose('mágica alvo', [NOME]).cast(NOME);
    tg.resolve();
    expect(tg.state.delayedTriggers.filter((d) => d.abilityId === 'Pact of Negation:manutencao')).toHaveLength(1);
  });
});

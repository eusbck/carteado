import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const NOME = 'Wishclaw Talisman';

describe(NOME, () => {
  it('busca, e o oponente escolhido ganha o controle; ele só pode ativar no turno dele', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { wish: 3 } }, 'Swamp'], ['Island']], library: [['Island', 'Zetalpa, Primal Dawn'], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).activate(NOME).resolve();
    expect(tg.names(0, 'hand')).toEqual(['Zetalpa, Primal Dawn']);
    const id = tg.bf(NOME);
    expect(tg.state.objects[id].counters.wish).toBe(2);
    expect(tg.names(1, 'battlefield')).toContain(NOME);
    // no turno de Ana, Bruno não pode ativar
    tg.pass();
    expect(tg.actionIds().some((a) => a.startsWith('act:') && a.includes(String(id)))).toBe(false);
  });

  it('com três jogadores, quem ativa escolhe qual oponente ganha o controle', () => {
    const tg = setup({ players: 3, battlefield: [[{ name: NOME, counters: { wish: 3 } }, 'Swamp'], [], []], library: [['Island', 'Zetalpa, Primal Dawn'], [], []] });
    tg.choose('Procure', ['Zetalpa, Primal Dawn']).choose('escolha o oponente', [tg.state.players[2].name]).activate(NOME).resolve();
    expect(tg.names(2, 'battlefield')).toContain(NOME);
    expect(tg.names(1, 'battlefield')).not.toContain(NOME);
  });

  it('sem marcadores de desejo, a habilidade não pode ser ativada', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { wish: 0 } }, 'Swamp'], []] });
    expect(tg.actionIds().some((a) => a.startsWith('act:'))).toBe(false);
  });

  it('entra com três marcadores de desejo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp'], []], hand: [[NOME], []] });
    tg.cast(NOME).resolve();
    expect(tg.state.objects[tg.bf(NOME)].counters.wish).toBe(3);
  });
});

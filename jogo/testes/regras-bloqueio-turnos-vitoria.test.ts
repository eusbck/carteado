// Recursos do motor para as cartas do Calling All Angels: custo para bloquear (gancho blockCost), turnos que cada jogador
// já tomou (turnsTaken) e "não pode vencer o jogo" (gancho cantWinGame).
import { describe, expect, it } from 'vitest';
import { winGame } from '../motor/api.ts';
import { fixture as setup } from './artefatos.ts';

describe('Custo para bloquear (CR 509.1d-f)', () => {
  it('CR 509.1d: o defensor paga ao declarar; desistindo do pagamento, declara de novo', () => {
    // Archangel of Tithes atacando: bloquear custa {1} por criatura
    const tg = setup({ battlefield: [['Archangel of Tithes'], ['Baleful Strix', 'Island']] });
    let pedidos = 0;
    tg.script.push((d, t) => {
      if (d.kind !== 'blockers') return null;
      pedidos++;
      return { kind: 'blockers', blocks: [[t.bf('Baleful Strix'), t.bf('Archangel of Tithes')]] };
    });
    tg.script.push((d) => (d.kind === 'payment' && d.prompt.includes('bloquear') ? { kind: 'payment', cancel: true } : null));
    tg.script.push((d) => {
      if (d.kind !== 'blockers') return null;
      pedidos++;
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Archangel of Tithes', 1]]).passTo('main2', 0);
    expect(pedidos).toBe(2);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(false);
    expect(tg.life(1)).toBe(37);
  });

  it('CR 509.1d: sem mana para o custo, a declaração é recusada', () => {
    const tg = setup({ battlefield: [['Archangel of Tithes'], ['Baleful Strix']] });
    let erro: string | null = null;
    tg.script.push((d, t) => {
      if (d.kind !== 'blockers') return null;
      erro = (d as typeof d & { validate?: (a: unknown) => string | null }).validate?.({ kind: 'blockers', blocks: [[t.bf('Baleful Strix'), t.bf('Archangel of Tithes')]] }) ?? null;
      return { kind: 'blockers', blocks: [] };
    });
    tg.attack([['Archangel of Tithes', 1]]).passTo('main2', 0);
    expect(erro).toContain('509.1d');
  });
});

describe('Turnos tomados por jogador', () => {
  it('cada jogador conta os próprios turnos', () => {
    const tg = setup({ players: 3, battlefield: [[], [], []] });
    const antes = tg.state.players.map((p) => p.turnsTaken ?? 0);
    tg.passTo('main1', 1).passTo('main1', 2).passTo('main1', 0);
    expect(tg.state.players.map((p, i) => (p.turnsTaken ?? 0) - antes[i])).toEqual([1, 1, 1]);
  });
});

describe('Não pode vencer o jogo (CR 104.2)', () => {
  it('CR 104.2b: um efeito que diria que o oponente vence não faz nada; CR 104.2a passa por cima', () => {
    const tg = setup({ battlefield: [['Herald of Eternal Dawn'], []] });
    winGame(tg.g, 1, 'teste');
    expect(tg.state.gameOver).toBeNull();
    tg.game.concede(0);
    expect(tg.state.gameOver?.winners).toEqual([1]);
  });
});

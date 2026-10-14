import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Bladegriff Prototype';

describe(N, () => {
  it('o jogador atingido escolhe o alvo, que pode ser de outro oponente; a habilidade continua sua', () => {
    const tg = setup({ players: 3, battlefield: [[N, 'Prismatic Lens'], ['Sol Ring', 'Forest'], ['Baleful Strix']] });
    let quem = -1;
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      quem = d.player;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Baleful Strix')!.id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(quem).toBe(1);
    // nem terreno nem permanente seu
    expect(opcoes).toEqual(['Baleful Strix', 'Sol Ring']);
    expect(tg.find('Baleful Strix')).toBeNull();
    expect(tg.find('Sol Ring')).not.toBeNull();
    expect(tg.life(1)).toBe(37);
  });

  it('se o jogador atingido saiu da partida, outro oponente escolhe', () => {
    const tg = setup({ players: 3, battlefield: [[N], ['Sol Ring'], ['Baleful Strix']] });
    tg.state.players[1].life = 3;
    tg.refresh();
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      quem = d.player;
      return { kind: 'select', ids: [d.items[0].id] };
    });
    tg.attack([[N, 1]]).passTo('main2', 0);
    expect(tg.state.players[1].left || tg.state.players[1].lost).toBeTruthy();
    expect(quem).toBe(2);
    expect(tg.find('Baleful Strix')).toBeNull();
  });
});

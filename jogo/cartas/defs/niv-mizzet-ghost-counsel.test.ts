import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife, loseLife } from '../../motor/api.ts';

describe('Niv-Mizzet, Ghost Counsel', () => {
  it('{T}: cada oponente perde 1 e você ganha 1; ao ganhar, pode pagar a mesma vida para comprar', () => {
    const tg = setup({ players: 3, battlefield: [['Niv-Mizzet, Ghost Counsel'], [], []], library: [['Island', 'Swamp'], ['Island'], ['Island']] });
    tg.yes('Niv-Mizzet: pagar 1 de vida', true);
    tg.activate('Niv-Mizzet, Ghost Counsel', '{T}').resolveAll();
    expect([tg.life(1), tg.life(2)]).toEqual([39, 39]);
    expect(tg.life(0)).toBe(40); // ganhou 1 e pagou 1
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });

  it('pode recusar: fica com a vida e não compra', () => {
    const tg = setup({ battlefield: [['Niv-Mizzet, Ghost Counsel'], []], library: [['Island'], ['Island']] });
    tg.yes('Niv-Mizzet: pagar', false);
    tg.activate('Niv-Mizzet, Ghost Counsel', '{T}').resolveAll();
    expect(tg.life(0)).toBe(41);
    expect(tg.names(0, 'hand')).toEqual([]);
  });

  it('ruling 1 — duas criaturas com vínculo com a vida causando dano de combate juntas disparam duas vezes', () => {
    const tg = setup({
      battlefield: [['Niv-Mizzet, Ghost Counsel', 'Killian, Ink Duelist', 'Indulging Patrician'], []],
      library: [['Island', 'Island', 'Island', 'Island'], ['Island']],
    });
    const pedidos: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Niv-Mizzet: pagar') ? (pedidos.push(d.prompt), { kind: 'select', ids: ['yes'] }) : null));
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Niv-Mizzet: pagar') ? (pedidos.push(d.prompt), { kind: 'select', ids: ['yes'] }) : null));
    tg.attack([['Killian, Ink Duelist', 1], ['Indulging Patrician', 1]]).passTo('main2');
    expect(pedidos.length).toBe(2);
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(40); // +2 +1 do vínculo, -2 -1 pagos
    expect(tg.names(0, 'hand').length).toBe(3);
  });

  it('CR 119.4: sem vida suficiente para pagar, não há como comprar', () => {
    const tg = setup({ battlefield: [['Niv-Mizzet, Ghost Counsel'], []], library: [['Island', 'Island', 'Island', 'Island', 'Island'], ['Island']] });
    let perguntou = false;
    tg.script.push((d) => (d.kind === 'select' && d.prompt.startsWith('Niv-Mizzet') ? (perguntou = true, { kind: 'select', ids: ['yes'] }) : null));
    gainLife(tg.g, 0, 5, null); // dispara agora
    loseLife(tg.g, 0, 42, null); // antes de o gatilho resolver: vida 3
    tg.refresh().resolveAll();
    expect(perguntou).toBe(false);
    expect(tg.life(0)).toBe(3);
    expect(tg.names(0, 'hand')).toEqual([]);
  });
});

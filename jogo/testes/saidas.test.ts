// Quem sai do campo e para onde (cliente/src/mesa/golpes.ts, itens N1 e N2 da onda R1): o destino pela zona do dono
// que cresceu (cemitério, exílio, comando, mão, grimório), o jeito de cada saída (morte, seca, volta, some) e a ordem da
// destruição em massa (pela distância da origem, intervalo mín(90; 1300 ÷ n), até 12 cópias voando).
import { describe, expect, it } from 'vitest';
import { ehGrupo, GRUPO_COPIAS, ordenarGrupo, passoGrupo, planejarSaidas, zonaQueCresceu } from '../cliente/src/mesa/golpes.ts';
import type { GameView, ObjView, PlayerView } from '../motor/view.ts';

let proximo = 1;
const obj = (o: Partial<ObjView> & { owner: number }): ObjView => ({ id: proximo++, token: false, types: ['Creature'], counters: {}, damage: 0, keywords: [], ...o } as unknown as ObjView);
const jog = (id: number, x: Partial<PlayerView> = {}): PlayerView => ({ id, life: 40, handCount: 3, libraryCount: 50, graveyard: [], ...x } as unknown as PlayerView);
const vista = (x: Partial<GameView>): GameView => ({ players: [jog(0), jog(1)], battlefield: [], exile: [], command: [], stack: [], ...x } as unknown as GameView);
const cem = (n: number) => Array.from({ length: n }, () => obj({ owner: 0 }));

describe('saídas do campo: destino e jeito', () => {
  it('criatura para o cemitério morre; artefato para o cemitério sai seco', () => {
    const c = obj({ owner: 0 }), art = obj({ owner: 0, types: ['Artifact'] });
    const a = vista({ battlefield: [c, art] });
    const v = vista({ players: [jog(0, { graveyard: cem(2) }), jog(1)] });
    expect(planejarSaidas(a, v, 0).map((s) => [s.o.id, s.zona, s.jeito])).toEqual([[c.id, 'graveyard', 'morte'], [art.id, 'graveyard', 'seca']]);
  });

  it('planeswalker exilado usa a morte; encantamento exilado sai seco', () => {
    const pw = obj({ owner: 1, types: ['Planeswalker'] }), enc = obj({ owner: 1, types: ['Enchantment'] });
    const a = vista({ battlefield: [pw, enc] });
    const v = vista({ exile: [obj({ owner: 1 }), obj({ owner: 1 })] });
    expect(planejarSaidas(a, v, 0).map((s) => s.jeito)).toEqual(['morte', 'seca']);
    expect(zonaQueCresceu(a, v, 1)).toBe('exile');
  });

  it('comandante que morre e vai para o Comando voa para lá', () => {
    const cmd = obj({ owner: 0, commander: true });
    const a = vista({ battlefield: [cmd] });
    const v = vista({ command: [obj({ owner: 0, commander: true })] });
    expect(planejarSaidas(a, v, 0)).toMatchObject([{ zona: 'command', jeito: 'morte' }]);
  });

  it('o emblema que aparece no comando não conta como destino', () => {
    const c = obj({ owner: 0 });
    expect(planejarSaidas(vista({ battlefield: [c] }), vista({ command: [obj({ owner: 0, emblem: true })] }), 0)).toEqual([]);
  });

  it('devolvida à mão: de frente para a sua mão, de verso para a mão de um oponente; o grimório sempre de verso', () => {
    const minha = obj({ owner: 0 }), dele = obj({ owner: 1, types: ['Artifact'] });
    const a = vista({ battlefield: [minha, dele] });
    const v = vista({ players: [jog(0, { handCount: 4 }), jog(1, { handCount: 4 })] });
    expect(planejarSaidas(a, v, 0).map((s) => [s.zona, s.jeito, s.verso])).toEqual([['hand', 'volta', false], ['hand', 'volta', true]]);
    const g = vista({ players: [jog(0, { libraryCount: 51 }), jog(1)] });
    expect(planejarSaidas(vista({ battlefield: [minha] }), g, 0)).toMatchObject([{ zona: 'library', jeito: 'volta', verso: true }]);
  });

  it('a ficha some no lugar, tenha ou não crescido uma zona; carta sem destino conhecido fica de fora', () => {
    const ficha = obj({ owner: 0, token: true, types: ['Artifact'] }), carta = obj({ owner: 1 });
    const s = planejarSaidas(vista({ battlefield: [ficha, carta] }), vista({}), 0);
    expect(s.map((x) => [x.o.id, x.zona, x.jeito])).toEqual([[ficha.id, null, 'some']]);
  });

  it('o cemitério tem prioridade sobre a mão que cresceu no mesmo quadro (o compra junto)', () => {
    const c = obj({ owner: 0 });
    const v = vista({ players: [jog(0, { graveyard: cem(1), handCount: 4 }), jog(1)] });
    expect(planejarSaidas(vista({ battlefield: [c] }), v, 0)[0].zona).toBe('graveyard');
  });
});

describe('destruição em massa', () => {
  const morrem = (n: number) => Array.from({ length: n }, () => obj({ owner: 0 }));

  it('vira grupo com 4 criaturas saindo sem golpe; as que morreram num golpe não contam', () => {
    const quatro = morrem(4);
    const v = vista({ players: [jog(0, { graveyard: cem(4) }), jog(1)] });
    const s = planejarSaidas(vista({ battlefield: quatro }), v, 0);
    expect(ehGrupo(s, new Set())).toBe(true);
    expect(ehGrupo(s, new Set([quatro[0].id]))).toBe(false);
    expect(ehGrupo(s.slice(0, 3), new Set())).toBe(false);
  });

  it('o intervalo é mín(90 ms; 1,3 s ÷ n): o grupo inteiro cabe em 1,3 s', () => {
    expect(passoGrupo(1)).toBe(0);
    expect(passoGrupo(4)).toBe(90);
    expect(passoGrupo(20)).toBe(65);
    expect(19 * passoGrupo(20)).toBeLessThanOrEqual(1300);
  });

  it('ordena pela distância da origem e começa depois de `inicio`', () => {
    const itens = [30, 10, 20, 0].map((x) => ({ x, y: 0, deveVoar: false, podeVoar: true }));
    const r = ordenarGrupo(itens, { x: 0, y: 0 }, 100);
    expect(r.map((x) => x.inicio)).toEqual([370, 190, 280, 100]);
  });

  it('até 12 cópias voam (as mais perto primeiro); o comandante sempre voa; a ficha nunca', () => {
    const itens = Array.from({ length: 16 }, (_, i) => ({ x: i * 10, y: 0, deveVoar: false, podeVoar: true }));
    itens[15].deveVoar = true; // o comandante, o mais longe
    itens[0].podeVoar = false; // a ficha, a mais perto
    const r = ordenarGrupo(itens, { x: 0, y: 0 });
    expect(r.filter((x) => x.voa).length).toBe(GRUPO_COPIAS);
    expect(r[15].voa).toBe(true);
    expect(r[0].voa).toBe(false);
    expect(r[1].voa).toBe(true);
    expect(r[14].voa).toBe(false);
  });
});

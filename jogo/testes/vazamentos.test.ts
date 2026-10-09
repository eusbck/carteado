// Informação oculta na vista e no pedido de desfazer:
//  - carta virada para baixo no exílio (Abstract Performance): quem não pode vê-la não recebe força, resistência,
//    lealdade, cores, tipos nem a imagem; quem pode, recebe tudo;
//  - pilha: mágica virada para baixo e habilidade de uma fonte virada para baixo (manifestada) não entregam a carta;
//  - o rótulo da jogada no pedido de desfazer (que vai para a mesa inteira) só cita a carta se ela estava à vista.
import { describe, expect, it } from 'vitest';
import { createObject } from '../motor/state.ts';
import type { ObjId, StackInfo } from '../motor/types.ts';
import { buildView } from '../motor/view.ts';
import { linhasDesfeitas } from '../servidor/desfazer.ts';
import { setup } from './harness.ts';

const CRIATURA = 'Ghoulcaller Gisa';
const PLANESWALKER = 'Jace, Multiverse Architect';

describe('vazamentos: virada para baixo', () => {
  it('no exílio: sem força, resistência, lealdade, cores, tipos nem imagem para quem não vê', () => {
    const tg = setup({ exile: [[CRIATURA, PLANESWALKER]] });
    const s = tg.state;
    const [gisa, jace] = s.zones.exile;
    for (const id of [gisa, jace]) s.objects[id].faceDown = true;
    tg.g.bump();
    for (const viewer of [0, 1, null]) {
      const v = buildView(tg.g, viewer, null);
      for (const o of v.exile) {
        expect(o).toMatchObject({ def: '', name: 'Virada para baixo', power: null, toughness: null, loyalty: null, colors: [], types: [], subtypes: [], manaCost: '', abilities: [], keywords: [] });
      }
      expect(JSON.stringify(v)).not.toContain('Gisa');
      expect(JSON.stringify(v)).not.toContain('Jace');
    }
    // quem tem permissão vê a carta inteira
    s.objects[gisa].visibleTo = [0];
    tg.g.bump();
    const dono = buildView(tg.g, 0, null).exile.find((o) => o.id === gisa)!;
    expect(dono.def).toBe(CRIATURA);
    expect(dono.power).not.toBeNull();
    expect(dono.colors).toContain('B');
    const outro = buildView(tg.g, 1, null).exile.find((o) => o.id === gisa)!;
    expect(outro).toMatchObject({ def: '', power: null, colors: [] });
  });

  it('no campo, a virada para baixo continua uma criatura 2/2 incolor sem nome para todos (CR 708.2)', () => {
    const tg = setup({ battlefield: [[CRIATURA]] });
    const id = tg.bf(CRIATURA);
    tg.state.objects[id].faceDown = true;
    tg.g.bump();
    const o = buildView(tg.g, 1, null).battlefield.find((x) => x.id === id)!;
    expect(o).toMatchObject({ def: '', name: 'Virada para baixo', power: 2, toughness: 2, colors: [], types: ['Creature'] });
    expect(buildView(tg.g, 0, null).battlefield.find((x) => x.id === id)!.def).toBe(CRIATURA);
  });

  it('na pilha: mágica virada para baixo e habilidade de fonte virada para baixo não entregam a carta', () => {
    const tg = setup({ battlefield: [[CRIATURA]] });
    const g = tg.g;
    const fonte = tg.bf(CRIATURA);
    g.state.objects[fonte].faceDown = true;
    const info = (kind: StackInfo['kind'], source?: ObjId): StackInfo => ({ kind, controller: 0, source, modes: [], targets: [], x: 0, paid: {}, data: {}, isCopy: false });
    const magica = createObject(g, { def: PLANESWALKER, owner: 0, controller: 0, zone: 'stack', faceDown: true });
    magica.stack = info('spell');
    const habilidade = createObject(g, { def: '', owner: 0, controller: 0, zone: 'stack' });
    habilidade.stack = info('triggered', fonte);
    g.bump();
    const deOutro = buildView(g, 1, null);
    expect(deOutro.stack.find((x) => x.id === magica.id)).toMatchObject({ def: '', name: 'Mágica virada para baixo' });
    expect(deOutro.stack.find((x) => x.id === habilidade.id)).toMatchObject({ def: '', name: 'Virada para baixo' });
    expect(JSON.stringify(deOutro.stack)).not.toMatch(/Gisa|Jace/);
    // o controlador vê as duas
    const doDono = buildView(g, 0, null);
    expect(doDono.stack.find((x) => x.id === magica.id)!.def).toBe(PLANESWALKER);
    expect(doDono.stack.find((x) => x.id === habilidade.id)!.def).toBe(CRIATURA);
  });
});

describe('vazamentos: rótulo do pedido de desfazer', () => {
  it('mágica da mão conjurada e cancelada: o pedido diz só "conjura uma mágica"', () => {
    const tg = setup({ battlefield: [['Swamp']], hand: [['Sol Ring']] });
    const voltar = tg.game.fork();
    const n0 = tg.game.inputs.length;
    tg.settle();
    const d = tg.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const acao = d.actions.find((a) => a.kind === 'cast')!;
    expect(acao.label).toContain('Sol Ring');
    tg.answer({ kind: 'priority', action: acao.id });
    // cancela no pagamento: nada aparece no registro, a carta continua na mão
    expect(tg.pending?.kind).toBe('payment');
    tg.answer({ kind: 'payment', cancel: true });
    expect(tg.state.zones.hand[0].map((id) => tg.state.objects[id].def)).toEqual(['Sol Ring']);
    const linhas = linhasDesfeitas(tg.game, voltar, tg.game.inputs[n0]);
    expect(linhas.map((l) => l.texto)).toEqual(['Ana conjura uma mágica']);
  });

  it('jogada com uma carta à vista de todos: o rótulo continua o mesmo', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Swamp']], hand: [['Sol Ring']] });
    const voltar = tg.game.fork();
    const n0 = tg.game.inputs.length;
    const d = tg.pending!;
    if (d.kind !== 'priority') throw new Error('sem prioridade');
    const anel = tg.bf('Sol Ring');
    const acao = d.actions.find((a) => a.obj === anel && a.kind !== 'cast')!;
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao.id });
    tg.settle();
    const linhas = linhasDesfeitas(tg.game, voltar, tg.game.inputs[n0]);
    expect(linhas[0].texto).toBe(`Ana: ${acao.label}`);
  });
});

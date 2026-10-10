// O plano do combate visto de uma vista para a seguinte (cliente/src/mesa/golpes.ts): quem foi declarado atacante e quem
// golpeou no dano (bloqueadores, jogador ou planeswalker), com quanto e se morreu; primeiro golpe e golpe duplo; nada de
// golpe quando a etapa não passou por uma etapa de dano (a mágica que dá dano no meio do combate) ou ninguém levou dano.
import { describe, expect, it } from 'vitest';
import '../cartas/index.ts';
import { danoDe, planejarCombate } from '../cliente/src/mesa/golpes.ts';
import type { ObjId } from '../motor/types.ts';
import { buildView, type GameView } from '../motor/view.ts';
import { setup, type TestGame } from './harness.ts';

const vista = (tg: TestGame): GameView => { tg.settle(); return structuredClone(buildView(tg.g, 0, tg.pending)); };
const ate = (tg: TestGame, step: string) => tg.passUntil((x) => x.state.turn.step === step);

/** Ana (0) ataca Bruno (1) com a Daemogoth, o Kami e uma ficha; Bruno bloqueia o Kami com o Ancients e a ficha com a ficha dele */
function combate(blocos?: (ids: Record<'daemo' | 'kami' | 'fichaAna' | 'ancients' | 'fichaBruno', ObjId>) => [ObjId, ObjId][]) {
  const tg = setup({ step: 'beginCombat', active: 0, battlefield: [
    ['Defiling Daemogoth', 'Kami of Ancient Law', { name: 'Goblin', token: true }],
    ['Indomitable Ancients', { name: 'Goblin', token: true }],
  ], library: [['Forest', 'Forest'], ['Forest', 'Forest']] });
  const [fichaAna] = tg.all('Goblin').filter((id) => tg.state.objects[id].controller === 0);
  const [fichaBruno] = tg.all('Goblin').filter((id) => tg.state.objects[id].controller === 1);
  const ids = { daemo: tg.bf('Defiling Daemogoth'), kami: tg.bf('Kami of Ancient Law'), fichaAna, ancients: tg.bf('Indomitable Ancients'), fichaBruno };
  const antes = vista(tg);
  tg.attack([[ids.daemo, 1], [ids.kami, 1], [ids.fichaAna, 1]]);
  tg.block(blocos ? blocos(ids) : [[ids.ancients, ids.kami], [ids.fichaBruno, ids.fichaAna]]);
  ate(tg, 'declareAttackers');
  const declarados = vista(tg);
  ate(tg, 'declareBlockers');
  const bloqueios = vista(tg);
  ate(tg, 'combatDamage');
  const dano = vista(tg);
  return { tg, ids, antes, declarados, bloqueios, dano };
}

describe('golpes: o plano do combate', () => {
  it('ataque declarado: os atacantes novos e para quem vão; nenhum golpe', () => {
    const { ids, antes, declarados } = combate();
    const p = planejarCombate(antes, declarados);
    expect(p.golpes).toEqual([]);
    expect(p.declarados.map((x) => x.id).sort()).toEqual([ids.daemo, ids.kami, ids.fichaAna].sort());
    expect(p.declarados.every((x) => x.alvo.tipo === 'jogador' && x.alvo.id === 1)).toBe(true);
    // a vista seguinte com os mesmos atacantes não declara de novo
    expect(planejarCombate(declarados, declarados).declarados).toEqual([]);
  });

  it('dano de combate: o sem bloqueio golpeia o jogador; os bloqueados, os bloqueadores; quem morreu fica marcado', () => {
    const { ids, bloqueios, dano } = combate();
    const p = planejarCombate(bloqueios, dano);
    expect(p.declarados).toEqual([]);
    const por = new Map(p.golpes.map((g) => [g.atacante, g]));
    expect(p.golpes).toHaveLength(3);
    const forca = (id: ObjId) => danoDe(bloqueios.battlefield.find((o) => o.id === id)!);
    expect(por.get(ids.daemo)).toEqual({ atacante: ids.daemo, alvo: { tipo: 'jogador', id: 1 }, dano: forca(ids.daemo), morreu: false });
    expect(por.get(ids.kami)).toEqual({ atacante: ids.kami, alvo: { tipo: 'bloqueadores', ids: [ids.ancients] }, dano: forca(ids.kami), morreu: true });
    expect(por.get(ids.fichaAna)).toMatchObject({ alvo: { tipo: 'bloqueadores', ids: [ids.fichaBruno] }, dano: 1, morreu: true });
    // a vida de Bruno caiu de fato
    expect(dano.players[1].life).toBe(bloqueios.players[1].life - forca(ids.daemo));
  });

  it('as etapas de dano numa vista só, vindo de antes do bloqueio declarado: os bloqueios vêm da vista nova', () => {
    // a Daemogoth (ameaça) bloqueada pelo Ancients e pela ficha de Bruno sobrevive e continua no combate da vista nova
    const { ids, declarados, dano } = combate((x) => [[x.ancients, x.daemo], [x.fichaBruno, x.daemo]]);
    const p = planejarCombate(declarados, dano);
    expect(p.golpes.find((g) => g.atacante === ids.daemo)).toMatchObject({ alvo: { tipo: 'bloqueadores', ids: [ids.ancients, ids.fichaBruno] }, morreu: false });
  });

  it('o turno seguinte também conta (a sala mandou o fim do combate e o turno novo de uma vez)', () => {
    const { tg, bloqueios } = combate();
    tg.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'main1');
    const p = planejarCombate(bloqueios, vista(tg));
    expect(p.golpes).toHaveLength(3);
  });

  it('dano no meio do combate sem passar pela etapa de dano (uma mágica nos bloqueadores): nenhum golpe', () => {
    const { bloqueios } = combate();
    const depois = structuredClone(bloqueios);
    depois.players[1].life -= 2;
    expect(planejarCombate(bloqueios, depois).golpes).toEqual([]);
  });

  it('a etapa de dano passou sem ninguém levar dano nem morrer: nenhum golpe', () => {
    const { bloqueios } = combate();
    const depois = structuredClone(bloqueios);
    depois.turn.step = 'combatDamage';
    expect(planejarCombate(bloqueios, depois).golpes).toEqual([]);
  });

  it('planeswalker atacado: o golpe vai nele', () => {
    const { ids, bloqueios, dano } = combate();
    const a = structuredClone(bloqueios), v = structuredClone(dano);
    for (const x of [a, v]) for (const at of x.combat?.attackers ?? []) if (at.id === ids.daemo) at.target = { kind: 'obj', id: 999 };
    expect(planejarCombate(a, v).golpes.find((g) => g.atacante === ids.daemo)?.alvo).toEqual({ tipo: 'planeswalker', id: 999 });
  });

  it('quem ataca de novo noutro turno é declarado de novo, mesmo com o mesmo número de objeto', () => {
    const { declarados } = combate();
    const novo = structuredClone(declarados);
    novo.turn = { ...novo.turn, number: novo.turn.number + 2 };
    expect(planejarCombate(declarados, novo).declarados).toHaveLength(3);
  });

  it('primeiro golpe e golpe duplo: cada um na etapa dele; as duas etapas juntas, todos uma vez', () => {
    const tg = setup({ step: 'beginCombat', active: 0, battlefield: [
      ['Danitha Capashen, Paragon', 'Cyan, Vengeful Samurai', 'Kami of Ancient Law'], ['Indomitable Ancients'],
    ], library: [['Forest', 'Forest'], ['Forest', 'Forest']] });
    const danitha = tg.bf('Danitha Capashen, Paragon'), cyan = tg.bf('Cyan, Vengeful Samurai'), kami = tg.bf('Kami of Ancient Law');
    tg.attack([[danitha, 1], [cyan, 1], [kami, 1]]);
    tg.block([]);
    ate(tg, 'declareBlockers');
    const a = vista(tg);
    ate(tg, 'firstStrikeDamage');
    const primeiro = vista(tg);
    ate(tg, 'combatDamage');
    const normal = vista(tg);
    const quem = (x: GameView, y: GameView) => planejarCombate(x, y).golpes.map((g) => g.atacante).sort();
    expect(quem(a, primeiro)).toEqual([danitha, cyan].sort());
    expect(quem(primeiro, normal)).toEqual([cyan, kami].sort());
    expect(quem(a, normal)).toEqual([danitha, cyan, kami].sort());
  });

  it('atacante sem força (0/5) não golpeia', () => {
    const tg = setup({ step: 'beginCombat', active: 0, battlefield: [['Nyx-Fleece Ram', 'Kami of Ancient Law'], []], library: [['Forest'], ['Forest']] });
    const ram = tg.bf('Nyx-Fleece Ram'), kami = tg.bf('Kami of Ancient Law');
    tg.attack([[ram, 1], [kami, 1]]);
    ate(tg, 'declareAttackers');
    const a = vista(tg);
    ate(tg, 'combatDamage');
    expect(planejarCombate(a, vista(tg)).golpes.map((g) => g.atacante)).toEqual([kami]);
  });
});

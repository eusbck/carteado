import { describe, expect, it } from 'vitest';
import { destroy, nameOf, sacrifice } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';
import { EMBLEMA_SEPHIROTH } from '../sephiroth.ts';

const NOME = 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel';
const emblemas = (tg: ReturnType<typeof setup>) => tg.state.zones.command.filter((id) => tg.state.objects[id].def === EMBLEMA_SEPHIROTH);

describe(NOME, () => {
  it('na quarta resolução no turno, Sephiroth transforma e você recebe o emblema', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Wall of Omens', 'Wall of Omens'], ['Wall of Omens', 'Indomitable Ancients']] });
    const id = tg.bf(NOME);
    const minhas = tg.all('Wall of Omens').filter((x) => tg.state.objects[x].controller === 0);
    tg.run(sacrifice(tg.g, minhas));
    tg.resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.life(0)).toBe(43);
    expect(tg.state.objects[id].face).toBe(0);
    const dele = tg.all('Wall of Omens').find((x) => tg.state.objects[x].controller === 1)!;
    tg.run(destroy(tg.g, [dele]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(36);
    expect(tg.state.objects[id].face).toBe(1);
    expect(nameOf(tg.g, id)).toBe('Sephiroth, One-Winged Angel');
    expect(emblemas(tg)).toHaveLength(1);
    // o emblema dispara com qualquer criatura morrendo; o verso não tem mais o dreno
    tg.run(destroy(tg.g, [tg.bf('Indomitable Ancients')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(35);
    expect(tg.life(0)).toBe(45);
  });

  it('a contagem recomeça a cada turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Wall of Omens', 'Wall of Omens'], ['Wall of Omens']] });
    const id = tg.bf(NOME);
    tg.run(sacrifice(tg.g, tg.all('Wall of Omens').filter((x) => tg.state.objects[x].controller === 0)));
    tg.resolveAll();
    tg.passTo('upkeep', 1);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.state.objects[id].face).toBe(0);
    expect(emblemas(tg)).toHaveLength(0);
  });

  it('morrendo junto com outras criaturas, dispara para cada uma, mas não transforma', () => {
    const tg = setup({ battlefield: [[NOME, 'Wall of Omens', 'Wall of Omens', 'Wall of Omens', 'Wall of Omens'], []] });
    tg.run(sacrifice(tg.g, tg.state.zones.battlefield.filter((x) => tg.state.objects[x].controller === 0)));
    tg.resolveAll();
    expect(tg.life(1)).toBe(36);
    expect(emblemas(tg)).toHaveLength(0);
  });

  it('entra: pode sacrificar outra criatura para comprar uma carta', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], []], hand: [[NOME], []], library: [['Forest', 'Island'], []] });
    tg.yes('sacrificar outra criatura').choose('sacrifique outra criatura', ['Wall of Omens']);
    tg.cast(NOME).resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
    // e o dreno dispara pela Wall of Omens que morreu
    expect(tg.life(1)).toBe(39);
  });

  it('verso: ao atacar, sacrifica quantas criaturas quiser e compra essa quantidade', () => {
    const tg = setup({
      step: 'beginCombat',
      battlefield: [[{ name: NOME }, 'Wall of Omens', 'Indomitable Ancients'], []],
      library: [['Forest', 'Island', 'Plains'], []],
      onStart: (t) => { t.state.objects[t.bf(NOME)].face = 1; t.g.bump(); t.refresh(); },
    });
    tg.choose('sacrifique quantas', ['Wall of Omens', 'Indomitable Ancients']);
    tg.attack([[NOME, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest', 'Island']);
  });

  it('o comandante transformado que vai para a zona de comando volta com a frente para cima', () => {
    const tg = setup({ battlefield: [[{ name: NOME, commander: true }], []] });
    const id = tg.bf(NOME);
    tg.state.objects[id].face = 1;
    tg.g.bump();
    tg.refresh();
    tg.yes('zona de comando');
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    const cmd = tg.state.zones.command.find((x) => tg.state.objects[x].def === NOME);
    expect(cmd).toBeDefined();
    expect(tg.state.objects[cmd!].face).toBe(0);
    expect(nameOf(tg.g, cmd!)).toBe('Sephiroth, Fabled SOLDIER');
  });
});

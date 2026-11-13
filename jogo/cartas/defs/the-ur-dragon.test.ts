import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { sacrifice } from '../../motor/api.ts';

const UR = 'The Ur-Dragon';
const conjuravel = (tg: ReturnType<typeof setup>, id: number, metodo: string) => tg.actionIds().includes(`cast:${id}:${metodo}`);

describe(UR, () => {
  it('eminência na zona de comando: outras mágicas de Dragon custam {1} a menos; outras não', () => {
    // Dragon Whelp ({2}{R}{R}) com três terrenos
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], command: [[UR], []], hand: [['Dragon Whelp', 'Indomitable Ancients'], []] });
    expect(conjuravel(tg, tg.find('Dragon Whelp', 'hand')!, 'hand')).toBe(true);
    expect(tg.canCast('Indomitable Ancients')).toBe(false);
    const sem = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain'], []], hand: [['Dragon Whelp'], []] });
    expect(sem.canCast('Dragon Whelp')).toBe(false);
  });

  it('compra uma carta para cada Dragon que atacou, mesmo que um tenha saído do campo', () => {
    const tg = setup({
      battlefield: [[UR, 'Dragon Whelp', 'Wall of Omens'], []],
      library: [['Island', 'Plains', 'Swamp'], []],
    });
    tg.attack([[UR, 1], ['Dragon Whelp', 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    // o Whelp sai do campo antes de o gatilho resolver: compra 2 mesmo assim
    tg.run(sacrifice(tg.g, [tg.bf('Dragon Whelp')]));
    expect(tg.find('Dragon Whelp', 'graveyard')).not.toBeNull();
    tg.resolve();
    expect(tg.names(0, 'hand').sort()).toEqual(['Island', 'Plains']);
  });

  it('coloca só uma carta de permanente da mão no campo; ela não está atacando', () => {
    const tg = setup({
      battlefield: [[UR, 'Dragon Whelp'], []],
      hand: [['Indomitable Ancients', 'Wall of Omens', 'Demonic Tutor'], []],
      library: [['Island', 'Plains'], []],
    });
    let oferecidas: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('carta de permanente da sua mão')) return null;
      oferecidas = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Indomitable Ancients')!.id] };
    });
    tg.attack([[UR, 1], ['Dragon Whelp', 1]]).passUntil((x) => x.state.turn.step === 'declareAttackers' && x.state.zones.stack.length > 0);
    tg.resolve();
    // Demonic Tutor não é carta de permanente
    expect(oferecidas).toEqual(['Indomitable Ancients', 'Island', 'Plains', 'Wall of Omens']);
    const anc = tg.bf('Indomitable Ancients');
    expect(tg.state.combat!.attackers.some((a) => a.id === anc)).toBe(false);
    expect(tg.names(0, 'hand').sort()).toEqual(['Demonic Tutor', 'Island', 'Plains', 'Wall of Omens']);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';
import { goadada, suspeita } from '../culpa.ts';

const NOME = 'Hot Pursuit';

describe(NOME, () => {
  it('suspeita a criatura alvo e a mantém goadada enquanto estiver no campo; saindo, ela continua suspeita mas não goadada', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain'], ['Indomitable Ancients']], hand: [[NOME], []] });
    tg.choose('criatura alvo que um oponente', ['Indomitable Ancients']).cast(NOME).resolveAll();
    const anc = tg.bf('Indomitable Ancients');
    expect(suspeita(tg.g, anc)).toBe(true);
    expect(goadada(tg.g, anc)).toBe(true);
    tg.run(destroy(tg.g, [tg.bf(NOME)]));
    expect(suspeita(tg.g, anc)).toBe(true);
    expect(goadada(tg.g, anc)).toBe(false);
  });

  it('com dois jogadores fora, no seu combate você ganha o controle das goadadas e suspeitas, desviradas e com ímpeto', () => {
    const tg = setup({ players: 4, step: 'main1', battlefield: [[NOME], [{ name: 'Indomitable Ancients', tapped: true }], [], []] });
    const anc = tg.bf('Indomitable Ancients');
    tg.state.objects[anc].goadedBy.push({ player: 0, untilTurnOf: 0, sinceTurn: 2 });
    tg.state.players[2].lost = true;
    tg.state.players[3].lost = true;
    tg.g.bump();
    tg.passUntil((x) => x.state.turn.step === 'beginCombat' && x.state.zones.stack.length === 0);
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).toBe(anc);
    expect(tg.state.objects[anc].tapped).toBe(false);
    expect(hasKw(tg.g, anc, 'haste')).toBe(true);
    tg.passTo('cleanup');
    expect(tg.find('Indomitable Ancients', 'battlefield', 1)).toBe(anc);
  });
});

import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Angel of Indemnity', () => {
  it('ao entrar, devolve carta de permanente com valor de mana 4 ou menos do cemitério', () => {
    const tg = setup({ battlefield: [Array(6).fill('Plains'), []], hand: [['Angel of Indemnity'], []], graveyard: [['Wall of Omens', 'Zetalpa, Primal Dawn'], []], library: [['Island'], []] });
    tg.choose('valor de mana 4 ou menos', ['Wall of Omens']).cast('Angel of Indemnity').resolve().resolveAll();
    expect(tg.find('Wall of Omens')).not.toBeNull();
  });
  it('bis: a ficha copia só a carta original (5/5); uma ficha por oponente na partida; cada uma é obrigada a atacar o seu oponente; sacrifica no início da próxima etapa final só as que ainda controla', () => {
    const tg = setup({ players: 4, battlefield: [Array(8).fill('Plains'), [], [], []], graveyard: [['Angel of Indemnity'], [], [], []], library: [[], ['Island'], ['Island'], ['Island']] });
    tg.state.players[3].left = true;
    tg.refresh();
    tg.activate('Angel of Indemnity', 'Bis').resolve();
    const fichas = tg.all('Angel of Indemnity');
    expect(fichas.length).toBe(2);
    expect(tg.pt(fichas[0])).toEqual([5, 5]);
    expect(hasKw(tg.g, fichas[0], 'haste')).toBe(true);
    expect(tg.names(0, 'exile')).toEqual(['Angel of Indemnity']);
    const erros: (string | null)[] = [];
    tg.script.push((d, x) => {
      if (d.kind !== 'attackers') return null;
      erros.push(x.game.check(0, { kind: 'attackers', attacks: [] }));
      erros.push(x.game.check(0, { kind: 'attackers', attacks: [[fichas[0], { kind: 'player', id: 2 }], [fichas[1], { kind: 'player', id: 1 }]] }));
      return { kind: 'attackers', attacks: [[fichas[0], { kind: 'player', id: 1 }], [fichas[1], { kind: 'player', id: 2 }]] };
    });
    tg.passTo('end');
    expect(erros.every((e) => e !== null && /508.1d/.test(e))).toBe(true);
    expect([tg.life(1), tg.life(2)]).toEqual([35, 35]);
    tg.resolveAll();
    expect(tg.all('Angel of Indemnity').length).toBe(0);
  });
});

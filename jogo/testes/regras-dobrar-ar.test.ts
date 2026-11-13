// Dobrar o ar / airbend (CR 701.65a): exila os objetos; cada carta exilada assim pode ser conjurada pelo dono por {2}
// em vez do custo de mana enquanto continuar exilada (motor/mecanicas-ur.ts airbend; custo da permissão em
// motor/priority.ts permissionsFor). E "os oponentes não podem conjurar mágicas de nenhum lugar que não seja a mão"
// (rule:castOnlyFromHand em motor/priority.ts canStartCast).
import { describe, expect, it } from 'vitest';
import { setup } from './harness.ts';
import { airbend, ruleEffect } from '../motor/api.ts';
import { runEffect } from './artefatos.ts';

describe('Dobrar o ar (CR 701.65)', () => {
  it('CR 701.65a: o dono conjura a carta exilada por {2}, só mágicas; ao sair do exílio, a permissão acaba', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Indomitable Ancients', 'Forest'], []] });
    const [anc, fl] = runEffect(tg, airbend(tg.g, 1, tg.bf('Island'), [tg.bf('Indomitable Ancients'), tg.bf('Forest')]));
    expect(tg.state.objects[anc].zone).toBe('exile');
    // Indomitable Ancients ({2}{W}{W}) com duas Islands
    const acao = tg.actionIds().find((a) => a.startsWith(`cast:${anc}:`));
    expect(acao).toBeDefined();
    // o terreno não se joga do exílio
    expect(tg.actionIds().some((a) => a.startsWith(`play:${fl}:`))).toBe(false);
    tg.answer({ kind: 'priority', action: acao! });
    tg.resolve();
    expect(tg.find('Indomitable Ancients', 'battlefield', 0)).not.toBeNull();
  });

  it('rule:castOnlyFromHand: o jogador afetado não conjura da zona de comando, mas conjura da mão', () => {
    const tg = setup({ battlefield: [['Forest', 'Island'], []], hand: [['Elvish Mystic'], []], command: [[{ name: 'Kinnan, Bonder Prodigy', commander: true }], []] });
    const k = tg.find('Kinnan, Bonder Prodigy', 'command')!;
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${k}:`))).toBe(true);
    ruleEffect({ g: tg.g, you: 1, source: -1 } as never, 'rule:castOnlyFromHand', { kind: 'endOfTurn' }, { players: [0] });
    tg.refresh();
    expect(tg.actionIds().some((a) => a.startsWith(`cast:${k}:`))).toBe(false);
    expect(tg.canCast('Elvish Mystic')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { attach, destroy, exile } from '../../motor/api.ts';
import { chars, hasKw, nameOf } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Halvar, God of Battle // Sword of the Realms';
const planicies = (n: number) => Array(n).fill('Plains');
const A = 'Indomitable Ancients';

describe(N, () => {
  it('Equipamento de outro jogador também dá golpe duplo', () => {
    // Skullclamp do oponente presa a uma criatura sua
    const tg = setup({ battlefield: [[...planicies(4), A, 'Wall of Omens'], ['Skullclamp']], hand: [[N], []] });
    tg.cast(N, 'hand').resolveAll();
    expect(nameOf(tg.g, tg.bf(N))).toBe('Halvar, God of Battle');
    expect(tg.pt(tg.bf(N))).toEqual([4, 4]);
    expect(hasKw(tg.g, tg.bf(A), 'double strike')).toBe(false);
    attach(tg.g, tg.bf('Skullclamp'), tg.bf(A));
    tg.refresh();
    expect(hasKw(tg.g, tg.bf(A), 'double strike')).toBe(true);
    // a criatura sem nada preso não ganha
    expect(hasKw(tg.g, tg.bf('Wall of Omens'), 'double strike')).toBe(false);
  });

  it('move o Equipamento de outro jogador preso a uma criatura sua', () => {
    const tg = setup({ battlefield: [[N, A, 'Wall of Omens'], ['Skullclamp']] });
    attach(tg.g, tg.bf('Skullclamp'), tg.bf(A));
    tg.refresh();
    tg.choose('Aura ou Equipamento alvo', ['Skullclamp']).choose('criatura alvo que você controla', ['Wall of Omens']).yes('Halvar', true);
    tg.passTo('declareAttackers');
    expect(tg.state.objects[tg.bf('Skullclamp')].attachedTo).toBe(tg.bf('Wall of Omens'));
    // continua sob o controle do oponente
    expect(tg.state.objects[tg.bf('Skullclamp')].controller).toBe(1);
  });

  it('com um alvo ilegal, nada acontece', () => {
    const tg = setup({ battlefield: [[N, A, 'Wall of Omens'], ['Skullclamp']] });
    attach(tg.g, tg.bf('Skullclamp'), tg.bf(A));
    tg.refresh();
    tg.choose('Aura ou Equipamento alvo', ['Skullclamp']).choose('criatura alvo que você controla', ['Wall of Omens']);
    tg.passUntil((x) => x.state.turn.step === 'beginCombat' && x.state.zones.stack.length > 0);
    // em resposta, a criatura que receberia o Equipamento sai do campo
    tg.run(exile(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Skullclamp')].attachedTo).toBe(tg.bf(A));
  });

  it('CR 712.11c — conjurar Sword of the Realms olha só a face de trás', () => {
    // {1}{W}: com duas Plains só o Equipamento pode ser conjurado, não a criatura de {2}{W}{W}
    const tg = setup({ battlefield: [planicies(2), []], hand: [[N], []] });
    const chavesDeConjurar = tg.actionIds().filter((a) => a.startsWith('cast:')).map((a) => a.split(':').slice(2).join(':'));
    expect(chavesDeConjurar).toEqual(['hand@1']);
    tg.cast(N, 'hand@1').resolveAll();
    const id = tg.bf(N);
    expect(nameOf(tg.g, id)).toBe('Sword of the Realms');
    expect(chars(tg.g, id).types).toEqual(['Artifact']);
    expect(chars(tg.g, id).subtypes).toEqual(['Equipment']);
  });

  it('CR 712.8f — no campo vale o valor de mana da face para cima', () => {
    const tg = setup({ battlefield: [planicies(2), []], hand: [[N], []] });
    expect(chars(tg.g, tg.find(N, 'hand', 0)!).manaValue).toBe(4);
    tg.cast(N, 'hand@1').resolveAll();
    expect(chars(tg.g, tg.bf(N)).manaValue).toBe(2);
  });

  it('Sword of the Realms devolve a criatura equipada que morre; se ela já saiu do cemitério, fica onde está', () => {
    const tg = setup({ battlefield: [[...planicies(6), A, 'Wall of Omens'], []], hand: [[N], []] });
    tg.cast(N, 'hand@1').resolveAll();
    tg.choose('criatura alvo que você controla', [A]).activate('Sword of the Realms').resolveAll();
    // +2/+0 e vigilância
    expect(tg.pt(tg.bf(A))).toEqual([4, 10]);
    expect(hasKw(tg.g, tg.bf(A), 'vigilance')).toBe(true);
    tg.run(destroy(tg.g, [tg.bf(A)]));
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual([A]);
    expect(tg.find(N)).not.toBeNull();

    // de novo, mas a carta é exilada do cemitério em resposta
    tg.choose('criatura alvo que você controla', ['Wall of Omens']).activate('Sword of the Realms').resolveAll();
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.settle();
    tg.run(exile(tg.g, [tg.find('Wall of Omens', 'graveyard', 0)!]));
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'exile')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual([A]);
  });
});

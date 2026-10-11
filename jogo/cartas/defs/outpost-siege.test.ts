import { describe, expect, it } from 'vitest';
import { destroy, manifest } from '../../motor/api.ts';
import { setup, type TestGame } from '../../testes/harness.ts';

const O = 'Outpost Siege';
/** o cerco já no campo com a escolha feita */
function comEscolha(tg: TestGame, escolha: 'khans' | 'dragons'): TestGame {
  tg.state.objects[tg.bf(O)].choices.siege = escolha;
  return tg.refresh();
}
const ateManutencao = (tg: TestGame) => tg.passUntil((x) => x.state.turn.active === 0 && x.state.turn.step === 'upkeep');

describe(O, () => {
  it('ao entrar, escolhe Khans ou Dragons', () => {
    const tg = setup({ battlefield: [Array(4).fill('Mountain'), []], hand: [[O], []] });
    tg.choose('escolha Khans ou Dragons', ['Dragons — 1 de dano a qualquer alvo quando uma criatura sua sai do campo']);
    tg.cast(O).resolve();
    expect(tg.state.objects[tg.bf(O)].choices.siege).toBe('dragons');
  });
  it('Khans: a carta exilada é jogada pelas regras normais e só até o fim do turno', () => {
    const tg = comEscolha(setup({ step: 'end', active: 1, battlefield: [[O, 'Mountain', 'Mountain'], []], library: [['Sol Ring', 'Lightning Bolt', 'Island'], ['Island', 'Island', 'Island']] }), 'khans');
    ateManutencao(tg).resolve();
    expect(tg.names(0, 'exile')).toEqual(['Sol Ring']);
    // artefato: só na fase principal com a pilha vazia
    expect(tg.canCast('Sol Ring')).toBe(false);
    tg.passTo('main1');
    expect(tg.canCast('Sol Ring')).toBe(true);
    tg.cast('Sol Ring', '*').resolve();
    expect(tg.find('Sol Ring')).not.toBeNull();
    // a do turno seguinte (instantânea) não pode mais ser jogada depois que o turno acaba
    const tg2 = comEscolha(setup({ step: 'end', active: 1, battlefield: [[O, 'Mountain'], []], library: [['Lightning Bolt', 'Island'], ['Island', 'Island', 'Island']] }), 'khans');
    ateManutencao(tg2).resolve();
    expect(tg2.canCast('Lightning Bolt')).toBe(true);
    tg2.passUntil((x) => x.state.turn.active === 1 && x.state.turn.step === 'upkeep' && x.pending?.player === 0);
    expect(tg2.canCast('Lightning Bolt')).toBe(false);
  });
  it('Khans: um terreno exilado só pode ser jogado com jogada de terreno disponível', () => {
    const tg = comEscolha(setup({ step: 'end', active: 1, battlefield: [[O], []], library: [['Mountain', 'Island'], ['Island', 'Island']] }), 'khans');
    ateManutencao(tg).resolve();
    tg.passTo('main1');
    const podeJogar = (x: TestGame) => x.actionIds().some((a) => a.startsWith('play:') && x.state.objects[Number(a.split(':')[1])]?.zone === 'exile');
    expect(podeJogar(tg)).toBe(true);
    tg.state.turn.landsPlayed = 1;
    tg.refresh();
    expect(podeJogar(tg)).toBe(false);
  });
  it('Dragons: criatura sua sai do campo, 1 de dano a qualquer alvo; de oponente, não', () => {
    const tg = comEscolha(setup({ battlefield: [[O, 'Wall of Omens'], ['Elvish Mystic']] }), 'dragons');
    tg.run(destroy(tg.g, [tg.bf('Elvish Mystic')]));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('Dragons: a manifestada com a face para baixo que sai do campo dispara', () => {
    const tg = comEscolha(setup({ battlefield: [[O], []], library: [['Sol Ring'], []] }), 'dragons');
    const id = tg.run(manifest(tg.g, 0))!;
    tg.choose('qualquer alvo', ['Bruno']);
    tg.run(destroy(tg.g, [id]));
    tg.resolveAll();
    expect(tg.life(1)).toBe(39);
  });
  it('cada escolha dá só uma das duas habilidades', () => {
    // Khans: criatura que sai do campo não dispara
    const tg = comEscolha(setup({ battlefield: [[O, 'Wall of Omens'], []] }), 'khans');
    tg.run(destroy(tg.g, [tg.bf('Wall of Omens')]));
    tg.settle();
    expect(tg.state.zones.stack).toHaveLength(0);
    // Dragons: nada é exilado na manutenção
    const tg2 = comEscolha(setup({ step: 'end', active: 1, battlefield: [[O], []], library: [['Sol Ring', 'Island'], ['Island', 'Island']] }), 'dragons');
    ateManutencao(tg2);
    expect(tg2.state.zones.stack).toHaveLength(0);
    expect(tg2.names(0, 'exile')).toEqual([]);
  });
});

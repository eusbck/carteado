import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = "Witch's Cottage";

describe(NOME, () => {
  it('é Swamp ({B})', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('entra virado com só dois outros Swamps (CR 614.12: só vê os que já estão no campo)', () => expect(entraVirado(NOME, ['Swamp', 'Swamp'])).toBe(true));
  it('com três outros Swamps entra desvirado e pode pôr uma carta de criatura do cemitério no topo', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [['Viscera Seer', 'Sign in Blood'], []], library: [['Plains'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de criatura alvo') ? (opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Viscera Seer')!.id] }) : null));
    tg.yes('topo', true).play(NOME).resolve();
    expect(opcoes).toEqual(['Viscera Seer']);
    expect(tg.names(0, 'library')).toEqual(['Viscera Seer', 'Plains']);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(false);
  });
  it('pode recusar: a carta fica no cemitério', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp'], []], hand: [[NOME], []], graveyard: [['Viscera Seer'], []] });
    tg.yes('topo', false).play(NOME).resolve();
    expect(tg.names(0, 'graveyard')).toEqual(['Viscera Seer']);
  });
  it('entrando virado, o gatilho não acontece', () => {
    const tg = setup({ hand: [[NOME], []], graveyard: [['Viscera Seer'], []] });
    tg.play(NOME);
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.state.objects[tg.bf(NOME)].tapped).toBe(true);
  });
});

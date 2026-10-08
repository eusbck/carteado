import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { alternativasDeMana, entraVirado } from '../../testes/padroes.ts';

const NOME = 'Memorial to Folly';

describe(NOME, () => {
  it('CR 605: produz {B}', () => expect(alternativasDeMana(NOME)).toEqual(['B']));
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('sacrifica-se e devolve a carta de criatura alvo do seu cemitério para a mão', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Viscera Seer', 'Sign in Blood'], ['Hateful Eidolon']] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de criatura alvo') ? (opcoes = d.items.filter((i) => !i.disabled).map((i) => i.label), { kind: 'select', ids: [d.items.find((i) => i.label === 'Viscera Seer')!.id] }) : null));
    tg.activate(NOME, 'Devolva').resolve();
    expect(opcoes).toEqual(['Viscera Seer']);
    expect(tg.names(0, 'hand')).toEqual(['Viscera Seer']);
    expect(tg.names(0, 'graveyard').sort()).toEqual([NOME, 'Sign in Blood']);
  });
  it('sem carta de criatura no seu cemitério, não pode ativar', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp'], []], graveyard: [['Sign in Blood'], ['Hateful Eidolon']] });
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf(NOME)}:`))).toBe(false);
  });
});

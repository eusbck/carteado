import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const NOME = "Hall of Heliod's Generosity";

describe(NOME, () => {
  it('CR 605: mana que produz', () => expect(alternativasDeMana(NOME)).toEqual(['C']));
  it('{1}{W}, {T}: põe a carta de encantamento alvo do seu cemitério no topo do grimório', () => {
    const tg = setup({ battlefield: [[NOME, 'Plains', 'Plains'], []], graveyard: [['Ghostly Prison', 'Wall of Omens'], []], library: [['Island'], []] });
    let oferecidas: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('carta de encantamento alvo') ? (oferecidas = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate(NOME, '{1}{W}').resolve();
    expect(oferecidas).toEqual(['Ghostly Prison']);
    expect(tg.names(0, 'library')).toEqual(['Ghostly Prison', 'Island']);
  });
});

import { describe, expect, it } from 'vitest';
import { alternativasDeMana, entraVirado, setup } from '../../testes/padroes.ts';
import { manaOptions } from '../../motor/costs.ts';

const NOME = 'Thriving Isle';

describe(NOME, () => {
  it('CR 614.1c: entra virado', () => expect(entraVirado(NOME)).toBe(true));
  it('ao entrar, escolhe uma cor diferente de azul; produz {U} ou a cor escolhida', () => {
    const tg = setup({ battlefield: [[], []], hand: [[NOME], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('escolha uma cor diferente') ? (opcoes = d.items.map((i) => i.id), { kind: 'select', ids: ['B'] }) : null));
    tg.play(NOME);
    expect(opcoes).toEqual(['W', 'B', 'R', 'G']);
    const id = tg.bf(NOME);
    expect(tg.state.objects[id].tapped).toBe(true);
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === id).length).toBe(0); // virado
    tg.state.objects[id].tapped = false;
    tg.g.bump();
    expect(manaOptions(tg.g, 0).filter((o) => o.obj === id).map((o) => o.alt.join('')).sort()).toEqual(['B', 'U']);
  });
  it('sem cor escolhida (posto direto no campo), só produz {U}', () => expect(alternativasDeMana(NOME)).toEqual(['U']));
});

import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Orim's Thunder";

describe(N, () => {
  it('sem reforço, destrói o artefato ou encantamento alvo e não pede criatura', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Mountain'], ['Darksteel Mutation', 'Sol Ring', 'Thief of Sanity']], hand: [[N], []] });
    tg.script.push((d) => { if (d.kind === 'select' && d.prompt.includes('criatura alvo (se reforçada)')) throw new Error('não devia pedir criatura'); return null; });
    tg.choose('custo adicional opcional', ['Não pagar']).choose('artefato ou encantamento alvo', ['Sol Ring']);
    tg.cast(N).resolveAll();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.find('Thief of Sanity')).not.toBeNull();
  });

  it('reforçada, também causa à criatura alvo dano igual ao valor de mana da permanente destruída', () => {
    // Righteous Cause tem valor de mana 5; Thief of Sanity é 2/2
    const tg = setup({ battlefield: [['Plains', 'Plains', 'Plains', 'Mountain'], ['Righteous Cause', 'Indomitable Ancients']], hand: [[N], []] });
    tg.choose('custo adicional opcional', ['Pagar: kicker {R}']).choose('artefato ou encantamento alvo', ['Righteous Cause']).choose('criatura alvo (se reforçada)', ['Indomitable Ancients']);
    tg.cast(N).resolveAll();
    expect(tg.find('Righteous Cause')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(5);
  });
});
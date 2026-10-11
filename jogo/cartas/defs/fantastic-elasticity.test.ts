import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Fantastic Elasticity';
const PERMANENTE = 'Devolva o permanente não terreno alvo para a mão do dono';
const CARTA = 'Devolva a carta de instantânea ou feitiço alvo do seu cemitério para a sua mão';
const forests = Array(10).fill('Forest');

describe(N, () => {
  it('primeiro modo: devolve o permanente não terreno alvo para a mão do dono', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Indomitable Ancients']], hand: [[N], []], library: [forests, forests] });
    tg.choose('modo', [PERMANENTE]).choose('permanente não terreno alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.names(1, 'hand')).toEqual(['Indomitable Ancients']);
  });

  it('segundo modo: devolve uma instantânea ou feitiço do seu cemitério para a sua mão', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], []], hand: [[N], []], graveyard: [['Breath Weapon', 'Elvish Mystic'], []], library: [forests, forests] });
    let alvos: string[] = [];
    tg.choose('modo', [CARTA]);
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('instantânea ou feitiço alvo')) return null;
      alvos = d.items.filter((i) => !i.disabled).map((i) => i.label);
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Breath Weapon')!.id] };
    });
    tg.cast(N).resolveAll();
    expect(alvos).toEqual(['Breath Weapon']);
    expect(tg.names(0, 'hand')).toEqual(['Breath Weapon']);
  });

  it('CR 702.88a: conjurada da mão, é exilada ao resolver e pode ser conjurada de graça na sua próxima manutenção', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island'], ['Indomitable Ancients', 'Wall of Omens']], hand: [[N], []], library: [forests, forests] });
    tg.choose('modo', [PERMANENTE]).choose('permanente não terreno alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.find(N, 'exile')).not.toBeNull();
    expect(tg.find(N, 'graveyard', 0)).toBeNull();
    tg.yes('Ricochete', true).choose('modo', [PERMANENTE]).choose('permanente não terreno alvo', ['Wall of Omens']);
    tg.passTo('upkeep', 0);
    tg.resolveAll();
    // (o oponente também comprou uma carta no turno dele)
    expect(tg.names(1, 'hand')).toEqual(expect.arrayContaining(['Indomitable Ancients', 'Wall of Omens']));
    expect(tg.find('Wall of Omens')).toBeNull();
    // conjurada do exílio, desta vez vai para o cemitério
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
    expect(tg.find(N, 'exile')).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const NOME = 'Gisa, the Hellraiser';
const zumbis = (tg: ReturnType<typeof setup>) => tg.all('Zombie Rogue');

describe(NOME, () => {
  it('mirar um oponente, um permanente dele ou uma carta no cemitério dele é crime; mirar algo seu não é', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp', 'Wall of Omens'], ['Indomitable Ancients']], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp');
    expect(tg.state.zones.stack).toHaveLength(1);
    tg.resolveAll();
    expect(zumbis(tg)).toHaveLength(0);
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    expect(tg.state.zones.stack).toHaveLength(2);
    tg.resolveAll();
    const z = zumbis(tg);
    expect(z).toHaveLength(2);
    expect(z.every((id) => tg.state.objects[id].tapped)).toBe(true);
    // Zombies que você controla recebem +1/+1 e ameaçar
    expect(tg.pt(z[0])).toEqual([3, 3]);
    expect(hasKw(tg.g, z[0], 'menace')).toBe(true);
  });

  it('o crime dispara assim que a mágica é conjurada, antes de ela resolver', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [['Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolve();
    expect(zumbis(tg)).toHaveLength(2);
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });

  it('uma mágica com dois alvos criminosos é um crime só, e a habilidade só dispara uma vez por turno', () => {
    const tg = setup({ battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients', 'Wall of Omens']], hand: [['Infernal Grasp', 'Infernal Grasp'], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast('Infernal Grasp');
    tg.resolveAll();
    tg.choose('criatura alvo', ['Wall of Omens']).cast('Infernal Grasp');
    tg.resolveAll();
    expect(zumbis(tg)).toHaveLength(2);
  });
});

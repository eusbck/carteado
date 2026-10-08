import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Diregraf Colossus';

describe(NOME, () => {
  it('entra com um marcador +1/+1 por carta de Zombie no seu cemitério; não dispara ao conjurar a si mesmo', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp'], []],
      hand: [[NOME], []],
      graveyard: [['Wall of Limbs', 'Gravecrawler', 'Viscera Seer'], ['Carrion Feeder']],
    });
    tg.cast(NOME).resolveAll();
    const col = tg.bf(NOME);
    expect(tg.state.objects[col].counters['+1/+1']).toBe(2);
    expect(tg.pt(col)).toEqual([4, 4]);
    expect(tg.all('Zombie').length).toBe(0);
  });

  it('vindo do cemitério, conta a si mesmo entre os Zombies', () => {
    const tg = setup({ graveyard: [[NOME, 'Wall of Limbs'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find(NOME, 'graveyard')!, controller: 0 }], 'effect'));
    expect(tg.state.objects[tg.bf(NOME)].counters['+1/+1']).toBe(2);
  });

  it('sempre que você conjura uma mágica de Zombie, cria uma ficha Zombie 2/2 virada; outras mágicas não', () => {
    const tg = setup({
      battlefield: [[NOME, 'Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Swamp']],
      hand: [['Carrion Feeder', 'Viscera Seer', 'Sign in Blood'], []],
      library: [['Island', 'Island'], []],
    });
    tg.cast('Carrion Feeder');
    expect(tg.state.zones.stack.length).toBe(2); // gatilho resolve antes da mágica
    tg.resolveAll();
    const [z] = tg.all('Zombie').filter((id) => tg.state.objects[id].isToken);
    expect(z).toBeDefined();
    expect(tg.state.objects[z].tapped).toBe(true);
    expect(tg.state.objects[z].def).toBe('Zombie 2/2');
    tg.cast('Viscera Seer').resolveAll();
    tg.choose('jogador alvo', ['Ana']).cast('Sign in Blood').resolveAll();
    expect(tg.all('Zombie').filter((id) => tg.state.objects[id].isToken).length).toBe(1);
  });
});

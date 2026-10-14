// Recursos do motor para as cartas do Grand Larceny: outro jogador escolhe os alvos de um gatilho (targetChooser),
// custo próprio da carta (CostPart 'custom') e o lote de eventos no gancho extraTriggers.
import { describe, expect, it } from 'vitest';
import { fixture as setup } from './artefatos.ts';

const ilhas = Array(8).fill('Island');

describe('Alvos escolhidos por outro jogador (CR 603.3d, 601.2c)', () => {
  it('CR 603.3d: quem escolhe é o jogador indicado, mas a legalidade e o controle continuam do controlador', () => {
    // Bladegriff Prototype: "à escolha desse jogador"; hexproof conta para o controlador (Silhana é de Carla)
    const tg = setup({ players: 3, battlefield: [['Bladegriff Prototype'], ['Sol Ring'], ['Silhana Ledgewalker', 'Prismatic Lens']] });
    let quem = -1;
    let opcoes: string[] = [];
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('permanente não terreno alvo')) return null;
      quem = d.player;
      opcoes = d.items.map((i) => i.label).sort();
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Prismatic Lens')!.id] };
    });
    tg.attack([['Bladegriff Prototype', 1]]).passTo('main2', 0);
    expect(quem).toBe(1);
    // os alvos são os legais para Ana: permanentes dos oponentes dela (não os dela), sem o de resistência a magia
    expect(opcoes).toEqual(['Prismatic Lens', 'Sol Ring']);
    expect(tg.find('Prismatic Lens')).toBeNull();
  });
});

describe("Custo próprio da carta (CostPart 'custom', CR 602.2b)", () => {
  it('CR 602.2b: é pago ao ativar, antes de a habilidade resolver', () => {
    const tg = setup({ battlefield: [['Void Attendant', 'Forest', 'Island'], []], exile: [[], ['Sol Ring']] });
    tg.activate('Void Attendant');
    // a habilidade está na pilha e a carta já foi para o cemitério do dono
    expect(tg.state.zones.stack).toHaveLength(1);
    expect(tg.names(1, 'graveyard')).toEqual(['Sol Ring']);
    tg.resolveAll();
    expect(tg.find('Eldrazi Scion')).not.toBeNull();
  });
});

describe('extraTriggers com o lote de eventos (CR 603.2c)', () => {
  it('CR 603.2c: um gatilho de "um ou mais" recebe o lote e pode disparar uma vez a mais', () => {
    const tg = setup({ battlefield: [['Felix Five-Boots', 'Orochi Soul-Reaver'], []], library: [ilhas, ilhas] });
    tg.attack([['Orochi Soul-Reaver', 1]]).passTo('main2', 0);
    expect(tg.all('Treasure')).toHaveLength(2);
    expect(tg.state.zones.battlefield.filter((id) => tg.state.objects[id].faceDown)).toHaveLength(2);
  });
});

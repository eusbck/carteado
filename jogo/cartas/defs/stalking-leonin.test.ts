import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Stalking Leonin';
const lib = Array(10).fill('Forest');
const vez = (tg: ReturnType<typeof setup>) => { for (let i = 0; i < 4 && tg.pending?.player !== 0; i++) tg.pass(); };

describe(N, () => {
  it('exila a criatura que ataca você se o controlador for o jogador escolhido; só uma vez', () => {
    const tg = setup({ players: 3, battlefield: [[], ['Indomitable Ancients', 'Elvish Mystic'], []], library: [lib, lib, lib] });
    tg.choose('Stalking Leonin', ['Bruno']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    expect(tg.pt(id)).toEqual([3, 3]);
    expect(tg.state.objects[id].data.leoninEscolhido).toBe(1);
    tg.script.length = 0;
    tg.passTo('main1', 1);
    tg.attack([['Indomitable Ancients', 0], ['Elvish Mystic', 0]]);
    tg.passTo('declareBlockers', 1);
    // os outros passam a prioridade até chegar em você
    vez(tg);
    tg.choose('criatura alvo que está atacando você', ['Indomitable Ancients']);
    tg.activate(N, 'Revele o jogador').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
    vez(tg);
    expect(() => tg.activate(N, 'Revele o jogador')).toThrow();
  });

  it('se o atacante é de outro jogador, a criatura não é exilada e a habilidade fica gasta', () => {
    const tg = setup({ players: 3, battlefield: [[], ['Elvish Mystic'], ['Silver Myr']], library: [lib, lib, lib] });
    tg.choose('Stalking Leonin', ['Carla']);
    const id = enterCard(tg, N, 0)!;
    tg.resolveAll();
    tg.script.length = 0;
    tg.passTo('main1', 1);
    tg.attack([['Elvish Mystic', 0]]);
    tg.passTo('declareBlockers', 1);
    vez(tg);
    tg.choose('criatura alvo que está atacando você', ['Elvish Mystic']);
    tg.activate(N, 'Revele o jogador').resolveAll();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
    expect(tg.state.objects[id].data.leoninUsado).toBe(true);
  });

  it('sem jogador escolhido, a habilidade não pode ser ativada', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Elvish Mystic']], library: [lib, lib] });
    tg.attack([['Elvish Mystic', 0]]);
    tg.passTo('declareBlockers', 1);
    vez(tg);
    expect(() => tg.activate(N, 'Revele o jogador')).toThrow();
  });
});

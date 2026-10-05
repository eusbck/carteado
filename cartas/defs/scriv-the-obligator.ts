// Scriv, the Obligator
// Flying, deathtouch
// Whenever Scriv enters or attacks, create a white Aura enchantment token named Contract attached to target creature an
// opponent controls. The token has enchant creature and "Whenever enchanted creature attacks, it gets +2/+0 until end of
// turn if it's attacking one of your opponents. Otherwise, its controller loses 2 life."
import { createTokens, defineCard, enchantCandidates, is, keywords, on, t, tgt, triggered } from '../../motor/api.ts';
import type { Ctx } from '../../motor/defs.ts';

function* contrato(c: Ctx) {
  const id = tgt(c);
  // ruling 1: alvo ilegal, nada acontece
  if (id === null) return;
  // ruling 2: se o Contract não puder encantar a criatura, a ficha nem é criada
  if (!enchantCandidates(c.g, 'Contract', 0, c.you).includes(id)) return;
  yield* createTokens(c.g, c.you, 'Contract', 1, { attachTo: id });
}

const alvo = t.creature(is.opponents, 'criatura alvo que um oponente controla');
const texto = 'crie uma ficha de encantamento Aura branca chamada Contract presa à criatura alvo que um oponente controla. A ficha tem "encantar criatura" e "Sempre que a criatura encantada ataca, ela recebe +2/+0 até o fim do turno se estiver atacando um dos seus oponentes. Caso contrário, o controlador dela perde 2 de vida."';

export default defineCard({
  name: 'Scriv, the Obligator',
  faces: [{
    abilities: [
      ...keywords('flying', 'deathtouch'),
      triggered(on.custom((e, c) => (e.type === 'zone' && e.to === 'battlefield' && e.obj === c.source) || (e.type === 'attackers' && e.attackers.some((a) => a.obj === c.source))), contrato, {
        targets: [alvo], text: `Sempre que Scriv entra ou ataca, ${texto}`,
      }),
    ],
  }],
  rulings: {
    1: 'regra geral: CR 608.2b — alvo ilegal, nada acontece (nem a ficha)',
    2: 'regra geral: CR 303.4 — sem poder encantar a criatura, a ficha não é criada',
  },
});

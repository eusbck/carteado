// Anointed Procession // Anointed Procession (carta reversível: as duas faces são iguais e vale a da frente)
// Anointed Procession {3}{W} — Enchantment
// If an effect would create one or more tokens under your control, it creates twice that many of those tokens instead.
import { defineCard, staticAbility } from '../../motor/api.ts';

export default defineCard({
  name: 'Anointed Procession // Anointed Procession',
  faces: [{
    abilities: [
      // CR 614.1a, 616.1f: substituição na criação de fichas; cada Anointed Procession se aplica uma vez (ruling 5)
      staticAbility({
        rules: {
          tokenCreation: (c, ev) => (ev.player !== c.you ? null : {
            label: 'Anointed Procession: o dobro das fichas',
            // ruling 4: o dobro de cada tipo de ficha; o resto do pedido (virada, atacando) acompanha as fichas novas
            *replace(e) { return { ...e, tokens: [...e.tokens, ...e.tokens.map((t) => ({ ...t }))] }; },
          }),
        },
        text: 'Se um efeito fosse criar uma ou mais fichas sob o seu controle, ele cria o dobro dessas fichas em vez disso.',
      }),
    ],
  }],
  rulings: {
    1: 'não se aplica: o símbolo de destaque da história não tem efeito no jogo',
    2: 'teste: cria o dobro das fichas, todas ao mesmo tempo e iguais',
    3: 'regra geral: CR 614.12 — as substituições de "ao entrar" valem para cada ficha, depois de decidir quantas são (motor/actions.ts putOntoBattlefield)',
    4: 'teste: o dobro de cada tipo de ficha',
    5: 'teste: com duas Anointed Procession, quatro vezes as fichas',
    6: 'teste: o que o efeito manda fazer depois com as fichas vale para todas',
  },
});

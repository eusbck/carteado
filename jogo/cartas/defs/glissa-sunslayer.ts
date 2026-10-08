// Glissa Sunslayer
// First strike, deathtouch
// Whenever Glissa Sunslayer deals combat damage to a player, choose one —
// • You draw a card and lose 1 life.
// • Destroy target enchantment.
// • Remove up to three counters from target permanent.
import { chooseItems, defineCard, destroy, draw, keywords, loseLife, modal, on, removeCounters, t, tgt, triggered } from '../../motor/api.ts';
import type { ChoiceItem } from '../../motor/types.ts';

export default defineCard({
  name: 'Glissa Sunslayer',
  faces: [{
    abilities: [
      ...keywords('first strike', 'deathtouch'),
      triggered(on.selfDealsCombatDamageToPlayer(), function* () { /* modos */ }, {
        modes: modal(1, 1, [
          { text: 'Você compra uma carta e perde 1 de vida', *effect(c) { yield* draw(c.g, c.you, 1); loseLife(c.g, c.you, 1, c.source); } },
          { text: 'Destrua o encantamento alvo', targets: [t.enchantment()], *effect(c) { const id = tgt(c); if (id !== null) yield* destroy(c.g, [id]); } },
          {
            text: 'Remova até três marcadores do permanente alvo', targets: [t.permanent(undefined, 'permanente alvo de onde remover marcadores')],
            *effect(c) {
              const id = tgt(c);
              if (id === null) return;
              // ruling 1: escolhe na resolução quais marcadores, de qualquer tipo
              const itens: ChoiceItem[] = [];
              for (const [tipo, n] of Object.entries(c.g.state.objects[id].counters)) for (let i = 0; i < n; i++) itens.push({ id: `${tipo}#${i}`, label: `marcador ${tipo}` });
              const esc = yield* chooseItems(c.g, c.you, 'Escolha até três marcadores para remover', itens, 0, 3);
              const porTipo = new Map<string, number>();
              for (const e of esc) { const tipo = e.slice(0, e.lastIndexOf('#')); porTipo.set(tipo, (porTipo.get(tipo) ?? 0) + 1); }
              for (const [tipo, n] of porTipo) removeCounters(c.g, { kind: 'obj', id }, tipo, n);
            },
          },
        ]),
        text: 'Sempre que Glissa Sunslayer causa dano de combate a um jogador, escolha um — compre uma carta e perca 1 de vida; destrua o encantamento alvo; ou remova até três marcadores do permanente alvo.',
      }),
    ],
  }],
  rulings: { 1: 'teste: remove marcadores de tipos diferentes' },
});

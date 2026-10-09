// Intenção de uma escolha do bot: contra os oponentes (remoção, dano, virar, devolver), a favor de quem escolhe
// (marcadores, ganhar habilidades, desvirar, anexar, trazer do próprio cemitério) ou perda (custo, descarte, fundo do
// grimório). Para alvos de mágicas e habilidades, a intenção sai do texto Oracle da carta de origem (inglês,
// padronizado pela Wizards), não das palavras da pergunta: a pergunta é "<carta>: escolha <alvo>" (motor/stack.ts) e
// palavras como "criatura" casavam com "cria" (criar fichas) e mandavam a remoção para as próprias criaturas.

import type { G } from '../motor/game-context.ts';
import { allOracleNames, hasOracle, oracle } from '../motor/oracle.ts';
import type { Decision, ObjId, PlayerId } from '../motor/types.ts';

/** 'neutra': nem o texto Oracle nem a pergunta dizem (a escolha segue a ordem de antes: as minhas, depois as deles) */
export type Intencao = 'contra' | 'favor' | 'perda' | 'neutra';

/** custo ou perda pelas palavras da pergunta (escolhas que não são alvo: sacrificar, descartar, pôr no fundo) */
export const PERDA = /sacrifi|descart|remova|pague|perca|perde|exile .*(seu|sua)|para o cemitério|vai para o cemitério|fundo do grimório|no fundo|mão para pôr no topo/i;
/** efeito contra alguém pelas palavras da pergunta (só quando o texto Oracle não decide) */
const DANO = /destru|exil|dano|-1\/-1|vire|goad|sacrifica|perde .*vida|veneno|anule|oponente/i;
/** efeito a favor pelas palavras da pergunta. Antes tinha "cria", que casava com "criatura" */
const BOM = /compra|ganha|\bcrie\b|copi|marcador \+1|\+\d+\/\+\d+|recebe \+|preparad|encantar/i;

// efeitos de uma frase com alvo, no texto Oracle (minúsculo)
const CONTRA = /\b(destroy|exile|deals? [^.]{0,30}damage|tap (up to \w+ )?(another )?target|doesn'?t untap|to (its|their) owners?'? hands?|on (the )?(top|bottom) of (its|their) owners?'? librar|fights?|can'?t (block|attack|be regenerated)|loses? all( other)? abilities|base power and toughness [01]\/[01]|sacrifices?|counter target|mills?|discards?|loses? [^.]{0,12}life|gains? control|goad|stun counter|shuffles? [^.]{0,30}into (its|their) owners?'? librar|becomes? a [^.]{0,40}base power)|-\d+\/-\d+|-x\/-x|gets? -|-1\/-1 counter/;
const FAVOR = /\+\d+\/\+\d+|\+x\/\+x|\+1\/\+1 counter|gets? \+|(gains?|has|have) [^.]{0,12}(flying|hexproof|indestructible|trample|haste|vigilance|lifelink|first strike|double strike|protection|menace|deathtouch|reach|ward|shroud)|untap (up to \w+ )?(another )?target|from your graveyard|\battach|\bequip|copy of (up to \w+ )?(another )?target|copy target|proliferate|\bdraws?\b|gains? (\d+|x) life|loyalty counter|shield counter|regenerate|can'?t be (blocked|countered)|return (it|that card|them|those cards) to the battlefield/;
/** a criatura escolhida é quem age (luta, morde): a minha melhor */
const ATOR = /you control (fights|deals damage equal to its power)/;
/** exilar e trazer de volta (piscar): a favor */
const PISCAR = /return (it|that card|them|those cards) to the battlefield/;

// palavras do rótulo do alvo (português) → substantivos do texto Oracle
const SUBSTANTIVOS: [RegExp, RegExp][] = [
  [/criatura/, /creature/], [/artefato/, /artifact/], [/encantamento/, /enchantment/], [/terreno/, /\bland/],
  [/planeswalker/, /planeswalker/], [/permanente/, /permanent/], [/mágica/, /spell/], [/jogador/, /player/],
  [/oponente/, /opponent/], [/carta/, /card/], [/qualquer alvo/, /any target/], [/habilidade/, /ability/],
  [/não controla/, /(you don'?t control|an opponent controls)/], [/(?<!não )você controla/, /you control/],
];

let faces: Map<string, string> | null = null;
/** nome da carta no Oracle, também pelo nome de uma face (cartas divididas e de duas faces) */
function cartaDoNome(nome: string): string | null {
  if (!nome) return null;
  if (hasOracle(nome)) return nome;
  if (!faces) {
    faces = new Map();
    for (const n of allOracleNames()) if (n.includes(' // ')) for (const f of n.split(' // ')) if (!faces.has(f)) faces.set(f, n);
  }
  return faces.get(nome) ?? null;
}

/** a pergunta é a de um alvo de mágica ou habilidade ("<rótulo>: escolha <alvo>") */
export function perguntaDeAlvo(prompt: string): boolean {
  const i = prompt.lastIndexOf(': escolha ');
  return i >= 0 && /\balvos?\b/.test(prompt.slice(i));
}

/** carta de origem pelo começo da pergunta: "Nome", "Nome (palavra-chave)", "Nome: texto da habilidade", "cópia de Nome" */
export function cartaDaPergunta(prompt: string): string | null {
  const i = prompt.lastIndexOf(': escolha ');
  const rotulo = (i >= 0 ? prompt.slice(0, i) : prompt).replace(/^cópia de /, '');
  const partes = rotulo.split(': ');
  for (let k = 1; k <= partes.length; k++) {
    const nome = partes.slice(0, k).join(': ').replace(/ \([^)]*\)$/, '');
    const c = cartaDoNome(nome);
    if (c) return c;
  }
  return null;
}

/** a mágica ou habilidade no topo da pilha (a que está sendo conjurada, ativada ou resolvida): carta e modos */
function topoDaPilha(g: G): { carta: string; modos: number[] } | null {
  const s = g.state;
  const id = s.zones.stack[s.zones.stack.length - 1];
  const o = id !== undefined ? s.objects[id] : undefined;
  if (!o?.stack) return null;
  let def = o.copyOf?.def ?? o.def;
  if (o.stack.kind !== 'spell') {
    const src = o.stack.source;
    const so = src !== undefined ? (s.objects[src] ?? s.lki[src]?.obj) : undefined;
    def = so ? (so.copyOf?.def ?? so.def) : '';
  }
  const carta = cartaDoNome(def);
  return carta ? { carta, modos: o.stack.kind === 'spell' ? o.stack.modes : [] } : null;
}

const frasesCache = new Map<string, string[]>();
/** frases do texto Oracle (minúsculo); os modos ("• ...") ficam cada um na sua frase, marcados com o número */
function frases(carta: string): string[] {
  let r = frasesCache.get(carta);
  if (r) return r;
  r = [];
  try {
    const texto = oracle(carta).faces.map((f) => f.oracleText).join('\n').toLowerCase();
    let modo = 0;
    for (const linha of texto.split('\n')) {
      if (linha.startsWith('•')) { r.push(`§${modo++}§ ${linha}`); continue; }
      for (const f of linha.split(/(?<=\.)\s+/)) r.push(f);
    }
  } catch { /* sem Oracle */ }
  frasesCache.set(carta, r);
  return r;
}

/** contra, a favor ou nada, pelo texto Oracle da carta de origem e pelo rótulo do alvo */
export function intencaoDoOracle(carta: string, rotuloAlvo: string, modos: number[] = [], soMinhas = false, anexar = false): 'contra' | 'favor' | null {
  const todas = frases(carta);
  // Aura e Equipamento: o efeito está nas frases da criatura encantada ou equipada ("Enchant creature" não diz "target")
  const anexo = todas.filter((f) => /\b(enchanted|equipped) (creature|permanent|artifact|land|planeswalker)\b/.test(f));
  let comAlvo = anexar ? anexo : todas.filter((f) => f.includes('target'));
  if (!comAlvo.length) comAlvo = anexo;
  // modo escolhido: só as frases dele
  if (modos.length && comAlvo.some((f) => f.startsWith('§'))) {
    const desses = comAlvo.filter((f) => !f.startsWith('§') || modos.some((m) => f.startsWith(`§${m}§`)));
    if (desses.length) comAlvo = desses;
  }
  if (!comAlvo.length) return null;
  // frases cujo alvo corresponde ao rótulo (criatura, artefato, jogador...)
  const rotulo = rotuloAlvo.toLowerCase();
  const nota = (f: string) => SUBSTANTIVOS.reduce((t, [pt, en]) => t + (pt.test(rotulo) && en.test(f) ? 1 : 0), 0);
  const max = Math.max(...comAlvo.map(nota));
  const escolhidas = max > 0 ? comAlvo.filter((f) => nota(f) === max) : comAlvo;
  let contra = 0;
  let favor = 0;
  for (const f of escolhidas) {
    if (soMinhas && ATOR.test(f)) { favor++; continue; }
    const c = CONTRA.test(f);
    const b = FAVOR.test(f);
    if (c && b) { if (PISCAR.test(f)) favor++; else contra++; } else if (c) contra++; else if (b) favor++;
  }
  if (!contra && !favor) return null;
  return favor > contra ? 'favor' : 'contra';
}

/** a intenção de uma escolha de `eu` (só decisões de seleção) */
export function intencao(d: Extract<Decision, { kind: 'select' }>, g: G, eu: PlayerId, minha: (id: ObjId) => boolean): Intencao {
  const prompt = d.prompt;
  const itens = d.items.filter((i) => !i.disabled);
  const soMinhas = itens.length > 0 && itens.every((i) => (i.player !== undefined ? i.player === eu : i.obj !== undefined && minha(i.obj)));
  if (perguntaDeAlvo(prompt)) {
    const rotulo = prompt.slice(prompt.lastIndexOf(': escolha ') + 10);
    const topo = topoDaPilha(g);
    const carta = cartaDaPergunta(prompt) ?? topo?.carta ?? null;
    if (carta) {
      const equipar = / \(equip\)/i.test(prompt.slice(0, prompt.lastIndexOf(': escolha ')));
      const r = intencaoDoOracle(carta, rotulo, topo && topo.carta === carta ? topo.modos : [], soMinhas, equipar);
      if (r) return r;
    }
  }
  if (PERDA.test(prompt)) return 'perda';
  if (DANO.test(prompt) && !BOM.test(prompt)) return 'contra';
  // escolha durante a resolução sem palavra clara: o texto da carta que está resolvendo
  const topo = topoDaPilha(g);
  if (topo) {
    const r = intencaoDoOracle(topo.carta, prompt, topo.modos, soMinhas);
    if (r) return r;
  }
  return BOM.test(prompt) ? 'favor' : 'neutra';
}

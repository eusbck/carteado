/** nome de arquivo de uma carta: "Night's Whisper" → "nights-whisper" */
export function slug(name: string): string {
  return name.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

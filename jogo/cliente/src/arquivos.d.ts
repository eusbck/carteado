// Arquivos importados pelo Vite com "?url": viram um endereço em /assets com o nome versionado.
declare module '*?url' {
  const url: string;
  export default url;
}

// import.meta.glob do Vite (o cliente não carrega os tipos de vite/client)
interface ImportMeta {
  glob<T = unknown>(padrao: string, opcoes?: { eager?: boolean; query?: string; import?: string }): Record<string, T>;
}

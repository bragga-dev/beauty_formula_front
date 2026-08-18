/**
 * Armazenamento do access token.
 *
 * Antes: access + refresh iam pro localStorage. Isso deixava os dois
 * tokens legíveis por qualquer script rodando na página (inclusive um XSS)
 * e persistentes em disco entre sessões — foi o que apareceu no DevTools.
 *
 * Agora:
 * - O refresh token (o que dá acesso de longa duração) nem chega no
 *   frontend: fica só num cookie httpOnly setado pelo backend, que
 *   JavaScript não consegue ler de jeito nenhum.
 * - O access token (vida curta, minutos) fica só em memória — uma
 *   variável de módulo, não localStorage. Ainda é lido por um XSS ativo
 *   *enquanto a página está aberta*, mas não persiste em disco nem
 *   sobrevive a um reload, o que reduz bastante a janela de exposição.
 *
 * Consequência: em um reload de página o access token some. Quem consome
 * isso (auth-context) faz um refresh silencioso no boot do app pra pegar
 * um novo access a partir do cookie httpOnly.
 */
let accessToken: string | null = null;

export const tokenStorage = {
  getAccess: () => accessToken,
  setAccess: (access: string) => {
    accessToken = access;
  },
  clear: () => {
    accessToken = null;
  },
};
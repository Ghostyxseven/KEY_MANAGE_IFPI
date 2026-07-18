import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sessionStorage } from "../adapters/storage/sessionStorage";
import { entrarAdministrador, entrarGuarda, observarAutenticacao, perfilAtual, sair as sairFirebase, type Usuario } from "../services/auth";

type AppContextType = {
  carregandoSessao: boolean;
  autenticado: boolean;
  perfil: "admin" | "guarda" | null;
  nomeGuarda: string;
  matriculaGuarda: string;
  entrarComoGuarda: (matricula: string, pin: string) => Promise<Usuario>;
  entrarComoAdmin: (email: string, senha: string) => Promise<Usuario>;
  sair: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    return observarAutenticacao((firebaseUser) => { void (async (): Promise<void> => {
      if (!firebaseUser) { setUsuario(null); setCarregandoSessao(false); return; }
      try { const perfil = await perfilAtual(firebaseUser); if (perfil?.ativo) { setUsuario(perfil); if (perfil.perfil === "guarda") await sessionStorage.salvar(perfil.uid, perfil.nome, perfil.matricula); } else { await sessionStorage.limpar(); setUsuario(null); } }
      catch { const cache = await sessionStorage.ler(); if (cache?.uid === firebaseUser.uid) setUsuario({ uid: firebaseUser.uid, nome: cache.nome, matricula: cache.matricula, perfil: "guarda", ativo: true }); else setUsuario(null); }
      finally { setCarregandoSessao(false); }
    })(); });
  }, []);

  const entrarComoGuarda = useCallback(async (matricula: string, pin: string): Promise<Usuario> => {
    const perfil = await entrarGuarda(matricula, pin); setUsuario(perfil);
    await sessionStorage.salvar(perfil.uid, perfil.nome, perfil.matricula); return perfil;
  }, []);
  const entrarComoAdmin = useCallback(async (email: string, senha: string): Promise<Usuario> => { const perfil = await entrarAdministrador(email, senha); setUsuario(perfil); return perfil; }, []);

  const sair = useCallback(async (): Promise<void> => {
    await sairFirebase(); await sessionStorage.limpar(); setUsuario(null);
  }, []);

  const value = useMemo(() => ({
    carregandoSessao,
    autenticado: usuario?.ativo === true,
    perfil: usuario?.perfil ?? null,
    nomeGuarda: usuario?.nome ?? "",
    matriculaGuarda: usuario?.matricula ?? "",
    entrarComoGuarda,
    entrarComoAdmin,
    sair,
  }), [carregandoSessao, entrarComoAdmin, entrarComoGuarda, sair, usuario]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider");
  return context;
}

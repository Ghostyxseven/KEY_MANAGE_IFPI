import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { sessionStorage } from "../adapters/storage/sessionStorage";

type AppContextType = {
  carregandoSessao: boolean;
  autenticado: boolean;
  nomeGuarda: string;
  matriculaGuarda: string;
  entrar: (nome: string, matricula: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [nomeGuarda, setNomeGuarda] = useState("");
  const [matriculaGuarda, setMatriculaGuarda] = useState("");

  useEffect(() => {
    void sessionStorage.ler().then((sessao) => {
      if (sessao) {
        setNomeGuarda(sessao.nome);
        setMatriculaGuarda(sessao.matricula);
      }
      setCarregandoSessao(false);
    });
  }, []);

  const entrar = useCallback(async (nome: string, matricula: string): Promise<void> => {
    await sessionStorage.salvar(nome, matricula);
    setNomeGuarda(nome);
    setMatriculaGuarda(matricula);
  }, []);

  const sair = useCallback(async (): Promise<void> => {
    await sessionStorage.limpar();
    setNomeGuarda("");
    setMatriculaGuarda("");
  }, []);

  const value = useMemo(() => ({
    carregandoSessao,
    autenticado: nomeGuarda.length > 0 && matriculaGuarda.length > 0,
    nomeGuarda,
    matriculaGuarda,
    entrar,
    sair,
  }), [carregandoSessao, entrar, matriculaGuarda, nomeGuarda, sair]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp precisa estar dentro de AppProvider");
  return context;
}

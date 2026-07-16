import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, writeBatch } from "firebase/firestore";
import { firebaseConfig, firebaseServices } from "./firebase";

export type Perfil = "admin" | "guarda";
export type Usuario = { uid: string; nome: string; matricula: string; perfil: Perfil; ativo: boolean };

export function normalizarMatricula(valor: string): string {
  return valor.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function pinValido(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

function emailDoGuarda(matricula: string): string {
  return `guarda.${matricula}@guardas.coretech.app`;
}

function usuarioFrom(uid: string, data: Record<string, unknown>): Usuario {
  if (typeof data.nome !== "string" || typeof data.matricula !== "string"
    || (data.perfil !== "admin" && data.perfil !== "guarda") || typeof data.ativo !== "boolean") {
    throw new Error("Cadastro de usuário inválido.");
  }
  return { uid, nome: data.nome, matricula: data.matricula, perfil: data.perfil, ativo: data.ativo };
}

export async function perfilAtual(user?: User | null): Promise<Usuario | null> {
  const atual = user ?? firebaseServices().auth.currentUser;
  if (!atual) return null;
  const snapshot = await getDoc(doc(firebaseServices().db, "usuarios", atual.uid));
  return snapshot.exists() ? usuarioFrom(snapshot.id, snapshot.data()) : null;
}

export async function entrarGuarda(matricula: string, pin: string): Promise<Usuario> {
  const normalizada = normalizarMatricula(matricula);
  if (!normalizada || !pinValido(pin)) throw new Error("Matrícula ou PIN inválido.");
  const { auth } = firebaseServices();
  try {
    const credencial = await signInWithEmailAndPassword(auth, emailDoGuarda(normalizada), pin);
    const perfil = await perfilAtual(credencial.user);
    if (!perfil?.ativo || perfil.perfil !== "guarda" || perfil.matricula !== normalizada) throw new Error();
    return perfil;
  } catch {
    await signOut(auth).catch(() => undefined);
    throw new Error("Matrícula ou PIN inválido.");
  }
}

export async function entrarAdministrador(email: string, senha: string): Promise<Usuario> {
  const { auth } = firebaseServices();
  try {
    const credencial = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    const perfil = await perfilAtual(credencial.user);
    if (!perfil?.ativo || perfil.perfil !== "admin") throw new Error();
    return perfil;
  } catch {
    await signOut(auth).catch(() => undefined);
    throw new Error("Credenciais administrativas inválidas.");
  }
}

export function sair(): Promise<void> {
  return signOut(firebaseServices().auth);
}

export function observarAutenticacao(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(firebaseServices().auth, callback);
}

export async function listarGuardas(): Promise<Usuario[]> {
  const snapshot = await getDocs(query(collection(firebaseServices().db, "usuarios"), orderBy("nome")));
  return snapshot.docs.map((item) => usuarioFrom(item.id, item.data())).filter((item) => item.perfil === "guarda");
}

export async function cadastrarGuarda(nome: string, matricula: string, pin: string): Promise<Usuario> {
  const normalizada = normalizarMatricula(matricula);
  const nomeLimpo = nome.trim();
  if (nomeLimpo.length < 2 || !normalizada || !pinValido(pin)) {
    throw new Error("Informe nome, matrícula e PIN de 6 dígitos.");
  }

  const { db } = firebaseServices();
  const acessoRef = doc(db, "acessos", normalizada);
  if ((await getDoc(acessoRef)).exists()) throw new Error("Esta matrícula já está cadastrada.");

  const appSecundario = initializeApp(firebaseConfig(), `provisionamento-${Date.now()}`);
  let authSecundario: Auth;
  try {
    authSecundario = initializeAuth(appSecundario, { persistence: inMemoryPersistence });
  } catch {
    authSecundario = getAuth(appSecundario);
  }

  const authEmail = emailDoGuarda(normalizada);
  const credencial = await createUserWithEmailAndPassword(authSecundario, authEmail, pin);
  const perfil: Usuario = {
    uid: credencial.user.uid,
    nome: nomeLimpo,
    matricula: normalizada,
    perfil: "guarda",
    ativo: true,
  };

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "usuarios", perfil.uid), {
      ...perfil,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    batch.set(acessoRef, {
      uid: perfil.uid,
      authEmail,
      ativo: true,
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    });
    await batch.commit();
    return perfil;
  } catch (error) {
    await deleteUser(credencial.user).catch(() => undefined);
    throw error;
  } finally {
    await signOut(authSecundario).catch(() => undefined);
    await deleteApp(appSecundario).catch(() => undefined);
  }
}

export async function alterarStatusGuarda(guarda: Usuario, ativo: boolean): Promise<Usuario> {
  const { db } = firebaseServices();
  const batch = writeBatch(db);
  batch.update(doc(db, "usuarios", guarda.uid), { ativo, atualizadoEm: serverTimestamp() });
  batch.update(doc(db, "acessos", guarda.matricula), { ativo, atualizadoEm: serverTimestamp() });
  await batch.commit();
  return { ...guarda, ativo };
}

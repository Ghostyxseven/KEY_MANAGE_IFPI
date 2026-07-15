import type { Request, Response, NextFunction } from "express";

export function tratarErros(
  erro: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (erro && typeof erro === "object" && "status" in erro) {
    const err = erro as { status: number; codigo: string; mensagem: string; responsavelAtual?: unknown };
    res.status(err.status).json({
      codigo: err.codigo,
      mensagem: err.mensagem,
      ...(err.responsavelAtual !== undefined && { responsavelAtual: err.responsavelAtual }),
    });
    return;
  }

  console.error("Erro nao tratado:", erro);
  res.status(500).json({
    codigo: "ERRO_INTERNO",
    mensagem: "Ocorreu um erro interno no servidor.",
  });
}

export function validarContentType(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.method === "POST" && !req.is("application/json")) {
    res.status(400).json({
      codigo: "TIPO_CONTEUDO_INVALIDO",
      mensagem: "Content-Type deve ser application/json.",
    });
    return;
  }
  next();
}

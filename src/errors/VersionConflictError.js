class VersionConflictError extends Error {
  constructor(id, attempts) {
    super(`Conflito de versao para o item ${id} apos ${attempts} tentativa(s)`);
    this.name = "VersionConflictError";
    this.id = id;
    this.attempts = attempts;
  }
}

export default VersionConflictError;

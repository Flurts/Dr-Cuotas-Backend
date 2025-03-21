import { CodeReferenceRepository } from "@/databases/postgresql/repos";

export const createCodeReference = async (name: string): Promise<boolean> => {
  const randomCode = Math.random().toString(36).substring(7); // Código aleatorio
  const code = `${name}-${randomCode}`; // Concatenar el nombre con el código generado

  const codeReference = CodeReferenceRepository.create({
    code,
    name,
    count: 0
  });

  await CodeReferenceRepository.save(codeReference);
  return true;
};

export const getCodeReferences = async () => {
  const codeReferences = await CodeReferenceRepository.find();
  return codeReferences;
};

export const useCodeReference = async (code: string): Promise<boolean> => {
  const codeReference = await CodeReferenceRepository.findOne({ where: { code } });
  if (!codeReference) {
    return false;
  }
  codeReference.count += 1;
  await CodeReferenceRepository.save(codeReference);
  return true;
};

import { Resolver, Query, Mutation, Arg } from "type-graphql";
import {
  createCodeReference,
  getCodeReferences,
  useCodeReference
} from "@/web/services/CodeReference";
import { CodeReference } from "@/databases/postgresql/entities/models";

@Resolver(CodeReference)
export class CodeReferenceResolver {
  @Query(() => [CodeReference])
  async getCodeReferences(): Promise<CodeReference[]> {
    return await getCodeReferences();
  }

  @Mutation(() => Boolean)
  async createCodeReference(@Arg("name") name: string): Promise<boolean> {
    return await createCodeReference(name);
  }

  @Mutation(() => Boolean)
  async useCodeReference(@Arg("code") code: string): Promise<boolean> {
    return await useCodeReference(code);
  }
}

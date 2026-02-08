export type TemplateType = "dir" | "file" | "boilerplate";

export interface Template {
  TemplateID: number;
  Username: string;
  TemplateName: string;
  Type: TemplateType;
  GithubRepoLink?: string;
  FileName?: string;
  PreCmds: string[];
  PostCmds: string[];
  Tags: string[];
  Code?: string;
  Stars: number;
  Clones: number;
  Usage: string;
  ForkOf?: number;
  ForkedBoilerplates?: number[];
  Description: string;
  Documentation: string;
  CreatedAt: string;
  UpdatedAt: string;
}

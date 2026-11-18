import type { PlopTypes } from "@turbo/gen";
import fs from "node:fs";
import path from "node:path";

const copyServiceTemplate: PlopTypes.CustomActionFunction = (answers, _config, plop) => {
  const root = answers.turbo.paths.root;
  const sourceRoot = path.join(root, "turbo", "generators", "templates", "service");
  const kebab = plop.renderString("{{kebabCase name}}", answers);
  const pascal = plop.renderString("{{pascalCase name}}", answers);
  const camel = plop.renderString("{{camelCase name}}", answers);
  const snake = plop.renderString("{{snakeCase name}}", answers);
  const constant = plop.renderString("{{constantCase name}}", answers);
  const destinationRoot = path.join(root, "apps", `${kebab}-service`);
  const copy = (source: string): void => {
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      const sourcePath = path.join(source, entry.name);
      if (entry.isDirectory()) {
        copy(sourcePath);
        continue;
      }
      const relative = path
        .relative(sourceRoot, sourcePath)
        .replace(/\.hbs$/, "")
        .replaceAll("{{kebabCase name}}", kebab)
        .replaceAll("{{pascalCase name}}", pascal)
        .replaceAll("{{camelCase name}}", camel)
        .replaceAll("{{snakeCase name}}", snake)
        .replaceAll("{{constantCase name}}", constant);
      const destination = path.join(destinationRoot, plop.renderString(relative, answers));
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.writeFileSync(
        destination,
        plop.renderString(fs.readFileSync(sourcePath, "utf8"), answers),
      );
    }
  };
  copy(sourceRoot);
  return `Created ${destinationRoot}`;
};

export default function generator(plop: PlopTypes.NodePlopAPI) {
  plop.setGenerator("service", {
    description: "Create a service from the reference service",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Service name (kebab-case)",
        validate: (value: string) => {
          if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)) return "Use kebab-case";
          if (["gateway", "client", "auth", "test"].includes(value)) return "That name is reserved";
          if (fs.existsSync(path.join(process.cwd(), "apps", `${value}-service`)))
            return "That service already exists";
          return true;
        },
      },
      {
        type: "input",
        name: "port",
        message: "Port",
        default: "4003",
        validate: (value: string) => /^\d+$/.test(value) || "Enter a port number",
      },
      {
        type: "list",
        name: "access",
        message: "Gateway access",
        choices: ["required", "optional", "public", "admin"],
        default: "required",
      },
    ],
    actions: [
      copyServiceTemplate,
      {
        type: "modify",
        path: "apps/gateway/src/services.registry.ts",
        pattern: /  \/\/ <generator:services>\r?\n/,
        template:
          '  { name: "{{kebabCase name}}", prefix: "/api/{{kebabCase name}}", urlEnv: "{{constantCase name}}_SERVICE_URL", access: "{{access}}" },\n  // <generator:services>\n',
      },
      {
        type: "modify",
        path: "docker-compose.yaml",
        pattern: /  # <generator:services>\r?\n/,
        template:
          '  {{kebabCase name}}-service:\n    build:\n      context: .\n      dockerfile: apps/{{kebabCase name}}-service/Dockerfile\n    env_file: ./apps/{{kebabCase name}}-service/.env\n    expose: ["{{port}}"]\n    networks: [private]\n\n  # <generator:services>\n',
      },
      {
        type: "modify",
        path: "apps/gateway/.env.example",
        pattern: /# <generator:gateway-env>/,
        template:
          "{{constantCase name}}_SERVICE_URL=http://{{kebabCase name}}-service:{{port}}\n# <generator:gateway-env>",
      },
      () => "Run pnpm install, then pnpm infra:up and pnpm dev.",
    ],
  });
}

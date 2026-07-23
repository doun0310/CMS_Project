import path from "path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const openApiPath = path.resolve(process.cwd(), "docs", "openapi.yaml");
const swaggerDocument = YAML.load(openApiPath);

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerDocument, {
  explorer: true
});

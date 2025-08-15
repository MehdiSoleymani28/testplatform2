export class ImportOpenApiDto {
  // Raw OpenAPI/Swagger JSON object
  openapi?: string;
  swagger?: string;
  // Either supply the full document in `document` or as a JSON string in `raw`.
  document?: any;
  raw?: string;
}

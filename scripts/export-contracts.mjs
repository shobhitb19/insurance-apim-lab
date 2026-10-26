import SwaggerParser from '@apidevtools/swagger-parser';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('contracts/import', { recursive: true });
for (const name of ['provider-baseline', 'provider-extended', 'provider-claims', 'gateway']) {
  const document = await SwaggerParser.bundle(`contracts/${name}.json`);
  await writeFile(`contracts/import/${name}.json`, JSON.stringify(document, null, 2) + '\n');
}
console.log('Bundled four self-contained OpenAPI files for portal import.');

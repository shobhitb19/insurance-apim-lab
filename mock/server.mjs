import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const policyIds = ['POL1001', 'POL1002', 'POL5001', 'POL5002', 'POL5003', 'POL5004'];
export const pairs = Array.from({ length: 6 }, (_, i) => `pair-0${i + 1}`);

export function policyFor(policyId, extended = false) {
  const second = policyId === 'POL1002';
  return {
    policyId,
    status: 'Active',
    product: second ? 'Motor' : 'Home',
    ...(extended ? { riskCategory: second ? 'Standard' : 'Elevated' } : {})
  };
}

export function claimsFor(policyId) {
  return {
    policyId,
    openClaimCount: policyId === 'POL1002' ? 0 : 1,
    totalIncurred: policyId === 'POL1002' ? 0 : 1250,
    currency: 'NZD'
  };
}

export function createFixtureServer() {
  return createServer(async (req, res) => {
    const incoming = req.headers['x-correlation-id'];
    const correlationId = typeof incoming === 'string' &&
      /^[A-Za-z0-9-]{1,64}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Correlation-Id', correlationId);
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => {
      if (!res.destroyed) {
        res.writeHead(status);
        res.end(JSON.stringify(body));
      }
    };
    const error = (status, code, message) => send(status, { code, message, correlationId });
    const url = new URL(req.url, 'http://fixture.invalid');
    if (req.method !== 'GET') return error(405, 'MethodNotAllowed', 'Only GET is supported.');
    if (url.pathname === '/health') return send(200, { status: 'ok' });
    if (url.search) return error(400, 'UnexpectedQuery', 'Fixture routes do not accept query parameters.');
    const route = /^\/pairs\/(pair-0[1-6])\/(baseline|extended|claims)\/policies\/([A-Z0-9]+)(\/summary)?$/.exec(url.pathname);
    if (!route) return error(404, 'RouteNotFound', 'Unknown fixture route or pair namespace.');
    const [, , stage, policyId, summary] = route;
    if ((stage === 'claims') !== Boolean(summary)) {
      return error(404, 'RouteNotFound', 'Unknown fixture route.');
    }
    if (!policyIds.includes(policyId)) return error(404, 'PolicyNotFound', 'Policy not found.');
    if (stage !== 'claims') return send(200, policyFor(policyId, stage === 'extended'));
    if (policyId === 'POL5001') return error(503, 'FixtureUnavailable', 'Synthetic claims dependency failure.');
    if (policyId === 'POL5002') {
      await new Promise(resolve => {
        const timer = setTimeout(resolve, 3500);
        res.once('close', () => { clearTimeout(timer); resolve(); });
      });
    }
    if (policyId === 'POL5003') return send(200, claimsFor('POL1002'));
    if (policyId === 'POL5004') {
      res.writeHead(200);
      return res.end('not-json');
    }
    return send(200, claimsFor(policyId));
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 7071);
  const host = process.env.HOST ?? '127.0.0.1';
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer from 1 to 65535.');
  }
  const server = createFixtureServer();
  server.listen(port, host, () => console.log(`Synthetic fixture listening on ${host}:${port}`));
}

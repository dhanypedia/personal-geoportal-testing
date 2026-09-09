import assert from "node:assert/strict";
import test from "node:test";

import nextConfig from "../next.config.mjs";

test("uses a trailing slash for the portal base path", () => {
  assert.equal(nextConfig.basePath, "/portal");
  assert.equal(nextConfig.trailingSlash, true);
});

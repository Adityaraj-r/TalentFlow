# Backend configuration and credential handling

## Local and production configuration

For local development, run the backend npm scripts from this package (for example, `npm run dev` with `backend` as the working directory). The shared environment loader locates this package in both source and compiled layouts and loads `backend/.env`. Existing shell or deployment-platform variables take precedence over values in that file.

For production, provide configuration through the hosting platform's protected environment settings or secret manager. Do not upload `.env` files or service-account JSON files. See `.env.example` for supported variable names and placeholders. Frontend `VITE_*` settings are public build-time values and must never contain credentials.

## JWT signing-secret rotation

The shared resolver uses `ACCESS_TOKEN_SECRET` for access-token signing and verification, falling back to `JWT_SECRET`. It uses `REFRESH_TOKEN_SECRET` for refresh-token signing and verification, also falling back to `JWT_SECRET`. Login and refresh issue both token types through `utils/token.util.ts`; `middleware/auth.middleware.ts` verifies access tokens; `auth.controller.ts` verifies refresh tokens and stores only their hashes in `RefreshToken`; `User.model.ts` uses the same access-token resolver for its legacy signing method. The `scripts/test_live_delete.ts` diagnostic request also uses the shared access-token resolver.

If the exposed `JWT_SECRET` is the effective secret, rotating it without separate access and refresh overrides invalidates both token types. Existing access tokens fail on their next protected request. Refresh tokens fail verification, so users cannot silently renew; the refresh endpoint clears the auth cookies, and users must sign in again. Stored refresh-token hashes are not usable after that, though old database rows may remain until normal cleanup. No database deletion is required to invalidate tokens.

Safe rotation procedure:

1. Generate new high-entropy secrets in a trusted local secret manager or the deployment platform. Do not put them in source control, frontend variables, tickets, logs, or chat.
2. Decide whether to set independent `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`, or use a new `JWT_SECRET` fallback. If rotating only one independent secret, the other token type remains valid; this can support staged recovery but does not invalidate that other token type.
3. Update the protected environment settings for every backend instance together. This application has no dual-key verification window, so mixed old/new instances may reject tokens issued by other instances.
4. Restart the backend, then verify login, an authenticated request, refresh, and logout. Tell users to sign in again when rotation invalidates their sessions.
5. Do not revoke the old value until the new configuration is active and verified. The repository owner should coordinate the change; no credential has been rotated by this repository work.

## Tracked service-account credential

`config/serviceAccountKey.json` is tracked in Git and contains a private-key field. A source search found no application reference to this file, but confirm with the service owner before removing it. Treat the credential as exposed because it exists in Git history.

1. Identify the Google/Firebase project and owner associated with this key without copying the key into tickets, logs, or reports.
2. If Firebase Admin access is required, provision a replacement credential or workload identity and store it in the deployment platform's secret manager. Update application configuration to consume that managed identity through an explicitly reviewed change; this repository currently has no code reference to the JSON file.
3. Deploy and verify the replacement in a non-production environment, then revoke the exposed credential in the provider console. If the file is obsolete, confirm that no external deployment depends on it, then remove it in a reviewed code change.
4. Removing the current file does not erase Git history. History rewriting is a separate, disruptive operation and is not part of this configuration change. Consider it only with repository-owner approval and coordination with all existing clones.

Do not commit replacement credentials. The repository ignore rules cover service-account JSON filenames, but already tracked files remain tracked until explicitly removed from the index.

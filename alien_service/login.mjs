// login.mjs
const keycloakUrl = 'http://localhost:2000'; // Keycloak server URL
const realm = 'myrealm'; // Keycloak realm
const clientId = 'frontend-client'; // Client ID

function login() {
    const redirectUri = `${window.location.origin}/callback`;
    const authUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

    window.location.href = authUrl;
}

export { login };

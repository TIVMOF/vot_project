// callback.mjs
async function handleCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        const tokenResponse = await fetch('http://localhost:2000/realms/myrealm/protocol/openid-connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: 'frontend-client',
                code: code,
                redirect_uri: `${window.location.origin}/callback`
            })
        });

        if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log(tokenData);

            // Store tokens in localStorage or sessionStorage
            localStorage.setItem('access_token', tokenData.access_token);
            localStorage.setItem('refresh_token', tokenData.refresh_token);

            // Redirect to the desired page after successful login
            window.location.href = '/gen/index.html'; // Change this to your target page
        } else {
            console.error('Failed to exchange code for tokens');
            // Handle error (e.g., display a message to the user)
        }
    } else {
        console.error('Authorization code not found');
        // Handle error (e.g., display a message to the user)
    }
}

export { handleCallback };

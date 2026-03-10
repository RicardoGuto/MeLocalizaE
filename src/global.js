const mode = 'DEV';

export const API_BASE_URL =
    mode === 'DEV'
        ? 'http://localhost/melocalizae/src/php/'
        : 'https://melocalizae.com.br/src/php/';
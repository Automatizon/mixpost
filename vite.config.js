import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import DefineOptions from 'unplugin-vue-define-options/vite'
import fs from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const isDev = mode === 'development';

    let serverConfig = {};

    if (isDev) {
        const appUrl = env.APP_URL;
        const host = appUrl ? new URL(appUrl).host : 'localhost';
        const homeDir = homedir();
        const certificatesPath = env.CERTIFICATES_PATH !== undefined
            ? env.CERTIFICATES_PATH
            : `.config/valet/Certificates/${host}`;

        try {
            serverConfig = {
                https: {
                    key: fs.readFileSync(resolve(homeDir, `${certificatesPath}.key`)),
                    cert: fs.readFileSync(resolve(homeDir, `${certificatesPath}.crt`)),
                },
                hmr: {
                    host,
                },
                host,
            };
        } catch (err) {
            console.warn(`⚠️ Could not load SSL certificates for host "${host}". Proceeding without HTTPS.`);
        }
    }

    return {
        publicDir: 'vendor/mixpost',
        plugins: [
            laravel({
                input: 'resources/js/app.js',
                publicDirectory: 'resources/dist',
                buildDirectory: 'vendor/mixpost',
                refresh: true,
            }),
            vue({
                template: {
                    transformAssetUrls: {
                        base: null,
                        includeAbsolute: false,
                    },
                },
            }),
            DefineOptions(),
        ],
        resolve: {
            alias: {
                '@css': '/resources/css',
                '@img': '/resources/img',
            },
        },
        server: serverConfig,
    };
});

'use strict';

const { Unleash, Strategy } = require('unleash-client');
const throat = require('throat')(2);

Promise.all(new Array(1000)
    .join(',')
    .split(',')
    .map((v, index) => {
    return throat(() => {
        return new Promise(resolve => {
            const instance = new Unleash({
                appName: `demo-app-${index % 20}`,
                instanceId: `index-${index}`,
                url: 'http://localhost:4242/api/',
                refreshIntervall: 60 * 1000,
                metricsInterval: 10 * 1000,
                strategies: [
                    new Strategy('extra', true),
                ],
            });

            let toggles = [];
            instance.repository.on('data', () => {
                toggles = Object.keys(instance.repository.storage.data);
            });

            instance.on('ready', () => {
                console.log('Connected to unleash', index);
                setInterval(() => {
                    toggles.forEach((toggleName, index) => {
                        const t = toggleName;
                        setTimeout(() => {
                            const result = instance.isEnabled(t, null, Boolean(Math.round(Math.random() * 2)));
                            // console.log(t, result);
                        }, Math.round(Math.random() * 1500))
                    });
                }, 2500);
                setTimeout(resolve, 100);
            });
            instance.on('error', (err) => {
                console.error('error index', index, err.message);
                resolve();
            });
            instance.on('warn', (msg) => {
                 console.warn('warn:', msg);
            });
        });
    });
}));

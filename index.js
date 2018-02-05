'use strict';

const express = require('express');
const unleash = require('unleash-client');
const chalk = require('chalk');

const app = express();

const instance = unleash.initialize({
    appName: 'demo-app',
    url: 'http://unleash.herokuapp.com/api/',
    refreshIntervall: 1000,
    metricsInterval: 500,
    strategies: [
        new unleash.Strategy('extra', true),
    ],
});

let toggles = [];
instance.repository.on('data', () => {
    toggles = Object.keys(instance.repository.storage.data);
});

instance.on('ready', () => {
    console.log('connected to unleash');

    setInterval(() => {
        toggles.forEach(toggleName => {
            unleash.isEnabled(toggleName, {userId: 123}, Boolean(Math.round(Math.random() * 2)));
        });
    }, 100);

    setInterval(() => {
        unleash.isEnabled('toggle-x', {userId: 1}, Boolean(Math.round(Math.random() * 2)));
    }, 50);
    setInterval(() => {
        unleash.isEnabled('toggle-2', {userId: 42}, Boolean(Math.round(Math.random() * 2)));
    }, 100);
    setInterval(() => {
        unleash.isEnabled('toggle-3', {userId: 4}, Boolean(Math.round(Math.random() * 2)));
    }, 5);
});
instance.on('error', (err) => {
    console.error(err.message, err.stack);
});
instance.on('warn', (msg) => {
    console.warn('warn:', msg);
});


function outputFeature (name, feature) {
    if (feature.enabled === false) {
        return;
    }
    return `<div>
        <h3>${name}</h3>
        <ul>${feature.strategies.map(strategy => `<li>${strategy.name}:<ul>${
            Object
                .keys(strategy.parameters)
                .map((paramName) => `<li>${paramName}: ${strategy.parameters[paramName]}</li>`)
                .join('')
        }</ul></li>`)}</ul>
    </div>`;
}

app.get('/', (req, res) => {
    const { data } = instance.repository.storage;

    res.send(`<!DOCTYPE html>
        <link rel="stylesheet" href="//static.finncdn.no/bb/css/spaden/5.2.1/spaden.min.css">
        <meta http-equiv="refresh" content="5000">
        <title>Demo example unleash-client usage</title>

        ${
            Object.keys(data)
                .map((key) => outputFeature(key, data[key]))
                .filter(Boolean)
                .join('<hr />')
        }
    `);
});

app.listen(process.env.PORT || 1337);

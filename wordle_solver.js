#!/usr/bin/env node
const fs = require('fs');
const yargs = require('yargs/yargs')
const prompt = require('prompt');
const WordleSolver = require('./WordleSolver');
const WordleInput = require('./WordleInput');
var path = process.cwd();




prompt.start();


async function run() {
    var argv = require('yargs/yargs')(process.argv.slice(2))
    .default({ n : 1, f : path + "/wordle_es_notildes.txt" })
    .argv;
    const wordles = [];
    const buffer = fs.readFileSync(argv.f);
    const data = buffer.toString().split("\n");
    const numWordles = argv.n;

    for (let i = 0; i < numWordles; i++) {
        wordles.push(new WordleSolver(data));
    }

    console.log('(CTRL + C to quit)');

    while (true) {
        try {

            let {
                word
            } = await prompt.get({
                properties: {
                    word: {
                        required: true
                    }
                }
            });
            let results = []
            minResults = Infinity;
            wordleIndex = -1;

            for (let i = 0; i < numWordles; i++) {
                const ws = wordles[i];
                if (!ws.isSolved()) {
                    console.log(`Wordle #${i+1}`);
                    let input = await WordleInput(word);
                    const {
                        green,
                        yellow
                    } = input.reduce((o, {
                        color,
                        letter
                    }) => {
                        o.green.push(color === "green" ? letter : "");
                        o.yellow.push(color === "yellow" ? letter : "");
                        return o;
                    }, {
                        green: [],
                        yellow: []
                    });


                    r = ws.solve(word, green, yellow);
                    if (!ws.isSolved()) {
                        if (r.length && r.length < minResults) {
                            minResults = r.length
                            wordleIndex = i;
                            results = r;
                        }
                    } else {
                        console.log(`Wordle #${i+1} SOLVED ${ws.greenList.join('')}`);
                    }
                } else {
                    console.log(`Wordle #${i+1} SOLVED "${ws.greenList.join('')}"`);
                }


            }
            if (wordleIndex < 0) {
                break;
            }
            console.log(`Results for wordle #${wordleIndex+1}`);
            console.log('Matches', results.length);
            console.log(results.slice(0, 20));


        } catch (e) {
            console.log('Closing...');
            process.exit();
        }

    }
}

process.on('SIGINT', function () {
    process.exit();
});

run();
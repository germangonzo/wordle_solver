module.exports = class WordleSolver {

    greenList = ["", "", "", "", ""];
    yellowList = ["", "", "", "", ""];
    discarded = new Set();
    log = [];
    dictionary = []
    frequency = {};


    constructor(dictionary) {
        this.dictionary = dictionary;
        this.frequency = this.dictionary.reduce((p, w) => {
            w.split("").forEach((c,i) => {
                if (!p[i]) {
                    p[i] = {[c]: 0};
                }
                if (!p[i][c]) {
                    p[i][c] = 0;
                }
                ++p[i][c]
            });
            return p;
        }, {});
    }


    buildSearchRegex() {
        const all = Array.from(new Set(this.greenList.concat(this.yellowList))).flatMap(v => v.split(""));
        const excluded = Array.from(this.discarded).join('');
        const regex = all.filter(v => v !== "").reduce((p, l) => p + `(?=(?:[^${l}]*${l})+[^${l}]*$)`, "");
        const final = this.yellowList.reduce((p, c, i) => p += this.greenList[i] || (c ? `[^${c}]` : '.'), '');

        return new RegExp(`${regex}^(?=[${all.join("")}\\w]+)(?=[^${excluded}]{5})${final}$`, 'gi');
    }

    score(results) {
        return results.map(word => ({
            word,
            score:  word.split("").reduce((p, c, i) => p += this.frequency[i][c] || 0, 0)
        })).sort((a,b)=>b.score - a.score);
    }

    solve(word, green, yellow) {

        this.log.push({
            word,
            green,
            yellow
        });
        green.forEach((g,i)=> {
            if (g!=="") {
                this.greenList[i] = g;
            }
        })
        yellow.forEach((y,i) => {
            if (y!=="") {
                this.yellowList[i] += y;
            }
        });
        const re = new RegExp(`[^${green}${yellow}]`, 'gi');
        const toDiscard =  word.match(re) || [];
        toDiscard.forEach(d => this.discarded.add(d));
        const searchRe = this.buildSearchRegex();
        // console.debug(searchRe);
        return this.score(this.dictionary.filter(d => searchRe.exec(d)));

    }
    isSolved() { 
        return this.greenList.filter(v=>v!=="").length === 5;
    }
}
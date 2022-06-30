const { showCompletionScript } = require("yargs");

module.exports =
  class WordleSolver {
    greenList = ["", "", "", "", ""];
    yellowList = ["", "", "", "", ""];
    discarded = ["", "", "", "", ""];
    log = [];
    dictionary = [];
    dictFrequency = {};

    constructor(dictionary) {
      this.dictionary = dictionary;
      this.dictFrequency = this.calcFrequency(this.dictionary);
    }
    uniq(arr) {
      return Array.from(new Set(arr));
    }
    uniqLetters(str) {
      return this.uniq(str.split("")).join("");
    }

    calcFrequency(dictionary) {
      return dictionary.reduce(
        (p, w) => {
          w.split("").forEach((c, i) => {
            if (!p[i]) {
              p[i] = { [c]: 0 };
            }
            if (!p[i][c]) {
              p[i][c] = 0;
            }
            ++p[i][c];
          },);
          return p;
        },
        {},
      );
    }

    buildSearchRegex() {
      const all = this.uniq(this.greenList.concat(this.yellowList)).flatMap((v) => v.split(""));
      const regex = all.filter((v) => v !== "").reduce((p, l) => p + `(?=(?:[^${l}]*${l})+[^${l}]*$)`, "");
      const final = this.discarded.reduce(
        (p, c, i) => p += this.greenList[i] || (c ? `[^${this.uniqLetters(c)}]` : "."),
        "",
      );

      return new RegExp(`${regex}^${final}$`, "i");
    }

    scoreWord(word, results, frequency) {
      const dictLength = this.dictionary.length;
      return word.split("").reduce(
        (p, c, i) => p += frequency[i][c] / results.length * this.dictFrequency[i][c] / dictLength || 0,
        0,
      );
    }

    scoreWord2(word, results, frequency) {
      const dictLength = this.dictionary.length;
      const chars = word.split("");
      return chars.reduce(
        (p, c, i) => {
          let positions = [];
          if (i === 0) {
            positions = [0, 1, 2];
          } else if (i < 4) {
            positions = [i - 1, i, i + 1];
          } else {
            positions = [i - 2, i - 1, i];
          }

          const sumFreq = positions.reduce((f, p) => f += frequency[p][chars[p]], 0);
          const sumTotalFreq = positions.reduce((f, p) => f += this.dictFrequency[p][chars[p]], 0);

          p += sumFreq / results.length * sumTotalFreq / dictLength || 0;

          return p;
        },
        0,
      );
    }

    score(results) {
      const frequency = this.calcFrequency(results);
      return results.map((word) => ({ word, score: this.scoreWord2(word, results, frequency) })).sort(
        (a, b) => b.score - a.score,
      );
    }

    solve(word, green, yellow) {
      word.split("").forEach((w, i) => {
        if (green[i]) {
          this.greenList[i] = w;
        } else if (yellow[i]) {
          this.yellowList[i] += w;
          this.discarded[i] += w;
        } else {
          this.discarded[i] += w;
          //Adds the discarded letter to the other positions
          const yflat = this.yellowList.flatMap((y) => y.split(""));
          if (!yflat.includes(w) || this.greenList.includes(w)) {
            this.discarded = this.discarded.map((d, j) => this.greenList[j] !== w ? d + w : d);
          }
        }
      },);
      const searchRe = this.buildSearchRegex();
      // console.debug(searchRe);
      return this.score(this.dictionary.filter((d) => searchRe.test(d)));
    }
    isSolved() {
      return this.greenList.filter((v) => v !== "").length === 5;
    }
  };

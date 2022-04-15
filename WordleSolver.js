module.exports =
  class WordleSolver {
    greenList = ["", "", "", "", ""];
    yellowList = ["", "", "", "", ""];
    discarded = ["", "", "", "", ""];
    log = [];
    dictionary = [];
    frequency = {};

    constructor(dictionary) {
      this.dictionary = dictionary;
      this.frequency =
        this.dictionary.reduce(
          (p, w) => {
            w
              .split("")
              .forEach(
                (c, i) => {
                  if (!p[i]) {
                    p[i] = { [c]: 0 };
                  }
                  if (!p[i][c]) {
                    p[i][c] = 0;
                  }
                  ++p[i][c];
                },
              );
            return p;
          },
          {},
        );
    }
    uniq(arr) {
      return Array.from(new Set(arr));
    }
    uniqLetters(str) {
      return this.uniq(str.split("")).join("");
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

    score(results) {
      return results.map(
        (word) => ({ word, score: word.split("").reduce((p, c, i) => p += this.frequency[i][c] || 0, 0) }),
      ).sort((a, b) => b.score - a.score);
    }

    solve(word, green, yellow) {
      this.log.push({ word, green, yellow });
      green.forEach(
        (g, i) => {
          if (g !== "") {
            this.greenList[i] = g;
          }
        },
      );
      yellow.forEach(
        (y, i) => {
          if (y !== "") {
            this.yellowList[i] += y;
            this.discarded[i] += y;
          }
        },
      );
      word
        .split("")
        .forEach(
          (w, i) => {
            const yflat = this.yellowList.flatMap((y) => y.split(""));
            if (!this.greenList[i] && yflat.indexOf(w) < 0) {
              this.discarded = this.discarded.map((d) => d + w);
            }
          },
        );

      const searchRe = this.buildSearchRegex();
      console.debug(searchRe);
      return this.score(this.dictionary.filter((d) => searchRe.test(d)));
    }
    isSolved() {
      return this.greenList.filter((v) => v !== "").length === 5;
    }
  };

const readline = require("readline");
const chalk = require("chalk");
colors = ["", "yellow", "green"];

function formatInput(input) {
  return input
    .map(
      ({ letter, color }) => {
        const l = ` ${letter.toUpperCase()} `;
        switch (color) {
          case "yellow":
            return chalk.bgHex("#ffc107").bold(l);
          case "green":
            return chalk.bgHex("#198754").bold(l);
        }
        return chalk.reset.bold(l);
      },
    )
    .join("");
}

module.exports =
  async function wordleInput(word) {
    const input = word.split("").map((letter) => ({ letter }));
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      const stream = process.stdout;
      let pos = 0;

      rl.write(formatInput(input));
      readline.cursorTo(stream, (3 * pos) + 1);
      const keypressHandler = (c, k) => {
        readline.clearLine(stream);
        const { name } = k;
        switch (name) {
          case "right":
          case "space":
            pos = ++pos % 5;
            break;
          case "left":
            pos = pos > 0 ? --pos : 4;
            break;
          case "up":
            let i = colors.indexOf(input[pos].color || "");
            input[pos].color = colors[++i % 3];
            break;
          case "down":
            let j = colors.indexOf(input[pos].color || "");
            input[pos].color = colors[j > 0 ? --j : 2];
            break;
          case "s":
            input.forEach(
              (c) => {
                c.color = "green";
              },
            );
        }
        readline.moveCursor(stream, 0, -1);
        //clears stream
        rl.clearLine();
        rl.write(formatInput(input));
        readline.cursorTo(stream, (3 * pos) + 1);
        if (name === "return") {
          rl.close();
          process.stdin.off("keypress", keypressHandler);
          readline.clearLine(stream, 0);
          readline.cursorTo(stream, 0);
          return resolve(input);
        }
      };
      process.stdin.on("keypress", keypressHandler);
    });
  };

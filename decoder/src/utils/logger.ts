// let clc = require("cli-color");
// let jsome = require('jsome');

import clc from 'cli-color';
import jsome from 'jsome';

let errorColor = clc.black.bold.bgRed;
let runningColor = clc.black.bold.bgGreen;
let warnColor = clc.yellow;
let noticeColor = clc.blue;
let logColor = clc.cyan;
let debugColor = clc.white;
let infoColor = clc.green;
let infoBrColor = clc.greenBright;
let noticeBrColor = clc.black.bold.bgCyan;
let specialColor = clc.magenta;
let trackerColor = clc.black.bold.bgMagenta;
export class Logger {
  static breakOnError = false;
  static loggingOn = true;

  static debugObject(a: any) {
    if (!Logger.loggingOn) return;
    jsome.colors = {
      'num': 'magenta',    // stands for numbers
      'str': 'green', // stands for strings
      'bool': 'blue',     // stands for booleans
      'regex': 'blue',    // stands for regular expressions
      'undef': 'grey',    // stands for undefined
      'null': 'grey',    // stands for null
      'attr': 'white',   // objects attributes -> { attr : value }
      'quot': 'grey',  // strings quotes -> "..."
      'punc': 'grey',  // commas seperating arrays and objects values -> [ , , , ]
      'brack': 'grey',  // for both {} and []
      'func': 'grey'     // stands for functions
      // dates are not defined and will be displayed in the default term color.
    }
    jsome.colors.attr = ['white', 'bold']

    return jsome(a);
  }
  static log(x: string) {
    if (Logger.loggingOn) console.log(logColor(x));
  };
  static warn(x: string) {
    console.log(warnColor(x));
  };
  static info(x: string) {
    if (Logger.loggingOn) console.log(infoColor(x));
  };
  static infoBr(x: string) {
    if (Logger.loggingOn) console.log(infoBrColor(x));
  };
  static debug(x: string) {
    if (Logger.loggingOn) console.log(debugColor(x));
  };
  static error(x: string) {
    console.log(errorColor(x));
    if (this.breakOnError) {
      process.exit(1);
    }

  };
  static notice(x: string) {
    if (Logger.loggingOn) console.log(noticeColor(x));
  };
  static noticeBr(x: string) {
    if (Logger.loggingOn) console.log(noticeBrColor(`${x}` + clc.erase.lineRight));
  };
  static special(x: string) {
    if (Logger.loggingOn) console.log(specialColor(x));
  };
  static running(x: string) {
    if (Logger.loggingOn) console.log(runningColor(x));
  };

  static tracker(x: string) {
    console.log(trackerColor(`\n${x}` + clc.erase.lineRight + '\n'));
  };

  static clear() {
    process.stdout.write(clc.reset);
    process.stdout.write(clc.erase.screen);
    process.stdout.write('\u001b[3J\u001b[1J');
  }
}
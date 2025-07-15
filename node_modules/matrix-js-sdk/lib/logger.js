import _defineProperty from "@babel/runtime/helpers/defineProperty";
/*
Copyright 2018 André Jaenisch
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import loglevel from "loglevel";

/** Backwards-compatibility hack to expose `log` to applications that might still be relying on it. */

/** Logger interface used within the js-sdk codebase */

/** The basic interface for a logger which doesn't support children */

// This is to demonstrate, that you can use any namespace you want.
// Namespaces allow you to turn on/off the logging for specific parts of the
// application.
// An idea would be to control this via an environment variable (on Node.js).
// See https://www.npmjs.com/package/debug to see how this could be implemented
// Part of #332 is introducing a logging library in the first place.
var DEFAULT_NAMESPACE = "matrix";

// because rageshakes in react-sdk hijack the console log, also at module load time,
// initializing the logger here races with the initialization of rageshakes.
// to avoid the issue, we override the methodFactory of loglevel that binds to the
// console methods at initialization time by a factory that looks up the console methods
// when logging so we always get the current value of console methods.
loglevel.methodFactory = function (methodName, logLevel, loggerName) {
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    /* eslint-disable @typescript-eslint/no-invalid-this */
    if (this.prefix) {
      args.unshift(this.prefix);
    }
    /* eslint-enable @typescript-eslint/no-invalid-this */
    var supportedByConsole = methodName === "error" || methodName === "warn" || methodName === "trace" || methodName === "info" || methodName === "debug";
    /* eslint-disable no-console */
    if (supportedByConsole) {
      return console[methodName](...args);
    } else {
      return console.log(...args);
    }
    /* eslint-enable no-console */
  };
};

/**
 * Implementation of {@link Logger} based on `loglevel`.
 */

/**
 * Internal utility function: gets a {@link Logger} based on `loglevel`.
 *
 * Child loggers produced by {@link Logger.getChild} add the name of the child logger as a prefix on each log line.
 *
 * @param prefix Prefix to add to each logged line. If undefined, no prefix will be added.
 */
function getPrefixedLogger(prefix) {
  var loggerName = DEFAULT_NAMESPACE + (prefix === undefined ? "" : "-".concat(prefix));
  var prefixLogger = loglevel.getLogger(loggerName);
  if (prefixLogger.getChild === undefined) {
    // This is a new loglevel Logger which has not been turned into a PrefixedLogger yet.
    prefixLogger.prefix = prefix;
    prefixLogger.getChild = childPrefix => {
      // create the new child logger
      var childLogger = getPrefixedLogger((prefix !== null && prefix !== void 0 ? prefix : "") + childPrefix);
      // Assign the methodFactory from the parent logger.
      // This is useful if we add extensions to the parent logger that modifies
      // its methodFactory. (An example extension is: storing each log to a rageshake db)
      childLogger.methodFactory = prefixLogger.methodFactory;
      // Rebuild the child logger with the new methodFactory.
      childLogger.rebuild();
      return childLogger;
    };
    prefixLogger.setLevel(loglevel.levels.DEBUG, false);
  }
  return prefixLogger;
}

/**
 * Drop-in replacement for `console` using {@link https://www.npmjs.com/package/loglevel|loglevel}.
 * Can be tailored down to specific use cases if needed.
 */
export var logger = getPrefixedLogger();

/**
 * A "span" for grouping related log lines together.
 *
 * The current implementation just adds the name at the start of each log line.
 *
 * This offers a lighter-weight alternative to 'child' loggers returned by {@link Logger#getChild}. In particular,
 * it's not possible to apply individual filters to the LogSpan such as setting the verbosity level. On the other hand,
 * no reference to the LogSpan is retained in the logging framework, so it is safe to make lots of them over the course
 * of an application's life and just drop references to them when the job is done.
 */
export class LogSpan {
  constructor(parent, name) {
    this.parent = parent;
    _defineProperty(this, "name", void 0);
    this.name = name + ":";
  }
  trace() {
    for (var _len2 = arguments.length, msg = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      msg[_key2] = arguments[_key2];
    }
    this.parent.trace(this.name, ...msg);
  }
  debug() {
    for (var _len3 = arguments.length, msg = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      msg[_key3] = arguments[_key3];
    }
    this.parent.debug(this.name, ...msg);
  }
  info() {
    for (var _len4 = arguments.length, msg = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      msg[_key4] = arguments[_key4];
    }
    this.parent.info(this.name, ...msg);
  }
  warn() {
    for (var _len5 = arguments.length, msg = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      msg[_key5] = arguments[_key5];
    }
    this.parent.warn(this.name, ...msg);
  }
  error() {
    for (var _len6 = arguments.length, msg = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      msg[_key6] = arguments[_key6];
    }
    this.parent.error(this.name, ...msg);
  }
}
//# sourceMappingURL=logger.js.map
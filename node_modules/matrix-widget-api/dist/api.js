(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.mxwidgets = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ClientWidgetApi = void 0;
var _events = require("events");
var _PostmessageTransport = require("./transport/PostmessageTransport");
var _WidgetApiDirection = require("./interfaces/WidgetApiDirection");
var _WidgetApiAction = require("./interfaces/WidgetApiAction");
var _Capabilities = require("./interfaces/Capabilities");
var _ApiVersion = require("./interfaces/ApiVersion");
var _WidgetEventCapability = require("./models/WidgetEventCapability");
var _GetOpenIDAction = require("./interfaces/GetOpenIDAction");
var _SimpleObservable = require("./util/SimpleObservable");
var _Symbols = require("./Symbols");
var _UpdateDelayedEventAction = require("./interfaces/UpdateDelayedEventAction");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _asyncIterator(iterable) { var method, async, sync, retry = 2; for ("undefined" != typeof Symbol && (async = Symbol.asyncIterator, sync = Symbol.iterator); retry--;) { if (async && null != (method = iterable[async])) return method.call(iterable); if (sync && null != (method = iterable[sync])) return new AsyncFromSyncIterator(method.call(iterable)); async = "@@asyncIterator", sync = "@@iterator"; } throw new TypeError("Object is not async iterable"); }
function AsyncFromSyncIterator(s) { function AsyncFromSyncIteratorContinuation(r) { if (Object(r) !== r) return Promise.reject(new TypeError(r + " is not an object.")); var done = r.done; return Promise.resolve(r.value).then(function (value) { return { value: value, done: done }; }); } return AsyncFromSyncIterator = function AsyncFromSyncIterator(s) { this.s = s, this.n = s.next; }, AsyncFromSyncIterator.prototype = { s: null, n: null, next: function next() { return AsyncFromSyncIteratorContinuation(this.n.apply(this.s, arguments)); }, "return": function _return(value) { var ret = this.s["return"]; return void 0 === ret ? Promise.resolve({ value: value, done: !0 }) : AsyncFromSyncIteratorContinuation(ret.apply(this.s, arguments)); }, "throw": function _throw(value) { var thr = this.s["return"]; return void 0 === thr ? Promise.reject(value) : AsyncFromSyncIteratorContinuation(thr.apply(this.s, arguments)); } }, new AsyncFromSyncIterator(s); } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *         http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             */
/**
 * API handler for the client side of widgets. This raises events
 * for each action received as `action:${action}` (eg: "action:screenshot").
 * Default handling can be prevented by using preventDefault() on the
 * raised event. The default handling varies for each action: ones
 * which the SDK can handle safely are acknowledged appropriately and
 * ones which are unhandled (custom or require the client to do something)
 * are rejected with an error.
 *
 * Events which are preventDefault()ed must reply using the transport.
 * The events raised will have a default of an IWidgetApiRequest
 * interface.
 *
 * When the ClientWidgetApi is ready to start sending requests, it will
 * raise a "ready" CustomEvent. After the ready event fires, actions can
 * be sent and the transport will be ready.
 *
 * When the widget has indicated it has loaded, this class raises a
 * "preparing" CustomEvent. The preparing event does not indicate that
 * the widget is ready to receive communications - that is signified by
 * the ready event exclusively.
 *
 * This class only handles one widget at a time.
 */
var ClientWidgetApi = /*#__PURE__*/function (_EventEmitter) {
  _inherits(ClientWidgetApi, _EventEmitter);
  var _super = _createSuper(ClientWidgetApi);
  /**
   * Creates a new client widget API. This will instantiate the transport
   * and start everything. When the iframe is loaded under the widget's
   * conditions, a "ready" event will be raised.
   * @param {Widget} widget The widget to communicate with.
   * @param {HTMLIFrameElement} iframe The iframe the widget is in.
   * @param {WidgetDriver} driver The driver for this widget/client.
   */
  function ClientWidgetApi(widget, iframe, driver) {
    var _this;
    _classCallCheck(this, ClientWidgetApi);
    _this = _super.call(this);
    _this.widget = widget;
    _this.iframe = iframe;
    _this.driver = driver;
    _defineProperty(_assertThisInitialized(_this), "transport", void 0);
    _defineProperty(_assertThisInitialized(_this), "cachedWidgetVersions", null);
    // contentLoadedActionSent is used to check that only one ContentLoaded request is send.
    _defineProperty(_assertThisInitialized(_this), "contentLoadedActionSent", false);
    _defineProperty(_assertThisInitialized(_this), "allowedCapabilities", new Set());
    _defineProperty(_assertThisInitialized(_this), "allowedEvents", []);
    _defineProperty(_assertThisInitialized(_this), "isStopped", false);
    _defineProperty(_assertThisInitialized(_this), "turnServers", null);
    _defineProperty(_assertThisInitialized(_this), "contentLoadedWaitTimer", void 0);
    // Stores pending requests to push a room's state to the widget
    _defineProperty(_assertThisInitialized(_this), "pushRoomStateTasks", new Set());
    // Room ID → event type → state key → events to be pushed
    _defineProperty(_assertThisInitialized(_this), "pushRoomStateResult", new Map());
    _defineProperty(_assertThisInitialized(_this), "flushRoomStateTask", null);
    _defineProperty(_assertThisInitialized(_this), "viewedRoomId", null);
    if (!(iframe !== null && iframe !== void 0 && iframe.contentWindow)) {
      throw new Error("No iframe supplied");
    }
    if (!widget) {
      throw new Error("Invalid widget");
    }
    if (!driver) {
      throw new Error("Invalid driver");
    }
    _this.transport = new _PostmessageTransport.PostmessageTransport(_WidgetApiDirection.WidgetApiDirection.ToWidget, widget.id, iframe.contentWindow, window);
    _this.transport.targetOrigin = widget.origin;
    _this.transport.on("message", _this.handleMessage.bind(_assertThisInitialized(_this)));
    iframe.addEventListener("load", _this.onIframeLoad.bind(_assertThisInitialized(_this)));
    _this.transport.start();
    return _this;
  }
  _createClass(ClientWidgetApi, [{
    key: "hasCapability",
    value: function hasCapability(capability) {
      return this.allowedCapabilities.has(capability);
    }
  }, {
    key: "canUseRoomTimeline",
    value: function canUseRoomTimeline(roomId) {
      return this.hasCapability("org.matrix.msc2762.timeline:".concat(_Symbols.Symbols.AnyRoom)) || this.hasCapability("org.matrix.msc2762.timeline:".concat(roomId));
    }
  }, {
    key: "canSendRoomEvent",
    value: function canSendRoomEvent(eventType) {
      var msgtype = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return this.allowedEvents.some(function (e) {
        return e.matchesAsRoomEvent(_WidgetEventCapability.EventDirection.Send, eventType, msgtype);
      });
    }
  }, {
    key: "canSendStateEvent",
    value: function canSendStateEvent(eventType, stateKey) {
      return this.allowedEvents.some(function (e) {
        return e.matchesAsStateEvent(_WidgetEventCapability.EventDirection.Send, eventType, stateKey);
      });
    }
  }, {
    key: "canSendToDeviceEvent",
    value: function canSendToDeviceEvent(eventType) {
      return this.allowedEvents.some(function (e) {
        return e.matchesAsToDeviceEvent(_WidgetEventCapability.EventDirection.Send, eventType);
      });
    }
  }, {
    key: "canReceiveRoomEvent",
    value: function canReceiveRoomEvent(eventType) {
      var msgtype = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return this.allowedEvents.some(function (e) {
        return e.matchesAsRoomEvent(_WidgetEventCapability.EventDirection.Receive, eventType, msgtype);
      });
    }
  }, {
    key: "canReceiveStateEvent",
    value: function canReceiveStateEvent(eventType, stateKey) {
      return this.allowedEvents.some(function (e) {
        return e.matchesAsStateEvent(_WidgetEventCapability.EventDirection.Receive, eventType, stateKey);
      });
    }
  }, {
    key: "canReceiveToDeviceEvent",
    value: function canReceiveToDeviceEvent(eventType) {
      return this.allowedEvents.some(function (e) {
        return e.matchesAsToDeviceEvent(_WidgetEventCapability.EventDirection.Receive, eventType);
      });
    }
  }, {
    key: "canReceiveRoomAccountData",
    value: function canReceiveRoomAccountData(eventType) {
      return this.allowedEvents.some(function (e) {
        return e.matchesAsRoomAccountData(_WidgetEventCapability.EventDirection.Receive, eventType);
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      this.isStopped = true;
      this.transport.stop();
    }
  }, {
    key: "getWidgetVersions",
    value: function () {
      var _getWidgetVersions = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
        var r;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!Array.isArray(this.cachedWidgetVersions)) {
                _context.next = 2;
                break;
              }
              return _context.abrupt("return", Promise.resolve(this.cachedWidgetVersions));
            case 2:
              _context.prev = 2;
              _context.next = 5;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SupportedApiVersions, {});
            case 5:
              r = _context.sent;
              this.cachedWidgetVersions = r.supported_versions;
              return _context.abrupt("return", r.supported_versions);
            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](2);
              console.warn("non-fatal error getting supported widget versions: ", _context.t0);
              return _context.abrupt("return", []);
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this, [[2, 10]]);
      }));
      function getWidgetVersions() {
        return _getWidgetVersions.apply(this, arguments);
      }
      return getWidgetVersions;
    }()
  }, {
    key: "beginCapabilities",
    value: function beginCapabilities() {
      var _this2 = this;
      // widget has loaded - tell all the listeners that
      this.emit("preparing");
      var requestedCaps;
      this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.Capabilities, {}).then(function (caps) {
        requestedCaps = caps.capabilities;
        return _this2.driver.validateCapabilities(new Set(caps.capabilities));
      }).then(function (allowedCaps) {
        _this2.allowCapabilities(_toConsumableArray(allowedCaps), requestedCaps);
        _this2.emit("ready");
      })["catch"](function (e) {
        _this2.emit("error:preparing", e);
      });
    }
  }, {
    key: "allowCapabilities",
    value: function allowCapabilities(allowed, requested) {
      var _this$allowedEvents,
        _this3 = this;
      console.log("Widget ".concat(this.widget.id, " is allowed capabilities:"), allowed);
      var _iterator2 = _createForOfIteratorHelper(allowed),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var c = _step2.value;
          this.allowedCapabilities.add(c);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var allowedEvents = _WidgetEventCapability.WidgetEventCapability.findEventCapabilities(allowed);
      (_this$allowedEvents = this.allowedEvents).push.apply(_this$allowedEvents, _toConsumableArray(allowedEvents));
      this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities, {
        requested: requested,
        approved: Array.from(this.allowedCapabilities)
      })["catch"](function (e) {
        console.warn("non-fatal error notifying widget of approved capabilities:", e);
      }).then(function () {
        _this3.emit("capabilitiesNotified");
      });

      // Push the initial room state for all rooms with a timeline capability
      var _iterator3 = _createForOfIteratorHelper(allowed),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _c = _step3.value;
          if ((0, _Capabilities.isTimelineCapability)(_c)) {
            var roomId = (0, _Capabilities.getTimelineRoomIDFromCapability)(_c);
            if (roomId === _Symbols.Symbols.AnyRoom) {
              var _iterator4 = _createForOfIteratorHelper(this.driver.getKnownRooms()),
                _step4;
              try {
                for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                  var _roomId = _step4.value;
                  this.pushRoomState(_roomId);
                }
              } catch (err) {
                _iterator4.e(err);
              } finally {
                _iterator4.f();
              }
            } else {
              this.pushRoomState(roomId);
            }
          }
        }
        // If new events are allowed and the currently viewed room isn't covered
        // by a timeline capability, then we know that there could be some state
        // in the viewed room that the widget hasn't learned about yet- push it.
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      if (allowedEvents.length > 0 && this.viewedRoomId !== null && !this.canUseRoomTimeline(this.viewedRoomId)) {
        this.pushRoomState(this.viewedRoomId);
      }
    }
  }, {
    key: "onIframeLoad",
    value: function onIframeLoad(ev) {
      if (this.widget.waitForIframeLoad) {
        // If the widget is set to waitForIframeLoad the capabilities immediately get setup after load.
        // The client does not wait for the ContentLoaded action.
        this.beginCapabilities();
      } else {
        // Reaching this means, that the Iframe got reloaded/loaded and
        // the clientApi is awaiting the FIRST ContentLoaded action.
        console.log("waitForIframeLoad is false: waiting for widget to send contentLoaded");
        this.contentLoadedWaitTimer = setTimeout(function () {
          console.error("Widget specified waitForIframeLoad=false but timed out waiting for contentLoaded event!");
        }, 10000);
        this.contentLoadedActionSent = false;
      }
    }
  }, {
    key: "handleContentLoadedAction",
    value: function handleContentLoadedAction(action) {
      if (this.contentLoadedWaitTimer !== undefined) {
        clearTimeout(this.contentLoadedWaitTimer);
        this.contentLoadedWaitTimer = undefined;
      }
      if (this.contentLoadedActionSent) {
        throw new Error("Improper sequence: ContentLoaded Action can only be sent once after the widget loaded " + "and should only be used if waitForIframeLoad is false (default=true)");
      }
      if (this.widget.waitForIframeLoad) {
        this.transport.reply(action, {
          error: {
            message: "Improper sequence: not expecting ContentLoaded event if " + "waitForIframeLoad is true (default=true)"
          }
        });
      } else {
        this.transport.reply(action, {});
        this.beginCapabilities();
      }
      this.contentLoadedActionSent = true;
    }
  }, {
    key: "replyVersions",
    value: function replyVersions(request) {
      this.transport.reply(request, {
        supported_versions: _ApiVersion.CurrentApiVersions
      });
    }
  }, {
    key: "supportsUpdateState",
    value: function () {
      var _supportsUpdateState = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
        return _regeneratorRuntime().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.getWidgetVersions();
            case 2:
              return _context2.abrupt("return", _context2.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE));
            case 3:
            case "end":
              return _context2.stop();
          }
        }, _callee2, this);
      }));
      function supportsUpdateState() {
        return _supportsUpdateState.apply(this, arguments);
      }
      return supportsUpdateState;
    }()
  }, {
    key: "handleCapabilitiesRenegotiate",
    value: function handleCapabilitiesRenegotiate(request) {
      var _request$data,
        _this4 = this;
      // acknowledge first
      this.transport.reply(request, {});
      var requested = ((_request$data = request.data) === null || _request$data === void 0 ? void 0 : _request$data.capabilities) || [];
      var newlyRequested = new Set(requested.filter(function (r) {
        return !_this4.hasCapability(r);
      }));
      if (newlyRequested.size === 0) {
        // Nothing to do - skip validation
        this.allowCapabilities([], []);
      }
      this.driver.validateCapabilities(newlyRequested).then(function (allowed) {
        return _this4.allowCapabilities(_toConsumableArray(allowed), _toConsumableArray(newlyRequested));
      });
    }
  }, {
    key: "handleNavigate",
    value: function handleNavigate(request) {
      var _request$data2,
        _request$data3,
        _this5 = this;
      if (!this.hasCapability(_Capabilities.MatrixCapabilities.MSC2931Navigate)) {
        return this.transport.reply(request, {
          error: {
            message: "Missing capability"
          }
        });
      }
      if (!((_request$data2 = request.data) !== null && _request$data2 !== void 0 && _request$data2.uri) || !((_request$data3 = request.data) !== null && _request$data3 !== void 0 && _request$data3.uri.toString().startsWith("https://matrix.to/#"))) {
        return this.transport.reply(request, {
          error: {
            message: "Invalid matrix.to URI"
          }
        });
      }
      var onErr = function onErr(e) {
        console.error("[ClientWidgetApi] Failed to handle navigation: ", e);
        _this5.handleDriverError(e, request, "Error handling navigation");
      };
      try {
        this.driver.navigate(request.data.uri.toString())["catch"](function (e) {
          return onErr(e);
        }).then(function () {
          return _this5.transport.reply(request, {});
        });
      } catch (e) {
        return onErr(e);
      }
    }
  }, {
    key: "handleOIDC",
    value: function handleOIDC(request) {
      var _this6 = this;
      var phase = 1; // 1 = initial request, 2 = after user manual confirmation

      var replyState = function replyState(state, credential) {
        credential = credential || {};
        if (phase > 1) {
          return _this6.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials, _objectSpread({
            state: state,
            original_request_id: request.requestId
          }, credential));
        } else {
          return _this6.transport.reply(request, _objectSpread({
            state: state
          }, credential));
        }
      };
      var replyError = function replyError(msg) {
        console.error("[ClientWidgetApi] Failed to handle OIDC: ", msg);
        if (phase > 1) {
          // We don't have a way to indicate that a random error happened in this flow, so
          // just block the attempt.
          return replyState(_GetOpenIDAction.OpenIDRequestState.Blocked);
        } else {
          return _this6.transport.reply(request, {
            error: {
              message: msg
            }
          });
        }
      };
      var observer = new _SimpleObservable.SimpleObservable(function (update) {
        if (update.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation && phase > 1) {
          observer.close();
          return replyError("client provided out-of-phase response to OIDC flow");
        }
        if (update.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation) {
          replyState(update.state);
          phase++;
          return;
        }
        if (update.state === _GetOpenIDAction.OpenIDRequestState.Allowed && !update.token) {
          return replyError("client provided invalid OIDC token for an allowed request");
        }
        if (update.state === _GetOpenIDAction.OpenIDRequestState.Blocked) {
          update.token = undefined; // just in case the client did something weird
        }

        observer.close();
        return replyState(update.state, update.token);
      });
      this.driver.askOpenID(observer);
    }
  }, {
    key: "handleReadRoomAccountData",
    value: function handleReadRoomAccountData(request) {
      var _this7 = this;
      var events = Promise.resolve([]);
      events = this.driver.readRoomAccountData(request.data.type);
      if (!this.canReceiveRoomAccountData(request.data.type)) {
        return this.transport.reply(request, {
          error: {
            message: "Cannot read room account data of this type"
          }
        });
      }
      return events.then(function (evs) {
        _this7.transport.reply(request, {
          events: evs
        });
      });
    }
  }, {
    key: "handleReadEvents",
    value: function () {
      var _handleReadEvents = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3(request) {
        var _this8 = this;
        var askRoomIds, _iterator5, _step5, roomId, limit, since, stateKey, msgtype, _stateKey, events;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (request.data.type) {
                _context3.next = 2;
                break;
              }
              return _context3.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing event type"
                }
              }));
            case 2:
              if (!(request.data.limit !== undefined && (!request.data.limit || request.data.limit < 0))) {
                _context3.next = 4;
                break;
              }
              return _context3.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - limit out of range"
                }
              }));
            case 4:
              if (!(request.data.room_ids === undefined)) {
                _context3.next = 8;
                break;
              }
              askRoomIds = this.viewedRoomId === null ? [] : [this.viewedRoomId];
              _context3.next = 30;
              break;
            case 8:
              if (!(request.data.room_ids === _Symbols.Symbols.AnyRoom)) {
                _context3.next = 12;
                break;
              }
              askRoomIds = this.driver.getKnownRooms().filter(function (roomId) {
                return _this8.canUseRoomTimeline(roomId);
              });
              _context3.next = 30;
              break;
            case 12:
              askRoomIds = request.data.room_ids;
              _iterator5 = _createForOfIteratorHelper(askRoomIds);
              _context3.prev = 14;
              _iterator5.s();
            case 16:
              if ((_step5 = _iterator5.n()).done) {
                _context3.next = 22;
                break;
              }
              roomId = _step5.value;
              if (this.canUseRoomTimeline(roomId)) {
                _context3.next = 20;
                break;
              }
              return _context3.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Unable to access room timeline: ".concat(roomId)
                }
              }));
            case 20:
              _context3.next = 16;
              break;
            case 22:
              _context3.next = 27;
              break;
            case 24:
              _context3.prev = 24;
              _context3.t0 = _context3["catch"](14);
              _iterator5.e(_context3.t0);
            case 27:
              _context3.prev = 27;
              _iterator5.f();
              return _context3.finish(27);
            case 30:
              limit = request.data.limit || 0;
              since = request.data.since;
              stateKey = undefined;
              msgtype = undefined;
              if (!(request.data.state_key !== undefined)) {
                _context3.next = 40;
                break;
              }
              stateKey = request.data.state_key === true ? undefined : request.data.state_key.toString();
              if (this.canReceiveStateEvent(request.data.type, (_stateKey = stateKey) !== null && _stateKey !== void 0 ? _stateKey : null)) {
                _context3.next = 38;
                break;
              }
              return _context3.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Cannot read state events of this type"
                }
              }));
            case 38:
              _context3.next = 43;
              break;
            case 40:
              msgtype = request.data.msgtype;
              if (this.canReceiveRoomEvent(request.data.type, msgtype)) {
                _context3.next = 43;
                break;
              }
              return _context3.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Cannot read room events of this type"
                }
              }));
            case 43:
              if (!(request.data.room_ids === undefined && askRoomIds.length === 0)) {
                _context3.next = 50;
                break;
              }
              // For backwards compatibility we still call the deprecated
              // readRoomEvents and readStateEvents methods in case the client isn't
              // letting us know the currently viewed room via setViewedRoomId
              //
              // This can be considered as a deprecated implementation.
              // A driver should call `setViewedRoomId` on the widget messaging and implement the new readRoomState and readRoomTimeline
              // Methods.
              // This block makes sure that it is also possible to not use setViewedRoomId.
              // readRoomTimeline and readRoomState are required however! Otherwise widget requests that include
              // `room_ids` will fail.
              console.warn("The widgetDriver uses deprecated behaviour:\n It does not set the viewedRoomId using `setViewedRoomId`");
              _context3.next = 47;
              return (
                // This returns [] with the current driver of Element Web.
                // Add default implementations of the `readRoomEvents` and `readStateEvents`
                // methods to use `readRoomTimeline` and `readRoomState` if they are not overwritten.
                request.data.state_key === undefined ? this.driver.readRoomEvents(request.data.type, msgtype, limit, null, since) : this.driver.readStateEvents(request.data.type, stateKey, limit, null)
              );
            case 47:
              events = _context3.sent;
              _context3.next = 68;
              break;
            case 50:
              _context3.next = 52;
              return this.supportsUpdateState();
            case 52:
              if (!_context3.sent) {
                _context3.next = 58;
                break;
              }
              _context3.next = 55;
              return Promise.all(askRoomIds.map(function (roomId) {
                return _this8.driver.readRoomTimeline(roomId, request.data.type, msgtype, stateKey, limit, since);
              }));
            case 55:
              events = _context3.sent.flat(1);
              _context3.next = 68;
              break;
            case 58:
              if (!(request.data.state_key === undefined)) {
                _context3.next = 64;
                break;
              }
              _context3.next = 61;
              return Promise.all(askRoomIds.map(function (roomId) {
                return _this8.driver.readRoomTimeline(roomId, request.data.type, msgtype, stateKey, limit, since);
              }));
            case 61:
              _context3.t1 = _context3.sent;
              _context3.next = 67;
              break;
            case 64:
              _context3.next = 66;
              return Promise.all(askRoomIds.map(function (roomId) {
                return _this8.driver.readRoomState(roomId, request.data.type, stateKey);
              }));
            case 66:
              _context3.t1 = _context3.sent;
            case 67:
              events = _context3.t1.flat(1);
            case 68:
              this.transport.reply(request, {
                events: events
              });
            case 69:
            case "end":
              return _context3.stop();
          }
        }, _callee3, this, [[14, 24, 27, 30]]);
      }));
      function handleReadEvents(_x) {
        return _handleReadEvents.apply(this, arguments);
      }
      return handleReadEvents;
    }()
  }, {
    key: "handleSendEvent",
    value: function handleSendEvent(request) {
      var _this9 = this;
      if (!request.data.type) {
        return this.transport.reply(request, {
          error: {
            message: "Invalid request - missing event type"
          }
        });
      }
      if (!!request.data.room_id && !this.canUseRoomTimeline(request.data.room_id)) {
        return this.transport.reply(request, {
          error: {
            message: "Unable to access room timeline: ".concat(request.data.room_id)
          }
        });
      }
      var isDelayedEvent = request.data.delay !== undefined || request.data.parent_delay_id !== undefined;
      if (isDelayedEvent && !this.hasCapability(_Capabilities.MatrixCapabilities.MSC4157SendDelayedEvent)) {
        return this.transport.reply(request, {
          error: {
            message: "Missing capability"
          }
        });
      }
      var sendEventPromise;
      if (request.data.state_key !== undefined) {
        if (!this.canSendStateEvent(request.data.type, request.data.state_key)) {
          return this.transport.reply(request, {
            error: {
              message: "Cannot send state events of this type"
            }
          });
        }
        if (!isDelayedEvent) {
          sendEventPromise = this.driver.sendEvent(request.data.type, request.data.content || {}, request.data.state_key, request.data.room_id);
        } else {
          var _request$data$delay, _request$data$parent_;
          sendEventPromise = this.driver.sendDelayedEvent((_request$data$delay = request.data.delay) !== null && _request$data$delay !== void 0 ? _request$data$delay : null, (_request$data$parent_ = request.data.parent_delay_id) !== null && _request$data$parent_ !== void 0 ? _request$data$parent_ : null, request.data.type, request.data.content || {}, request.data.state_key, request.data.room_id);
        }
      } else {
        var content = request.data.content || {};
        var msgtype = content["msgtype"];
        if (!this.canSendRoomEvent(request.data.type, msgtype)) {
          return this.transport.reply(request, {
            error: {
              message: "Cannot send room events of this type"
            }
          });
        }
        if (!isDelayedEvent) {
          sendEventPromise = this.driver.sendEvent(request.data.type, content, null,
          // not sending a state event
          request.data.room_id);
        } else {
          var _request$data$delay2, _request$data$parent_2;
          sendEventPromise = this.driver.sendDelayedEvent((_request$data$delay2 = request.data.delay) !== null && _request$data$delay2 !== void 0 ? _request$data$delay2 : null, (_request$data$parent_2 = request.data.parent_delay_id) !== null && _request$data$parent_2 !== void 0 ? _request$data$parent_2 : null, request.data.type, content, null,
          // not sending a state event
          request.data.room_id);
        }
      }
      sendEventPromise.then(function (sentEvent) {
        return _this9.transport.reply(request, _objectSpread({
          room_id: sentEvent.roomId
        }, "eventId" in sentEvent ? {
          event_id: sentEvent.eventId
        } : {
          delay_id: sentEvent.delayId
        }));
      })["catch"](function (e) {
        console.error("error sending event: ", e);
        _this9.handleDriverError(e, request, "Error sending event");
      });
    }
  }, {
    key: "handleUpdateDelayedEvent",
    value: function handleUpdateDelayedEvent(request) {
      var _this10 = this;
      if (!request.data.delay_id) {
        return this.transport.reply(request, {
          error: {
            message: "Invalid request - missing delay_id"
          }
        });
      }
      if (!this.hasCapability(_Capabilities.MatrixCapabilities.MSC4157UpdateDelayedEvent)) {
        return this.transport.reply(request, {
          error: {
            message: "Missing capability"
          }
        });
      }
      switch (request.data.action) {
        case _UpdateDelayedEventAction.UpdateDelayedEventAction.Cancel:
        case _UpdateDelayedEventAction.UpdateDelayedEventAction.Restart:
        case _UpdateDelayedEventAction.UpdateDelayedEventAction.Send:
          this.driver.updateDelayedEvent(request.data.delay_id, request.data.action).then(function () {
            return _this10.transport.reply(request, {});
          })["catch"](function (e) {
            console.error("error updating delayed event: ", e);
            _this10.handleDriverError(e, request, "Error updating delayed event");
          });
          break;
        default:
          return this.transport.reply(request, {
            error: {
              message: "Invalid request - unsupported action"
            }
          });
      }
    }
  }, {
    key: "handleSendToDevice",
    value: function () {
      var _handleSendToDevice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(request) {
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              if (request.data.type) {
                _context4.next = 5;
                break;
              }
              _context4.next = 3;
              return this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing event type"
                }
              });
            case 3:
              _context4.next = 31;
              break;
            case 5:
              if (request.data.messages) {
                _context4.next = 10;
                break;
              }
              _context4.next = 8;
              return this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing event contents"
                }
              });
            case 8:
              _context4.next = 31;
              break;
            case 10:
              if (!(typeof request.data.encrypted !== "boolean")) {
                _context4.next = 15;
                break;
              }
              _context4.next = 13;
              return this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing encryption flag"
                }
              });
            case 13:
              _context4.next = 31;
              break;
            case 15:
              if (this.canSendToDeviceEvent(request.data.type)) {
                _context4.next = 20;
                break;
              }
              _context4.next = 18;
              return this.transport.reply(request, {
                error: {
                  message: "Cannot send to-device events of this type"
                }
              });
            case 18:
              _context4.next = 31;
              break;
            case 20:
              _context4.prev = 20;
              _context4.next = 23;
              return this.driver.sendToDevice(request.data.type, request.data.encrypted, request.data.messages);
            case 23:
              _context4.next = 25;
              return this.transport.reply(request, {});
            case 25:
              _context4.next = 31;
              break;
            case 27:
              _context4.prev = 27;
              _context4.t0 = _context4["catch"](20);
              console.error("error sending to-device event", _context4.t0);
              this.handleDriverError(_context4.t0, request, "Error sending event");
            case 31:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this, [[20, 27]]);
      }));
      function handleSendToDevice(_x2) {
        return _handleSendToDevice.apply(this, arguments);
      }
      return handleSendToDevice;
    }()
  }, {
    key: "pollTurnServers",
    value: function () {
      var _pollTurnServers = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5(turnServers, initialServer) {
        var _iteratorAbruptCompletion, _didIteratorError, _iteratorError, _iterator, _step, server;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.prev = 0;
              _context5.next = 3;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers, initialServer // it's compatible, but missing the index signature
              );
            case 3:
              // Pick the generator up where we left off
              _iteratorAbruptCompletion = false;
              _didIteratorError = false;
              _context5.prev = 5;
              _iterator = _asyncIterator(turnServers);
            case 7:
              _context5.next = 9;
              return _iterator.next();
            case 9:
              if (!(_iteratorAbruptCompletion = !(_step = _context5.sent).done)) {
                _context5.next = 16;
                break;
              }
              server = _step.value;
              _context5.next = 13;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers, server // it's compatible, but missing the index signature
              );
            case 13:
              _iteratorAbruptCompletion = false;
              _context5.next = 7;
              break;
            case 16:
              _context5.next = 22;
              break;
            case 18:
              _context5.prev = 18;
              _context5.t0 = _context5["catch"](5);
              _didIteratorError = true;
              _iteratorError = _context5.t0;
            case 22:
              _context5.prev = 22;
              _context5.prev = 23;
              if (!(_iteratorAbruptCompletion && _iterator["return"] != null)) {
                _context5.next = 27;
                break;
              }
              _context5.next = 27;
              return _iterator["return"]();
            case 27:
              _context5.prev = 27;
              if (!_didIteratorError) {
                _context5.next = 30;
                break;
              }
              throw _iteratorError;
            case 30:
              return _context5.finish(27);
            case 31:
              return _context5.finish(22);
            case 32:
              _context5.next = 37;
              break;
            case 34:
              _context5.prev = 34;
              _context5.t1 = _context5["catch"](0);
              console.error("error polling for TURN servers", _context5.t1);
            case 37:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this, [[0, 34], [5, 18, 22, 32], [23,, 27, 31]]);
      }));
      function pollTurnServers(_x3, _x4) {
        return _pollTurnServers.apply(this, arguments);
      }
      return pollTurnServers;
    }()
  }, {
    key: "handleWatchTurnServers",
    value: function () {
      var _handleWatchTurnServers = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(request) {
        var turnServers, _yield$turnServers$ne, done, value;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3846TurnServers)) {
                _context6.next = 5;
                break;
              }
              _context6.next = 3;
              return this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              });
            case 3:
              _context6.next = 30;
              break;
            case 5:
              if (!this.turnServers) {
                _context6.next = 10;
                break;
              }
              _context6.next = 8;
              return this.transport.reply(request, {});
            case 8:
              _context6.next = 30;
              break;
            case 10:
              _context6.prev = 10;
              turnServers = this.driver.getTurnServers(); // Peek at the first result, so we can at least verify that the
              // client isn't banned from getting TURN servers entirely
              _context6.next = 14;
              return turnServers.next();
            case 14:
              _yield$turnServers$ne = _context6.sent;
              done = _yield$turnServers$ne.done;
              value = _yield$turnServers$ne.value;
              if (!done) {
                _context6.next = 19;
                break;
              }
              throw new Error("Client refuses to provide any TURN servers");
            case 19:
              _context6.next = 21;
              return this.transport.reply(request, {});
            case 21:
              // Start the poll loop, sending the widget the initial result
              this.pollTurnServers(turnServers, value);
              this.turnServers = turnServers;
              _context6.next = 30;
              break;
            case 25:
              _context6.prev = 25;
              _context6.t0 = _context6["catch"](10);
              console.error("error getting first TURN server results", _context6.t0);
              _context6.next = 30;
              return this.transport.reply(request, {
                error: {
                  message: "TURN servers not available"
                }
              });
            case 30:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this, [[10, 25]]);
      }));
      function handleWatchTurnServers(_x5) {
        return _handleWatchTurnServers.apply(this, arguments);
      }
      return handleWatchTurnServers;
    }()
  }, {
    key: "handleUnwatchTurnServers",
    value: function () {
      var _handleUnwatchTurnServers = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(request) {
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3846TurnServers)) {
                _context7.next = 5;
                break;
              }
              _context7.next = 3;
              return this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              });
            case 3:
              _context7.next = 15;
              break;
            case 5:
              if (this.turnServers) {
                _context7.next = 10;
                break;
              }
              _context7.next = 8;
              return this.transport.reply(request, {});
            case 8:
              _context7.next = 15;
              break;
            case 10:
              _context7.next = 12;
              return this.turnServers["return"](undefined);
            case 12:
              this.turnServers = null;
              _context7.next = 15;
              return this.transport.reply(request, {});
            case 15:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function handleUnwatchTurnServers(_x6) {
        return _handleUnwatchTurnServers.apply(this, arguments);
      }
      return handleUnwatchTurnServers;
    }()
  }, {
    key: "handleReadRelations",
    value: function () {
      var _handleReadRelations = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee8(request) {
        var _this11 = this;
        var result, chunk;
        return _regeneratorRuntime().wrap(function _callee8$(_context8) {
          while (1) switch (_context8.prev = _context8.next) {
            case 0:
              if (request.data.event_id) {
                _context8.next = 2;
                break;
              }
              return _context8.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing event ID"
                }
              }));
            case 2:
              if (!(request.data.limit !== undefined && request.data.limit < 0)) {
                _context8.next = 4;
                break;
              }
              return _context8.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - limit out of range"
                }
              }));
            case 4:
              if (!(request.data.room_id !== undefined && !this.canUseRoomTimeline(request.data.room_id))) {
                _context8.next = 6;
                break;
              }
              return _context8.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Unable to access room timeline: ".concat(request.data.room_id)
                }
              }));
            case 6:
              _context8.prev = 6;
              _context8.next = 9;
              return this.driver.readEventRelations(request.data.event_id, request.data.room_id, request.data.rel_type, request.data.event_type, request.data.from, request.data.to, request.data.limit, request.data.direction);
            case 9:
              result = _context8.sent;
              // only return events that the user has the permission to receive
              chunk = result.chunk.filter(function (e) {
                if (e.state_key !== undefined) {
                  return _this11.canReceiveStateEvent(e.type, e.state_key);
                } else {
                  return _this11.canReceiveRoomEvent(e.type, e.content["msgtype"]);
                }
              });
              return _context8.abrupt("return", this.transport.reply(request, {
                chunk: chunk,
                prev_batch: result.prevBatch,
                next_batch: result.nextBatch
              }));
            case 14:
              _context8.prev = 14;
              _context8.t0 = _context8["catch"](6);
              console.error("error getting the relations", _context8.t0);
              this.handleDriverError(_context8.t0, request, "Unexpected error while reading relations");
            case 18:
            case "end":
              return _context8.stop();
          }
        }, _callee8, this, [[6, 14]]);
      }));
      function handleReadRelations(_x7) {
        return _handleReadRelations.apply(this, arguments);
      }
      return handleReadRelations;
    }()
  }, {
    key: "handleUserDirectorySearch",
    value: function () {
      var _handleUserDirectorySearch = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee9(request) {
        var result;
        return _regeneratorRuntime().wrap(function _callee9$(_context9) {
          while (1) switch (_context9.prev = _context9.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC3973UserDirectorySearch)) {
                _context9.next = 2;
                break;
              }
              return _context9.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              }));
            case 2:
              if (!(typeof request.data.search_term !== "string")) {
                _context9.next = 4;
                break;
              }
              return _context9.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - missing search term"
                }
              }));
            case 4:
              if (!(request.data.limit !== undefined && request.data.limit < 0)) {
                _context9.next = 6;
                break;
              }
              return _context9.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Invalid request - limit out of range"
                }
              }));
            case 6:
              _context9.prev = 6;
              _context9.next = 9;
              return this.driver.searchUserDirectory(request.data.search_term, request.data.limit);
            case 9:
              result = _context9.sent;
              return _context9.abrupt("return", this.transport.reply(request, {
                limited: result.limited,
                results: result.results.map(function (r) {
                  return {
                    user_id: r.userId,
                    display_name: r.displayName,
                    avatar_url: r.avatarUrl
                  };
                })
              }));
            case 13:
              _context9.prev = 13;
              _context9.t0 = _context9["catch"](6);
              console.error("error searching in the user directory", _context9.t0);
              this.handleDriverError(_context9.t0, request, "Unexpected error while searching in the user directory");
            case 17:
            case "end":
              return _context9.stop();
          }
        }, _callee9, this, [[6, 13]]);
      }));
      function handleUserDirectorySearch(_x8) {
        return _handleUserDirectorySearch.apply(this, arguments);
      }
      return handleUserDirectorySearch;
    }()
  }, {
    key: "handleGetMediaConfig",
    value: function () {
      var _handleGetMediaConfig = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee10(request) {
        var result;
        return _regeneratorRuntime().wrap(function _callee10$(_context10) {
          while (1) switch (_context10.prev = _context10.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039UploadFile)) {
                _context10.next = 2;
                break;
              }
              return _context10.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              }));
            case 2:
              _context10.prev = 2;
              _context10.next = 5;
              return this.driver.getMediaConfig();
            case 5:
              result = _context10.sent;
              return _context10.abrupt("return", this.transport.reply(request, result));
            case 9:
              _context10.prev = 9;
              _context10.t0 = _context10["catch"](2);
              console.error("error while getting the media configuration", _context10.t0);
              this.handleDriverError(_context10.t0, request, "Unexpected error while getting the media configuration");
            case 13:
            case "end":
              return _context10.stop();
          }
        }, _callee10, this, [[2, 9]]);
      }));
      function handleGetMediaConfig(_x9) {
        return _handleGetMediaConfig.apply(this, arguments);
      }
      return handleGetMediaConfig;
    }()
  }, {
    key: "handleUploadFile",
    value: function () {
      var _handleUploadFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee11(request) {
        var result;
        return _regeneratorRuntime().wrap(function _callee11$(_context11) {
          while (1) switch (_context11.prev = _context11.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039UploadFile)) {
                _context11.next = 2;
                break;
              }
              return _context11.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              }));
            case 2:
              _context11.prev = 2;
              _context11.next = 5;
              return this.driver.uploadFile(request.data.file);
            case 5:
              result = _context11.sent;
              return _context11.abrupt("return", this.transport.reply(request, {
                content_uri: result.contentUri
              }));
            case 9:
              _context11.prev = 9;
              _context11.t0 = _context11["catch"](2);
              console.error("error while uploading a file", _context11.t0);
              this.handleDriverError(_context11.t0, request, "Unexpected error while uploading a file");
            case 13:
            case "end":
              return _context11.stop();
          }
        }, _callee11, this, [[2, 9]]);
      }));
      function handleUploadFile(_x10) {
        return _handleUploadFile.apply(this, arguments);
      }
      return handleUploadFile;
    }()
  }, {
    key: "handleDownloadFile",
    value: function () {
      var _handleDownloadFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee12(request) {
        var result;
        return _regeneratorRuntime().wrap(function _callee12$(_context12) {
          while (1) switch (_context12.prev = _context12.next) {
            case 0:
              if (this.hasCapability(_Capabilities.MatrixCapabilities.MSC4039DownloadFile)) {
                _context12.next = 2;
                break;
              }
              return _context12.abrupt("return", this.transport.reply(request, {
                error: {
                  message: "Missing capability"
                }
              }));
            case 2:
              _context12.prev = 2;
              _context12.next = 5;
              return this.driver.downloadFile(request.data.content_uri);
            case 5:
              result = _context12.sent;
              return _context12.abrupt("return", this.transport.reply(request, {
                file: result.file
              }));
            case 9:
              _context12.prev = 9;
              _context12.t0 = _context12["catch"](2);
              console.error("error while downloading a file", _context12.t0);
              this.handleDriverError(_context12.t0, request, "Unexpected error while downloading a file");
            case 13:
            case "end":
              return _context12.stop();
          }
        }, _callee12, this, [[2, 9]]);
      }));
      function handleDownloadFile(_x11) {
        return _handleDownloadFile.apply(this, arguments);
      }
      return handleDownloadFile;
    }()
  }, {
    key: "handleDriverError",
    value: function handleDriverError(e, request, message) {
      var data = this.driver.processError(e);
      this.transport.reply(request, {
        error: _objectSpread({
          message: message
        }, data)
      });
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(ev) {
      if (this.isStopped) return;
      var actionEv = new CustomEvent("action:".concat(ev.detail.action), {
        detail: ev.detail,
        cancelable: true
      });
      this.emit("action:".concat(ev.detail.action), actionEv);
      if (!actionEv.defaultPrevented) {
        switch (ev.detail.action) {
          case _WidgetApiAction.WidgetApiFromWidgetAction.ContentLoaded:
            return this.handleContentLoadedAction(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.SupportedApiVersions:
            return this.replyVersions(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.SendEvent:
            return this.handleSendEvent(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.SendToDevice:
            return this.handleSendToDevice(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.GetOpenIDCredentials:
            return this.handleOIDC(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2931Navigate:
            return this.handleNavigate(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2974RenegotiateCapabilities:
            return this.handleCapabilitiesRenegotiate(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents:
            return this.handleReadEvents(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.WatchTurnServers:
            return this.handleWatchTurnServers(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.UnwatchTurnServers:
            return this.handleUnwatchTurnServers(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC3869ReadRelations:
            return this.handleReadRelations(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC3973UserDirectorySearch:
            return this.handleUserDirectorySearch(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.BeeperReadRoomAccountData:
            return this.handleReadRoomAccountData(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction:
            return this.handleGetMediaConfig(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039UploadFileAction:
            return this.handleUploadFile(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4039DownloadFileAction:
            return this.handleDownloadFile(ev.detail);
          case _WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent:
            return this.handleUpdateDelayedEvent(ev.detail);
          default:
            return this.transport.reply(ev.detail, {
              error: {
                message: "Unknown or unsupported action: " + ev.detail.action
              }
            });
        }
      }
    }

    /**
     * Informs the widget that the client's theme has changed.
     * @param theme The theme data, as an object with arbitrary contents.
     */
  }, {
    key: "updateTheme",
    value: function updateTheme(theme) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.ThemeChange, theme);
    }

    /**
     * Informs the widget that the client's language has changed.
     * @param lang The BCP 47 identifier representing the client's current language.
     */
  }, {
    key: "updateLanguage",
    value: function updateLanguage(lang) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.LanguageChange, {
        lang: lang
      });
    }

    /**
     * Takes a screenshot of the widget.
     * @returns Resolves to the widget's screenshot.
     * @throws Throws if there is a problem.
     */
  }, {
    key: "takeScreenshot",
    value: function takeScreenshot() {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.TakeScreenshot, {});
    }

    /**
     * Alerts the widget to whether or not it is currently visible.
     * @param {boolean} isVisible Whether the widget is visible or not.
     * @returns {Promise<IWidgetApiResponseData>} Resolves when the widget acknowledges the update.
     */
  }, {
    key: "updateVisibility",
    value: function updateVisibility(isVisible) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateVisibility, {
        visible: isVisible
      });
    }
  }, {
    key: "sendWidgetConfig",
    value: function sendWidgetConfig(data) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.WidgetConfig, data).then();
    }
  }, {
    key: "notifyModalWidgetButtonClicked",
    value: function notifyModalWidgetButtonClicked(id) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.ButtonClicked, {
        id: id
      }).then();
    }
  }, {
    key: "notifyModalWidgetClose",
    value: function notifyModalWidgetClose(data) {
      return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.CloseModalWidget, data).then();
    }

    /**
     * Feeds an event to the widget. As a client you are expected to call this
     * for every new event in every room to which you are joined or invited.
     * @param {IRoomEvent} rawEvent The event to (try to) send to the widget.
     * @param {string} currentViewedRoomId The room ID the user is currently
     *   interacting with. Not the room ID of the event.
     * @returns {Promise<void>} Resolves when delivered or if the widget is not
     *   able to read the event due to permissions, rejects if the widget failed
     *   to handle the event.
     * @deprecated It is recommended to communicate the viewed room ID by calling
     *   {@link ClientWidgetApi.setViewedRoomId} rather than passing it to this
     *   method.
     */
  }, {
    key: "feedEvent",
    value: function () {
      var _feedEvent = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee13(rawEvent, currentViewedRoomId) {
        var _rawEvent$content;
        return _regeneratorRuntime().wrap(function _callee13$(_context13) {
          while (1) switch (_context13.prev = _context13.next) {
            case 0:
              if (currentViewedRoomId !== undefined) this.setViewedRoomId(currentViewedRoomId);
              if (!(rawEvent.room_id !== this.viewedRoomId && !this.canUseRoomTimeline(rawEvent.room_id))) {
                _context13.next = 3;
                break;
              }
              return _context13.abrupt("return");
            case 3:
              if (!(rawEvent.state_key !== undefined && rawEvent.state_key !== null)) {
                _context13.next = 8;
                break;
              }
              if (this.canReceiveStateEvent(rawEvent.type, rawEvent.state_key)) {
                _context13.next = 6;
                break;
              }
              return _context13.abrupt("return");
            case 6:
              _context13.next = 10;
              break;
            case 8:
              if (this.canReceiveRoomEvent(rawEvent.type, (_rawEvent$content = rawEvent.content) === null || _rawEvent$content === void 0 ? void 0 : _rawEvent$content["msgtype"])) {
                _context13.next = 10;
                break;
              }
              return _context13.abrupt("return");
            case 10:
              _context13.next = 12;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SendEvent,
              // it's compatible, but missing the index signature
              rawEvent);
            case 12:
            case "end":
              return _context13.stop();
          }
        }, _callee13, this);
      }));
      function feedEvent(_x12, _x13) {
        return _feedEvent.apply(this, arguments);
      }
      return feedEvent;
    }()
    /**
     * Feeds a to-device event to the widget. As a client you are expected to
     * call this for every to-device event you receive.
     * @param {IRoomEvent} rawEvent The event to (try to) send to the widget.
     * @param {boolean} encrypted Whether the event contents were encrypted.
     * @returns {Promise<void>} Resolves when delivered or if the widget is not
     *   able to receive the event due to permissions, rejects if the widget
     *   failed to handle the event.
     */
  }, {
    key: "feedToDevice",
    value: function () {
      var _feedToDevice = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee14(rawEvent, encrypted) {
        return _regeneratorRuntime().wrap(function _callee14$(_context14) {
          while (1) switch (_context14.prev = _context14.next) {
            case 0:
              if (!this.canReceiveToDeviceEvent(rawEvent.type)) {
                _context14.next = 3;
                break;
              }
              _context14.next = 3;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.SendToDevice, // it's compatible, but missing the index signature
              _objectSpread(_objectSpread({}, rawEvent), {}, {
                encrypted: encrypted
              }));
            case 3:
            case "end":
              return _context14.stop();
          }
        }, _callee14, this);
      }));
      function feedToDevice(_x14, _x15) {
        return _feedToDevice.apply(this, arguments);
      }
      return feedToDevice;
    }()
  }, {
    key: "setViewedRoomId",
    value:
    /**
     * Indicate that a room is being viewed (making it possible for the widget
     * to interact with it).
     */
    function setViewedRoomId(roomId) {
      this.viewedRoomId = roomId;
      // If the widget doesn't have timeline permissions for the room then
      // this is its opportunity to learn the room state. We push the entire
      // room state, which could be redundant if this room had been viewed
      // once before, but it's easier than selectively pushing just the bits
      // of state that changed while the room was in the background.
      if (roomId !== null && !this.canUseRoomTimeline(roomId)) this.pushRoomState(roomId);
    }
  }, {
    key: "flushRoomState",
    value: function () {
      var _flushRoomState = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee15() {
        var events, _iterator6, _step6, eventTypeMap, _iterator7, _step7, stateKeyMap;
        return _regeneratorRuntime().wrap(function _callee15$(_context15) {
          while (1) switch (_context15.prev = _context15.next) {
            case 0:
              _context15.prev = 0;
            case 1:
              _context15.next = 3;
              return Promise.all(_toConsumableArray(this.pushRoomStateTasks));
            case 3:
              if (this.pushRoomStateTasks.size > 0) {
                _context15.next = 1;
                break;
              }
            case 4:
              events = [];
              _iterator6 = _createForOfIteratorHelper(this.pushRoomStateResult.values());
              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  eventTypeMap = _step6.value;
                  _iterator7 = _createForOfIteratorHelper(eventTypeMap.values());
                  try {
                    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
                      stateKeyMap = _step7.value;
                      events.push.apply(events, _toConsumableArray(stateKeyMap.values()));
                    }
                  } catch (err) {
                    _iterator7.e(err);
                  } finally {
                    _iterator7.f();
                  }
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
              _context15.next = 9;
              return this.getWidgetVersions();
            case 9:
              if (!_context15.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE)) {
                _context15.next = 12;
                break;
              }
              _context15.next = 12;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateState, {
                state: events
              });
            case 12:
              _context15.prev = 12;
              this.flushRoomStateTask = null;
              return _context15.finish(12);
            case 15:
            case "end":
              return _context15.stop();
          }
        }, _callee15, this, [[0,, 12, 15]]);
      }));
      function flushRoomState() {
        return _flushRoomState.apply(this, arguments);
      }
      return flushRoomState;
    }()
    /**
     * Read the room's state and push all entries that the widget is allowed to
     * read through to the widget.
     */
  }, {
    key: "pushRoomState",
    value: function pushRoomState(roomId) {
      var _this12 = this;
      var _iterator8 = _createForOfIteratorHelper(this.allowedEvents),
        _step8;
      try {
        var _loop = function _loop() {
          var cap = _step8.value;
          if (cap.kind === _WidgetEventCapability.EventKind.State && cap.direction === _WidgetEventCapability.EventDirection.Receive) {
            var _cap$keyStr, _this12$flushRoomStat;
            // Initiate the task
            var events = _this12.driver.readRoomState(roomId, cap.eventType, (_cap$keyStr = cap.keyStr) !== null && _cap$keyStr !== void 0 ? _cap$keyStr : undefined);
            var task = events.then(function (events) {
              // When complete, queue the resulting events to be
              // pushed to the widget
              var _iterator9 = _createForOfIteratorHelper(events),
                _step9;
              try {
                for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
                  var event = _step9.value;
                  var eventTypeMap = _this12.pushRoomStateResult.get(roomId);
                  if (eventTypeMap === undefined) {
                    eventTypeMap = new Map();
                    _this12.pushRoomStateResult.set(roomId, eventTypeMap);
                  }
                  var stateKeyMap = eventTypeMap.get(cap.eventType);
                  if (stateKeyMap === undefined) {
                    stateKeyMap = new Map();
                    eventTypeMap.set(cap.eventType, stateKeyMap);
                  }
                  if (!stateKeyMap.has(event.state_key)) stateKeyMap.set(event.state_key, event);
                }
              } catch (err) {
                _iterator9.e(err);
              } finally {
                _iterator9.f();
              }
            }, function (e) {
              return console.error("Failed to read room state for ".concat(roomId, " (").concat(cap.eventType, ", ").concat(cap.keyStr, ")"), e);
            }).then(function () {
              // Mark request as no longer pending
              _this12.pushRoomStateTasks["delete"](task);
            });

            // Mark task as pending
            _this12.pushRoomStateTasks.add(task);
            // Assuming no other tasks are already happening concurrently,
            // schedule the widget action that actually pushes the events
            (_this12$flushRoomStat = _this12.flushRoomStateTask) !== null && _this12$flushRoomStat !== void 0 ? _this12$flushRoomStat : _this12.flushRoomStateTask = _this12.flushRoomState();
            _this12.flushRoomStateTask["catch"](function (e) {
              return console.error("Failed to push room state", e);
            });
          }
        };
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
    }

    /**
     * Feeds a room state update to the widget. As a client you are expected to
     * call this for every state update in every room to which you are joined or
     * invited.
     * @param {IRoomEvent} rawEvent The state event corresponding to the updated
     *   room state entry.
     * @returns {Promise<void>} Resolves when delivered or if the widget is not
     *   able to receive the room state due to permissions, rejects if the
     *   widget failed to handle the update.
     */
  }, {
    key: "feedStateUpdate",
    value: function () {
      var _feedStateUpdate = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee16(rawEvent) {
        var eventTypeMap, stateKeyMap;
        return _regeneratorRuntime().wrap(function _callee16$(_context16) {
          while (1) switch (_context16.prev = _context16.next) {
            case 0:
              if (!(rawEvent.state_key === undefined)) {
                _context16.next = 2;
                break;
              }
              throw new Error("Not a state event");
            case 2:
              if (!((rawEvent.room_id === this.viewedRoomId || this.canUseRoomTimeline(rawEvent.room_id)) && this.canReceiveStateEvent(rawEvent.type, rawEvent.state_key))) {
                _context16.next = 21;
                break;
              }
              if (!(this.pushRoomStateTasks.size === 0)) {
                _context16.next = 11;
                break;
              }
              _context16.next = 6;
              return this.getWidgetVersions();
            case 6:
              if (!_context16.sent.includes(_ApiVersion.UnstableApiVersion.MSC2762_UPDATE_STATE)) {
                _context16.next = 9;
                break;
              }
              _context16.next = 9;
              return this.transport.send(_WidgetApiAction.WidgetApiToWidgetAction.UpdateState, {
                state: [rawEvent]
              });
            case 9:
              _context16.next = 21;
              break;
            case 11:
              // Lump the update in with whatever data will be sent in the
              // initial push later. Even if we set it to an "outdated" entry
              // here, we can count on any newer entries being passed to this
              // same method eventually; this won't cause stuck state.
              eventTypeMap = this.pushRoomStateResult.get(rawEvent.room_id);
              if (eventTypeMap === undefined) {
                eventTypeMap = new Map();
                this.pushRoomStateResult.set(rawEvent.room_id, eventTypeMap);
              }
              stateKeyMap = eventTypeMap.get(rawEvent.type);
              if (stateKeyMap === undefined) {
                stateKeyMap = new Map();
                eventTypeMap.set(rawEvent.type, stateKeyMap);
              }
              if (!stateKeyMap.has(rawEvent.type)) stateKeyMap.set(rawEvent.state_key, rawEvent);
            case 16:
              _context16.next = 18;
              return Promise.all(_toConsumableArray(this.pushRoomStateTasks));
            case 18:
              if (this.pushRoomStateTasks.size > 0) {
                _context16.next = 16;
                break;
              }
            case 19:
              _context16.next = 21;
              return this.flushRoomStateTask;
            case 21:
            case "end":
              return _context16.stop();
          }
        }, _callee16, this);
      }));
      function feedStateUpdate(_x16) {
        return _feedStateUpdate.apply(this, arguments);
      }
      return feedStateUpdate;
    }()
  }]);
  return ClientWidgetApi;
}(_events.EventEmitter);
exports.ClientWidgetApi = ClientWidgetApi;

},{"./Symbols":2,"./interfaces/ApiVersion":6,"./interfaces/Capabilities":7,"./interfaces/GetOpenIDAction":8,"./interfaces/UpdateDelayedEventAction":12,"./interfaces/WidgetApiAction":13,"./interfaces/WidgetApiDirection":14,"./models/WidgetEventCapability":18,"./transport/PostmessageTransport":23,"./util/SimpleObservable":24,"events":25}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Symbols = void 0;
/*
 * Copyright 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Symbols = /*#__PURE__*/function (Symbols) {
  Symbols["AnyRoom"] = "*";
  return Symbols;
}({});
exports.Symbols = Symbols;

},{}],3:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetApiResponseError = exports.WidgetApi = void 0;
var _events = require("events");
var _WidgetApiDirection = require("./interfaces/WidgetApiDirection");
var _ApiVersion = require("./interfaces/ApiVersion");
var _PostmessageTransport = require("./transport/PostmessageTransport");
var _WidgetApiAction = require("./interfaces/WidgetApiAction");
var _GetOpenIDAction = require("./interfaces/GetOpenIDAction");
var _WidgetType = require("./interfaces/WidgetType");
var _ModalWidgetActions = require("./interfaces/ModalWidgetActions");
var _WidgetEventCapability = require("./models/WidgetEventCapability");
var _Symbols = require("./Symbols");
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }
function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct.bind(); } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _awaitAsyncGenerator(value) { return new _OverloadYield(value, 0); }
function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }
function _AsyncGenerator(gen) { var front, back; function resume(key, arg) { try { var result = gen[key](arg), value = result.value, overloaded = value instanceof _OverloadYield; Promise.resolve(overloaded ? value.v : value).then(function (arg) { if (overloaded) { var nextKey = "return" === key ? "return" : "next"; if (!value.k || arg.done) return resume(nextKey, arg); arg = gen[nextKey](arg).value; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: !0 }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: !1 }); } (front = front.next) ? resume(front.key, front.arg) : back = null; } this._invoke = function (key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; back ? back = back.next = request : (front = back = request, resume(key, arg)); }); }, "function" != typeof gen["return"] && (this["return"] = void 0); }
_AsyncGenerator.prototype["function" == typeof Symbol && Symbol.asyncIterator || "@@asyncIterator"] = function () { return this; }, _AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); }, _AsyncGenerator.prototype["throw"] = function (arg) { return this._invoke("throw", arg); }, _AsyncGenerator.prototype["return"] = function (arg) { return this._invoke("return", arg); };
function _OverloadYield(value, kind) { this.v = value, this.k = kind; } /*
                                                                         * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
                                                                         *
                                                                         * Licensed under the Apache License, Version 2.0 (the "License");
                                                                         * you may not use this file except in compliance with the License.
                                                                         * You may obtain a copy of the License at
                                                                         *
                                                                         *         http://www.apache.org/licenses/LICENSE-2.0
                                                                         *
                                                                         * Unless required by applicable law or agreed to in writing, software
                                                                         * distributed under the License is distributed on an "AS IS" BASIS,
                                                                         * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                         * See the License for the specific language governing permissions and
                                                                         * limitations under the License.
                                                                         */
var WidgetApiResponseError = /*#__PURE__*/function (_Error) {
  _inherits(WidgetApiResponseError, _Error);
  var _super = _createSuper(WidgetApiResponseError);
  function WidgetApiResponseError(message, data) {
    var _this2;
    _classCallCheck(this, WidgetApiResponseError);
    _this2 = _super.call(this, message);
    _this2.data = data;
    return _this2;
  }
  return _createClass(WidgetApiResponseError);
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * API handler for widgets. This raises events for each action
 * received as `action:${action}` (eg: "action:screenshot").
 * Default handling can be prevented by using preventDefault()
 * on the raised event. The default handling varies for each
 * action: ones which the SDK can handle safely are acknowledged
 * appropriately and ones which are unhandled (custom or require
 * the widget to do something) are rejected with an error.
 *
 * Events which are preventDefault()ed must reply using the
 * transport. The events raised will have a detail of an
 * IWidgetApiRequest interface.
 *
 * When the WidgetApi is ready to start sending requests, it will
 * raise a "ready" CustomEvent. After the ready event fires, actions
 * can be sent and the transport will be ready.
 */
exports.WidgetApiResponseError = WidgetApiResponseError;
WidgetApiResponseError.prototype.name = WidgetApiResponseError.name;
var WidgetApi = /*#__PURE__*/function (_EventEmitter) {
  _inherits(WidgetApi, _EventEmitter);
  var _super2 = _createSuper(WidgetApi);
  /**
   * Creates a new API handler for the given widget.
   * @param {string} widgetId The widget ID to listen for. If not supplied then
   * the API will use the widget ID from the first valid request it receives.
   * @param {string} clientOrigin The origin of the client, or null if not known.
   */
  function WidgetApi() {
    var _this3;
    var widgetId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var clientOrigin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    _classCallCheck(this, WidgetApi);
    _this3 = _super2.call(this);
    _this3.clientOrigin = clientOrigin;
    _defineProperty(_assertThisInitialized(_this3), "transport", void 0);
    _defineProperty(_assertThisInitialized(_this3), "capabilitiesFinished", false);
    _defineProperty(_assertThisInitialized(_this3), "supportsMSC2974Renegotiate", false);
    _defineProperty(_assertThisInitialized(_this3), "requestedCapabilities", []);
    _defineProperty(_assertThisInitialized(_this3), "approvedCapabilities", void 0);
    _defineProperty(_assertThisInitialized(_this3), "cachedClientVersions", void 0);
    _defineProperty(_assertThisInitialized(_this3), "turnServerWatchers", 0);
    if (!window.parent) {
      throw new Error("No parent window. This widget doesn't appear to be embedded properly.");
    }
    _this3.transport = new _PostmessageTransport.PostmessageTransport(_WidgetApiDirection.WidgetApiDirection.FromWidget, widgetId, window.parent, window);
    _this3.transport.targetOrigin = clientOrigin;
    _this3.transport.on("message", _this3.handleMessage.bind(_assertThisInitialized(_this3)));
    return _this3;
  }

  /**
   * Determines if the widget was granted a particular capability. Note that on
   * clients where the capabilities are not fed back to the widget this function
   * will rely on requested capabilities instead.
   * @param {Capability} capability The capability to check for approval of.
   * @returns {boolean} True if the widget has approval for the given capability.
   */
  _createClass(WidgetApi, [{
    key: "hasCapability",
    value: function hasCapability(capability) {
      if (Array.isArray(this.approvedCapabilities)) {
        return this.approvedCapabilities.includes(capability);
      }
      return this.requestedCapabilities.includes(capability);
    }

    /**
     * Request a capability from the client. It is not guaranteed to be allowed,
     * but will be asked for.
     * @param {Capability} capability The capability to request.
     * @throws Throws if the capabilities negotiation has already started and the
     * widget is unable to request additional capabilities.
     */
  }, {
    key: "requestCapability",
    value: function requestCapability(capability) {
      if (this.capabilitiesFinished && !this.supportsMSC2974Renegotiate) {
        throw new Error("Capabilities have already been negotiated");
      }
      this.requestedCapabilities.push(capability);
    }

    /**
     * Request capabilities from the client. They are not guaranteed to be allowed,
     * but will be asked for if the negotiation has not already happened.
     * @param {Capability[]} capabilities The capabilities to request.
     * @throws Throws if the capabilities negotiation has already started.
     */
  }, {
    key: "requestCapabilities",
    value: function requestCapabilities(capabilities) {
      var _this4 = this;
      capabilities.forEach(function (cap) {
        return _this4.requestCapability(cap);
      });
    }

    /**
     * Requests the capability to interact with rooms other than the user's currently
     * viewed room. Applies to event receiving and sending.
     * @param {string | Symbols.AnyRoom} roomId The room ID, or `Symbols.AnyRoom` to
     * denote all known rooms.
     */
  }, {
    key: "requestCapabilityForRoomTimeline",
    value: function requestCapabilityForRoomTimeline(roomId) {
      this.requestCapability("org.matrix.msc2762.timeline:".concat(roomId));
    }

    /**
     * Requests the capability to send a given state event with optional explicit
     * state key. It is not guaranteed to be allowed, but will be asked for if the
     * negotiation has not already happened.
     * @param {string} eventType The state event type to ask for.
     * @param {string} stateKey If specified, the specific state key to request.
     * Otherwise all state keys will be requested.
     */
  }, {
    key: "requestCapabilityToSendState",
    value: function requestCapabilityToSendState(eventType, stateKey) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forStateEvent(_WidgetEventCapability.EventDirection.Send, eventType, stateKey).raw);
    }

    /**
     * Requests the capability to receive a given state event with optional explicit
     * state key. It is not guaranteed to be allowed, but will be asked for if the
     * negotiation has not already happened.
     * @param {string} eventType The state event type to ask for.
     * @param {string} stateKey If specified, the specific state key to request.
     * Otherwise all state keys will be requested.
     */
  }, {
    key: "requestCapabilityToReceiveState",
    value: function requestCapabilityToReceiveState(eventType, stateKey) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forStateEvent(_WidgetEventCapability.EventDirection.Receive, eventType, stateKey).raw);
    }

    /**
     * Requests the capability to send a given to-device event. It is not
     * guaranteed to be allowed, but will be asked for if the negotiation has
     * not already happened.
     * @param {string} eventType The room event type to ask for.
     */
  }, {
    key: "requestCapabilityToSendToDevice",
    value: function requestCapabilityToSendToDevice(eventType) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forToDeviceEvent(_WidgetEventCapability.EventDirection.Send, eventType).raw);
    }

    /**
     * Requests the capability to receive a given to-device event. It is not
     * guaranteed to be allowed, but will be asked for if the negotiation has
     * not already happened.
     * @param {string} eventType The room event type to ask for.
     */
  }, {
    key: "requestCapabilityToReceiveToDevice",
    value: function requestCapabilityToReceiveToDevice(eventType) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forToDeviceEvent(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
    }

    /**
     * Requests the capability to send a given room event. It is not guaranteed to be
     * allowed, but will be asked for if the negotiation has not already happened.
     * @param {string} eventType The room event type to ask for.
     */
  }, {
    key: "requestCapabilityToSendEvent",
    value: function requestCapabilityToSendEvent(eventType) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomEvent(_WidgetEventCapability.EventDirection.Send, eventType).raw);
    }

    /**
     * Requests the capability to receive a given room event. It is not guaranteed to be
     * allowed, but will be asked for if the negotiation has not already happened.
     * @param {string} eventType The room event type to ask for.
     */
  }, {
    key: "requestCapabilityToReceiveEvent",
    value: function requestCapabilityToReceiveEvent(eventType) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomEvent(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
    }

    /**
     * Requests the capability to send a given message event with optional explicit
     * `msgtype`. It is not guaranteed to be allowed, but will be asked for if the
     * negotiation has not already happened.
     * @param {string} msgtype If specified, the specific msgtype to request.
     * Otherwise all message types will be requested.
     */
  }, {
    key: "requestCapabilityToSendMessage",
    value: function requestCapabilityToSendMessage(msgtype) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomMessageEvent(_WidgetEventCapability.EventDirection.Send, msgtype).raw);
    }

    /**
     * Requests the capability to receive a given message event with optional explicit
     * `msgtype`. It is not guaranteed to be allowed, but will be asked for if the
     * negotiation has not already happened.
     * @param {string} msgtype If specified, the specific msgtype to request.
     * Otherwise all message types will be requested.
     */
  }, {
    key: "requestCapabilityToReceiveMessage",
    value: function requestCapabilityToReceiveMessage(msgtype) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomMessageEvent(_WidgetEventCapability.EventDirection.Receive, msgtype).raw);
    }

    /**
     * Requests the capability to receive a given item in room account data. It is not guaranteed to be
     * allowed, but will be asked for if the negotiation has not already happened.
     * @param {string} eventType The state event type to ask for.
     */
  }, {
    key: "requestCapabilityToReceiveRoomAccountData",
    value: function requestCapabilityToReceiveRoomAccountData(eventType) {
      this.requestCapability(_WidgetEventCapability.WidgetEventCapability.forRoomAccountData(_WidgetEventCapability.EventDirection.Receive, eventType).raw);
    }

    /**
     * Requests an OpenID Connect token from the client for the currently logged in
     * user. This token can be validated server-side with the federation API. Note
     * that the widget is responsible for validating the token and caching any results
     * it needs.
     * @returns {Promise<IOpenIDCredentials>} Resolves to a token for verification.
     * @throws Throws if the user rejected the request or the request failed.
     */
  }, {
    key: "requestOpenIDConnectToken",
    value: function requestOpenIDConnectToken() {
      var _this5 = this;
      return new Promise(function (resolve, reject) {
        _this5.transport.sendComplete(_WidgetApiAction.WidgetApiFromWidgetAction.GetOpenIDCredentials, {}).then(function (response) {
          var rdata = response.response;
          if (rdata.state === _GetOpenIDAction.OpenIDRequestState.Allowed) {
            resolve(rdata);
          } else if (rdata.state === _GetOpenIDAction.OpenIDRequestState.Blocked) {
            reject(new Error("User declined to verify their identity"));
          } else if (rdata.state === _GetOpenIDAction.OpenIDRequestState.PendingUserConfirmation) {
            var handlerFn = function handlerFn(ev) {
              ev.preventDefault();
              var request = ev.detail;
              if (request.data.original_request_id !== response.requestId) return;
              if (request.data.state === _GetOpenIDAction.OpenIDRequestState.Allowed) {
                resolve(request.data);
                _this5.transport.reply(request, {}); // ack
              } else if (request.data.state === _GetOpenIDAction.OpenIDRequestState.Blocked) {
                reject(new Error("User declined to verify their identity"));
                _this5.transport.reply(request, {}); // ack
              } else {
                reject(new Error("Invalid state on reply: " + rdata.state));
                _this5.transport.reply(request, {
                  error: {
                    message: "Invalid state"
                  }
                });
              }
              _this5.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials), handlerFn);
            };
            _this5.on("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.OpenIDCredentials), handlerFn);
          } else {
            reject(new Error("Invalid state: " + rdata.state));
          }
        })["catch"](reject);
      });
    }

    /**
     * Asks the client for additional capabilities. Capabilities can be queued for this
     * request with the requestCapability() functions.
     * @returns {Promise<void>} Resolves when complete. Note that the promise resolves when
     * the capabilities request has gone through, not when the capabilities are approved/denied.
     * Use the WidgetApiToWidgetAction.NotifyCapabilities action to detect changes.
     */
  }, {
    key: "updateRequestedCapabilities",
    value: function updateRequestedCapabilities() {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2974RenegotiateCapabilities, {
        capabilities: this.requestedCapabilities
      }).then();
    }

    /**
     * Tell the client that the content has been loaded.
     * @returns {Promise} Resolves when the client acknowledges the request.
     */
  }, {
    key: "sendContentLoaded",
    value: function sendContentLoaded() {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.ContentLoaded, {}).then();
    }

    /**
     * Sends a sticker to the client.
     * @param {IStickerActionRequestData} sticker The sticker to send.
     * @returns {Promise} Resolves when the client acknowledges the request.
     */
  }, {
    key: "sendSticker",
    value: function sendSticker(sticker) {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendSticker, sticker).then();
    }

    /**
     * Asks the client to set the always-on-screen status for this widget.
     * @param {boolean} value The new state to request.
     * @returns {Promise<boolean>} Resolve with true if the client was able to fulfill
     * the request, resolves to false otherwise. Rejects if an error occurred.
     */
  }, {
    key: "setAlwaysOnScreen",
    value: function setAlwaysOnScreen(value) {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.UpdateAlwaysOnScreen, {
        value: value
      }).then(function (res) {
        return res.success;
      });
    }

    /**
     * Opens a modal widget.
     * @param {string} url The URL to the modal widget.
     * @param {string} name The name of the widget.
     * @param {IModalWidgetOpenRequestDataButton[]} buttons The buttons to have on the widget.
     * @param {IModalWidgetCreateData} data Data to supply to the modal widget.
     * @param {WidgetType} type The type of modal widget.
     * @returns {Promise<void>} Resolves when the modal widget has been opened.
     */
  }, {
    key: "openModalWidget",
    value: function openModalWidget(url, name) {
      var buttons = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
      var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : _WidgetType.MatrixWidgetType.Custom;
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.OpenModalWidget, {
        type: type,
        url: url,
        name: name,
        buttons: buttons,
        data: data
      }).then();
    }

    /**
     * Closes the modal widget. The widget's session will be terminated shortly after.
     * @param {IModalWidgetReturnData} data Optional data to close the modal widget with.
     * @returns {Promise<void>} Resolves when complete.
     */
  }, {
    key: "closeModalWidget",
    value: function closeModalWidget() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.CloseModalWidget, data).then();
    }
  }, {
    key: "sendRoomEvent",
    value: function sendRoomEvent(eventType, content, roomId, delay, parentDelayId) {
      return this.sendEvent(eventType, undefined, content, roomId, delay, parentDelayId);
    }
  }, {
    key: "sendStateEvent",
    value: function sendStateEvent(eventType, stateKey, content, roomId, delay, parentDelayId) {
      return this.sendEvent(eventType, stateKey, content, roomId, delay, parentDelayId);
    }
  }, {
    key: "sendEvent",
    value: function sendEvent(eventType, stateKey, content, roomId, delay, parentDelayId) {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendEvent, _objectSpread(_objectSpread(_objectSpread(_objectSpread({
        type: eventType,
        content: content
      }, stateKey !== undefined && {
        state_key: stateKey
      }), roomId !== undefined && {
        room_id: roomId
      }), delay !== undefined && {
        delay: delay
      }), parentDelayId !== undefined && {
        parent_delay_id: parentDelayId
      }));
    }

    /**
     * @deprecated This currently relies on an unstable MSC (MSC4157).
     */
  }, {
    key: "updateDelayedEvent",
    value: function updateDelayedEvent(delayId, action) {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4157UpdateDelayedEvent, {
        delay_id: delayId,
        action: action
      });
    }

    /**
     * Sends a to-device event.
     * @param {string} eventType The type of events being sent.
     * @param {boolean} encrypted Whether to encrypt the message contents.
     * @param {Object} contentMap A map from user IDs to device IDs to message contents.
     * @returns {Promise<ISendToDeviceFromWidgetResponseData>} Resolves when complete.
     */
  }, {
    key: "sendToDevice",
    value: function sendToDevice(eventType, encrypted, contentMap) {
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SendToDevice, {
        type: eventType,
        encrypted: encrypted,
        messages: contentMap
      });
    }
  }, {
    key: "readRoomAccountData",
    value: function readRoomAccountData(eventType, roomIds) {
      var data = {
        type: eventType
      };
      if (roomIds) {
        if (roomIds.includes(_Symbols.Symbols.AnyRoom)) {
          data.room_ids = _Symbols.Symbols.AnyRoom;
        } else {
          data.room_ids = roomIds;
        }
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.BeeperReadRoomAccountData, data).then(function (r) {
        return r.events;
      });
    }
  }, {
    key: "readRoomEvents",
    value: function readRoomEvents(eventType, limit, msgtype, roomIds, since) {
      var data = {
        type: eventType,
        msgtype: msgtype
      };
      if (limit !== undefined) {
        data.limit = limit;
      }
      if (roomIds) {
        if (roomIds.includes(_Symbols.Symbols.AnyRoom)) {
          data.room_ids = _Symbols.Symbols.AnyRoom;
        } else {
          data.room_ids = roomIds;
        }
      }
      if (since) {
        data.since = since;
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents, data).then(function (r) {
        return r.events;
      });
    }

    /**
     * Reads all related events given a known eventId.
     * @param eventId The id of the parent event to be read.
     * @param roomId The room to look within. When undefined, the user's currently
     * viewed room.
     * @param relationType The relationship type of child events to search for.
     * When undefined, all relations are returned.
     * @param eventType The event type of child events to search for. When undefined,
     * all related events are returned.
     * @param limit The maximum number of events to retrieve per room. If not
     * supplied, the server will apply a default limit.
     * @param from The pagination token to start returning results from, as
     * received from a previous call. If not supplied, results start at the most
     * recent topological event known to the server.
     * @param to The pagination token to stop returning results at. If not
     * supplied, results continue up to limit or until there are no more events.
     * @param direction The direction to search for according to MSC3715.
     * @returns Resolves to the room relations.
     */
  }, {
    key: "readEventRelations",
    value: function () {
      var _readEventRelations = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(eventId, roomId, relationType, eventType, limit, from, to, direction) {
        var versions, data;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.getClientVersions();
            case 2:
              versions = _context.sent;
              if (versions.includes(_ApiVersion.UnstableApiVersion.MSC3869)) {
                _context.next = 5;
                break;
              }
              throw new Error("The read_relations action is not supported by the client.");
            case 5:
              data = {
                event_id: eventId,
                rel_type: relationType,
                event_type: eventType,
                room_id: roomId,
                to: to,
                from: from,
                limit: limit,
                direction: direction
              };
              return _context.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC3869ReadRelations, data));
            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function readEventRelations(_x, _x2, _x3, _x4, _x5, _x6, _x7, _x8) {
        return _readEventRelations.apply(this, arguments);
      }
      return readEventRelations;
    }()
  }, {
    key: "readStateEvents",
    value: function readStateEvents(eventType, limit, stateKey, roomIds) {
      var data = {
        type: eventType,
        state_key: stateKey === undefined ? true : stateKey
      };
      if (limit !== undefined) {
        data.limit = limit;
      }
      if (roomIds) {
        if (roomIds.includes(_Symbols.Symbols.AnyRoom)) {
          data.room_ids = _Symbols.Symbols.AnyRoom;
        } else {
          data.room_ids = roomIds;
        }
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2876ReadEvents, data).then(function (r) {
        return r.events;
      });
    }

    /**
     * Sets a button as disabled or enabled on the modal widget. Buttons are enabled by default.
     * @param {ModalButtonID} buttonId The button ID to enable/disable.
     * @param {boolean} isEnabled Whether or not the button is enabled.
     * @returns {Promise<void>} Resolves when complete.
     * @throws Throws if the button cannot be disabled, or the client refuses to disable the button.
     */
  }, {
    key: "setModalButtonEnabled",
    value: function setModalButtonEnabled(buttonId, isEnabled) {
      if (buttonId === _ModalWidgetActions.BuiltInModalButtonID.Close) {
        throw new Error("The close button cannot be disabled");
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SetModalButtonEnabled, {
        button: buttonId,
        enabled: isEnabled
      }).then();
    }

    /**
     * Attempts to navigate the client to the given URI. This can only be called with Matrix URIs
     * (currently only matrix.to, but in future a Matrix URI scheme will be defined).
     * @param {string} uri The URI to navigate to.
     * @returns {Promise<void>} Resolves when complete.
     * @throws Throws if the URI is invalid or cannot be processed.
     * @deprecated This currently relies on an unstable MSC (MSC2931).
     */
  }, {
    key: "navigateTo",
    value: function navigateTo(uri) {
      if (!uri || !uri.startsWith("https://matrix.to/#")) {
        throw new Error("Invalid matrix.to URI");
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC2931Navigate, {
        uri: uri
      }).then();
    }

    /**
     * Starts watching for TURN servers, yielding an initial set of credentials as soon as possible,
     * and thereafter yielding new credentials whenever the previous ones expire.
     * @yields {ITurnServer} The TURN server URIs and credentials currently available to the widget.
     */
  }, {
    key: "getTurnServers",
    value: function getTurnServers() {
      var _this = this;
      return _wrapAsyncGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee3() {
        var setTurnServer, onUpdateTurnServers;
        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              onUpdateTurnServers = /*#__PURE__*/function () {
                var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2(ev) {
                  return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                    while (1) switch (_context2.prev = _context2.next) {
                      case 0:
                        ev.preventDefault();
                        setTurnServer(ev.detail.data);
                        _context2.next = 4;
                        return _this.transport.reply(ev.detail, {});
                      case 4:
                      case "end":
                        return _context2.stop();
                    }
                  }, _callee2);
                }));
                return function onUpdateTurnServers(_x9) {
                  return _ref.apply(this, arguments);
                };
              }(); // Start listening for updates before we even start watching, to catch
              // TURN data that is sent immediately
              _this.on("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);

              // Only send the 'watch' action if we aren't already watching
              if (!(_this.turnServerWatchers === 0)) {
                _context3.next = 12;
                break;
              }
              _context3.prev = 3;
              _context3.next = 6;
              return _awaitAsyncGenerator(_this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.WatchTurnServers, {}));
            case 6:
              _context3.next = 12;
              break;
            case 8:
              _context3.prev = 8;
              _context3.t0 = _context3["catch"](3);
              _this.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);
              throw _context3.t0;
            case 12:
              _this.turnServerWatchers++;
              _context3.prev = 13;
            case 14:
              if (!true) {
                _context3.next = 21;
                break;
              }
              _context3.next = 17;
              return _awaitAsyncGenerator(new Promise(function (resolve) {
                return setTurnServer = resolve;
              }));
            case 17:
              _context3.next = 19;
              return _context3.sent;
            case 19:
              _context3.next = 14;
              break;
            case 21:
              _context3.prev = 21;
              // The loop was broken by the caller - clean up
              _this.off("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.UpdateTurnServers), onUpdateTurnServers);

              // Since sending the 'unwatch' action will end updates for all other
              // consumers, only send it if we're the only consumer remaining
              _this.turnServerWatchers--;
              if (!(_this.turnServerWatchers === 0)) {
                _context3.next = 27;
                break;
              }
              _context3.next = 27;
              return _awaitAsyncGenerator(_this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.UnwatchTurnServers, {}));
            case 27:
              return _context3.finish(21);
            case 28:
            case "end":
              return _context3.stop();
          }
        }, _callee3, null, [[3, 8], [13,, 21, 28]]);
      }))();
    }

    /**
     * Search for users in the user directory.
     * @param searchTerm The term to search for.
     * @param limit The maximum number of results to return. If not supplied, the
     * @returns Resolves to the search results.
     */
  }, {
    key: "searchUserDirectory",
    value: function () {
      var _searchUserDirectory = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee4(searchTerm, limit) {
        var versions, data;
        return _regeneratorRuntime().wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.getClientVersions();
            case 2:
              versions = _context4.sent;
              if (versions.includes(_ApiVersion.UnstableApiVersion.MSC3973)) {
                _context4.next = 5;
                break;
              }
              throw new Error("The user_directory_search action is not supported by the client.");
            case 5:
              data = {
                search_term: searchTerm,
                limit: limit
              };
              return _context4.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC3973UserDirectorySearch, data));
            case 7:
            case "end":
              return _context4.stop();
          }
        }, _callee4, this);
      }));
      function searchUserDirectory(_x10, _x11) {
        return _searchUserDirectory.apply(this, arguments);
      }
      return searchUserDirectory;
    }()
    /**
     * Get the config for the media repository.
     * @returns Promise which resolves with an object containing the config.
     */
  }, {
    key: "getMediaConfig",
    value: function () {
      var _getMediaConfig = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee5() {
        var versions, data;
        return _regeneratorRuntime().wrap(function _callee5$(_context5) {
          while (1) switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return this.getClientVersions();
            case 2:
              versions = _context5.sent;
              if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
                _context5.next = 5;
                break;
              }
              throw new Error("The get_media_config action is not supported by the client.");
            case 5:
              data = {};
              return _context5.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039GetMediaConfigAction, data));
            case 7:
            case "end":
              return _context5.stop();
          }
        }, _callee5, this);
      }));
      function getMediaConfig() {
        return _getMediaConfig.apply(this, arguments);
      }
      return getMediaConfig;
    }()
    /**
     * Upload a file to the media repository on the homeserver.
     * @param file - The object to upload. Something that can be sent to
     *               XMLHttpRequest.send (typically a File).
     * @returns Resolves to the location of the uploaded file.
     */
  }, {
    key: "uploadFile",
    value: function () {
      var _uploadFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee6(file) {
        var versions, data;
        return _regeneratorRuntime().wrap(function _callee6$(_context6) {
          while (1) switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return this.getClientVersions();
            case 2:
              versions = _context6.sent;
              if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
                _context6.next = 5;
                break;
              }
              throw new Error("The upload_file action is not supported by the client.");
            case 5:
              data = {
                file: file
              };
              return _context6.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039UploadFileAction, data));
            case 7:
            case "end":
              return _context6.stop();
          }
        }, _callee6, this);
      }));
      function uploadFile(_x12) {
        return _uploadFile.apply(this, arguments);
      }
      return uploadFile;
    }()
    /**
     * Download a file from the media repository on the homeserver.
     * @param contentUri - MXC URI of the file to download.
     * @returns Resolves to the contents of the file.
     */
  }, {
    key: "downloadFile",
    value: function () {
      var _downloadFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee7(contentUri) {
        var versions, data;
        return _regeneratorRuntime().wrap(function _callee7$(_context7) {
          while (1) switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return this.getClientVersions();
            case 2:
              versions = _context7.sent;
              if (versions.includes(_ApiVersion.UnstableApiVersion.MSC4039)) {
                _context7.next = 5;
                break;
              }
              throw new Error("The download_file action is not supported by the client.");
            case 5:
              data = {
                content_uri: contentUri
              };
              return _context7.abrupt("return", this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.MSC4039DownloadFileAction, data));
            case 7:
            case "end":
              return _context7.stop();
          }
        }, _callee7, this);
      }));
      function downloadFile(_x13) {
        return _downloadFile.apply(this, arguments);
      }
      return downloadFile;
    }()
    /**
     * Starts the communication channel. This should be done early to ensure
     * that messages are not missed. Communication can only be stopped by the client.
     */
  }, {
    key: "start",
    value: function start() {
      var _this6 = this;
      this.transport.start();
      this.getClientVersions().then(function (v) {
        if (v.includes(_ApiVersion.UnstableApiVersion.MSC2974)) {
          _this6.supportsMSC2974Renegotiate = true;
        }
      });
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(ev) {
      var actionEv = new CustomEvent("action:".concat(ev.detail.action), {
        detail: ev.detail,
        cancelable: true
      });
      this.emit("action:".concat(ev.detail.action), actionEv);
      if (!actionEv.defaultPrevented) {
        switch (ev.detail.action) {
          case _WidgetApiAction.WidgetApiToWidgetAction.SupportedApiVersions:
            return this.replyVersions(ev.detail);
          case _WidgetApiAction.WidgetApiToWidgetAction.Capabilities:
            return this.handleCapabilities(ev.detail);
          case _WidgetApiAction.WidgetApiToWidgetAction.UpdateVisibility:
            return this.transport.reply(ev.detail, {});
          // ack to avoid error spam
          case _WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities:
            return this.transport.reply(ev.detail, {});
          // ack to avoid error spam
          default:
            return this.transport.reply(ev.detail, {
              error: {
                message: "Unknown or unsupported action: " + ev.detail.action
              }
            });
        }
      }
    }
  }, {
    key: "replyVersions",
    value: function replyVersions(request) {
      this.transport.reply(request, {
        supported_versions: _ApiVersion.CurrentApiVersions
      });
    }
  }, {
    key: "getClientVersions",
    value: function getClientVersions() {
      var _this7 = this;
      if (Array.isArray(this.cachedClientVersions)) {
        return Promise.resolve(this.cachedClientVersions);
      }
      return this.transport.send(_WidgetApiAction.WidgetApiFromWidgetAction.SupportedApiVersions, {}).then(function (r) {
        _this7.cachedClientVersions = r.supported_versions;
        return r.supported_versions;
      })["catch"](function (e) {
        console.warn("non-fatal error getting supported client versions: ", e);
        return [];
      });
    }
  }, {
    key: "handleCapabilities",
    value: function handleCapabilities(request) {
      var _this8 = this;
      if (this.capabilitiesFinished) {
        return this.transport.reply(request, {
          error: {
            message: "Capability negotiation already completed"
          }
        });
      }

      // See if we can expect a capabilities notification or not
      return this.getClientVersions().then(function (v) {
        if (v.includes(_ApiVersion.UnstableApiVersion.MSC2871)) {
          _this8.once("action:".concat(_WidgetApiAction.WidgetApiToWidgetAction.NotifyCapabilities), function (ev) {
            _this8.approvedCapabilities = ev.detail.data.approved;
            _this8.emit("ready");
          });
        } else {
          // if we can't expect notification, we're as done as we can be
          _this8.emit("ready");
        }

        // in either case, reply to that capabilities request
        _this8.capabilitiesFinished = true;
        return _this8.transport.reply(request, {
          capabilities: _this8.requestedCapabilities
        });
      });
    }
  }]);
  return WidgetApi;
}(_events.EventEmitter);
exports.WidgetApi = WidgetApi;

},{"./Symbols":2,"./interfaces/ApiVersion":6,"./interfaces/GetOpenIDAction":8,"./interfaces/ModalWidgetActions":11,"./interfaces/WidgetApiAction":13,"./interfaces/WidgetApiDirection":14,"./interfaces/WidgetType":16,"./models/WidgetEventCapability":18,"./transport/PostmessageTransport":23,"events":25}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetDriver = void 0;
var _ = require("..");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                               * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                               * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *         http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                               * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                               * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                               * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                               * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                               */
/**
 * Represents the functions and behaviour the widget-api is unable to
 * do, such as prompting the user for information or interacting with
 * the UI. Clients are expected to implement this class and override
 * any functions they need/want to support.
 *
 * This class assumes the client will have a context of a Widget
 * instance already.
 */
var WidgetDriver = /*#__PURE__*/function () {
  function WidgetDriver() {
    _classCallCheck(this, WidgetDriver);
  }
  _createClass(WidgetDriver, [{
    key: "validateCapabilities",
    value:
    /**
     * Verifies the widget's requested capabilities, returning the ones
     * it is approved to use. Mutating the requested capabilities will
     * have no effect.
     *
     * This SHOULD result in the user being prompted to approve/deny
     * capabilities.
     *
     * By default this rejects all capabilities (returns an empty set).
     * @param {Set<Capability>} requested The set of requested capabilities.
     * @returns {Promise<Set<Capability>>} Resolves to the allowed capabilities.
     */
    function validateCapabilities(requested) {
      return Promise.resolve(new Set());
    }

    /**
     * Sends an event into a room. If `roomId` is falsy, the client should send the event
     * into the room the user is currently looking at. The widget API will have already
     * verified that the widget is capable of sending the event to that room.
     * @param {string} eventType The event type to be sent.
     * @param {*} content The content for the event.
     * @param {string|null} stateKey The state key if this is a state event, otherwise null.
     * May be an empty string.
     * @param {string|null} roomId The room ID to send the event to. If falsy, the room the
     * user is currently looking at.
     * @returns {Promise<ISendEventDetails>} Resolves when the event has been sent with
     * details of that event.
     * @throws Rejected when the event could not be sent.
     */
  }, {
    key: "sendEvent",
    value: function sendEvent(eventType, content) {
      var stateKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var roomId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return Promise.reject(new Error("Failed to override function"));
    }

    /**
     * @experimental Part of MSC4140 & MSC4157
     * Sends a delayed event into a room. If `roomId` is falsy, the client should send it
     * into the room the user is currently looking at. The widget API will have already
     * verified that the widget is capable of sending the event to that room.
     * @param {number|null} delay How much later to send the event, or null to not send the
     * event automatically. May not be null if {@link parentDelayId} is null.
     * @param {string|null} parentDelayId The ID of the delayed event this one is grouped with,
     * or null if it will be put in a new group. May not be null if {@link delay} is null.
     * @param {string} eventType The event type of the event to be sent.
     * @param {*} content The content for the event to be sent.
     * @param {string|null} stateKey The state key if the event to be sent a state event,
     * otherwise null. May be an empty string.
     * @param {string|null} roomId The room ID to send the event to. If falsy, the room the
     * user is currently looking at.
     * @returns {Promise<ISendDelayedEventDetails>} Resolves when the delayed event has been
     * prepared with details of how to refer to it for updating/sending/canceling it later.
     * @throws Rejected when the delayed event could not be sent.
     */
  }, {
    key: "sendDelayedEvent",
    value: function sendDelayedEvent(delay, parentDelayId, eventType, content) {
      var stateKey = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
      var roomId = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
      return Promise.reject(new Error("Failed to override function"));
    }

    /**
     * @experimental Part of MSC4140 & MSC4157
     * Run the specified {@link action} for the delayed event matching the provided {@link delayId}.
     * @throws Rejected when there is no matching delayed event, or when the action failed to run.
     */
  }, {
    key: "updateDelayedEvent",
    value: function updateDelayedEvent(delayId, action) {
      return Promise.reject(new Error("Failed to override function"));
    }

    /**
     * Sends a to-device event. The widget API will have already verified that the widget
     * is capable of sending the event.
     * @param {string} eventType The event type to be sent.
     * @param {boolean} encrypted Whether to encrypt the message contents.
     * @param {Object} contentMap A map from user ID and device ID to event content.
     * @returns {Promise<void>} Resolves when the event has been sent.
     * @throws Rejected when the event could not be sent.
     */
  }, {
    key: "sendToDevice",
    value: function sendToDevice(eventType, encrypted, contentMap) {
      return Promise.reject(new Error("Failed to override function"));
    }
    /**
     * Reads an element of room account data. The widget API will have already verified that the widget is
     * capable of receiving the `eventType` of the requested information. If `roomIds` is supplied, it may
     * contain `Symbols.AnyRoom` to denote that the piece of room account data in each of the client's known
     * rooms should be returned. When `null`, only the room the user is currently looking at should be considered.
     * @param eventType The event type to be read.
     * @param roomIds When null, the user's currently viewed room. Otherwise, the list of room IDs
     * to look within, possibly containing Symbols.AnyRoom to denote all known rooms.
     * @returns {Promise<IRoomAccountData[]>} Resolves to the element of room account data, or an empty array.
     */
  }, {
    key: "readRoomAccountData",
    value: function readRoomAccountData(eventType) {
      var roomIds = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return Promise.resolve([]);
    }

    /**
     * Reads all events of the given type, and optionally `msgtype` (if applicable/defined),
     * the user has access to. The widget API will have already verified that the widget is
     * capable of receiving the events. Less events than the limit are allowed to be returned,
     * but not more. If `roomIds` is supplied, it may contain `Symbols.AnyRoom` to denote that
     * `limit` in each of the client's known rooms should be returned. When `null`, only the
     * room the user is currently looking at should be considered. If `since` is specified but
     * the event ID isn't present in the number of events fetched by the client due to `limit`,
     * the client will return all the events.
     * @param eventType The event type to be read.
     * @param msgtype The msgtype of the events to be read, if applicable/defined.
     * @param stateKey The state key of the events to be read, if applicable/defined.
     * @param limit The maximum number of events to retrieve per room. Will be zero to denote "as many
     * as possible".
     * @param roomIds When null, the user's currently viewed room. Otherwise, the list of room IDs
     * to look within, possibly containing Symbols.AnyRoom to denote all known rooms.
     * @param since When null, retrieves the number of events specified by the "limit" parameter.
     * Otherwise, the event ID at which only subsequent events will be returned, as many as specified
     * in "limit".
     * @returns {Promise<IRoomEvent[]>} Resolves to the room events, or an empty array.
     * @deprecated Clients are advised to implement {@link WidgetDriver.readRoomTimeline} instead.
     */
  }, {
    key: "readRoomEvents",
    value: function readRoomEvents(eventType, msgtype, limit) {
      var roomIds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      var since = arguments.length > 4 ? arguments[4] : undefined;
      return Promise.resolve([]);
    }

    /**
     * Reads all events of the given type, and optionally state key (if applicable/defined),
     * the user has access to. The widget API will have already verified that the widget is
     * capable of receiving the events. Less events than the limit are allowed to be returned,
     * but not more. If `roomIds` is supplied, it may contain `Symbols.AnyRoom` to denote that
     * `limit` in each of the client's known rooms should be returned. When `null`, only the
     * room the user is currently looking at should be considered.
     * @param eventType The event type to be read.
     * @param stateKey The state key of the events to be read, if applicable/defined.
     * @param limit The maximum number of events to retrieve. Will be zero to denote "as many
     * as possible".
     * @param roomIds When null, the user's currently viewed room. Otherwise, the list of room IDs
     * to look within, possibly containing Symbols.AnyRoom to denote all known rooms.
     * @returns {Promise<IRoomEvent[]>} Resolves to the state events, or an empty array.
     * @deprecated Clients are advised to implement {@link WidgetDriver.readRoomTimeline} instead.
     */
  }, {
    key: "readStateEvents",
    value: function readStateEvents(eventType, stateKey, limit) {
      var roomIds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
      return Promise.resolve([]);
    }

    /**
     * Reads all events of the given type, and optionally `msgtype` (if applicable/defined),
     * the user has access to. The widget API will have already verified that the widget is
     * capable of receiving the events. Less events than the limit are allowed to be returned,
     * but not more.
     * @param roomId The ID of the room to look within.
     * @param eventType The event type to be read.
     * @param msgtype The msgtype of the events to be read, if applicable/defined.
     * @param stateKey The state key of the events to be read, if applicable/defined.
     * @param limit The maximum number of events to retrieve. Will be zero to denote "as many as
     * possible".
     * @param since When null, retrieves the number of events specified by the "limit" parameter.
     * Otherwise, the event ID at which only subsequent events will be returned, as many as specified
     * in "limit".
     * @returns {Promise<IRoomEvent[]>} Resolves to the room events, or an empty array.
     */
  }, {
    key: "readRoomTimeline",
    value: function readRoomTimeline(roomId, eventType, msgtype, stateKey, limit, since) {
      // For backward compatibility we try the deprecated methods, in case
      // they're implemented
      if (stateKey === undefined) return this.readRoomEvents(eventType, msgtype, limit, [roomId], since);else return this.readStateEvents(eventType, stateKey, limit, [roomId]);
    }

    /**
     * Reads the current values of all matching room state entries.
     * @param roomId The ID of the room.
     * @param eventType The event type of the entries to be read.
     * @param stateKey The state key of the entry to be read. If undefined,
     * all room state entries with a matching event type should be returned.
     * @returns {Promise<IRoomEvent[]>} Resolves to the events representing the
     * current values of the room state entries.
     */
  }, {
    key: "readRoomState",
    value: function readRoomState(roomId, eventType, stateKey) {
      return this.readStateEvents(eventType, stateKey, Number.MAX_SAFE_INTEGER, [roomId]);
    }

    /**
     * Reads all events that are related to a given event. The widget API will
     * have already verified that the widget is capable of receiving the event,
     * or will make sure to reject access to events which are returned from this
     * function, but are not capable of receiving. If `relationType` or `eventType`
     * are set, the returned events should already be filtered. Less events than
     * the limit are allowed to be returned, but not more.
     * @param eventId The id of the parent event to be read.
     * @param roomId The room to look within. When undefined, the user's
     * currently viewed room.
     * @param relationType The relationship type of child events to search for.
     * When undefined, all relations are returned.
     * @param eventType The event type of child events to search for. When undefined,
     * all related events are returned.
     * @param from The pagination token to start returning results from, as
     * received from a previous call. If not supplied, results start at the most
     * recent topological event known to the server.
     * @param to The pagination token to stop returning results at. If not
     * supplied, results continue up to limit or until there are no more events.
     * @param limit The maximum number of events to retrieve per room. If not
     * supplied, the server will apply a default limit.
     * @param direction The direction to search for according to MSC3715
     * @returns Resolves to the room relations.
     */
  }, {
    key: "readEventRelations",
    value: function readEventRelations(eventId, roomId, relationType, eventType, from, to, limit, direction) {
      return Promise.resolve({
        chunk: []
      });
    }

    /**
     * Asks the user for permission to validate their identity through OpenID Connect. The
     * interface for this function is an observable which accepts the state machine of the
     * OIDC exchange flow. For example, if the client/user blocks the request then it would
     * feed back a `{state: Blocked}` into the observable. Similarly, if the user already
     * approved the widget then a `{state: Allowed}` would be fed into the observable alongside
     * the token itself. If the client is asking for permission, it should feed in a
     * `{state: PendingUserConfirmation}` followed by the relevant Allowed or Blocked state.
     *
     * The widget API will reject the widget's request with an error if this contract is not
     * met properly. By default, the widget driver will block all OIDC requests.
     * @param {SimpleObservable<IOpenIDUpdate>} observer The observable to feed updates into.
     */
  }, {
    key: "askOpenID",
    value: function askOpenID(observer) {
      observer.update({
        state: _.OpenIDRequestState.Blocked
      });
    }

    /**
     * Navigates the client with a matrix.to URI. In future this function will also be provided
     * with the Matrix URIs once matrix.to is replaced. The given URI will have already been
     * lightly checked to ensure it looks like a valid URI, though the implementation is recommended
     * to do further checks on the URI.
     * @param {string} uri The URI to navigate to.
     * @returns {Promise<void>} Resolves when complete.
     * @throws Throws if there's a problem with the navigation, such as invalid format.
     */
  }, {
    key: "navigate",
    value: function navigate(uri) {
      throw new Error("Navigation is not implemented");
    }

    /**
     * Polls for TURN server data, yielding an initial set of credentials as soon as possible, and
     * thereafter yielding new credentials whenever the previous ones expire. The widget API will
     * have already verified that the widget has permission to access TURN servers.
     * @yields {ITurnServer} The TURN server URIs and credentials currently available to the client.
     */
  }, {
    key: "getTurnServers",
    value: function getTurnServers() {
      throw new Error("TURN server support is not implemented");
    }

    /**
     * Search for users in the user directory.
     * @param searchTerm The term to search for.
     * @param limit The maximum number of results to return. If not supplied, the
     * @returns Resolves to the search results.
     */
  }, {
    key: "searchUserDirectory",
    value: function searchUserDirectory(searchTerm, limit) {
      return Promise.resolve({
        limited: false,
        results: []
      });
    }

    /**
     * Get the config for the media repository.
     * @returns Promise which resolves with an object containing the config.
     */
  }, {
    key: "getMediaConfig",
    value: function getMediaConfig() {
      throw new Error("Get media config is not implemented");
    }

    /**
     * Upload a file to the media repository on the homeserver.
     * @param file - The object to upload. Something that can be sent to
     *               XMLHttpRequest.send (typically a File).
     * @returns Resolves to the location of the uploaded file.
     */
  }, {
    key: "uploadFile",
    value: function uploadFile(file) {
      throw new Error("Upload file is not implemented");
    }

    /**
     * Download a file from the media repository on the homeserver.
     * @param contentUri - MXC URI of the file to download.
     * @returns Resolves to the contents of the file.
     */
  }, {
    key: "downloadFile",
    value: function downloadFile(contentUri) {
      throw new Error("Download file is not implemented");
    }

    /**
     * Gets the IDs of all joined or invited rooms currently known to the
     * client.
     * @returns The room IDs.
     */
  }, {
    key: "getKnownRooms",
    value: function getKnownRooms() {
      throw new Error("Querying known rooms is not implemented");
    }

    /**
     * Expresses an error thrown by this driver in a format compatible with the Widget API.
     * @param error The error to handle.
     * @returns The error expressed as a {@link IWidgetApiErrorResponseDataDetails},
     * or undefined if it cannot be expressed as one.
     */
  }, {
    key: "processError",
    value: function processError(error) {
      return undefined;
    }
  }]);
  return WidgetDriver;
}();
exports.WidgetDriver = WidgetDriver;

},{"..":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _WidgetApi = require("./WidgetApi");
Object.keys(_WidgetApi).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetApi[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetApi[key];
    }
  });
});
var _ClientWidgetApi = require("./ClientWidgetApi");
Object.keys(_ClientWidgetApi).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ClientWidgetApi[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ClientWidgetApi[key];
    }
  });
});
var _Symbols = require("./Symbols");
Object.keys(_Symbols).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Symbols[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Symbols[key];
    }
  });
});
var _PostmessageTransport = require("./transport/PostmessageTransport");
Object.keys(_PostmessageTransport).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _PostmessageTransport[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _PostmessageTransport[key];
    }
  });
});
var _WidgetType = require("./interfaces/WidgetType");
Object.keys(_WidgetType).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetType[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetType[key];
    }
  });
});
var _IWidgetApiErrorResponse = require("./interfaces/IWidgetApiErrorResponse");
Object.keys(_IWidgetApiErrorResponse).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _IWidgetApiErrorResponse[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _IWidgetApiErrorResponse[key];
    }
  });
});
var _WidgetApiAction = require("./interfaces/WidgetApiAction");
Object.keys(_WidgetApiAction).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetApiAction[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetApiAction[key];
    }
  });
});
var _WidgetApiDirection = require("./interfaces/WidgetApiDirection");
Object.keys(_WidgetApiDirection).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetApiDirection[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetApiDirection[key];
    }
  });
});
var _ApiVersion = require("./interfaces/ApiVersion");
Object.keys(_ApiVersion).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ApiVersion[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ApiVersion[key];
    }
  });
});
var _Capabilities = require("./interfaces/Capabilities");
Object.keys(_Capabilities).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Capabilities[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Capabilities[key];
    }
  });
});
var _GetOpenIDAction = require("./interfaces/GetOpenIDAction");
Object.keys(_GetOpenIDAction).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _GetOpenIDAction[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _GetOpenIDAction[key];
    }
  });
});
var _WidgetKind = require("./interfaces/WidgetKind");
Object.keys(_WidgetKind).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetKind[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetKind[key];
    }
  });
});
var _ModalButtonKind = require("./interfaces/ModalButtonKind");
Object.keys(_ModalButtonKind).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ModalButtonKind[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ModalButtonKind[key];
    }
  });
});
var _ModalWidgetActions = require("./interfaces/ModalWidgetActions");
Object.keys(_ModalWidgetActions).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _ModalWidgetActions[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _ModalWidgetActions[key];
    }
  });
});
var _UpdateDelayedEventAction = require("./interfaces/UpdateDelayedEventAction");
Object.keys(_UpdateDelayedEventAction).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _UpdateDelayedEventAction[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _UpdateDelayedEventAction[key];
    }
  });
});
var _WidgetEventCapability = require("./models/WidgetEventCapability");
Object.keys(_WidgetEventCapability).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetEventCapability[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetEventCapability[key];
    }
  });
});
var _url = require("./models/validation/url");
Object.keys(_url).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _url[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _url[key];
    }
  });
});
var _utils = require("./models/validation/utils");
Object.keys(_utils).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _utils[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _utils[key];
    }
  });
});
var _Widget = require("./models/Widget");
Object.keys(_Widget).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _Widget[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Widget[key];
    }
  });
});
var _WidgetParser = require("./models/WidgetParser");
Object.keys(_WidgetParser).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetParser[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetParser[key];
    }
  });
});
var _urlTemplate = require("./templating/url-template");
Object.keys(_urlTemplate).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _urlTemplate[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _urlTemplate[key];
    }
  });
});
var _SimpleObservable = require("./util/SimpleObservable");
Object.keys(_SimpleObservable).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _SimpleObservable[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _SimpleObservable[key];
    }
  });
});
var _WidgetDriver = require("./driver/WidgetDriver");
Object.keys(_WidgetDriver).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _WidgetDriver[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _WidgetDriver[key];
    }
  });
});

},{"./ClientWidgetApi":1,"./Symbols":2,"./WidgetApi":3,"./driver/WidgetDriver":4,"./interfaces/ApiVersion":6,"./interfaces/Capabilities":7,"./interfaces/GetOpenIDAction":8,"./interfaces/IWidgetApiErrorResponse":9,"./interfaces/ModalButtonKind":10,"./interfaces/ModalWidgetActions":11,"./interfaces/UpdateDelayedEventAction":12,"./interfaces/WidgetApiAction":13,"./interfaces/WidgetApiDirection":14,"./interfaces/WidgetKind":15,"./interfaces/WidgetType":16,"./models/Widget":17,"./models/WidgetEventCapability":18,"./models/WidgetParser":19,"./models/validation/url":20,"./models/validation/utils":21,"./templating/url-template":22,"./transport/PostmessageTransport":23,"./util/SimpleObservable":24}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnstableApiVersion = exports.MatrixApiVersion = exports.CurrentApiVersions = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MatrixApiVersion = /*#__PURE__*/function (MatrixApiVersion) {
  MatrixApiVersion["Prerelease1"] = "0.0.1";
  MatrixApiVersion["Prerelease2"] = "0.0.2";
  return MatrixApiVersion;
}({}); //V010 = "0.1.0", // first release
exports.MatrixApiVersion = MatrixApiVersion;
var UnstableApiVersion = /*#__PURE__*/function (UnstableApiVersion) {
  UnstableApiVersion["MSC2762"] = "org.matrix.msc2762";
  UnstableApiVersion["MSC2762_UPDATE_STATE"] = "org.matrix.msc2762_update_state";
  UnstableApiVersion["MSC2871"] = "org.matrix.msc2871";
  UnstableApiVersion["MSC2873"] = "org.matrix.msc2873";
  UnstableApiVersion["MSC2931"] = "org.matrix.msc2931";
  UnstableApiVersion["MSC2974"] = "org.matrix.msc2974";
  UnstableApiVersion["MSC2876"] = "org.matrix.msc2876";
  UnstableApiVersion["MSC3819"] = "org.matrix.msc3819";
  UnstableApiVersion["MSC3846"] = "town.robin.msc3846";
  UnstableApiVersion["MSC3869"] = "org.matrix.msc3869";
  UnstableApiVersion["MSC3973"] = "org.matrix.msc3973";
  UnstableApiVersion["MSC4039"] = "org.matrix.msc4039";
  return UnstableApiVersion;
}({});
exports.UnstableApiVersion = UnstableApiVersion;
var CurrentApiVersions = [MatrixApiVersion.Prerelease1, MatrixApiVersion.Prerelease2,
//MatrixApiVersion.V010,
UnstableApiVersion.MSC2762, UnstableApiVersion.MSC2762_UPDATE_STATE, UnstableApiVersion.MSC2871, UnstableApiVersion.MSC2873, UnstableApiVersion.MSC2931, UnstableApiVersion.MSC2974, UnstableApiVersion.MSC2876, UnstableApiVersion.MSC3819, UnstableApiVersion.MSC3846, UnstableApiVersion.MSC3869, UnstableApiVersion.MSC3973, UnstableApiVersion.MSC4039];
exports.CurrentApiVersions = CurrentApiVersions;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoConferenceCapabilities = exports.StickerpickerCapabilities = exports.MatrixCapabilities = void 0;
exports.getTimelineRoomIDFromCapability = getTimelineRoomIDFromCapability;
exports.isTimelineCapability = isTimelineCapability;
exports.isTimelineCapabilityFor = isTimelineCapabilityFor;
/*
 * Copyright 2020 - 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MatrixCapabilities = /*#__PURE__*/function (MatrixCapabilities) {
  MatrixCapabilities["Screenshots"] = "m.capability.screenshot";
  MatrixCapabilities["StickerSending"] = "m.sticker";
  MatrixCapabilities["AlwaysOnScreen"] = "m.always_on_screen";
  MatrixCapabilities["RequiresClient"] = "io.element.requires_client";
  MatrixCapabilities["MSC2931Navigate"] = "org.matrix.msc2931.navigate";
  MatrixCapabilities["MSC3846TurnServers"] = "town.robin.msc3846.turn_servers";
  MatrixCapabilities["MSC3973UserDirectorySearch"] = "org.matrix.msc3973.user_directory_search";
  MatrixCapabilities["MSC4039UploadFile"] = "org.matrix.msc4039.upload_file";
  MatrixCapabilities["MSC4039DownloadFile"] = "org.matrix.msc4039.download_file";
  MatrixCapabilities["MSC4157SendDelayedEvent"] = "org.matrix.msc4157.send.delayed_event";
  MatrixCapabilities["MSC4157UpdateDelayedEvent"] = "org.matrix.msc4157.update_delayed_event";
  return MatrixCapabilities;
}({});
exports.MatrixCapabilities = MatrixCapabilities;
var StickerpickerCapabilities = [MatrixCapabilities.StickerSending];
exports.StickerpickerCapabilities = StickerpickerCapabilities;
var VideoConferenceCapabilities = [MatrixCapabilities.AlwaysOnScreen];

/**
 * Determines if a capability is a capability for a timeline.
 * @param {Capability} capability The capability to test.
 * @returns {boolean} True if a timeline capability, false otherwise.
 */
exports.VideoConferenceCapabilities = VideoConferenceCapabilities;
function isTimelineCapability(capability) {
  // TODO: Change when MSC2762 becomes stable.
  return capability === null || capability === void 0 ? void 0 : capability.startsWith("org.matrix.msc2762.timeline:");
}

/**
 * Determines if a capability is a timeline capability for the given room.
 * @param {Capability} capability The capability to test.
 * @param {string | Symbols.AnyRoom} roomId The room ID, or `Symbols.AnyRoom` for that designation.
 * @returns {boolean} True if a matching capability, false otherwise.
 */
function isTimelineCapabilityFor(capability, roomId) {
  return capability === "org.matrix.msc2762.timeline:".concat(roomId);
}

/**
 * Gets the room ID described by a timeline capability.
 * @param {string} capability The capability to parse.
 * @returns {string} The room ID.
 */
function getTimelineRoomIDFromCapability(capability) {
  return capability.substring(capability.indexOf(":") + 1);
}

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OpenIDRequestState = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var OpenIDRequestState = /*#__PURE__*/function (OpenIDRequestState) {
  OpenIDRequestState["Allowed"] = "allowed";
  OpenIDRequestState["Blocked"] = "blocked";
  OpenIDRequestState["PendingUserConfirmation"] = "request";
  return OpenIDRequestState;
}({});
exports.OpenIDRequestState = OpenIDRequestState;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isErrorResponse = isErrorResponse;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
/*
 * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The format of errors returned by Matrix API requests
 * made by a WidgetDriver.
 */

function isErrorResponse(responseData) {
  var error = responseData.error;
  return _typeof(error) === "object" && error !== null && "message" in error && typeof error.message === "string";
}

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalButtonKind = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ModalButtonKind = /*#__PURE__*/function (ModalButtonKind) {
  ModalButtonKind["Primary"] = "m.primary";
  ModalButtonKind["Secondary"] = "m.secondary";
  ModalButtonKind["Warning"] = "m.warning";
  ModalButtonKind["Danger"] = "m.danger";
  ModalButtonKind["Link"] = "m.link";
  return ModalButtonKind;
}({});
exports.ModalButtonKind = ModalButtonKind;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BuiltInModalButtonID = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var BuiltInModalButtonID = /*#__PURE__*/function (BuiltInModalButtonID) {
  BuiltInModalButtonID["Close"] = "m.close";
  return BuiltInModalButtonID;
}({}); // Types for a normal modal requesting the opening a modal widget
// Types for a modal widget receiving notifications that its buttons have been pressed
// Types for a modal widget requesting close
// Types for a normal widget being notified that the modal widget it opened has been closed
exports.BuiltInModalButtonID = BuiltInModalButtonID;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UpdateDelayedEventAction = void 0;
/*
 * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var UpdateDelayedEventAction = /*#__PURE__*/function (UpdateDelayedEventAction) {
  UpdateDelayedEventAction["Cancel"] = "cancel";
  UpdateDelayedEventAction["Restart"] = "restart";
  UpdateDelayedEventAction["Send"] = "send";
  return UpdateDelayedEventAction;
}({});
exports.UpdateDelayedEventAction = UpdateDelayedEventAction;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetApiToWidgetAction = exports.WidgetApiFromWidgetAction = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var WidgetApiToWidgetAction = /*#__PURE__*/function (WidgetApiToWidgetAction) {
  WidgetApiToWidgetAction["SupportedApiVersions"] = "supported_api_versions";
  WidgetApiToWidgetAction["Capabilities"] = "capabilities";
  WidgetApiToWidgetAction["NotifyCapabilities"] = "notify_capabilities";
  WidgetApiToWidgetAction["ThemeChange"] = "theme_change";
  WidgetApiToWidgetAction["LanguageChange"] = "language_change";
  WidgetApiToWidgetAction["TakeScreenshot"] = "screenshot";
  WidgetApiToWidgetAction["UpdateVisibility"] = "visibility";
  WidgetApiToWidgetAction["OpenIDCredentials"] = "openid_credentials";
  WidgetApiToWidgetAction["WidgetConfig"] = "widget_config";
  WidgetApiToWidgetAction["CloseModalWidget"] = "close_modal";
  WidgetApiToWidgetAction["ButtonClicked"] = "button_clicked";
  WidgetApiToWidgetAction["SendEvent"] = "send_event";
  WidgetApiToWidgetAction["SendToDevice"] = "send_to_device";
  WidgetApiToWidgetAction["UpdateState"] = "update_state";
  WidgetApiToWidgetAction["UpdateTurnServers"] = "update_turn_servers";
  return WidgetApiToWidgetAction;
}({});
exports.WidgetApiToWidgetAction = WidgetApiToWidgetAction;
var WidgetApiFromWidgetAction = /*#__PURE__*/function (WidgetApiFromWidgetAction) {
  WidgetApiFromWidgetAction["SupportedApiVersions"] = "supported_api_versions";
  WidgetApiFromWidgetAction["ContentLoaded"] = "content_loaded";
  WidgetApiFromWidgetAction["SendSticker"] = "m.sticker";
  WidgetApiFromWidgetAction["UpdateAlwaysOnScreen"] = "set_always_on_screen";
  WidgetApiFromWidgetAction["GetOpenIDCredentials"] = "get_openid";
  WidgetApiFromWidgetAction["CloseModalWidget"] = "close_modal";
  WidgetApiFromWidgetAction["OpenModalWidget"] = "open_modal";
  WidgetApiFromWidgetAction["SetModalButtonEnabled"] = "set_button_enabled";
  WidgetApiFromWidgetAction["SendEvent"] = "send_event";
  WidgetApiFromWidgetAction["SendToDevice"] = "send_to_device";
  WidgetApiFromWidgetAction["WatchTurnServers"] = "watch_turn_servers";
  WidgetApiFromWidgetAction["UnwatchTurnServers"] = "unwatch_turn_servers";
  WidgetApiFromWidgetAction["BeeperReadRoomAccountData"] = "com.beeper.read_room_account_data";
  WidgetApiFromWidgetAction["MSC2876ReadEvents"] = "org.matrix.msc2876.read_events";
  WidgetApiFromWidgetAction["MSC2931Navigate"] = "org.matrix.msc2931.navigate";
  WidgetApiFromWidgetAction["MSC2974RenegotiateCapabilities"] = "org.matrix.msc2974.request_capabilities";
  WidgetApiFromWidgetAction["MSC3869ReadRelations"] = "org.matrix.msc3869.read_relations";
  WidgetApiFromWidgetAction["MSC3973UserDirectorySearch"] = "org.matrix.msc3973.user_directory_search";
  WidgetApiFromWidgetAction["MSC4039GetMediaConfigAction"] = "org.matrix.msc4039.get_media_config";
  WidgetApiFromWidgetAction["MSC4039UploadFileAction"] = "org.matrix.msc4039.upload_file";
  WidgetApiFromWidgetAction["MSC4039DownloadFileAction"] = "org.matrix.msc4039.download_file";
  WidgetApiFromWidgetAction["MSC4157UpdateDelayedEvent"] = "org.matrix.msc4157.update_delayed_event";
  return WidgetApiFromWidgetAction;
}({});
exports.WidgetApiFromWidgetAction = WidgetApiFromWidgetAction;

},{}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetApiDirection = void 0;
exports.invertedDirection = invertedDirection;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var WidgetApiDirection = /*#__PURE__*/function (WidgetApiDirection) {
  WidgetApiDirection["ToWidget"] = "toWidget";
  WidgetApiDirection["FromWidget"] = "fromWidget";
  return WidgetApiDirection;
}({});
exports.WidgetApiDirection = WidgetApiDirection;
function invertedDirection(dir) {
  if (dir === WidgetApiDirection.ToWidget) {
    return WidgetApiDirection.FromWidget;
  } else if (dir === WidgetApiDirection.FromWidget) {
    return WidgetApiDirection.ToWidget;
  } else {
    throw new Error("Invalid direction");
  }
}

},{}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetKind = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var WidgetKind = /*#__PURE__*/function (WidgetKind) {
  WidgetKind["Room"] = "room";
  WidgetKind["Account"] = "account";
  WidgetKind["Modal"] = "modal";
  return WidgetKind;
}({});
exports.WidgetKind = WidgetKind;

},{}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MatrixWidgetType = void 0;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MatrixWidgetType = /*#__PURE__*/function (MatrixWidgetType) {
  MatrixWidgetType["Custom"] = "m.custom";
  MatrixWidgetType["JitsiMeet"] = "m.jitsi";
  MatrixWidgetType["Stickerpicker"] = "m.stickerpicker";
  return MatrixWidgetType;
}({});
exports.MatrixWidgetType = MatrixWidgetType;

},{}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Widget = void 0;
var _utils = require("./validation/utils");
var _ = require("..");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2020 The Matrix.org Foundation C.I.C.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                               * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                               * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *         http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                               * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                               * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                               * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                               * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                               */
/**
 * Represents the barest form of widget.
 */
var Widget = /*#__PURE__*/function () {
  function Widget(definition) {
    _classCallCheck(this, Widget);
    this.definition = definition;
    if (!this.definition) throw new Error("Definition is required");
    (0, _utils.assertPresent)(definition, "id");
    (0, _utils.assertPresent)(definition, "creatorUserId");
    (0, _utils.assertPresent)(definition, "type");
    (0, _utils.assertPresent)(definition, "url");
  }

  /**
   * The user ID who created the widget.
   */
  _createClass(Widget, [{
    key: "creatorUserId",
    get: function get() {
      return this.definition.creatorUserId;
    }

    /**
     * The type of widget.
     */
  }, {
    key: "type",
    get: function get() {
      return this.definition.type;
    }

    /**
     * The ID of the widget.
     */
  }, {
    key: "id",
    get: function get() {
      return this.definition.id;
    }

    /**
     * The name of the widget, or null if not set.
     */
  }, {
    key: "name",
    get: function get() {
      return this.definition.name || null;
    }

    /**
     * The title for the widget, or null if not set.
     */
  }, {
    key: "title",
    get: function get() {
      return this.rawData.title || null;
    }

    /**
     * The templated URL for the widget.
     */
  }, {
    key: "templateUrl",
    get: function get() {
      return this.definition.url;
    }

    /**
     * The origin for this widget.
     */
  }, {
    key: "origin",
    get: function get() {
      return new URL(this.templateUrl).origin;
    }

    /**
     * Whether or not the client should wait for the iframe to load. Defaults
     * to true.
     */
  }, {
    key: "waitForIframeLoad",
    get: function get() {
      if (this.definition.waitForIframeLoad === false) return false;
      if (this.definition.waitForIframeLoad === true) return true;
      return true; // default true
    }

    /**
     * The raw data for the widget. This will always be defined, though
     * may be empty.
     */
  }, {
    key: "rawData",
    get: function get() {
      return this.definition.data || {};
    }

    /**
     * Gets a complete widget URL for the client to render.
     * @param {ITemplateParams} params The template parameters.
     * @returns {string} A templated URL.
     */
  }, {
    key: "getCompleteUrl",
    value: function getCompleteUrl(params) {
      return (0, _.runTemplate)(this.templateUrl, this.definition, params);
    }
  }]);
  return Widget;
}();
exports.Widget = Widget;

},{"..":5,"./validation/utils":21}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetEventCapability = exports.EventKind = exports.EventDirection = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var EventKind = /*#__PURE__*/function (EventKind) {
  EventKind["Event"] = "event";
  EventKind["State"] = "state_event";
  EventKind["ToDevice"] = "to_device";
  EventKind["RoomAccount"] = "room_account";
  return EventKind;
}({});
exports.EventKind = EventKind;
var EventDirection = /*#__PURE__*/function (EventDirection) {
  EventDirection["Send"] = "send";
  EventDirection["Receive"] = "receive";
  return EventDirection;
}({});
exports.EventDirection = EventDirection;
var WidgetEventCapability = /*#__PURE__*/function () {
  function WidgetEventCapability(direction, eventType, kind, keyStr, raw) {
    _classCallCheck(this, WidgetEventCapability);
    this.direction = direction;
    this.eventType = eventType;
    this.kind = kind;
    this.keyStr = keyStr;
    this.raw = raw;
  }
  _createClass(WidgetEventCapability, [{
    key: "matchesAsStateEvent",
    value: function matchesAsStateEvent(direction, eventType, stateKey) {
      if (this.kind !== EventKind.State) return false; // not a state event
      if (this.direction !== direction) return false; // direction mismatch
      if (this.eventType !== eventType) return false; // event type mismatch
      if (this.keyStr === null) return true; // all state keys are allowed
      if (this.keyStr === stateKey) return true; // this state key is allowed

      // Default not allowed
      return false;
    }
  }, {
    key: "matchesAsToDeviceEvent",
    value: function matchesAsToDeviceEvent(direction, eventType) {
      if (this.kind !== EventKind.ToDevice) return false; // not a to-device event
      if (this.direction !== direction) return false; // direction mismatch
      if (this.eventType !== eventType) return false; // event type mismatch

      // Checks passed, the event is allowed
      return true;
    }
  }, {
    key: "matchesAsRoomEvent",
    value: function matchesAsRoomEvent(direction, eventType) {
      var msgtype = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      if (this.kind !== EventKind.Event) return false; // not a room event
      if (this.direction !== direction) return false; // direction mismatch
      if (this.eventType !== eventType) return false; // event type mismatch

      if (this.eventType === "m.room.message") {
        if (this.keyStr === null) return true; // all message types are allowed
        if (this.keyStr === msgtype) return true; // this message type is allowed
      } else {
        return true; // already passed the check for if the event is allowed
      }

      // Default not allowed
      return false;
    }
  }, {
    key: "matchesAsRoomAccountData",
    value: function matchesAsRoomAccountData(direction, eventType) {
      if (this.kind !== EventKind.RoomAccount) return false; // not room account data
      if (this.direction !== direction) return false; // direction mismatch
      if (this.eventType !== eventType) return false; // event type mismatch

      // Checks passed, the event is allowed
      return true;
    }
  }], [{
    key: "forStateEvent",
    value: function forStateEvent(direction, eventType, stateKey) {
      // TODO: Enable support for m.* namespace once the MSC lands.
      // https://github.com/matrix-org/matrix-widget-api/issues/22
      eventType = eventType.replace(/#/g, "\\#");
      stateKey = stateKey !== null && stateKey !== undefined ? "#".concat(stateKey) : "";
      var str = "org.matrix.msc2762.".concat(direction, ".state_event:").concat(eventType).concat(stateKey);

      // cheat by sending it through the processor
      return WidgetEventCapability.findEventCapabilities([str])[0];
    }
  }, {
    key: "forToDeviceEvent",
    value: function forToDeviceEvent(direction, eventType) {
      // TODO: Enable support for m.* namespace once the MSC lands.
      // https://github.com/matrix-org/matrix-widget-api/issues/56
      var str = "org.matrix.msc3819.".concat(direction, ".to_device:").concat(eventType);

      // cheat by sending it through the processor
      return WidgetEventCapability.findEventCapabilities([str])[0];
    }
  }, {
    key: "forRoomEvent",
    value: function forRoomEvent(direction, eventType) {
      // TODO: Enable support for m.* namespace once the MSC lands.
      // https://github.com/matrix-org/matrix-widget-api/issues/22
      var str = "org.matrix.msc2762.".concat(direction, ".event:").concat(eventType);

      // cheat by sending it through the processor
      return WidgetEventCapability.findEventCapabilities([str])[0];
    }
  }, {
    key: "forRoomMessageEvent",
    value: function forRoomMessageEvent(direction, msgtype) {
      // TODO: Enable support for m.* namespace once the MSC lands.
      // https://github.com/matrix-org/matrix-widget-api/issues/22
      msgtype = msgtype === null || msgtype === undefined ? "" : msgtype;
      var str = "org.matrix.msc2762.".concat(direction, ".event:m.room.message#").concat(msgtype);

      // cheat by sending it through the processor
      return WidgetEventCapability.findEventCapabilities([str])[0];
    }
  }, {
    key: "forRoomAccountData",
    value: function forRoomAccountData(direction, eventType) {
      var str = "com.beeper.capabilities.".concat(direction, ".room_account_data:").concat(eventType);
      return WidgetEventCapability.findEventCapabilities([str])[0];
    }

    /**
     * Parses a capabilities request to find all the event capability requests.
     * @param {Iterable<Capability>} capabilities The capabilities requested/to parse.
     * @returns {WidgetEventCapability[]} An array of event capability requests. May be empty, but never null.
     */
  }, {
    key: "findEventCapabilities",
    value: function findEventCapabilities(capabilities) {
      var parsed = [];
      var _iterator = _createForOfIteratorHelper(capabilities),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var cap = _step.value;
          var _direction = null;
          var eventSegment = void 0;
          var _kind = null;

          // TODO: Enable support for m.* namespace once the MSCs land.
          // https://github.com/matrix-org/matrix-widget-api/issues/22
          // https://github.com/matrix-org/matrix-widget-api/issues/56

          if (cap.startsWith("org.matrix.msc2762.send.event:")) {
            _direction = EventDirection.Send;
            _kind = EventKind.Event;
            eventSegment = cap.substring("org.matrix.msc2762.send.event:".length);
          } else if (cap.startsWith("org.matrix.msc2762.send.state_event:")) {
            _direction = EventDirection.Send;
            _kind = EventKind.State;
            eventSegment = cap.substring("org.matrix.msc2762.send.state_event:".length);
          } else if (cap.startsWith("org.matrix.msc3819.send.to_device:")) {
            _direction = EventDirection.Send;
            _kind = EventKind.ToDevice;
            eventSegment = cap.substring("org.matrix.msc3819.send.to_device:".length);
          } else if (cap.startsWith("org.matrix.msc2762.receive.event:")) {
            _direction = EventDirection.Receive;
            _kind = EventKind.Event;
            eventSegment = cap.substring("org.matrix.msc2762.receive.event:".length);
          } else if (cap.startsWith("org.matrix.msc2762.receive.state_event:")) {
            _direction = EventDirection.Receive;
            _kind = EventKind.State;
            eventSegment = cap.substring("org.matrix.msc2762.receive.state_event:".length);
          } else if (cap.startsWith("org.matrix.msc3819.receive.to_device:")) {
            _direction = EventDirection.Receive;
            _kind = EventKind.ToDevice;
            eventSegment = cap.substring("org.matrix.msc3819.receive.to_device:".length);
          } else if (cap.startsWith("com.beeper.capabilities.receive.room_account_data:")) {
            _direction = EventDirection.Receive;
            _kind = EventKind.RoomAccount;
            eventSegment = cap.substring("com.beeper.capabilities.receive.room_account_data:".length);
          }
          if (_direction === null || _kind === null || eventSegment === undefined) continue;

          // The capability uses `#` as a separator between event type and state key/msgtype,
          // so we split on that. However, a # is also valid in either one of those so we
          // join accordingly.
          // Eg: `m.room.message##m.text` is "m.room.message" event with msgtype "#m.text".
          var expectingKeyStr = eventSegment.startsWith("m.room.message#") || _kind === EventKind.State;
          var _keyStr = null;
          if (eventSegment.includes("#") && expectingKeyStr) {
            // Dev note: regex is difficult to write, so instead the rules are manually written
            // out. This is probably just as understandable as a boring regex though, so win-win?

            // Test cases:
            // str                      eventSegment        keyStr
            // -------------------------------------------------------------
            // m.room.message#          m.room.message      <empty string>
            // m.room.message#test      m.room.message      test
            // m.room.message\#         m.room.message#     test
            // m.room.message##test     m.room.message      #test
            // m.room.message\##test    m.room.message#     test
            // m.room.message\\##test   m.room.message\#    test
            // m.room.message\\###test  m.room.message\#    #test

            // First step: explode the string
            var parts = eventSegment.split("#");

            // To form the eventSegment, we'll keep finding parts of the exploded string until
            // there's one that doesn't end with the escape character (\). We'll then join those
            // segments together with the exploding character. We have to remember to consume the
            // escape character as well.
            var idx = parts.findIndex(function (p) {
              return !p.endsWith("\\");
            });
            eventSegment = parts.slice(0, idx + 1).map(function (p) {
              return p.endsWith("\\") ? p.substring(0, p.length - 1) : p;
            }).join("#");

            // The keyStr is whatever is left over.
            _keyStr = parts.slice(idx + 1).join("#");
          }
          parsed.push(new WidgetEventCapability(_direction, eventSegment, _kind, _keyStr, cap));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return parsed;
    }
  }]);
  return WidgetEventCapability;
}();
exports.WidgetEventCapability = WidgetEventCapability;

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetParser = void 0;
var _Widget = require("./Widget");
var _url = require("./validation/url");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2020 The Matrix.org Foundation C.I.C.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                               * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                               * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *         http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                               * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                               * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                               * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                               * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                               */
var WidgetParser = /*#__PURE__*/function () {
  function WidgetParser() {
    _classCallCheck(this, WidgetParser);
  } // private constructor because this is a util class

  /**
   * Parses widgets from the "m.widgets" account data event. This will always
   * return an array, though may be empty if no valid widgets were found.
   * @param {IAccountDataWidgets} content The content of the "m.widgets" account data.
   * @returns {Widget[]} The widgets in account data, or an empty array.
   */
  _createClass(WidgetParser, null, [{
    key: "parseAccountData",
    value: function parseAccountData(content) {
      if (!content) return [];
      var result = [];
      for (var _i = 0, _Object$keys = Object.keys(content); _i < _Object$keys.length; _i++) {
        var _widgetId = _Object$keys[_i];
        var roughWidget = content[_widgetId];
        if (!roughWidget) continue;
        if (roughWidget.type !== "m.widget" && roughWidget.type !== "im.vector.modular.widgets") continue;
        if (!roughWidget.sender) continue;
        var probableWidgetId = roughWidget.state_key || roughWidget.id;
        if (probableWidgetId !== _widgetId) continue;
        var asStateEvent = {
          content: roughWidget.content,
          sender: roughWidget.sender,
          type: "m.widget",
          state_key: _widgetId,
          event_id: "$example",
          room_id: "!example",
          origin_server_ts: 1
        };
        var widget = WidgetParser.parseRoomWidget(asStateEvent);
        if (widget) result.push(widget);
      }
      return result;
    }

    /**
     * Parses all the widgets possible in the given array. This will always return
     * an array, though may be empty if no widgets could be parsed.
     * @param {IStateEvent[]} currentState The room state to parse.
     * @returns {Widget[]} The widgets in the state, or an empty array.
     */
  }, {
    key: "parseWidgetsFromRoomState",
    value: function parseWidgetsFromRoomState(currentState) {
      if (!currentState) return [];
      var result = [];
      var _iterator = _createForOfIteratorHelper(currentState),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var state = _step.value;
          var widget = WidgetParser.parseRoomWidget(state);
          if (widget) result.push(widget);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return result;
    }

    /**
     * Parses a state event into a widget. If the state event does not represent
     * a widget (wrong event type, invalid widget, etc) then null is returned.
     * @param {IStateEvent} stateEvent The state event.
     * @returns {Widget|null} The widget, or null if invalid
     */
  }, {
    key: "parseRoomWidget",
    value: function parseRoomWidget(stateEvent) {
      if (!stateEvent) return null;

      // TODO: [Legacy] Remove legacy support
      if (stateEvent.type !== "m.widget" && stateEvent.type !== "im.vector.modular.widgets") {
        return null;
      }

      // Dev note: Throughout this function we have null safety to ensure that
      // if the caller did not supply something useful that we don't error. This
      // is done against the requirements of the interface because not everyone
      // will have an interface to validate against.

      var content = stateEvent.content || {};

      // Form our best approximation of a widget with the information we have
      var estimatedWidget = {
        id: stateEvent.state_key,
        creatorUserId: content["creatorUserId"] || stateEvent.sender,
        name: content["name"],
        type: content["type"],
        url: content["url"],
        waitForIframeLoad: content["waitForIframeLoad"],
        data: content["data"]
      };

      // Finally, process that widget
      return WidgetParser.processEstimatedWidget(estimatedWidget);
    }
  }, {
    key: "processEstimatedWidget",
    value: function processEstimatedWidget(widget) {
      // Validate that the widget has the best chance of passing as a widget
      if (!widget.id || !widget.creatorUserId || !widget.type) {
        return null;
      }
      if (!(0, _url.isValidUrl)(widget.url)) {
        return null;
      }
      // TODO: Validate data for known widget types
      return new _Widget.Widget(widget);
    }
  }]);
  return WidgetParser;
}();
exports.WidgetParser = WidgetParser;

},{"./Widget":17,"./validation/url":20}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isValidUrl = isValidUrl;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function isValidUrl(val) {
  if (!val) return false; // easy: not valid if not present

  try {
    var parsed = new URL(val);
    if (parsed.protocol !== "http" && parsed.protocol !== "https") {
      return false;
    }
    return true;
  } catch (e) {
    if (e instanceof TypeError) {
      return false;
    }
    throw e;
  }
}

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.assertPresent = assertPresent;
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertPresent(obj, key) {
  if (!obj[key]) {
    throw new Error("".concat(String(key), " is required"));
  }
}

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runTemplate = runTemplate;
exports.toString = toString;
/*
 * Copyright 2020, 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function runTemplate(url, widget, params) {
  // Always apply the supplied params over top of data to ensure the data can't lie about them.
  var variables = Object.assign({}, widget.data, {
    "matrix_room_id": params.widgetRoomId || "",
    "matrix_user_id": params.currentUserId,
    "matrix_display_name": params.userDisplayName || params.currentUserId,
    "matrix_avatar_url": params.userHttpAvatarUrl || "",
    "matrix_widget_id": widget.id,
    // TODO: Convert to stable (https://github.com/matrix-org/matrix-doc/pull/2873)
    "org.matrix.msc2873.client_id": params.clientId || "",
    "org.matrix.msc2873.client_theme": params.clientTheme || "",
    "org.matrix.msc2873.client_language": params.clientLanguage || "",
    // TODO: Convert to stable (https://github.com/matrix-org/matrix-spec-proposals/pull/3819)
    "org.matrix.msc3819.matrix_device_id": params.deviceId || "",
    // TODO: Convert to stable (https://github.com/matrix-org/matrix-spec-proposals/pull/4039)
    "org.matrix.msc4039.matrix_base_url": params.baseUrl || ""
  });
  var result = url;
  for (var _i = 0, _Object$keys = Object.keys(variables); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    // Regex escape from https://stackoverflow.com/a/6969486/7037379
    var pattern = "$".concat(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    var rexp = new RegExp(pattern, "g");

    // This is technically not what we're supposed to do for a couple of reasons:
    // 1. We are assuming that there won't later be a $key match after we replace a variable.
    // 2. We are assuming that the variable is in a place where it can be escaped (eg: path or query string).
    result = result.replace(rexp, encodeURIComponent(toString(variables[key])));
  }
  return result;
}
function toString(a) {
  if (a === null || a === undefined) {
    return "".concat(a);
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return String(a);
}

},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostmessageTransport = void 0;
var _events = require("events");
var _ = require("..");
var _excluded = ["message"];
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * Copyright 2020 - 2024 The Matrix.org Foundation C.I.C.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Licensed under the Apache License, Version 2.0 (the "License");
                                                                                                                                                                                                                                                                                                                                                                                               * you may not use this file except in compliance with the License.
                                                                                                                                                                                                                                                                                                                                                                                               * You may obtain a copy of the License at
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               *         http://www.apache.org/licenses/LICENSE-2.0
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Unless required by applicable law or agreed to in writing, software
                                                                                                                                                                                                                                                                                                                                                                                               * distributed under the License is distributed on an "AS IS" BASIS,
                                                                                                                                                                                                                                                                                                                                                                                               * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                                                                                                                                                                                                                                                                                                                                                                                               * See the License for the specific language governing permissions and
                                                                                                                                                                                                                                                                                                                                                                                               * limitations under the License.
                                                                                                                                                                                                                                                                                                                                                                                               */
/**
 * Transport for the Widget API over postMessage.
 */
var PostmessageTransport = /*#__PURE__*/function (_EventEmitter) {
  _inherits(PostmessageTransport, _EventEmitter);
  var _super = _createSuper(PostmessageTransport);
  function PostmessageTransport(sendDirection, initialWidgetId, transportWindow, inboundWindow) {
    var _this;
    _classCallCheck(this, PostmessageTransport);
    _this = _super.call(this);
    _this.sendDirection = sendDirection;
    _this.initialWidgetId = initialWidgetId;
    _this.transportWindow = transportWindow;
    _this.inboundWindow = inboundWindow;
    _defineProperty(_assertThisInitialized(_this), "strictOriginCheck", false);
    _defineProperty(_assertThisInitialized(_this), "targetOrigin", "*");
    _defineProperty(_assertThisInitialized(_this), "timeoutSeconds", 10);
    _defineProperty(_assertThisInitialized(_this), "_ready", false);
    _defineProperty(_assertThisInitialized(_this), "_widgetId", null);
    _defineProperty(_assertThisInitialized(_this), "outboundRequests", new Map());
    _defineProperty(_assertThisInitialized(_this), "stopController", new AbortController());
    _this._widgetId = initialWidgetId;
    return _this;
  }
  _createClass(PostmessageTransport, [{
    key: "ready",
    get: function get() {
      return this._ready;
    }
  }, {
    key: "widgetId",
    get: function get() {
      return this._widgetId || null;
    }
  }, {
    key: "nextRequestId",
    get: function get() {
      var idBase = "widgetapi-".concat(Date.now());
      var index = 0;
      var id = idBase;
      while (this.outboundRequests.has(id)) {
        id = "".concat(idBase, "-").concat(index++);
      }

      // reserve the ID
      this.outboundRequests.set(id, null);
      return id;
    }
  }, {
    key: "sendInternal",
    value: function sendInternal(message) {
      console.log("[PostmessageTransport] Sending object to ".concat(this.targetOrigin, ": "), message);
      this.transportWindow.postMessage(message, this.targetOrigin);
    }
  }, {
    key: "reply",
    value: function reply(request, responseData) {
      return this.sendInternal(_objectSpread(_objectSpread({}, request), {}, {
        response: responseData
      }));
    }
  }, {
    key: "send",
    value: function send(action, data) {
      return this.sendComplete(action, data).then(function (r) {
        return r.response;
      });
    }
  }, {
    key: "sendComplete",
    value: function sendComplete(action, data) {
      var _this2 = this;
      if (!this.ready || !this.widgetId) {
        return Promise.reject(new Error("Not ready or unknown widget ID"));
      }
      var request = {
        api: this.sendDirection,
        widgetId: this.widgetId,
        requestId: this.nextRequestId,
        action: action,
        data: data
      };
      if (action === _.WidgetApiToWidgetAction.UpdateVisibility) {
        request["visible"] = data["visible"];
      }
      return new Promise(function (prResolve, prReject) {
        var resolve = function resolve(response) {
          cleanUp();
          prResolve(response);
        };
        var reject = function reject(err) {
          cleanUp();
          prReject(err);
        };
        var timerId = setTimeout(function () {
          return reject(new Error("Request timed out"));
        }, (_this2.timeoutSeconds || 1) * 1000);
        var onStop = function onStop() {
          return reject(new Error("Transport stopped"));
        };
        _this2.stopController.signal.addEventListener("abort", onStop);
        var cleanUp = function cleanUp() {
          _this2.outboundRequests["delete"](request.requestId);
          clearTimeout(timerId);
          _this2.stopController.signal.removeEventListener("abort", onStop);
        };
        _this2.outboundRequests.set(request.requestId, {
          request: request,
          resolve: resolve,
          reject: reject
        });
        _this2.sendInternal(request);
      });
    }
  }, {
    key: "start",
    value: function start() {
      var _this3 = this;
      this.inboundWindow.addEventListener("message", function (ev) {
        _this3.handleMessage(ev);
      });
      this._ready = true;
    }
  }, {
    key: "stop",
    value: function stop() {
      this._ready = false;
      this.stopController.abort();
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(ev) {
      if (this.stopController.signal.aborted) return;
      if (!ev.data) return; // invalid event

      if (this.strictOriginCheck && ev.origin !== window.origin) return; // bad origin

      // treat the message as a response first, then downgrade to a request
      var response = ev.data;
      if (!response.action || !response.requestId || !response.widgetId) return; // invalid request/response

      if (!response.response) {
        // it's a request
        var request = response;
        if (request.api !== (0, _.invertedDirection)(this.sendDirection)) return; // wrong direction
        this.handleRequest(request);
      } else {
        // it's a response
        if (response.api !== this.sendDirection) return; // wrong direction
        this.handleResponse(response);
      }
    }
  }, {
    key: "handleRequest",
    value: function handleRequest(request) {
      if (this.widgetId) {
        if (this.widgetId !== request.widgetId) return; // wrong widget
      } else {
        this._widgetId = request.widgetId;
      }
      this.emit("message", new CustomEvent("message", {
        detail: request
      }));
    }
  }, {
    key: "handleResponse",
    value: function handleResponse(response) {
      if (response.widgetId !== this.widgetId) return; // wrong widget

      var req = this.outboundRequests.get(response.requestId);
      if (!req) return; // response to an unknown request

      if ((0, _.isErrorResponse)(response.response)) {
        var _response$response$er = response.response.error,
          message = _response$response$er.message,
          data = _objectWithoutProperties(_response$response$er, _excluded);
        req.reject(new _.WidgetApiResponseError(message, data));
      } else {
        req.resolve(response);
      }
    }
  }]);
  return PostmessageTransport;
}(_events.EventEmitter);
exports.PostmessageTransport = PostmessageTransport;

},{"..":5,"events":25}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SimpleObservable = void 0;
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*
 * Copyright 2020 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SimpleObservable = /*#__PURE__*/function () {
  function SimpleObservable(initialFn) {
    _classCallCheck(this, SimpleObservable);
    _defineProperty(this, "listeners", []);
    if (initialFn) this.listeners.push(initialFn);
  }
  _createClass(SimpleObservable, [{
    key: "onUpdate",
    value: function onUpdate(fn) {
      this.listeners.push(fn);
    }
  }, {
    key: "update",
    value: function update(val) {
      var _iterator = _createForOfIteratorHelper(this.listeners),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var listener = _step.value;
          listener(val);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "close",
    value: function close() {
      this.listeners = []; // reset
    }
  }]);
  return SimpleObservable;
}();
exports.SimpleObservable = SimpleObservable;

},{}],25:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}]},{},[5])(5)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQ2xpZW50V2lkZ2V0QXBpLmpzIiwibGliL1N5bWJvbHMuanMiLCJsaWIvV2lkZ2V0QXBpLmpzIiwibGliL2RyaXZlci9XaWRnZXREcml2ZXIuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvaW50ZXJmYWNlcy9BcGlWZXJzaW9uLmpzIiwibGliL2ludGVyZmFjZXMvQ2FwYWJpbGl0aWVzLmpzIiwibGliL2ludGVyZmFjZXMvR2V0T3BlbklEQWN0aW9uLmpzIiwibGliL2ludGVyZmFjZXMvSVdpZGdldEFwaUVycm9yUmVzcG9uc2UuanMiLCJsaWIvaW50ZXJmYWNlcy9Nb2RhbEJ1dHRvbktpbmQuanMiLCJsaWIvaW50ZXJmYWNlcy9Nb2RhbFdpZGdldEFjdGlvbnMuanMiLCJsaWIvaW50ZXJmYWNlcy9VcGRhdGVEZWxheWVkRXZlbnRBY3Rpb24uanMiLCJsaWIvaW50ZXJmYWNlcy9XaWRnZXRBcGlBY3Rpb24uanMiLCJsaWIvaW50ZXJmYWNlcy9XaWRnZXRBcGlEaXJlY3Rpb24uanMiLCJsaWIvaW50ZXJmYWNlcy9XaWRnZXRLaW5kLmpzIiwibGliL2ludGVyZmFjZXMvV2lkZ2V0VHlwZS5qcyIsImxpYi9tb2RlbHMvV2lkZ2V0LmpzIiwibGliL21vZGVscy9XaWRnZXRFdmVudENhcGFiaWxpdHkuanMiLCJsaWIvbW9kZWxzL1dpZGdldFBhcnNlci5qcyIsImxpYi9tb2RlbHMvdmFsaWRhdGlvbi91cmwuanMiLCJsaWIvbW9kZWxzL3ZhbGlkYXRpb24vdXRpbHMuanMiLCJsaWIvdGVtcGxhdGluZy91cmwtdGVtcGxhdGUuanMiLCJsaWIvdHJhbnNwb3J0L1Bvc3RtZXNzYWdlVHJhbnNwb3J0LmpzIiwibGliL3V0aWwvU2ltcGxlT2JzZXJ2YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1OUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuQ2xpZW50V2lkZ2V0QXBpID0gdm9pZCAwO1xudmFyIF9ldmVudHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpO1xudmFyIF9Qb3N0bWVzc2FnZVRyYW5zcG9ydCA9IHJlcXVpcmUoXCIuL3RyYW5zcG9ydC9Qb3N0bWVzc2FnZVRyYW5zcG9ydFwiKTtcbnZhciBfV2lkZ2V0QXBpRGlyZWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9XaWRnZXRBcGlEaXJlY3Rpb25cIik7XG52YXIgX1dpZGdldEFwaUFjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvV2lkZ2V0QXBpQWN0aW9uXCIpO1xudmFyIF9DYXBhYmlsaXRpZXMgPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL0NhcGFiaWxpdGllc1wiKTtcbnZhciBfQXBpVmVyc2lvbiA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvQXBpVmVyc2lvblwiKTtcbnZhciBfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5ID0gcmVxdWlyZShcIi4vbW9kZWxzL1dpZGdldEV2ZW50Q2FwYWJpbGl0eVwiKTtcbnZhciBfR2V0T3BlbklEQWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9HZXRPcGVuSURBY3Rpb25cIik7XG52YXIgX1NpbXBsZU9ic2VydmFibGUgPSByZXF1aXJlKFwiLi91dGlsL1NpbXBsZU9ic2VydmFibGVcIik7XG52YXIgX1N5bWJvbHMgPSByZXF1aXJlKFwiLi9TeW1ib2xzXCIpO1xudmFyIF9VcGRhdGVEZWxheWVkRXZlbnRBY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL1VwZGF0ZURlbGF5ZWRFdmVudEFjdGlvblwiKTtcbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgcmV0dXJuIF90eXBlb2YgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBcInN5bWJvbFwiID09IHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9LCBfdHlwZW9mKG9iaik7IH1cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBlbnVtZXJhYmxlT25seSAmJiAoc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pKSwga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gbnVsbCAhPSBhcmd1bWVudHNbaV0gPyBhcmd1bWVudHNbaV0gOiB7fTsgaSAlIDIgPyBvd25LZXlzKE9iamVjdChzb3VyY2UpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKSA6IG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gcmV0dXJuIHRhcmdldDsgfVxuZnVuY3Rpb24gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIobywgYWxsb3dBcnJheUxpa2UpIHsgdmFyIGl0ID0gdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl0gfHwgb1tcIkBAaXRlcmF0b3JcIl07IGlmICghaXQpIHsgaWYgKEFycmF5LmlzQXJyYXkobykgfHwgKGl0ID0gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8pKSB8fCBhbGxvd0FycmF5TGlrZSAmJiBvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgeyBpZiAoaXQpIG8gPSBpdDsgdmFyIGkgPSAwOyB2YXIgRiA9IGZ1bmN0aW9uIEYoKSB7fTsgcmV0dXJuIHsgczogRiwgbjogZnVuY3Rpb24gbigpIHsgaWYgKGkgPj0gby5sZW5ndGgpIHJldHVybiB7IGRvbmU6IHRydWUgfTsgcmV0dXJuIHsgZG9uZTogZmFsc2UsIHZhbHVlOiBvW2krK10gfTsgfSwgZTogZnVuY3Rpb24gZShfZSkgeyB0aHJvdyBfZTsgfSwgZjogRiB9OyB9IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gaXRlcmF0ZSBub24taXRlcmFibGUgaW5zdGFuY2UuXFxuSW4gb3JkZXIgdG8gYmUgaXRlcmFibGUsIG5vbi1hcnJheSBvYmplY3RzIG11c3QgaGF2ZSBhIFtTeW1ib2wuaXRlcmF0b3JdKCkgbWV0aG9kLlwiKTsgfSB2YXIgbm9ybWFsQ29tcGxldGlvbiA9IHRydWUsIGRpZEVyciA9IGZhbHNlLCBlcnI7IHJldHVybiB7IHM6IGZ1bmN0aW9uIHMoKSB7IGl0ID0gaXQuY2FsbChvKTsgfSwgbjogZnVuY3Rpb24gbigpIHsgdmFyIHN0ZXAgPSBpdC5uZXh0KCk7IG5vcm1hbENvbXBsZXRpb24gPSBzdGVwLmRvbmU7IHJldHVybiBzdGVwOyB9LCBlOiBmdW5jdGlvbiBlKF9lMikgeyBkaWRFcnIgPSB0cnVlOyBlcnIgPSBfZTI7IH0sIGY6IGZ1bmN0aW9uIGYoKSB7IHRyeSB7IGlmICghbm9ybWFsQ29tcGxldGlvbiAmJiBpdFtcInJldHVyblwiXSAhPSBudWxsKSBpdFtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoZGlkRXJyKSB0aHJvdyBlcnI7IH0gfSB9OyB9XG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7IH1cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH1cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuZnVuY3Rpb24gX2l0ZXJhYmxlVG9BcnJheShpdGVyKSB7IGlmICh0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIGl0ZXJbU3ltYm9sLml0ZXJhdG9yXSAhPSBudWxsIHx8IGl0ZXJbXCJAQGl0ZXJhdG9yXCJdICE9IG51bGwpIHJldHVybiBBcnJheS5mcm9tKGl0ZXIpOyB9XG5mdW5jdGlvbiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShhcnIpOyB9XG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfVxuZnVuY3Rpb24gX3JlZ2VuZXJhdG9yUnVudGltZSgpIHsgXCJ1c2Ugc3RyaWN0XCI7IC8qISByZWdlbmVyYXRvci1ydW50aW1lIC0tIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLiAtLSBsaWNlbnNlIChNSVQpOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvYmxvYi9tYWluL0xJQ0VOU0UgKi8gX3JlZ2VuZXJhdG9yUnVudGltZSA9IGZ1bmN0aW9uIF9yZWdlbmVyYXRvclJ1bnRpbWUoKSB7IHJldHVybiBleHBvcnRzOyB9OyB2YXIgZXhwb3J0cyA9IHt9LCBPcCA9IE9iamVjdC5wcm90b3R5cGUsIGhhc093biA9IE9wLmhhc093blByb3BlcnR5LCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB8fCBmdW5jdGlvbiAob2JqLCBrZXksIGRlc2MpIHsgb2JqW2tleV0gPSBkZXNjLnZhbHVlOyB9LCAkU3ltYm9sID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgPyBTeW1ib2wgOiB7fSwgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiLCBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCIsIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjsgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkgeyByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogITAsIGNvbmZpZ3VyYWJsZTogITAsIHdyaXRhYmxlOiAhMCB9KSwgb2JqW2tleV07IH0gdHJ5IHsgZGVmaW5lKHt9LCBcIlwiKTsgfSBjYXRjaCAoZXJyKSB7IGRlZmluZSA9IGZ1bmN0aW9uIGRlZmluZShvYmosIGtleSwgdmFsdWUpIHsgcmV0dXJuIG9ialtrZXldID0gdmFsdWU7IH07IH0gZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkgeyB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvciwgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpLCBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pOyByZXR1cm4gZGVmaW5lUHJvcGVydHkoZ2VuZXJhdG9yLCBcIl9pbnZva2VcIiwgeyB2YWx1ZTogbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB9KSwgZ2VuZXJhdG9yOyB9IGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykgeyB0cnkgeyByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07IH0gY2F0Y2ggKGVycikgeyByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07IH0gfSBleHBvcnRzLndyYXAgPSB3cmFwOyB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9OyBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fSBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9IGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge30gdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307IGRlZmluZShJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pOyB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpOyBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJiBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiYgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSAmJiAoSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSk7IHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTsgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkgeyBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbiAobWV0aG9kKSB7IGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24gKGFyZykgeyByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTsgfSk7IH0pOyB9IGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkgeyBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkgeyB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTsgaWYgKFwidGhyb3dcIiAhPT0gcmVjb3JkLnR5cGUpIHsgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmcsIHZhbHVlID0gcmVzdWx0LnZhbHVlOyByZXR1cm4gdmFsdWUgJiYgXCJvYmplY3RcIiA9PSBfdHlwZW9mKHZhbHVlKSAmJiBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpID8gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkgeyBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpOyB9LCBmdW5jdGlvbiAoZXJyKSB7IGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTsgfSkgOiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uICh1bndyYXBwZWQpIHsgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkLCByZXNvbHZlKHJlc3VsdCk7IH0sIGZ1bmN0aW9uIChlcnJvcikgeyByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7IH0pOyB9IHJlamVjdChyZWNvcmQuYXJnKTsgfSB2YXIgcHJldmlvdXNQcm9taXNlOyBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIl9pbnZva2VcIiwgeyB2YWx1ZTogZnVuY3Rpb24gdmFsdWUobWV0aG9kLCBhcmcpIHsgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7IHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7IH0pOyB9IHJldHVybiBwcmV2aW91c1Byb21pc2UgPSBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZywgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcpIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTsgfSB9KTsgfSBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHsgdmFyIHN0YXRlID0gXCJzdXNwZW5kZWRTdGFydFwiOyByZXR1cm4gZnVuY3Rpb24gKG1ldGhvZCwgYXJnKSB7IGlmIChcImV4ZWN1dGluZ1wiID09PSBzdGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTsgaWYgKFwiY29tcGxldGVkXCIgPT09IHN0YXRlKSB7IGlmIChcInRocm93XCIgPT09IG1ldGhvZCkgdGhyb3cgYXJnOyByZXR1cm4gZG9uZVJlc3VsdCgpOyB9IGZvciAoY29udGV4dC5tZXRob2QgPSBtZXRob2QsIGNvbnRleHQuYXJnID0gYXJnOzspIHsgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTsgaWYgKGRlbGVnYXRlKSB7IHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpOyBpZiAoZGVsZWdhdGVSZXN1bHQpIHsgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTsgcmV0dXJuIGRlbGVnYXRlUmVzdWx0OyB9IH0gaWYgKFwibmV4dFwiID09PSBjb250ZXh0Lm1ldGhvZCkgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO2Vsc2UgaWYgKFwidGhyb3dcIiA9PT0gY29udGV4dC5tZXRob2QpIHsgaWYgKFwic3VzcGVuZGVkU3RhcnRcIiA9PT0gc3RhdGUpIHRocm93IHN0YXRlID0gXCJjb21wbGV0ZWRcIiwgY29udGV4dC5hcmc7IGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpOyB9IGVsc2UgXCJyZXR1cm5cIiA9PT0gY29udGV4dC5tZXRob2QgJiYgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpOyBzdGF0ZSA9IFwiZXhlY3V0aW5nXCI7IHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTsgaWYgKFwibm9ybWFsXCIgPT09IHJlY29yZC50eXBlKSB7IGlmIChzdGF0ZSA9IGNvbnRleHQuZG9uZSA/IFwiY29tcGxldGVkXCIgOiBcInN1c3BlbmRlZFlpZWxkXCIsIHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlOyByZXR1cm4geyB2YWx1ZTogcmVjb3JkLmFyZywgZG9uZTogY29udGV4dC5kb25lIH07IH0gXCJ0aHJvd1wiID09PSByZWNvcmQudHlwZSAmJiAoc3RhdGUgPSBcImNvbXBsZXRlZFwiLCBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIiwgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnKTsgfSB9OyB9IGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHsgdmFyIG1ldGhvZE5hbWUgPSBjb250ZXh0Lm1ldGhvZCwgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbbWV0aG9kTmFtZV07IGlmICh1bmRlZmluZWQgPT09IG1ldGhvZCkgcmV0dXJuIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsLCBcInRocm93XCIgPT09IG1ldGhvZE5hbWUgJiYgZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0gJiYgKGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIiwgY29udGV4dC5hcmcgPSB1bmRlZmluZWQsIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpLCBcInRocm93XCIgPT09IGNvbnRleHQubWV0aG9kKSB8fCBcInJldHVyblwiICE9PSBtZXRob2ROYW1lICYmIChjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIiwgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAnXCIgKyBtZXRob2ROYW1lICsgXCInIG1ldGhvZFwiKSksIENvbnRpbnVlU2VudGluZWw7IHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7IGlmIChcInRocm93XCIgPT09IHJlY29yZC50eXBlKSByZXR1cm4gY29udGV4dC5tZXRob2QgPSBcInRocm93XCIsIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZywgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGwsIENvbnRpbnVlU2VudGluZWw7IHZhciBpbmZvID0gcmVjb3JkLmFyZzsgcmV0dXJuIGluZm8gPyBpbmZvLmRvbmUgPyAoY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWUsIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2MsIFwicmV0dXJuXCIgIT09IGNvbnRleHQubWV0aG9kICYmIChjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiLCBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZCksIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsLCBDb250aW51ZVNlbnRpbmVsKSA6IGluZm8gOiAoY29udGV4dC5tZXRob2QgPSBcInRocm93XCIsIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpLCBjb250ZXh0LmRlbGVnYXRlID0gbnVsbCwgQ29udGludWVTZW50aW5lbCk7IH0gZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHsgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTsgMSBpbiBsb2NzICYmIChlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV0pLCAyIGluIGxvY3MgJiYgKGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdLCBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM10pLCB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7IH0gZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkgeyB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTsgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiLCBkZWxldGUgcmVjb3JkLmFyZywgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDsgfSBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7IHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV0sIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKSwgdGhpcy5yZXNldCghMCk7IH0gZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7IGlmIChpdGVyYWJsZSkgeyB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07IGlmIChpdGVyYXRvck1ldGhvZCkgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpOyBpZiAoXCJmdW5jdGlvblwiID09IHR5cGVvZiBpdGVyYWJsZS5uZXh0KSByZXR1cm4gaXRlcmFibGU7IGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkgeyB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHsgZm9yICg7ICsraSA8IGl0ZXJhYmxlLmxlbmd0aDspIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHJldHVybiBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV0sIG5leHQuZG9uZSA9ICExLCBuZXh0OyByZXR1cm4gbmV4dC52YWx1ZSA9IHVuZGVmaW5lZCwgbmV4dC5kb25lID0gITAsIG5leHQ7IH07IHJldHVybiBuZXh0Lm5leHQgPSBuZXh0OyB9IH0gcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9OyB9IGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7IHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6ICEwIH07IH0gcmV0dXJuIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCBkZWZpbmVQcm9wZXJ0eShHcCwgXCJjb25zdHJ1Y3RvclwiLCB7IHZhbHVlOiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgY29uZmlndXJhYmxlOiAhMCB9KSwgZGVmaW5lUHJvcGVydHkoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsIFwiY29uc3RydWN0b3JcIiwgeyB2YWx1ZTogR2VuZXJhdG9yRnVuY3Rpb24sIGNvbmZpZ3VyYWJsZTogITAgfSksIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKSwgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24gKGdlbkZ1bikgeyB2YXIgY3RvciA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZ2VuRnVuICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjsgcmV0dXJuICEhY3RvciAmJiAoY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHwgXCJHZW5lcmF0b3JGdW5jdGlvblwiID09PSAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpKTsgfSwgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24gKGdlbkZ1bikgeyByZXR1cm4gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpIDogKGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgZGVmaW5lKGdlbkZ1biwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yRnVuY3Rpb25cIikpLCBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCksIGdlbkZ1bjsgfSwgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uIChhcmcpIHsgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07IH0sIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSksIGRlZmluZShBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSwgYXN5bmNJdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSksIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3IsIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbiAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7IHZvaWQgMCA9PT0gUHJvbWlzZUltcGwgJiYgKFByb21pc2VJbXBsID0gUHJvbWlzZSk7IHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3Iod3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksIFByb21pc2VJbXBsKTsgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKSA/IGl0ZXIgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHsgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7IH0pOyB9LCBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApLCBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKSwgZGVmaW5lKEdwLCBpdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSksIGRlZmluZShHcCwgXCJ0b1N0cmluZ1wiLCBmdW5jdGlvbiAoKSB7IHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiOyB9KSwgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24gKHZhbCkgeyB2YXIgb2JqZWN0ID0gT2JqZWN0KHZhbCksIGtleXMgPSBbXTsgZm9yICh2YXIga2V5IGluIG9iamVjdCkga2V5cy5wdXNoKGtleSk7IHJldHVybiBrZXlzLnJldmVyc2UoKSwgZnVuY3Rpb24gbmV4dCgpIHsgZm9yICg7IGtleXMubGVuZ3RoOykgeyB2YXIga2V5ID0ga2V5cy5wb3AoKTsgaWYgKGtleSBpbiBvYmplY3QpIHJldHVybiBuZXh0LnZhbHVlID0ga2V5LCBuZXh0LmRvbmUgPSAhMSwgbmV4dDsgfSByZXR1cm4gbmV4dC5kb25lID0gITAsIG5leHQ7IH07IH0sIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzLCBDb250ZXh0LnByb3RvdHlwZSA9IHsgY29uc3RydWN0b3I6IENvbnRleHQsIHJlc2V0OiBmdW5jdGlvbiByZXNldChza2lwVGVtcFJlc2V0KSB7IGlmICh0aGlzLnByZXYgPSAwLCB0aGlzLm5leHQgPSAwLCB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkLCB0aGlzLmRvbmUgPSAhMSwgdGhpcy5kZWxlZ2F0ZSA9IG51bGwsIHRoaXMubWV0aG9kID0gXCJuZXh0XCIsIHRoaXMuYXJnID0gdW5kZWZpbmVkLCB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KSwgIXNraXBUZW1wUmVzZXQpIGZvciAodmFyIG5hbWUgaW4gdGhpcykgXCJ0XCIgPT09IG5hbWUuY2hhckF0KDApICYmIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmICFpc05hTigrbmFtZS5zbGljZSgxKSkgJiYgKHRoaXNbbmFtZV0gPSB1bmRlZmluZWQpOyB9LCBzdG9wOiBmdW5jdGlvbiBzdG9wKCkgeyB0aGlzLmRvbmUgPSAhMDsgdmFyIHJvb3RSZWNvcmQgPSB0aGlzLnRyeUVudHJpZXNbMF0uY29tcGxldGlvbjsgaWYgKFwidGhyb3dcIiA9PT0gcm9vdFJlY29yZC50eXBlKSB0aHJvdyByb290UmVjb3JkLmFyZzsgcmV0dXJuIHRoaXMucnZhbDsgfSwgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uIGRpc3BhdGNoRXhjZXB0aW9uKGV4Y2VwdGlvbikgeyBpZiAodGhpcy5kb25lKSB0aHJvdyBleGNlcHRpb247IHZhciBjb250ZXh0ID0gdGhpczsgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7IHJldHVybiByZWNvcmQudHlwZSA9IFwidGhyb3dcIiwgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbiwgY29udGV4dC5uZXh0ID0gbG9jLCBjYXVnaHQgJiYgKGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCIsIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkKSwgISFjYXVnaHQ7IH0gZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgeyB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV0sIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247IGlmIChcInJvb3RcIiA9PT0gZW50cnkudHJ5TG9jKSByZXR1cm4gaGFuZGxlKFwiZW5kXCIpOyBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikgeyB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKSwgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7IGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7IGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgITApOyBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTsgfSBlbHNlIGlmIChoYXNDYXRjaCkgeyBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsICEwKTsgfSBlbHNlIHsgaWYgKCFoYXNGaW5hbGx5KSB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTsgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7IH0gfSB9IH0sIGFicnVwdDogZnVuY3Rpb24gYWJydXB0KHR5cGUsIGFyZykgeyBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTsgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiYgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJiB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7IHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTsgYnJlYWs7IH0gfSBmaW5hbGx5RW50cnkgJiYgKFwiYnJlYWtcIiA9PT0gdHlwZSB8fCBcImNvbnRpbnVlXCIgPT09IHR5cGUpICYmIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYyAmJiAoZmluYWxseUVudHJ5ID0gbnVsbCk7IHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9OyByZXR1cm4gcmVjb3JkLnR5cGUgPSB0eXBlLCByZWNvcmQuYXJnID0gYXJnLCBmaW5hbGx5RW50cnkgPyAodGhpcy5tZXRob2QgPSBcIm5leHRcIiwgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MsIENvbnRpbnVlU2VudGluZWwpIDogdGhpcy5jb21wbGV0ZShyZWNvcmQpOyB9LCBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUocmVjb3JkLCBhZnRlckxvYykgeyBpZiAoXCJ0aHJvd1wiID09PSByZWNvcmQudHlwZSkgdGhyb3cgcmVjb3JkLmFyZzsgcmV0dXJuIFwiYnJlYWtcIiA9PT0gcmVjb3JkLnR5cGUgfHwgXCJjb250aW51ZVwiID09PSByZWNvcmQudHlwZSA/IHRoaXMubmV4dCA9IHJlY29yZC5hcmcgOiBcInJldHVyblwiID09PSByZWNvcmQudHlwZSA/ICh0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmcsIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIiwgdGhpcy5uZXh0ID0gXCJlbmRcIikgOiBcIm5vcm1hbFwiID09PSByZWNvcmQudHlwZSAmJiBhZnRlckxvYyAmJiAodGhpcy5uZXh0ID0gYWZ0ZXJMb2MpLCBDb250aW51ZVNlbnRpbmVsOyB9LCBmaW5pc2g6IGZ1bmN0aW9uIGZpbmlzaChmaW5hbGx5TG9jKSB7IGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHsgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldOyBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykgcmV0dXJuIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpLCByZXNldFRyeUVudHJ5KGVudHJ5KSwgQ29udGludWVTZW50aW5lbDsgfSB9LCBcImNhdGNoXCI6IGZ1bmN0aW9uIF9jYXRjaCh0cnlMb2MpIHsgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgeyB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07IGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykgeyB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjsgaWYgKFwidGhyb3dcIiA9PT0gcmVjb3JkLnR5cGUpIHsgdmFyIHRocm93biA9IHJlY29yZC5hcmc7IHJlc2V0VHJ5RW50cnkoZW50cnkpOyB9IHJldHVybiB0aHJvd247IH0gfSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7IH0sIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uIGRlbGVnYXRlWWllbGQoaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHsgcmV0dXJuIHRoaXMuZGVsZWdhdGUgPSB7IGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLCByZXN1bHROYW1lOiByZXN1bHROYW1lLCBuZXh0TG9jOiBuZXh0TG9jIH0sIFwibmV4dFwiID09PSB0aGlzLm1ldGhvZCAmJiAodGhpcy5hcmcgPSB1bmRlZmluZWQpLCBDb250aW51ZVNlbnRpbmVsOyB9IH0sIGV4cG9ydHM7IH1cbmZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHsgdHJ5IHsgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpOyB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlOyB9IGNhdGNoIChlcnJvcikgeyByZWplY3QoZXJyb3IpOyByZXR1cm47IH0gaWYgKGluZm8uZG9uZSkgeyByZXNvbHZlKHZhbHVlKTsgfSBlbHNlIHsgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpOyB9IH1cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHZhciBzZWxmID0gdGhpcywgYXJncyA9IGFyZ3VtZW50czsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpOyBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkgeyBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7IH0gZnVuY3Rpb24gX3Rocm93KGVycikgeyBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTsgfSBfbmV4dCh1bmRlZmluZWQpOyB9KTsgfTsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHN1YkNsYXNzLCBcInByb3RvdHlwZVwiLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTsgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZi5iaW5kKCkgOiBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH0gfVxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mLmJpbmQoKSA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsga2V5ID0gX3RvUHJvcGVydHlLZXkoa2V5KTsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHsgdmFyIGtleSA9IF90b1ByaW1pdGl2ZShhcmcsIFwic3RyaW5nXCIpOyByZXR1cm4gX3R5cGVvZihrZXkpID09PSBcInN5bWJvbFwiID8ga2V5IDogU3RyaW5nKGtleSk7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkgeyBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDsgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7IHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpOyBpZiAoX3R5cGVvZihyZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm4gcmVzOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7IH1cbmZ1bmN0aW9uIF9hc3luY0l0ZXJhdG9yKGl0ZXJhYmxlKSB7IHZhciBtZXRob2QsIGFzeW5jLCBzeW5jLCByZXRyeSA9IDI7IGZvciAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgU3ltYm9sICYmIChhc3luYyA9IFN5bWJvbC5hc3luY0l0ZXJhdG9yLCBzeW5jID0gU3ltYm9sLml0ZXJhdG9yKTsgcmV0cnktLTspIHsgaWYgKGFzeW5jICYmIG51bGwgIT0gKG1ldGhvZCA9IGl0ZXJhYmxlW2FzeW5jXSkpIHJldHVybiBtZXRob2QuY2FsbChpdGVyYWJsZSk7IGlmIChzeW5jICYmIG51bGwgIT0gKG1ldGhvZCA9IGl0ZXJhYmxlW3N5bmNdKSkgcmV0dXJuIG5ldyBBc3luY0Zyb21TeW5jSXRlcmF0b3IobWV0aG9kLmNhbGwoaXRlcmFibGUpKTsgYXN5bmMgPSBcIkBAYXN5bmNJdGVyYXRvclwiLCBzeW5jID0gXCJAQGl0ZXJhdG9yXCI7IH0gdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBpcyBub3QgYXN5bmMgaXRlcmFibGVcIik7IH1cbmZ1bmN0aW9uIEFzeW5jRnJvbVN5bmNJdGVyYXRvcihzKSB7IGZ1bmN0aW9uIEFzeW5jRnJvbVN5bmNJdGVyYXRvckNvbnRpbnVhdGlvbihyKSB7IGlmIChPYmplY3QocikgIT09IHIpIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKHIgKyBcIiBpcyBub3QgYW4gb2JqZWN0LlwiKSk7IHZhciBkb25lID0gci5kb25lOyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZG9uZTogZG9uZSB9OyB9KTsgfSByZXR1cm4gQXN5bmNGcm9tU3luY0l0ZXJhdG9yID0gZnVuY3Rpb24gQXN5bmNGcm9tU3luY0l0ZXJhdG9yKHMpIHsgdGhpcy5zID0gcywgdGhpcy5uID0gcy5uZXh0OyB9LCBBc3luY0Zyb21TeW5jSXRlcmF0b3IucHJvdG90eXBlID0geyBzOiBudWxsLCBuOiBudWxsLCBuZXh0OiBmdW5jdGlvbiBuZXh0KCkgeyByZXR1cm4gQXN5bmNGcm9tU3luY0l0ZXJhdG9yQ29udGludWF0aW9uKHRoaXMubi5hcHBseSh0aGlzLnMsIGFyZ3VtZW50cykpOyB9LCBcInJldHVyblwiOiBmdW5jdGlvbiBfcmV0dXJuKHZhbHVlKSB7IHZhciByZXQgPSB0aGlzLnNbXCJyZXR1cm5cIl07IHJldHVybiB2b2lkIDAgPT09IHJldCA/IFByb21pc2UucmVzb2x2ZSh7IHZhbHVlOiB2YWx1ZSwgZG9uZTogITAgfSkgOiBBc3luY0Zyb21TeW5jSXRlcmF0b3JDb250aW51YXRpb24ocmV0LmFwcGx5KHRoaXMucywgYXJndW1lbnRzKSk7IH0sIFwidGhyb3dcIjogZnVuY3Rpb24gX3Rocm93KHZhbHVlKSB7IHZhciB0aHIgPSB0aGlzLnNbXCJyZXR1cm5cIl07IHJldHVybiB2b2lkIDAgPT09IHRociA/IFByb21pc2UucmVqZWN0KHZhbHVlKSA6IEFzeW5jRnJvbVN5bmNJdGVyYXRvckNvbnRpbnVhdGlvbih0aHIuYXBwbHkodGhpcy5zLCBhcmd1bWVudHMpKTsgfSB9LCBuZXcgQXN5bmNGcm9tU3luY0l0ZXJhdG9yKHMpOyB9IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIENvcHlyaWdodCAyMDIwIC0gMjAyNCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyoqXG4gKiBBUEkgaGFuZGxlciBmb3IgdGhlIGNsaWVudCBzaWRlIG9mIHdpZGdldHMuIFRoaXMgcmFpc2VzIGV2ZW50c1xuICogZm9yIGVhY2ggYWN0aW9uIHJlY2VpdmVkIGFzIGBhY3Rpb246JHthY3Rpb259YCAoZWc6IFwiYWN0aW9uOnNjcmVlbnNob3RcIikuXG4gKiBEZWZhdWx0IGhhbmRsaW5nIGNhbiBiZSBwcmV2ZW50ZWQgYnkgdXNpbmcgcHJldmVudERlZmF1bHQoKSBvbiB0aGVcbiAqIHJhaXNlZCBldmVudC4gVGhlIGRlZmF1bHQgaGFuZGxpbmcgdmFyaWVzIGZvciBlYWNoIGFjdGlvbjogb25lc1xuICogd2hpY2ggdGhlIFNESyBjYW4gaGFuZGxlIHNhZmVseSBhcmUgYWNrbm93bGVkZ2VkIGFwcHJvcHJpYXRlbHkgYW5kXG4gKiBvbmVzIHdoaWNoIGFyZSB1bmhhbmRsZWQgKGN1c3RvbSBvciByZXF1aXJlIHRoZSBjbGllbnQgdG8gZG8gc29tZXRoaW5nKVxuICogYXJlIHJlamVjdGVkIHdpdGggYW4gZXJyb3IuXG4gKlxuICogRXZlbnRzIHdoaWNoIGFyZSBwcmV2ZW50RGVmYXVsdCgpZWQgbXVzdCByZXBseSB1c2luZyB0aGUgdHJhbnNwb3J0LlxuICogVGhlIGV2ZW50cyByYWlzZWQgd2lsbCBoYXZlIGEgZGVmYXVsdCBvZiBhbiBJV2lkZ2V0QXBpUmVxdWVzdFxuICogaW50ZXJmYWNlLlxuICpcbiAqIFdoZW4gdGhlIENsaWVudFdpZGdldEFwaSBpcyByZWFkeSB0byBzdGFydCBzZW5kaW5nIHJlcXVlc3RzLCBpdCB3aWxsXG4gKiByYWlzZSBhIFwicmVhZHlcIiBDdXN0b21FdmVudC4gQWZ0ZXIgdGhlIHJlYWR5IGV2ZW50IGZpcmVzLCBhY3Rpb25zIGNhblxuICogYmUgc2VudCBhbmQgdGhlIHRyYW5zcG9ydCB3aWxsIGJlIHJlYWR5LlxuICpcbiAqIFdoZW4gdGhlIHdpZGdldCBoYXMgaW5kaWNhdGVkIGl0IGhhcyBsb2FkZWQsIHRoaXMgY2xhc3MgcmFpc2VzIGFcbiAqIFwicHJlcGFyaW5nXCIgQ3VzdG9tRXZlbnQuIFRoZSBwcmVwYXJpbmcgZXZlbnQgZG9lcyBub3QgaW5kaWNhdGUgdGhhdFxuICogdGhlIHdpZGdldCBpcyByZWFkeSB0byByZWNlaXZlIGNvbW11bmljYXRpb25zIC0gdGhhdCBpcyBzaWduaWZpZWQgYnlcbiAqIHRoZSByZWFkeSBldmVudCBleGNsdXNpdmVseS5cbiAqXG4gKiBUaGlzIGNsYXNzIG9ubHkgaGFuZGxlcyBvbmUgd2lkZ2V0IGF0IGEgdGltZS5cbiAqL1xudmFyIENsaWVudFdpZGdldEFwaSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0V2ZW50RW1pdHRlcikge1xuICBfaW5oZXJpdHMoQ2xpZW50V2lkZ2V0QXBpLCBfRXZlbnRFbWl0dGVyKTtcbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihDbGllbnRXaWRnZXRBcGkpO1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjbGllbnQgd2lkZ2V0IEFQSS4gVGhpcyB3aWxsIGluc3RhbnRpYXRlIHRoZSB0cmFuc3BvcnRcbiAgICogYW5kIHN0YXJ0IGV2ZXJ5dGhpbmcuIFdoZW4gdGhlIGlmcmFtZSBpcyBsb2FkZWQgdW5kZXIgdGhlIHdpZGdldCdzXG4gICAqIGNvbmRpdGlvbnMsIGEgXCJyZWFkeVwiIGV2ZW50IHdpbGwgYmUgcmFpc2VkLlxuICAgKiBAcGFyYW0ge1dpZGdldH0gd2lkZ2V0IFRoZSB3aWRnZXQgdG8gY29tbXVuaWNhdGUgd2l0aC5cbiAgICogQHBhcmFtIHtIVE1MSUZyYW1lRWxlbWVudH0gaWZyYW1lIFRoZSBpZnJhbWUgdGhlIHdpZGdldCBpcyBpbi5cbiAgICogQHBhcmFtIHtXaWRnZXREcml2ZXJ9IGRyaXZlciBUaGUgZHJpdmVyIGZvciB0aGlzIHdpZGdldC9jbGllbnQuXG4gICAqL1xuICBmdW5jdGlvbiBDbGllbnRXaWRnZXRBcGkod2lkZ2V0LCBpZnJhbWUsIGRyaXZlcikge1xuICAgIHZhciBfdGhpcztcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2xpZW50V2lkZ2V0QXBpKTtcbiAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpO1xuICAgIF90aGlzLndpZGdldCA9IHdpZGdldDtcbiAgICBfdGhpcy5pZnJhbWUgPSBpZnJhbWU7XG4gICAgX3RoaXMuZHJpdmVyID0gZHJpdmVyO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJ0cmFuc3BvcnRcIiwgdm9pZCAwKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwiY2FjaGVkV2lkZ2V0VmVyc2lvbnNcIiwgbnVsbCk7XG4gICAgLy8gY29udGVudExvYWRlZEFjdGlvblNlbnQgaXMgdXNlZCB0byBjaGVjayB0aGF0IG9ubHkgb25lIENvbnRlbnRMb2FkZWQgcmVxdWVzdCBpcyBzZW5kLlxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJjb250ZW50TG9hZGVkQWN0aW9uU2VudFwiLCBmYWxzZSk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImFsbG93ZWRDYXBhYmlsaXRpZXNcIiwgbmV3IFNldCgpKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwiYWxsb3dlZEV2ZW50c1wiLCBbXSk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImlzU3RvcHBlZFwiLCBmYWxzZSk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInR1cm5TZXJ2ZXJzXCIsIG51bGwpO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJjb250ZW50TG9hZGVkV2FpdFRpbWVyXCIsIHZvaWQgMCk7XG4gICAgLy8gU3RvcmVzIHBlbmRpbmcgcmVxdWVzdHMgdG8gcHVzaCBhIHJvb20ncyBzdGF0ZSB0byB0aGUgd2lkZ2V0XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInB1c2hSb29tU3RhdGVUYXNrc1wiLCBuZXcgU2V0KCkpO1xuICAgIC8vIFJvb20gSUQg4oaSIGV2ZW50IHR5cGUg4oaSIHN0YXRlIGtleSDihpIgZXZlbnRzIHRvIGJlIHB1c2hlZFxuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJwdXNoUm9vbVN0YXRlUmVzdWx0XCIsIG5ldyBNYXAoKSk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcImZsdXNoUm9vbVN0YXRlVGFza1wiLCBudWxsKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwidmlld2VkUm9vbUlkXCIsIG51bGwpO1xuICAgIGlmICghKGlmcmFtZSAhPT0gbnVsbCAmJiBpZnJhbWUgIT09IHZvaWQgMCAmJiBpZnJhbWUuY29udGVudFdpbmRvdykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGlmcmFtZSBzdXBwbGllZFwiKTtcbiAgICB9XG4gICAgaWYgKCF3aWRnZXQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgd2lkZ2V0XCIpO1xuICAgIH1cbiAgICBpZiAoIWRyaXZlcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBkcml2ZXJcIik7XG4gICAgfVxuICAgIF90aGlzLnRyYW5zcG9ydCA9IG5ldyBfUG9zdG1lc3NhZ2VUcmFuc3BvcnQuUG9zdG1lc3NhZ2VUcmFuc3BvcnQoX1dpZGdldEFwaURpcmVjdGlvbi5XaWRnZXRBcGlEaXJlY3Rpb24uVG9XaWRnZXQsIHdpZGdldC5pZCwgaWZyYW1lLmNvbnRlbnRXaW5kb3csIHdpbmRvdyk7XG4gICAgX3RoaXMudHJhbnNwb3J0LnRhcmdldE9yaWdpbiA9IHdpZGdldC5vcmlnaW47XG4gICAgX3RoaXMudHJhbnNwb3J0Lm9uKFwibWVzc2FnZVwiLCBfdGhpcy5oYW5kbGVNZXNzYWdlLmJpbmQoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcykpKTtcbiAgICBpZnJhbWUuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgX3RoaXMub25JZnJhbWVMb2FkLmJpbmQoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcykpKTtcbiAgICBfdGhpcy50cmFuc3BvcnQuc3RhcnQoKTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cbiAgX2NyZWF0ZUNsYXNzKENsaWVudFdpZGdldEFwaSwgW3tcbiAgICBrZXk6IFwiaGFzQ2FwYWJpbGl0eVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYXNDYXBhYmlsaXR5KGNhcGFiaWxpdHkpIHtcbiAgICAgIHJldHVybiB0aGlzLmFsbG93ZWRDYXBhYmlsaXRpZXMuaGFzKGNhcGFiaWxpdHkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYW5Vc2VSb29tVGltZWxpbmVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FuVXNlUm9vbVRpbWVsaW5lKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHRoaXMuaGFzQ2FwYWJpbGl0eShcIm9yZy5tYXRyaXgubXNjMjc2Mi50aW1lbGluZTpcIi5jb25jYXQoX1N5bWJvbHMuU3ltYm9scy5BbnlSb29tKSkgfHwgdGhpcy5oYXNDYXBhYmlsaXR5KFwib3JnLm1hdHJpeC5tc2MyNzYyLnRpbWVsaW5lOlwiLmNvbmNhdChyb29tSWQpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2FuU2VuZFJvb21FdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5TZW5kUm9vbUV2ZW50KGV2ZW50VHlwZSkge1xuICAgICAgdmFyIG1zZ3R5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1sxXSA6IG51bGw7XG4gICAgICByZXR1cm4gdGhpcy5hbGxvd2VkRXZlbnRzLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIGUubWF0Y2hlc0FzUm9vbUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uU2VuZCwgZXZlbnRUeXBlLCBtc2d0eXBlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYW5TZW5kU3RhdGVFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5TZW5kU3RhdGVFdmVudChldmVudFR5cGUsIHN0YXRlS2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5hbGxvd2VkRXZlbnRzLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIGUubWF0Y2hlc0FzU3RhdGVFdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlNlbmQsIGV2ZW50VHlwZSwgc3RhdGVLZXkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNhblNlbmRUb0RldmljZUV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhblNlbmRUb0RldmljZUV2ZW50KGV2ZW50VHlwZSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEV2ZW50cy5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLm1hdGNoZXNBc1RvRGV2aWNlRXZlbnQoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5FdmVudERpcmVjdGlvbi5TZW5kLCBldmVudFR5cGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNhblJlY2VpdmVSb29tRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FuUmVjZWl2ZVJvb21FdmVudChldmVudFR5cGUpIHtcbiAgICAgIHZhciBtc2d0eXBlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEV2ZW50cy5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLm1hdGNoZXNBc1Jvb21FdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlJlY2VpdmUsIGV2ZW50VHlwZSwgbXNndHlwZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2FuUmVjZWl2ZVN0YXRlRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2FuUmVjZWl2ZVN0YXRlRXZlbnQoZXZlbnRUeXBlLCBzdGF0ZUtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEV2ZW50cy5zb21lKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLm1hdGNoZXNBc1N0YXRlRXZlbnQoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5FdmVudERpcmVjdGlvbi5SZWNlaXZlLCBldmVudFR5cGUsIHN0YXRlS2V5KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYW5SZWNlaXZlVG9EZXZpY2VFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjYW5SZWNlaXZlVG9EZXZpY2VFdmVudChldmVudFR5cGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmFsbG93ZWRFdmVudHMuc29tZShmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gZS5tYXRjaGVzQXNUb0RldmljZUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSwgZXZlbnRUeXBlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJjYW5SZWNlaXZlUm9vbUFjY291bnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNhblJlY2VpdmVSb29tQWNjb3VudERhdGEoZXZlbnRUeXBlKSB7XG4gICAgICByZXR1cm4gdGhpcy5hbGxvd2VkRXZlbnRzLnNvbWUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgcmV0dXJuIGUubWF0Y2hlc0FzUm9vbUFjY291bnREYXRhKF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSwgZXZlbnRUeXBlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzdG9wXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICB0aGlzLmlzU3RvcHBlZCA9IHRydWU7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5zdG9wKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImdldFdpZGdldFZlcnNpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfZ2V0V2lkZ2V0VmVyc2lvbnMgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUoKSB7XG4gICAgICAgIHZhciByO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5jYWNoZWRXaWRnZXRWZXJzaW9ucykpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIFByb21pc2UucmVzb2x2ZSh0aGlzLmNhY2hlZFdpZGdldFZlcnNpb25zKSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIF9jb250ZXh0LnByZXYgPSAyO1xuICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gNTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5TdXBwb3J0ZWRBcGlWZXJzaW9ucywge30pO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICByID0gX2NvbnRleHQuc2VudDtcbiAgICAgICAgICAgICAgdGhpcy5jYWNoZWRXaWRnZXRWZXJzaW9ucyA9IHIuc3VwcG9ydGVkX3ZlcnNpb25zO1xuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIHIuc3VwcG9ydGVkX3ZlcnNpb25zKTtcbiAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgIF9jb250ZXh0LnByZXYgPSAxMDtcbiAgICAgICAgICAgICAgX2NvbnRleHQudDAgPSBfY29udGV4dFtcImNhdGNoXCJdKDIpO1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJub24tZmF0YWwgZXJyb3IgZ2V0dGluZyBzdXBwb3J0ZWQgd2lkZ2V0IHZlcnNpb25zOiBcIiwgX2NvbnRleHQudDApO1xuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIFtdKTtcbiAgICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dC5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlLCB0aGlzLCBbWzIsIDEwXV0pO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gZ2V0V2lkZ2V0VmVyc2lvbnMoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0V2lkZ2V0VmVyc2lvbnMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRXaWRnZXRWZXJzaW9ucztcbiAgICB9KClcbiAgfSwge1xuICAgIGtleTogXCJiZWdpbkNhcGFiaWxpdGllc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBiZWdpbkNhcGFiaWxpdGllcygpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuICAgICAgLy8gd2lkZ2V0IGhhcyBsb2FkZWQgLSB0ZWxsIGFsbCB0aGUgbGlzdGVuZXJzIHRoYXRcbiAgICAgIHRoaXMuZW1pdChcInByZXBhcmluZ1wiKTtcbiAgICAgIHZhciByZXF1ZXN0ZWRDYXBzO1xuICAgICAgdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLkNhcGFiaWxpdGllcywge30pLnRoZW4oZnVuY3Rpb24gKGNhcHMpIHtcbiAgICAgICAgcmVxdWVzdGVkQ2FwcyA9IGNhcHMuY2FwYWJpbGl0aWVzO1xuICAgICAgICByZXR1cm4gX3RoaXMyLmRyaXZlci52YWxpZGF0ZUNhcGFiaWxpdGllcyhuZXcgU2V0KGNhcHMuY2FwYWJpbGl0aWVzKSk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChhbGxvd2VkQ2Fwcykge1xuICAgICAgICBfdGhpczIuYWxsb3dDYXBhYmlsaXRpZXMoX3RvQ29uc3VtYWJsZUFycmF5KGFsbG93ZWRDYXBzKSwgcmVxdWVzdGVkQ2Fwcyk7XG4gICAgICAgIF90aGlzMi5lbWl0KFwicmVhZHlcIik7XG4gICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIF90aGlzMi5lbWl0KFwiZXJyb3I6cHJlcGFyaW5nXCIsIGUpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFsbG93Q2FwYWJpbGl0aWVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFsbG93Q2FwYWJpbGl0aWVzKGFsbG93ZWQsIHJlcXVlc3RlZCkge1xuICAgICAgdmFyIF90aGlzJGFsbG93ZWRFdmVudHMsXG4gICAgICAgIF90aGlzMyA9IHRoaXM7XG4gICAgICBjb25zb2xlLmxvZyhcIldpZGdldCBcIi5jb25jYXQodGhpcy53aWRnZXQuaWQsIFwiIGlzIGFsbG93ZWQgY2FwYWJpbGl0aWVzOlwiKSwgYWxsb3dlZCk7XG4gICAgICB2YXIgX2l0ZXJhdG9yMiA9IF9jcmVhdGVGb3JPZkl0ZXJhdG9ySGVscGVyKGFsbG93ZWQpLFxuICAgICAgICBfc3RlcDI7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKF9pdGVyYXRvcjIucygpOyAhKF9zdGVwMiA9IF9pdGVyYXRvcjIubigpKS5kb25lOykge1xuICAgICAgICAgIHZhciBjID0gX3N0ZXAyLnZhbHVlO1xuICAgICAgICAgIHRoaXMuYWxsb3dlZENhcGFiaWxpdGllcy5hZGQoYyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfaXRlcmF0b3IyLmUoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9pdGVyYXRvcjIuZigpO1xuICAgICAgfVxuICAgICAgdmFyIGFsbG93ZWRFdmVudHMgPSBfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LldpZGdldEV2ZW50Q2FwYWJpbGl0eS5maW5kRXZlbnRDYXBhYmlsaXRpZXMoYWxsb3dlZCk7XG4gICAgICAoX3RoaXMkYWxsb3dlZEV2ZW50cyA9IHRoaXMuYWxsb3dlZEV2ZW50cykucHVzaC5hcHBseShfdGhpcyRhbGxvd2VkRXZlbnRzLCBfdG9Db25zdW1hYmxlQXJyYXkoYWxsb3dlZEV2ZW50cykpO1xuICAgICAgdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLk5vdGlmeUNhcGFiaWxpdGllcywge1xuICAgICAgICByZXF1ZXN0ZWQ6IHJlcXVlc3RlZCxcbiAgICAgICAgYXBwcm92ZWQ6IEFycmF5LmZyb20odGhpcy5hbGxvd2VkQ2FwYWJpbGl0aWVzKVxuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJub24tZmF0YWwgZXJyb3Igbm90aWZ5aW5nIHdpZGdldCBvZiBhcHByb3ZlZCBjYXBhYmlsaXRpZXM6XCIsIGUpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzMy5lbWl0KFwiY2FwYWJpbGl0aWVzTm90aWZpZWRcIik7XG4gICAgICB9KTtcblxuICAgICAgLy8gUHVzaCB0aGUgaW5pdGlhbCByb29tIHN0YXRlIGZvciBhbGwgcm9vbXMgd2l0aCBhIHRpbWVsaW5lIGNhcGFiaWxpdHlcbiAgICAgIHZhciBfaXRlcmF0b3IzID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIoYWxsb3dlZCksXG4gICAgICAgIF9zdGVwMztcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAoX2l0ZXJhdG9yMy5zKCk7ICEoX3N0ZXAzID0gX2l0ZXJhdG9yMy5uKCkpLmRvbmU7KSB7XG4gICAgICAgICAgdmFyIF9jID0gX3N0ZXAzLnZhbHVlO1xuICAgICAgICAgIGlmICgoMCwgX0NhcGFiaWxpdGllcy5pc1RpbWVsaW5lQ2FwYWJpbGl0eSkoX2MpKSB7XG4gICAgICAgICAgICB2YXIgcm9vbUlkID0gKDAsIF9DYXBhYmlsaXRpZXMuZ2V0VGltZWxpbmVSb29tSURGcm9tQ2FwYWJpbGl0eSkoX2MpO1xuICAgICAgICAgICAgaWYgKHJvb21JZCA9PT0gX1N5bWJvbHMuU3ltYm9scy5BbnlSb29tKSB7XG4gICAgICAgICAgICAgIHZhciBfaXRlcmF0b3I0ID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIodGhpcy5kcml2ZXIuZ2V0S25vd25Sb29tcygpKSxcbiAgICAgICAgICAgICAgICBfc3RlcDQ7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yIChfaXRlcmF0b3I0LnMoKTsgIShfc3RlcDQgPSBfaXRlcmF0b3I0Lm4oKSkuZG9uZTspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBfcm9vbUlkID0gX3N0ZXA0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoUm9vbVN0YXRlKF9yb29tSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yNC5lKGVycik7XG4gICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgX2l0ZXJhdG9yNC5mKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMucHVzaFJvb21TdGF0ZShyb29tSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiBuZXcgZXZlbnRzIGFyZSBhbGxvd2VkIGFuZCB0aGUgY3VycmVudGx5IHZpZXdlZCByb29tIGlzbid0IGNvdmVyZWRcbiAgICAgICAgLy8gYnkgYSB0aW1lbGluZSBjYXBhYmlsaXR5LCB0aGVuIHdlIGtub3cgdGhhdCB0aGVyZSBjb3VsZCBiZSBzb21lIHN0YXRlXG4gICAgICAgIC8vIGluIHRoZSB2aWV3ZWQgcm9vbSB0aGF0IHRoZSB3aWRnZXQgaGFzbid0IGxlYXJuZWQgYWJvdXQgeWV0LSBwdXNoIGl0LlxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9pdGVyYXRvcjMuZShlcnIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgX2l0ZXJhdG9yMy5mKCk7XG4gICAgICB9XG4gICAgICBpZiAoYWxsb3dlZEV2ZW50cy5sZW5ndGggPiAwICYmIHRoaXMudmlld2VkUm9vbUlkICE9PSBudWxsICYmICF0aGlzLmNhblVzZVJvb21UaW1lbGluZSh0aGlzLnZpZXdlZFJvb21JZCkpIHtcbiAgICAgICAgdGhpcy5wdXNoUm9vbVN0YXRlKHRoaXMudmlld2VkUm9vbUlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwib25JZnJhbWVMb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uSWZyYW1lTG9hZChldikge1xuICAgICAgaWYgKHRoaXMud2lkZ2V0LndhaXRGb3JJZnJhbWVMb2FkKSB7XG4gICAgICAgIC8vIElmIHRoZSB3aWRnZXQgaXMgc2V0IHRvIHdhaXRGb3JJZnJhbWVMb2FkIHRoZSBjYXBhYmlsaXRpZXMgaW1tZWRpYXRlbHkgZ2V0IHNldHVwIGFmdGVyIGxvYWQuXG4gICAgICAgIC8vIFRoZSBjbGllbnQgZG9lcyBub3Qgd2FpdCBmb3IgdGhlIENvbnRlbnRMb2FkZWQgYWN0aW9uLlxuICAgICAgICB0aGlzLmJlZ2luQ2FwYWJpbGl0aWVzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZWFjaGluZyB0aGlzIG1lYW5zLCB0aGF0IHRoZSBJZnJhbWUgZ290IHJlbG9hZGVkL2xvYWRlZCBhbmRcbiAgICAgICAgLy8gdGhlIGNsaWVudEFwaSBpcyBhd2FpdGluZyB0aGUgRklSU1QgQ29udGVudExvYWRlZCBhY3Rpb24uXG4gICAgICAgIGNvbnNvbGUubG9nKFwid2FpdEZvcklmcmFtZUxvYWQgaXMgZmFsc2U6IHdhaXRpbmcgZm9yIHdpZGdldCB0byBzZW5kIGNvbnRlbnRMb2FkZWRcIik7XG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZFdhaXRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJXaWRnZXQgc3BlY2lmaWVkIHdhaXRGb3JJZnJhbWVMb2FkPWZhbHNlIGJ1dCB0aW1lZCBvdXQgd2FpdGluZyBmb3IgY29udGVudExvYWRlZCBldmVudCFcIik7XG4gICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgdGhpcy5jb250ZW50TG9hZGVkQWN0aW9uU2VudCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVDb250ZW50TG9hZGVkQWN0aW9uXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUNvbnRlbnRMb2FkZWRBY3Rpb24oYWN0aW9uKSB7XG4gICAgICBpZiAodGhpcy5jb250ZW50TG9hZGVkV2FpdFRpbWVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuY29udGVudExvYWRlZFdhaXRUaW1lcik7XG4gICAgICAgIHRoaXMuY29udGVudExvYWRlZFdhaXRUaW1lciA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbnRlbnRMb2FkZWRBY3Rpb25TZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkltcHJvcGVyIHNlcXVlbmNlOiBDb250ZW50TG9hZGVkIEFjdGlvbiBjYW4gb25seSBiZSBzZW50IG9uY2UgYWZ0ZXIgdGhlIHdpZGdldCBsb2FkZWQgXCIgKyBcImFuZCBzaG91bGQgb25seSBiZSB1c2VkIGlmIHdhaXRGb3JJZnJhbWVMb2FkIGlzIGZhbHNlIChkZWZhdWx0PXRydWUpXCIpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMud2lkZ2V0LndhaXRGb3JJZnJhbWVMb2FkKSB7XG4gICAgICAgIHRoaXMudHJhbnNwb3J0LnJlcGx5KGFjdGlvbiwge1xuICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIkltcHJvcGVyIHNlcXVlbmNlOiBub3QgZXhwZWN0aW5nIENvbnRlbnRMb2FkZWQgZXZlbnQgaWYgXCIgKyBcIndhaXRGb3JJZnJhbWVMb2FkIGlzIHRydWUgKGRlZmF1bHQ9dHJ1ZSlcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRyYW5zcG9ydC5yZXBseShhY3Rpb24sIHt9KTtcbiAgICAgICAgdGhpcy5iZWdpbkNhcGFiaWxpdGllcygpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb250ZW50TG9hZGVkQWN0aW9uU2VudCA9IHRydWU7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInJlcGx5VmVyc2lvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVwbHlWZXJzaW9ucyhyZXF1ZXN0KSB7XG4gICAgICB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgIHN1cHBvcnRlZF92ZXJzaW9uczogX0FwaVZlcnNpb24uQ3VycmVudEFwaVZlcnNpb25zXG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic3VwcG9ydHNVcGRhdGVTdGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3N1cHBvcnRzVXBkYXRlU3RhdGUgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUyKCkge1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTIkKF9jb250ZXh0Mikge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0Mi5wcmV2ID0gX2NvbnRleHQyLm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQyLm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRXaWRnZXRWZXJzaW9ucygpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLmFicnVwdChcInJldHVyblwiLCBfY29udGV4dDIuc2VudC5pbmNsdWRlcyhfQXBpVmVyc2lvbi5VbnN0YWJsZUFwaVZlcnNpb24uTVNDMjc2Ml9VUERBVEVfU1RBVEUpKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Mi5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMiwgdGhpcyk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBzdXBwb3J0c1VwZGF0ZVN0YXRlKCkge1xuICAgICAgICByZXR1cm4gX3N1cHBvcnRzVXBkYXRlU3RhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdXBwb3J0c1VwZGF0ZVN0YXRlO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZUNhcGFiaWxpdGllc1JlbmVnb3RpYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUNhcGFiaWxpdGllc1JlbmVnb3RpYXRlKHJlcXVlc3QpIHtcbiAgICAgIHZhciBfcmVxdWVzdCRkYXRhLFxuICAgICAgICBfdGhpczQgPSB0aGlzO1xuICAgICAgLy8gYWNrbm93bGVkZ2UgZmlyc3RcbiAgICAgIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHt9KTtcbiAgICAgIHZhciByZXF1ZXN0ZWQgPSAoKF9yZXF1ZXN0JGRhdGEgPSByZXF1ZXN0LmRhdGEpID09PSBudWxsIHx8IF9yZXF1ZXN0JGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9yZXF1ZXN0JGRhdGEuY2FwYWJpbGl0aWVzKSB8fCBbXTtcbiAgICAgIHZhciBuZXdseVJlcXVlc3RlZCA9IG5ldyBTZXQocmVxdWVzdGVkLmZpbHRlcihmdW5jdGlvbiAocikge1xuICAgICAgICByZXR1cm4gIV90aGlzNC5oYXNDYXBhYmlsaXR5KHIpO1xuICAgICAgfSkpO1xuICAgICAgaWYgKG5ld2x5UmVxdWVzdGVkLnNpemUgPT09IDApIHtcbiAgICAgICAgLy8gTm90aGluZyB0byBkbyAtIHNraXAgdmFsaWRhdGlvblxuICAgICAgICB0aGlzLmFsbG93Q2FwYWJpbGl0aWVzKFtdLCBbXSk7XG4gICAgICB9XG4gICAgICB0aGlzLmRyaXZlci52YWxpZGF0ZUNhcGFiaWxpdGllcyhuZXdseVJlcXVlc3RlZCkudGhlbihmdW5jdGlvbiAoYWxsb3dlZCkge1xuICAgICAgICByZXR1cm4gX3RoaXM0LmFsbG93Q2FwYWJpbGl0aWVzKF90b0NvbnN1bWFibGVBcnJheShhbGxvd2VkKSwgX3RvQ29uc3VtYWJsZUFycmF5KG5ld2x5UmVxdWVzdGVkKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlTmF2aWdhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFuZGxlTmF2aWdhdGUocmVxdWVzdCkge1xuICAgICAgdmFyIF9yZXF1ZXN0JGRhdGEyLFxuICAgICAgICBfcmVxdWVzdCRkYXRhMyxcbiAgICAgICAgX3RoaXM1ID0gdGhpcztcbiAgICAgIGlmICghdGhpcy5oYXNDYXBhYmlsaXR5KF9DYXBhYmlsaXRpZXMuTWF0cml4Q2FwYWJpbGl0aWVzLk1TQzI5MzFOYXZpZ2F0ZSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgbWVzc2FnZTogXCJNaXNzaW5nIGNhcGFiaWxpdHlcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoISgoX3JlcXVlc3QkZGF0YTIgPSByZXF1ZXN0LmRhdGEpICE9PSBudWxsICYmIF9yZXF1ZXN0JGRhdGEyICE9PSB2b2lkIDAgJiYgX3JlcXVlc3QkZGF0YTIudXJpKSB8fCAhKChfcmVxdWVzdCRkYXRhMyA9IHJlcXVlc3QuZGF0YSkgIT09IG51bGwgJiYgX3JlcXVlc3QkZGF0YTMgIT09IHZvaWQgMCAmJiBfcmVxdWVzdCRkYXRhMy51cmkudG9TdHJpbmcoKS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9tYXRyaXgudG8vI1wiKSkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgbWVzc2FnZTogXCJJbnZhbGlkIG1hdHJpeC50byBVUklcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIgb25FcnIgPSBmdW5jdGlvbiBvbkVycihlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbQ2xpZW50V2lkZ2V0QXBpXSBGYWlsZWQgdG8gaGFuZGxlIG5hdmlnYXRpb246IFwiLCBlKTtcbiAgICAgICAgX3RoaXM1LmhhbmRsZURyaXZlckVycm9yKGUsIHJlcXVlc3QsIFwiRXJyb3IgaGFuZGxpbmcgbmF2aWdhdGlvblwiKTtcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmRyaXZlci5uYXZpZ2F0ZShyZXF1ZXN0LmRhdGEudXJpLnRvU3RyaW5nKCkpW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICByZXR1cm4gb25FcnIoZSk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpczUudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHt9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBvbkVycihlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlT0lEQ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVPSURDKHJlcXVlc3QpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuICAgICAgdmFyIHBoYXNlID0gMTsgLy8gMSA9IGluaXRpYWwgcmVxdWVzdCwgMiA9IGFmdGVyIHVzZXIgbWFudWFsIGNvbmZpcm1hdGlvblxuXG4gICAgICB2YXIgcmVwbHlTdGF0ZSA9IGZ1bmN0aW9uIHJlcGx5U3RhdGUoc3RhdGUsIGNyZWRlbnRpYWwpIHtcbiAgICAgICAgY3JlZGVudGlhbCA9IGNyZWRlbnRpYWwgfHwge307XG4gICAgICAgIGlmIChwaGFzZSA+IDEpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXM2LnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uT3BlbklEQ3JlZGVudGlhbHMsIF9vYmplY3RTcHJlYWQoe1xuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLFxuICAgICAgICAgICAgb3JpZ2luYWxfcmVxdWVzdF9pZDogcmVxdWVzdC5yZXF1ZXN0SWRcbiAgICAgICAgICB9LCBjcmVkZW50aWFsKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzNi50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwgX29iamVjdFNwcmVhZCh7XG4gICAgICAgICAgICBzdGF0ZTogc3RhdGVcbiAgICAgICAgICB9LCBjcmVkZW50aWFsKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB2YXIgcmVwbHlFcnJvciA9IGZ1bmN0aW9uIHJlcGx5RXJyb3IobXNnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJbQ2xpZW50V2lkZ2V0QXBpXSBGYWlsZWQgdG8gaGFuZGxlIE9JREM6IFwiLCBtc2cpO1xuICAgICAgICBpZiAocGhhc2UgPiAxKSB7XG4gICAgICAgICAgLy8gV2UgZG9uJ3QgaGF2ZSBhIHdheSB0byBpbmRpY2F0ZSB0aGF0IGEgcmFuZG9tIGVycm9yIGhhcHBlbmVkIGluIHRoaXMgZmxvdywgc29cbiAgICAgICAgICAvLyBqdXN0IGJsb2NrIHRoZSBhdHRlbXB0LlxuICAgICAgICAgIHJldHVybiByZXBseVN0YXRlKF9HZXRPcGVuSURBY3Rpb24uT3BlbklEUmVxdWVzdFN0YXRlLkJsb2NrZWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfdGhpczYudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgIG1lc3NhZ2U6IG1zZ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IF9TaW1wbGVPYnNlcnZhYmxlLlNpbXBsZU9ic2VydmFibGUoZnVuY3Rpb24gKHVwZGF0ZSkge1xuICAgICAgICBpZiAodXBkYXRlLnN0YXRlID09PSBfR2V0T3BlbklEQWN0aW9uLk9wZW5JRFJlcXVlc3RTdGF0ZS5QZW5kaW5nVXNlckNvbmZpcm1hdGlvbiAmJiBwaGFzZSA+IDEpIHtcbiAgICAgICAgICBvYnNlcnZlci5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybiByZXBseUVycm9yKFwiY2xpZW50IHByb3ZpZGVkIG91dC1vZi1waGFzZSByZXNwb25zZSB0byBPSURDIGZsb3dcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuUGVuZGluZ1VzZXJDb25maXJtYXRpb24pIHtcbiAgICAgICAgICByZXBseVN0YXRlKHVwZGF0ZS5zdGF0ZSk7XG4gICAgICAgICAgcGhhc2UrKztcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuQWxsb3dlZCAmJiAhdXBkYXRlLnRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5RXJyb3IoXCJjbGllbnQgcHJvdmlkZWQgaW52YWxpZCBPSURDIHRva2VuIGZvciBhbiBhbGxvd2VkIHJlcXVlc3RcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVwZGF0ZS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuQmxvY2tlZCkge1xuICAgICAgICAgIHVwZGF0ZS50b2tlbiA9IHVuZGVmaW5lZDsgLy8ganVzdCBpbiBjYXNlIHRoZSBjbGllbnQgZGlkIHNvbWV0aGluZyB3ZWlyZFxuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuIHJlcGx5U3RhdGUodXBkYXRlLnN0YXRlLCB1cGRhdGUudG9rZW4pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmRyaXZlci5hc2tPcGVuSUQob2JzZXJ2ZXIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVSZWFkUm9vbUFjY291bnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlYWRSb29tQWNjb3VudERhdGEocmVxdWVzdCkge1xuICAgICAgdmFyIF90aGlzNyA9IHRoaXM7XG4gICAgICB2YXIgZXZlbnRzID0gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgIGV2ZW50cyA9IHRoaXMuZHJpdmVyLnJlYWRSb29tQWNjb3VudERhdGEocmVxdWVzdC5kYXRhLnR5cGUpO1xuICAgICAgaWYgKCF0aGlzLmNhblJlY2VpdmVSb29tQWNjb3VudERhdGEocmVxdWVzdC5kYXRhLnR5cGUpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiQ2Fubm90IHJlYWQgcm9vbSBhY2NvdW50IGRhdGEgb2YgdGhpcyB0eXBlXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGV2ZW50cy50aGVuKGZ1bmN0aW9uIChldnMpIHtcbiAgICAgICAgX3RoaXM3LnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgZXZlbnRzOiBldnNcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlUmVhZEV2ZW50c1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2hhbmRsZVJlYWRFdmVudHMgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUzKHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIF90aGlzOCA9IHRoaXM7XG4gICAgICAgIHZhciBhc2tSb29tSWRzLCBfaXRlcmF0b3I1LCBfc3RlcDUsIHJvb21JZCwgbGltaXQsIHNpbmNlLCBzdGF0ZUtleSwgbXNndHlwZSwgX3N0YXRlS2V5LCBldmVudHM7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlMyQoX2NvbnRleHQzKSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQzLnByZXYgPSBfY29udGV4dDMubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAocmVxdWVzdC5kYXRhLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkludmFsaWQgcmVxdWVzdCAtIG1pc3NpbmcgZXZlbnQgdHlwZVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIGlmICghKHJlcXVlc3QuZGF0YS5saW1pdCAhPT0gdW5kZWZpbmVkICYmICghcmVxdWVzdC5kYXRhLmxpbWl0IHx8IHJlcXVlc3QuZGF0YS5saW1pdCA8IDApKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW52YWxpZCByZXF1ZXN0IC0gbGltaXQgb3V0IG9mIHJhbmdlXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaWYgKCEocmVxdWVzdC5kYXRhLnJvb21faWRzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA4O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFza1Jvb21JZHMgPSB0aGlzLnZpZXdlZFJvb21JZCA9PT0gbnVsbCA/IFtdIDogW3RoaXMudmlld2VkUm9vbUlkXTtcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAzMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGlmICghKHJlcXVlc3QuZGF0YS5yb29tX2lkcyA9PT0gX1N5bWJvbHMuU3ltYm9scy5BbnlSb29tKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYXNrUm9vbUlkcyA9IHRoaXMuZHJpdmVyLmdldEtub3duUm9vbXMoKS5maWx0ZXIoZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczguY2FuVXNlUm9vbVRpbWVsaW5lKHJvb21JZCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDMwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgIGFza1Jvb21JZHMgPSByZXF1ZXN0LmRhdGEucm9vbV9pZHM7XG4gICAgICAgICAgICAgIF9pdGVyYXRvcjUgPSBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihhc2tSb29tSWRzKTtcbiAgICAgICAgICAgICAgX2NvbnRleHQzLnByZXYgPSAxNDtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yNS5zKCk7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICBpZiAoKF9zdGVwNSA9IF9pdGVyYXRvcjUubigpKS5kb25lKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAyMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByb29tSWQgPSBfc3RlcDUudmFsdWU7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNhblVzZVJvb21UaW1lbGluZShyb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAyMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiVW5hYmxlIHRvIGFjY2VzcyByb29tIHRpbWVsaW5lOiBcIi5jb25jYXQocm9vbUlkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxNjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDIyOlxuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI3O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjQ6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5wcmV2ID0gMjQ7XG4gICAgICAgICAgICAgIF9jb250ZXh0My50MCA9IF9jb250ZXh0M1tcImNhdGNoXCJdKDE0KTtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yNS5lKF9jb250ZXh0My50MCk7XG4gICAgICAgICAgICBjYXNlIDI3OlxuICAgICAgICAgICAgICBfY29udGV4dDMucHJldiA9IDI3O1xuICAgICAgICAgICAgICBfaXRlcmF0b3I1LmYoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5maW5pc2goMjcpO1xuICAgICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgICAgbGltaXQgPSByZXF1ZXN0LmRhdGEubGltaXQgfHwgMDtcbiAgICAgICAgICAgICAgc2luY2UgPSByZXF1ZXN0LmRhdGEuc2luY2U7XG4gICAgICAgICAgICAgIHN0YXRlS2V5ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBtc2d0eXBlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICBpZiAoIShyZXF1ZXN0LmRhdGEuc3RhdGVfa2V5ICE9PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA0MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzdGF0ZUtleSA9IHJlcXVlc3QuZGF0YS5zdGF0ZV9rZXkgPT09IHRydWUgPyB1bmRlZmluZWQgOiByZXF1ZXN0LmRhdGEuc3RhdGVfa2V5LnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNhblJlY2VpdmVTdGF0ZUV2ZW50KHJlcXVlc3QuZGF0YS50eXBlLCAoX3N0YXRlS2V5ID0gc3RhdGVLZXkpICE9PSBudWxsICYmIF9zdGF0ZUtleSAhPT0gdm9pZCAwID8gX3N0YXRlS2V5IDogbnVsbCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDM4O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDMuYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJDYW5ub3QgcmVhZCBzdGF0ZSBldmVudHMgb2YgdGhpcyB0eXBlXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNDM7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgbXNndHlwZSA9IHJlcXVlc3QuZGF0YS5tc2d0eXBlO1xuICAgICAgICAgICAgICBpZiAodGhpcy5jYW5SZWNlaXZlUm9vbUV2ZW50KHJlcXVlc3QuZGF0YS50eXBlLCBtc2d0eXBlKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNDM7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkNhbm5vdCByZWFkIHJvb20gZXZlbnRzIG9mIHRoaXMgdHlwZVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjYXNlIDQzOlxuICAgICAgICAgICAgICBpZiAoIShyZXF1ZXN0LmRhdGEucm9vbV9pZHMgPT09IHVuZGVmaW5lZCAmJiBhc2tSb29tSWRzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDUwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIEZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3ZSBzdGlsbCBjYWxsIHRoZSBkZXByZWNhdGVkXG4gICAgICAgICAgICAgIC8vIHJlYWRSb29tRXZlbnRzIGFuZCByZWFkU3RhdGVFdmVudHMgbWV0aG9kcyBpbiBjYXNlIHRoZSBjbGllbnQgaXNuJ3RcbiAgICAgICAgICAgICAgLy8gbGV0dGluZyB1cyBrbm93IHRoZSBjdXJyZW50bHkgdmlld2VkIHJvb20gdmlhIHNldFZpZXdlZFJvb21JZFxuICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAvLyBUaGlzIGNhbiBiZSBjb25zaWRlcmVkIGFzIGEgZGVwcmVjYXRlZCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICAgICAgLy8gQSBkcml2ZXIgc2hvdWxkIGNhbGwgYHNldFZpZXdlZFJvb21JZGAgb24gdGhlIHdpZGdldCBtZXNzYWdpbmcgYW5kIGltcGxlbWVudCB0aGUgbmV3IHJlYWRSb29tU3RhdGUgYW5kIHJlYWRSb29tVGltZWxpbmVcbiAgICAgICAgICAgICAgLy8gTWV0aG9kcy5cbiAgICAgICAgICAgICAgLy8gVGhpcyBibG9jayBtYWtlcyBzdXJlIHRoYXQgaXQgaXMgYWxzbyBwb3NzaWJsZSB0byBub3QgdXNlIHNldFZpZXdlZFJvb21JZC5cbiAgICAgICAgICAgICAgLy8gcmVhZFJvb21UaW1lbGluZSBhbmQgcmVhZFJvb21TdGF0ZSBhcmUgcmVxdWlyZWQgaG93ZXZlciEgT3RoZXJ3aXNlIHdpZGdldCByZXF1ZXN0cyB0aGF0IGluY2x1ZGVcbiAgICAgICAgICAgICAgLy8gYHJvb21faWRzYCB3aWxsIGZhaWwuXG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlRoZSB3aWRnZXREcml2ZXIgdXNlcyBkZXByZWNhdGVkIGJlaGF2aW91cjpcXG4gSXQgZG9lcyBub3Qgc2V0IHRoZSB2aWV3ZWRSb29tSWQgdXNpbmcgYHNldFZpZXdlZFJvb21JZGBcIik7XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNDc7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXR1cm5zIFtdIHdpdGggdGhlIGN1cnJlbnQgZHJpdmVyIG9mIEVsZW1lbnQgV2ViLlxuICAgICAgICAgICAgICAgIC8vIEFkZCBkZWZhdWx0IGltcGxlbWVudGF0aW9ucyBvZiB0aGUgYHJlYWRSb29tRXZlbnRzYCBhbmQgYHJlYWRTdGF0ZUV2ZW50c2BcbiAgICAgICAgICAgICAgICAvLyBtZXRob2RzIHRvIHVzZSBgcmVhZFJvb21UaW1lbGluZWAgYW5kIGByZWFkUm9vbVN0YXRlYCBpZiB0aGV5IGFyZSBub3Qgb3ZlcndyaXR0ZW4uXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5kYXRhLnN0YXRlX2tleSA9PT0gdW5kZWZpbmVkID8gdGhpcy5kcml2ZXIucmVhZFJvb21FdmVudHMocmVxdWVzdC5kYXRhLnR5cGUsIG1zZ3R5cGUsIGxpbWl0LCBudWxsLCBzaW5jZSkgOiB0aGlzLmRyaXZlci5yZWFkU3RhdGVFdmVudHMocmVxdWVzdC5kYXRhLnR5cGUsIHN0YXRlS2V5LCBsaW1pdCwgbnVsbClcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgNDc6XG4gICAgICAgICAgICAgIGV2ZW50cyA9IF9jb250ZXh0My5zZW50O1xuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDY4O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTA6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNTI7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnN1cHBvcnRzVXBkYXRlU3RhdGUoKTtcbiAgICAgICAgICAgIGNhc2UgNTI6XG4gICAgICAgICAgICAgIGlmICghX2NvbnRleHQzLnNlbnQpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDU4O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNTU7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChhc2tSb29tSWRzLm1hcChmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzOC5kcml2ZXIucmVhZFJvb21UaW1lbGluZShyb29tSWQsIHJlcXVlc3QuZGF0YS50eXBlLCBtc2d0eXBlLCBzdGF0ZUtleSwgbGltaXQsIHNpbmNlKTtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSA1NTpcbiAgICAgICAgICAgICAgZXZlbnRzID0gX2NvbnRleHQzLnNlbnQuZmxhdCgxKTtcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA2ODtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU4OlxuICAgICAgICAgICAgICBpZiAoIShyZXF1ZXN0LmRhdGEuc3RhdGVfa2V5ID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA2NDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDYxO1xuICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoYXNrUm9vbUlkcy5tYXAoZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczguZHJpdmVyLnJlYWRSb29tVGltZWxpbmUocm9vbUlkLCByZXF1ZXN0LmRhdGEudHlwZSwgbXNndHlwZSwgc3RhdGVLZXksIGxpbWl0LCBzaW5jZSk7XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgNjE6XG4gICAgICAgICAgICAgIF9jb250ZXh0My50MSA9IF9jb250ZXh0My5zZW50O1xuICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDY3O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjQ6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gNjY7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChhc2tSb29tSWRzLm1hcChmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90aGlzOC5kcml2ZXIucmVhZFJvb21TdGF0ZShyb29tSWQsIHJlcXVlc3QuZGF0YS50eXBlLCBzdGF0ZUtleSk7XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgNjY6XG4gICAgICAgICAgICAgIF9jb250ZXh0My50MSA9IF9jb250ZXh0My5zZW50O1xuICAgICAgICAgICAgY2FzZSA2NzpcbiAgICAgICAgICAgICAgZXZlbnRzID0gX2NvbnRleHQzLnQxLmZsYXQoMSk7XG4gICAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgICB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXZlbnRzOiBldmVudHNcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIDY5OlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQzLnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIF9jYWxsZWUzLCB0aGlzLCBbWzE0LCAyNCwgMjcsIDMwXV0pO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVhZEV2ZW50cyhfeCkge1xuICAgICAgICByZXR1cm4gX2hhbmRsZVJlYWRFdmVudHMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYW5kbGVSZWFkRXZlbnRzO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVNlbmRFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVTZW5kRXZlbnQocmVxdWVzdCkge1xuICAgICAgdmFyIF90aGlzOSA9IHRoaXM7XG4gICAgICBpZiAoIXJlcXVlc3QuZGF0YS50eXBlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW52YWxpZCByZXF1ZXN0IC0gbWlzc2luZyBldmVudCB0eXBlXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKCEhcmVxdWVzdC5kYXRhLnJvb21faWQgJiYgIXRoaXMuY2FuVXNlUm9vbVRpbWVsaW5lKHJlcXVlc3QuZGF0YS5yb29tX2lkKSkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIlVuYWJsZSB0byBhY2Nlc3Mgcm9vbSB0aW1lbGluZTogXCIuY29uY2F0KHJlcXVlc3QuZGF0YS5yb29tX2lkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIgaXNEZWxheWVkRXZlbnQgPSByZXF1ZXN0LmRhdGEuZGVsYXkgIT09IHVuZGVmaW5lZCB8fCByZXF1ZXN0LmRhdGEucGFyZW50X2RlbGF5X2lkICE9PSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaXNEZWxheWVkRXZlbnQgJiYgIXRoaXMuaGFzQ2FwYWJpbGl0eShfQ2FwYWJpbGl0aWVzLk1hdHJpeENhcGFiaWxpdGllcy5NU0M0MTU3U2VuZERlbGF5ZWRFdmVudCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgbWVzc2FnZTogXCJNaXNzaW5nIGNhcGFiaWxpdHlcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIgc2VuZEV2ZW50UHJvbWlzZTtcbiAgICAgIGlmIChyZXF1ZXN0LmRhdGEuc3RhdGVfa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhblNlbmRTdGF0ZUV2ZW50KHJlcXVlc3QuZGF0YS50eXBlLCByZXF1ZXN0LmRhdGEuc3RhdGVfa2V5KSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICBtZXNzYWdlOiBcIkNhbm5vdCBzZW5kIHN0YXRlIGV2ZW50cyBvZiB0aGlzIHR5cGVcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNEZWxheWVkRXZlbnQpIHtcbiAgICAgICAgICBzZW5kRXZlbnRQcm9taXNlID0gdGhpcy5kcml2ZXIuc2VuZEV2ZW50KHJlcXVlc3QuZGF0YS50eXBlLCByZXF1ZXN0LmRhdGEuY29udGVudCB8fCB7fSwgcmVxdWVzdC5kYXRhLnN0YXRlX2tleSwgcmVxdWVzdC5kYXRhLnJvb21faWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBfcmVxdWVzdCRkYXRhJGRlbGF5LCBfcmVxdWVzdCRkYXRhJHBhcmVudF87XG4gICAgICAgICAgc2VuZEV2ZW50UHJvbWlzZSA9IHRoaXMuZHJpdmVyLnNlbmREZWxheWVkRXZlbnQoKF9yZXF1ZXN0JGRhdGEkZGVsYXkgPSByZXF1ZXN0LmRhdGEuZGVsYXkpICE9PSBudWxsICYmIF9yZXF1ZXN0JGRhdGEkZGVsYXkgIT09IHZvaWQgMCA/IF9yZXF1ZXN0JGRhdGEkZGVsYXkgOiBudWxsLCAoX3JlcXVlc3QkZGF0YSRwYXJlbnRfID0gcmVxdWVzdC5kYXRhLnBhcmVudF9kZWxheV9pZCkgIT09IG51bGwgJiYgX3JlcXVlc3QkZGF0YSRwYXJlbnRfICE9PSB2b2lkIDAgPyBfcmVxdWVzdCRkYXRhJHBhcmVudF8gOiBudWxsLCByZXF1ZXN0LmRhdGEudHlwZSwgcmVxdWVzdC5kYXRhLmNvbnRlbnQgfHwge30sIHJlcXVlc3QuZGF0YS5zdGF0ZV9rZXksIHJlcXVlc3QuZGF0YS5yb29tX2lkKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNvbnRlbnQgPSByZXF1ZXN0LmRhdGEuY29udGVudCB8fCB7fTtcbiAgICAgICAgdmFyIG1zZ3R5cGUgPSBjb250ZW50W1wibXNndHlwZVwiXTtcbiAgICAgICAgaWYgKCF0aGlzLmNhblNlbmRSb29tRXZlbnQocmVxdWVzdC5kYXRhLnR5cGUsIG1zZ3R5cGUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgIG1lc3NhZ2U6IFwiQ2Fubm90IHNlbmQgcm9vbSBldmVudHMgb2YgdGhpcyB0eXBlXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzRGVsYXllZEV2ZW50KSB7XG4gICAgICAgICAgc2VuZEV2ZW50UHJvbWlzZSA9IHRoaXMuZHJpdmVyLnNlbmRFdmVudChyZXF1ZXN0LmRhdGEudHlwZSwgY29udGVudCwgbnVsbCxcbiAgICAgICAgICAvLyBub3Qgc2VuZGluZyBhIHN0YXRlIGV2ZW50XG4gICAgICAgICAgcmVxdWVzdC5kYXRhLnJvb21faWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBfcmVxdWVzdCRkYXRhJGRlbGF5MiwgX3JlcXVlc3QkZGF0YSRwYXJlbnRfMjtcbiAgICAgICAgICBzZW5kRXZlbnRQcm9taXNlID0gdGhpcy5kcml2ZXIuc2VuZERlbGF5ZWRFdmVudCgoX3JlcXVlc3QkZGF0YSRkZWxheTIgPSByZXF1ZXN0LmRhdGEuZGVsYXkpICE9PSBudWxsICYmIF9yZXF1ZXN0JGRhdGEkZGVsYXkyICE9PSB2b2lkIDAgPyBfcmVxdWVzdCRkYXRhJGRlbGF5MiA6IG51bGwsIChfcmVxdWVzdCRkYXRhJHBhcmVudF8yID0gcmVxdWVzdC5kYXRhLnBhcmVudF9kZWxheV9pZCkgIT09IG51bGwgJiYgX3JlcXVlc3QkZGF0YSRwYXJlbnRfMiAhPT0gdm9pZCAwID8gX3JlcXVlc3QkZGF0YSRwYXJlbnRfMiA6IG51bGwsIHJlcXVlc3QuZGF0YS50eXBlLCBjb250ZW50LCBudWxsLFxuICAgICAgICAgIC8vIG5vdCBzZW5kaW5nIGEgc3RhdGUgZXZlbnRcbiAgICAgICAgICByZXF1ZXN0LmRhdGEucm9vbV9pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbmRFdmVudFByb21pc2UudGhlbihmdW5jdGlvbiAoc2VudEV2ZW50KSB7XG4gICAgICAgIHJldHVybiBfdGhpczkudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIF9vYmplY3RTcHJlYWQoe1xuICAgICAgICAgIHJvb21faWQ6IHNlbnRFdmVudC5yb29tSWRcbiAgICAgICAgfSwgXCJldmVudElkXCIgaW4gc2VudEV2ZW50ID8ge1xuICAgICAgICAgIGV2ZW50X2lkOiBzZW50RXZlbnQuZXZlbnRJZFxuICAgICAgICB9IDoge1xuICAgICAgICAgIGRlbGF5X2lkOiBzZW50RXZlbnQuZGVsYXlJZFxuICAgICAgICB9KSk7XG4gICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvciBzZW5kaW5nIGV2ZW50OiBcIiwgZSk7XG4gICAgICAgIF90aGlzOS5oYW5kbGVEcml2ZXJFcnJvcihlLCByZXF1ZXN0LCBcIkVycm9yIHNlbmRpbmcgZXZlbnRcIik7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlVXBkYXRlRGVsYXllZEV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZURlbGF5ZWRFdmVudChyZXF1ZXN0KSB7XG4gICAgICB2YXIgX3RoaXMxMCA9IHRoaXM7XG4gICAgICBpZiAoIXJlcXVlc3QuZGF0YS5kZWxheV9pZCkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIkludmFsaWQgcmVxdWVzdCAtIG1pc3NpbmcgZGVsYXlfaWRcIlxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMuaGFzQ2FwYWJpbGl0eShfQ2FwYWJpbGl0aWVzLk1hdHJpeENhcGFiaWxpdGllcy5NU0M0MTU3VXBkYXRlRGVsYXllZEV2ZW50KSkge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBcIk1pc3NpbmcgY2FwYWJpbGl0eVwiXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAocmVxdWVzdC5kYXRhLmFjdGlvbikge1xuICAgICAgICBjYXNlIF9VcGRhdGVEZWxheWVkRXZlbnRBY3Rpb24uVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uLkNhbmNlbDpcbiAgICAgICAgY2FzZSBfVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uLlVwZGF0ZURlbGF5ZWRFdmVudEFjdGlvbi5SZXN0YXJ0OlxuICAgICAgICBjYXNlIF9VcGRhdGVEZWxheWVkRXZlbnRBY3Rpb24uVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uLlNlbmQ6XG4gICAgICAgICAgdGhpcy5kcml2ZXIudXBkYXRlRGVsYXllZEV2ZW50KHJlcXVlc3QuZGF0YS5kZWxheV9pZCwgcmVxdWVzdC5kYXRhLmFjdGlvbikudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3RoaXMxMC50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge30pO1xuICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvciB1cGRhdGluZyBkZWxheWVkIGV2ZW50OiBcIiwgZSk7XG4gICAgICAgICAgICBfdGhpczEwLmhhbmRsZURyaXZlckVycm9yKGUsIHJlcXVlc3QsIFwiRXJyb3IgdXBkYXRpbmcgZGVsYXllZCBldmVudFwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgbWVzc2FnZTogXCJJbnZhbGlkIHJlcXVlc3QgLSB1bnN1cHBvcnRlZCBhY3Rpb25cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVTZW5kVG9EZXZpY2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9oYW5kbGVTZW5kVG9EZXZpY2UgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWU0KHJlcXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWU0JChfY29udGV4dDQpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dDQucHJldiA9IF9jb250ZXh0NC5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGlmIChyZXF1ZXN0LmRhdGEudHlwZSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gNTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDM7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW52YWxpZCByZXF1ZXN0IC0gbWlzc2luZyBldmVudCB0eXBlXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDMxO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuZGF0YS5tZXNzYWdlcykge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gMTA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSA4O1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkludmFsaWQgcmVxdWVzdCAtIG1pc3NpbmcgZXZlbnQgY29udGVudHNcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gMzE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgaWYgKCEodHlwZW9mIHJlcXVlc3QuZGF0YS5lbmNyeXB0ZWQgIT09IFwiYm9vbGVhblwiKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gMTU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSAxMztcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJJbnZhbGlkIHJlcXVlc3QgLSBtaXNzaW5nIGVuY3J5cHRpb24gZmxhZ1wiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gMzE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuU2VuZFRvRGV2aWNlRXZlbnQocmVxdWVzdC5kYXRhLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSAyMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDE4O1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkNhbm5vdCBzZW5kIHRvLWRldmljZSBldmVudHMgb2YgdGhpcyB0eXBlXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSAxODpcbiAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSAzMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDIwOlxuICAgICAgICAgICAgICBfY29udGV4dDQucHJldiA9IDIwO1xuICAgICAgICAgICAgICBfY29udGV4dDQubmV4dCA9IDIzO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kcml2ZXIuc2VuZFRvRGV2aWNlKHJlcXVlc3QuZGF0YS50eXBlLCByZXF1ZXN0LmRhdGEuZW5jcnlwdGVkLCByZXF1ZXN0LmRhdGEubWVzc2FnZXMpO1xuICAgICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSAyNTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHt9KTtcbiAgICAgICAgICAgIGNhc2UgMjU6XG4gICAgICAgICAgICAgIF9jb250ZXh0NC5uZXh0ID0gMzE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgX2NvbnRleHQ0LnByZXYgPSAyNztcbiAgICAgICAgICAgICAgX2NvbnRleHQ0LnQwID0gX2NvbnRleHQ0W1wiY2F0Y2hcIl0oMjApO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3Igc2VuZGluZyB0by1kZXZpY2UgZXZlbnRcIiwgX2NvbnRleHQ0LnQwKTtcbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVEcml2ZXJFcnJvcihfY29udGV4dDQudDAsIHJlcXVlc3QsIFwiRXJyb3Igc2VuZGluZyBldmVudFwiKTtcbiAgICAgICAgICAgIGNhc2UgMzE6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDQuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTQsIHRoaXMsIFtbMjAsIDI3XV0pO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlU2VuZFRvRGV2aWNlKF94Mikge1xuICAgICAgICByZXR1cm4gX2hhbmRsZVNlbmRUb0RldmljZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhbmRsZVNlbmRUb0RldmljZTtcbiAgICB9KClcbiAgfSwge1xuICAgIGtleTogXCJwb2xsVHVyblNlcnZlcnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9wb2xsVHVyblNlcnZlcnMgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWU1KHR1cm5TZXJ2ZXJzLCBpbml0aWFsU2VydmVyKSB7XG4gICAgICAgIHZhciBfaXRlcmF0b3JBYnJ1cHRDb21wbGV0aW9uLCBfZGlkSXRlcmF0b3JFcnJvciwgX2l0ZXJhdG9yRXJyb3IsIF9pdGVyYXRvciwgX3N0ZXAsIHNlcnZlcjtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWU1JChfY29udGV4dDUpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dDUucHJldiA9IF9jb250ZXh0NS5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIF9jb250ZXh0NS5wcmV2ID0gMDtcbiAgICAgICAgICAgICAgX2NvbnRleHQ1Lm5leHQgPSAzO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLlVwZGF0ZVR1cm5TZXJ2ZXJzLCBpbml0aWFsU2VydmVyIC8vIGl0J3MgY29tcGF0aWJsZSwgYnV0IG1pc3NpbmcgdGhlIGluZGV4IHNpZ25hdHVyZVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAvLyBQaWNrIHRoZSBnZW5lcmF0b3IgdXAgd2hlcmUgd2UgbGVmdCBvZmZcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yQWJydXB0Q29tcGxldGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgICBfY29udGV4dDUucHJldiA9IDU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvciA9IF9hc3luY0l0ZXJhdG9yKHR1cm5TZXJ2ZXJzKTtcbiAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgX2NvbnRleHQ1Lm5leHQgPSA5O1xuICAgICAgICAgICAgICByZXR1cm4gX2l0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgaWYgKCEoX2l0ZXJhdG9yQWJydXB0Q29tcGxldGlvbiA9ICEoX3N0ZXAgPSBfY29udGV4dDUuc2VudCkuZG9uZSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDE2O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHNlcnZlciA9IF9zdGVwLnZhbHVlO1xuICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDEzO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLlVwZGF0ZVR1cm5TZXJ2ZXJzLCBzZXJ2ZXIgLy8gaXQncyBjb21wYXRpYmxlLCBidXQgbWlzc2luZyB0aGUgaW5kZXggc2lnbmF0dXJlXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICBfaXRlcmF0b3JBYnJ1cHRDb21wbGV0aW9uID0gZmFsc2U7XG4gICAgICAgICAgICAgIF9jb250ZXh0NS5uZXh0ID0gNztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDIyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICAgIF9jb250ZXh0NS5wcmV2ID0gMTg7XG4gICAgICAgICAgICAgIF9jb250ZXh0NS50MCA9IF9jb250ZXh0NVtcImNhdGNoXCJdKDUpO1xuICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gX2NvbnRleHQ1LnQwO1xuICAgICAgICAgICAgY2FzZSAyMjpcbiAgICAgICAgICAgICAgX2NvbnRleHQ1LnByZXYgPSAyMjtcbiAgICAgICAgICAgICAgX2NvbnRleHQ1LnByZXYgPSAyMztcbiAgICAgICAgICAgICAgaWYgKCEoX2l0ZXJhdG9yQWJydXB0Q29tcGxldGlvbiAmJiBfaXRlcmF0b3JbXCJyZXR1cm5cIl0gIT0gbnVsbCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDI3O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0NS5uZXh0ID0gMjc7XG4gICAgICAgICAgICAgIHJldHVybiBfaXRlcmF0b3JbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgIGNhc2UgMjc6XG4gICAgICAgICAgICAgIF9jb250ZXh0NS5wcmV2ID0gMjc7XG4gICAgICAgICAgICAgIGlmICghX2RpZEl0ZXJhdG9yRXJyb3IpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDMwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yO1xuICAgICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0NS5maW5pc2goMjcpO1xuICAgICAgICAgICAgY2FzZSAzMTpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0NS5maW5pc2goMjIpO1xuICAgICAgICAgICAgY2FzZSAzMjpcbiAgICAgICAgICAgICAgX2NvbnRleHQ1Lm5leHQgPSAzNztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM0OlxuICAgICAgICAgICAgICBfY29udGV4dDUucHJldiA9IDM0O1xuICAgICAgICAgICAgICBfY29udGV4dDUudDEgPSBfY29udGV4dDVbXCJjYXRjaFwiXSgwKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yIHBvbGxpbmcgZm9yIFRVUk4gc2VydmVyc1wiLCBfY29udGV4dDUudDEpO1xuICAgICAgICAgICAgY2FzZSAzNzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0NS5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlNSwgdGhpcywgW1swLCAzNF0sIFs1LCAxOCwgMjIsIDMyXSwgWzIzLCwgMjcsIDMxXV0pO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gcG9sbFR1cm5TZXJ2ZXJzKF94MywgX3g0KSB7XG4gICAgICAgIHJldHVybiBfcG9sbFR1cm5TZXJ2ZXJzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcG9sbFR1cm5TZXJ2ZXJzO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVdhdGNoVHVyblNlcnZlcnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9oYW5kbGVXYXRjaFR1cm5TZXJ2ZXJzID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlNihyZXF1ZXN0KSB7XG4gICAgICAgIHZhciB0dXJuU2VydmVycywgX3lpZWxkJHR1cm5TZXJ2ZXJzJG5lLCBkb25lLCB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWU2JChfY29udGV4dDYpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dDYucHJldiA9IF9jb250ZXh0Ni5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGlmICh0aGlzLmhhc0NhcGFiaWxpdHkoX0NhcGFiaWxpdGllcy5NYXRyaXhDYXBhYmlsaXRpZXMuTVNDMzg0NlR1cm5TZXJ2ZXJzKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0Ni5uZXh0ID0gNTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDYubmV4dCA9IDM7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTWlzc2luZyBjYXBhYmlsaXR5XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICBfY29udGV4dDYubmV4dCA9IDMwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgaWYgKCF0aGlzLnR1cm5TZXJ2ZXJzKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ2Lm5leHQgPSAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDYubmV4dCA9IDg7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7fSk7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIF9jb250ZXh0Ni5uZXh0ID0gMzA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ2LnByZXYgPSAxMDtcbiAgICAgICAgICAgICAgdHVyblNlcnZlcnMgPSB0aGlzLmRyaXZlci5nZXRUdXJuU2VydmVycygpOyAvLyBQZWVrIGF0IHRoZSBmaXJzdCByZXN1bHQsIHNvIHdlIGNhbiBhdCBsZWFzdCB2ZXJpZnkgdGhhdCB0aGVcbiAgICAgICAgICAgICAgLy8gY2xpZW50IGlzbid0IGJhbm5lZCBmcm9tIGdldHRpbmcgVFVSTiBzZXJ2ZXJzIGVudGlyZWx5XG4gICAgICAgICAgICAgIF9jb250ZXh0Ni5uZXh0ID0gMTQ7XG4gICAgICAgICAgICAgIHJldHVybiB0dXJuU2VydmVycy5uZXh0KCk7XG4gICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICBfeWllbGQkdHVyblNlcnZlcnMkbmUgPSBfY29udGV4dDYuc2VudDtcbiAgICAgICAgICAgICAgZG9uZSA9IF95aWVsZCR0dXJuU2VydmVycyRuZS5kb25lO1xuICAgICAgICAgICAgICB2YWx1ZSA9IF95aWVsZCR0dXJuU2VydmVycyRuZS52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ2Lm5leHQgPSAxOTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgcmVmdXNlcyB0byBwcm92aWRlIGFueSBUVVJOIHNlcnZlcnNcIik7XG4gICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICBfY29udGV4dDYubmV4dCA9IDIxO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge30pO1xuICAgICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgICAgLy8gU3RhcnQgdGhlIHBvbGwgbG9vcCwgc2VuZGluZyB0aGUgd2lkZ2V0IHRoZSBpbml0aWFsIHJlc3VsdFxuICAgICAgICAgICAgICB0aGlzLnBvbGxUdXJuU2VydmVycyh0dXJuU2VydmVycywgdmFsdWUpO1xuICAgICAgICAgICAgICB0aGlzLnR1cm5TZXJ2ZXJzID0gdHVyblNlcnZlcnM7XG4gICAgICAgICAgICAgIF9jb250ZXh0Ni5uZXh0ID0gMzA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICAgICAgX2NvbnRleHQ2LnByZXYgPSAyNTtcbiAgICAgICAgICAgICAgX2NvbnRleHQ2LnQwID0gX2NvbnRleHQ2W1wiY2F0Y2hcIl0oMTApO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3IgZ2V0dGluZyBmaXJzdCBUVVJOIHNlcnZlciByZXN1bHRzXCIsIF9jb250ZXh0Ni50MCk7XG4gICAgICAgICAgICAgIF9jb250ZXh0Ni5uZXh0ID0gMzA7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiVFVSTiBzZXJ2ZXJzIG5vdCBhdmFpbGFibGVcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIDMwOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQ2LnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIF9jYWxsZWU2LCB0aGlzLCBbWzEwLCAyNV1dKTtcbiAgICAgIH0pKTtcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVdhdGNoVHVyblNlcnZlcnMoX3g1KSB7XG4gICAgICAgIHJldHVybiBfaGFuZGxlV2F0Y2hUdXJuU2VydmVycy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhbmRsZVdhdGNoVHVyblNlcnZlcnM7XG4gICAgfSgpXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlVW53YXRjaFR1cm5TZXJ2ZXJzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfaGFuZGxlVW53YXRjaFR1cm5TZXJ2ZXJzID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlNyhyZXF1ZXN0KSB7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlNyQoX2NvbnRleHQ3KSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQ3LnByZXYgPSBfY29udGV4dDcubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAodGhpcy5oYXNDYXBhYmlsaXR5KF9DYXBhYmlsaXRpZXMuTWF0cml4Q2FwYWJpbGl0aWVzLk1TQzM4NDZUdXJuU2VydmVycykpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDcubmV4dCA9IDU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSAzO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIk1pc3NpbmcgY2FwYWJpbGl0eVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSAxNTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgIGlmICh0aGlzLnR1cm5TZXJ2ZXJzKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDcubmV4dCA9IDg7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7fSk7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIF9jb250ZXh0Ny5uZXh0ID0gMTU7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHVyblNlcnZlcnNbXCJyZXR1cm5cIl0odW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgIHRoaXMudHVyblNlcnZlcnMgPSBudWxsO1xuICAgICAgICAgICAgICBfY29udGV4dDcubmV4dCA9IDE1O1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge30pO1xuICAgICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Ny5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlNywgdGhpcyk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBoYW5kbGVVbndhdGNoVHVyblNlcnZlcnMoX3g2KSB7XG4gICAgICAgIHJldHVybiBfaGFuZGxlVW53YXRjaFR1cm5TZXJ2ZXJzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFuZGxlVW53YXRjaFR1cm5TZXJ2ZXJzO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVJlYWRSZWxhdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9oYW5kbGVSZWFkUmVsYXRpb25zID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlOChyZXF1ZXN0KSB7XG4gICAgICAgIHZhciBfdGhpczExID0gdGhpcztcbiAgICAgICAgdmFyIHJlc3VsdCwgY2h1bms7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlOCQoX2NvbnRleHQ4KSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQ4LnByZXYgPSBfY29udGV4dDgubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAocmVxdWVzdC5kYXRhLmV2ZW50X2lkKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ4Lm5leHQgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDguYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgICAgbWVzc2FnZTogXCJJbnZhbGlkIHJlcXVlc3QgLSBtaXNzaW5nIGV2ZW50IElEXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgaWYgKCEocmVxdWVzdC5kYXRhLmxpbWl0ICE9PSB1bmRlZmluZWQgJiYgcmVxdWVzdC5kYXRhLmxpbWl0IDwgMCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDgubmV4dCA9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0OC5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkludmFsaWQgcmVxdWVzdCAtIGxpbWl0IG91dCBvZiByYW5nZVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgIGlmICghKHJlcXVlc3QuZGF0YS5yb29tX2lkICE9PSB1bmRlZmluZWQgJiYgIXRoaXMuY2FuVXNlUm9vbVRpbWVsaW5lKHJlcXVlc3QuZGF0YS5yb29tX2lkKSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDgubmV4dCA9IDY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0OC5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlVuYWJsZSB0byBhY2Nlc3Mgcm9vbSB0aW1lbGluZTogXCIuY29uY2F0KHJlcXVlc3QuZGF0YS5yb29tX2lkKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICBfY29udGV4dDgucHJldiA9IDY7XG4gICAgICAgICAgICAgIF9jb250ZXh0OC5uZXh0ID0gOTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZHJpdmVyLnJlYWRFdmVudFJlbGF0aW9ucyhyZXF1ZXN0LmRhdGEuZXZlbnRfaWQsIHJlcXVlc3QuZGF0YS5yb29tX2lkLCByZXF1ZXN0LmRhdGEucmVsX3R5cGUsIHJlcXVlc3QuZGF0YS5ldmVudF90eXBlLCByZXF1ZXN0LmRhdGEuZnJvbSwgcmVxdWVzdC5kYXRhLnRvLCByZXF1ZXN0LmRhdGEubGltaXQsIHJlcXVlc3QuZGF0YS5kaXJlY3Rpb24pO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICByZXN1bHQgPSBfY29udGV4dDguc2VudDtcbiAgICAgICAgICAgICAgLy8gb25seSByZXR1cm4gZXZlbnRzIHRoYXQgdGhlIHVzZXIgaGFzIHRoZSBwZXJtaXNzaW9uIHRvIHJlY2VpdmVcbiAgICAgICAgICAgICAgY2h1bmsgPSByZXN1bHQuY2h1bmsuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUuc3RhdGVfa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfdGhpczExLmNhblJlY2VpdmVTdGF0ZUV2ZW50KGUudHlwZSwgZS5zdGF0ZV9rZXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMxMS5jYW5SZWNlaXZlUm9vbUV2ZW50KGUudHlwZSwgZS5jb250ZW50W1wibXNndHlwZVwiXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0OC5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGNodW5rOiBjaHVuayxcbiAgICAgICAgICAgICAgICBwcmV2X2JhdGNoOiByZXN1bHQucHJldkJhdGNoLFxuICAgICAgICAgICAgICAgIG5leHRfYmF0Y2g6IHJlc3VsdC5uZXh0QmF0Y2hcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ4LnByZXYgPSAxNDtcbiAgICAgICAgICAgICAgX2NvbnRleHQ4LnQwID0gX2NvbnRleHQ4W1wiY2F0Y2hcIl0oNik7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJlcnJvciBnZXR0aW5nIHRoZSByZWxhdGlvbnNcIiwgX2NvbnRleHQ4LnQwKTtcbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVEcml2ZXJFcnJvcihfY29udGV4dDgudDAsIHJlcXVlc3QsIFwiVW5leHBlY3RlZCBlcnJvciB3aGlsZSByZWFkaW5nIHJlbGF0aW9uc1wiKTtcbiAgICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDguc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTgsIHRoaXMsIFtbNiwgMTRdXSk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZWFkUmVsYXRpb25zKF94Nykge1xuICAgICAgICByZXR1cm4gX2hhbmRsZVJlYWRSZWxhdGlvbnMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYW5kbGVSZWFkUmVsYXRpb25zO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVVzZXJEaXJlY3RvcnlTZWFyY2hcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9oYW5kbGVVc2VyRGlyZWN0b3J5U2VhcmNoID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlOShyZXF1ZXN0KSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlOSQoX2NvbnRleHQ5KSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQ5LnByZXYgPSBfY29udGV4dDkubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAodGhpcy5oYXNDYXBhYmlsaXR5KF9DYXBhYmlsaXRpZXMuTWF0cml4Q2FwYWJpbGl0aWVzLk1TQzM5NzNVc2VyRGlyZWN0b3J5U2VhcmNoKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0OS5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQ5LmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTWlzc2luZyBjYXBhYmlsaXR5XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgaWYgKCEodHlwZW9mIHJlcXVlc3QuZGF0YS5zZWFyY2hfdGVybSAhPT0gXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDkubmV4dCA9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0OS5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIkludmFsaWQgcmVxdWVzdCAtIG1pc3Npbmcgc2VhcmNoIHRlcm1cIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBpZiAoIShyZXF1ZXN0LmRhdGEubGltaXQgIT09IHVuZGVmaW5lZCAmJiByZXF1ZXN0LmRhdGEubGltaXQgPCAwKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0OS5uZXh0ID0gNjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQ5LmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW52YWxpZCByZXF1ZXN0IC0gbGltaXQgb3V0IG9mIHJhbmdlXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgX2NvbnRleHQ5LnByZXYgPSA2O1xuICAgICAgICAgICAgICBfY29udGV4dDkubmV4dCA9IDk7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmRyaXZlci5zZWFyY2hVc2VyRGlyZWN0b3J5KHJlcXVlc3QuZGF0YS5zZWFyY2hfdGVybSwgcmVxdWVzdC5kYXRhLmxpbWl0KTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gX2NvbnRleHQ5LnNlbnQ7XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDkuYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICBsaW1pdGVkOiByZXN1bHQubGltaXRlZCxcbiAgICAgICAgICAgICAgICByZXN1bHRzOiByZXN1bHQucmVzdWx0cy5tYXAoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJfaWQ6IHIudXNlcklkLFxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5X25hbWU6IHIuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHIuYXZhdGFyVXJsXG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgIF9jb250ZXh0OS5wcmV2ID0gMTM7XG4gICAgICAgICAgICAgIF9jb250ZXh0OS50MCA9IF9jb250ZXh0OVtcImNhdGNoXCJdKDYpO1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiZXJyb3Igc2VhcmNoaW5nIGluIHRoZSB1c2VyIGRpcmVjdG9yeVwiLCBfY29udGV4dDkudDApO1xuICAgICAgICAgICAgICB0aGlzLmhhbmRsZURyaXZlckVycm9yKF9jb250ZXh0OS50MCwgcmVxdWVzdCwgXCJVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHNlYXJjaGluZyBpbiB0aGUgdXNlciBkaXJlY3RvcnlcIik7XG4gICAgICAgICAgICBjYXNlIDE3OlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQ5LnN0b3AoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIF9jYWxsZWU5LCB0aGlzLCBbWzYsIDEzXV0pO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlVXNlckRpcmVjdG9yeVNlYXJjaChfeDgpIHtcbiAgICAgICAgcmV0dXJuIF9oYW5kbGVVc2VyRGlyZWN0b3J5U2VhcmNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFuZGxlVXNlckRpcmVjdG9yeVNlYXJjaDtcbiAgICB9KClcbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVHZXRNZWRpYUNvbmZpZ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2hhbmRsZUdldE1lZGlhQ29uZmlnID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlMTAocmVxdWVzdCkge1xuICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTEwJChfY29udGV4dDEwKSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQxMC5wcmV2ID0gX2NvbnRleHQxMC5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGlmICh0aGlzLmhhc0NhcGFiaWxpdHkoX0NhcGFiaWxpdGllcy5NYXRyaXhDYXBhYmlsaXRpZXMuTVNDNDAzOVVwbG9hZEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQxMC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMC5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIk1pc3NpbmcgY2FwYWJpbGl0eVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIF9jb250ZXh0MTAucHJldiA9IDI7XG4gICAgICAgICAgICAgIF9jb250ZXh0MTAubmV4dCA9IDU7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmRyaXZlci5nZXRNZWRpYUNvbmZpZygpO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICByZXN1bHQgPSBfY29udGV4dDEwLnNlbnQ7XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDEwLmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCByZXN1bHQpKTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgX2NvbnRleHQxMC5wcmV2ID0gOTtcbiAgICAgICAgICAgICAgX2NvbnRleHQxMC50MCA9IF9jb250ZXh0MTBbXCJjYXRjaFwiXSgyKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yIHdoaWxlIGdldHRpbmcgdGhlIG1lZGlhIGNvbmZpZ3VyYXRpb25cIiwgX2NvbnRleHQxMC50MCk7XG4gICAgICAgICAgICAgIHRoaXMuaGFuZGxlRHJpdmVyRXJyb3IoX2NvbnRleHQxMC50MCwgcmVxdWVzdCwgXCJVbmV4cGVjdGVkIGVycm9yIHdoaWxlIGdldHRpbmcgdGhlIG1lZGlhIGNvbmZpZ3VyYXRpb25cIik7XG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMC5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMTAsIHRoaXMsIFtbMiwgOV1dKTtcbiAgICAgIH0pKTtcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUdldE1lZGlhQ29uZmlnKF94OSkge1xuICAgICAgICByZXR1cm4gX2hhbmRsZUdldE1lZGlhQ29uZmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFuZGxlR2V0TWVkaWFDb25maWc7XG4gICAgfSgpXG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlVXBsb2FkRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2hhbmRsZVVwbG9hZEZpbGUgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUxMShyZXF1ZXN0KSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlMTEkKF9jb250ZXh0MTEpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dDExLnByZXYgPSBfY29udGV4dDExLm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzQ2FwYWJpbGl0eShfQ2FwYWJpbGl0aWVzLk1hdHJpeENhcGFiaWxpdGllcy5NU0M0MDM5VXBsb2FkRmlsZSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDExLm5leHQgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDExLmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiTWlzc2luZyBjYXBhYmlsaXR5XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgX2NvbnRleHQxMS5wcmV2ID0gMjtcbiAgICAgICAgICAgICAgX2NvbnRleHQxMS5uZXh0ID0gNTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZHJpdmVyLnVwbG9hZEZpbGUocmVxdWVzdC5kYXRhLmZpbGUpO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICByZXN1bHQgPSBfY29udGV4dDExLnNlbnQ7XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDExLmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgICAgICAgY29udGVudF91cmk6IHJlc3VsdC5jb250ZW50VXJpXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgX2NvbnRleHQxMS5wcmV2ID0gOTtcbiAgICAgICAgICAgICAgX2NvbnRleHQxMS50MCA9IF9jb250ZXh0MTFbXCJjYXRjaFwiXSgyKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yIHdoaWxlIHVwbG9hZGluZyBhIGZpbGVcIiwgX2NvbnRleHQxMS50MCk7XG4gICAgICAgICAgICAgIHRoaXMuaGFuZGxlRHJpdmVyRXJyb3IoX2NvbnRleHQxMS50MCwgcmVxdWVzdCwgXCJVbmV4cGVjdGVkIGVycm9yIHdoaWxlIHVwbG9hZGluZyBhIGZpbGVcIik7XG4gICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMS5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMTEsIHRoaXMsIFtbMiwgOV1dKTtcbiAgICAgIH0pKTtcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVVwbG9hZEZpbGUoX3gxMCkge1xuICAgICAgICByZXR1cm4gX2hhbmRsZVVwbG9hZEZpbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYW5kbGVVcGxvYWRGaWxlO1xuICAgIH0oKVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZURvd25sb2FkRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2hhbmRsZURvd25sb2FkRmlsZSA9IF9hc3luY1RvR2VuZXJhdG9yKCAvKiNfX1BVUkVfXyovX3JlZ2VuZXJhdG9yUnVudGltZSgpLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTEyKHJlcXVlc3QpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUxMiQoX2NvbnRleHQxMikge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0MTIucHJldiA9IF9jb250ZXh0MTIubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAodGhpcy5oYXNDYXBhYmlsaXR5KF9DYXBhYmlsaXRpZXMuTWF0cml4Q2FwYWJpbGl0aWVzLk1TQzQwMzlEb3dubG9hZEZpbGUpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQxMi5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMi5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIk1pc3NpbmcgY2FwYWJpbGl0eVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIF9jb250ZXh0MTIucHJldiA9IDI7XG4gICAgICAgICAgICAgIF9jb250ZXh0MTIubmV4dCA9IDU7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmRyaXZlci5kb3dubG9hZEZpbGUocmVxdWVzdC5kYXRhLmNvbnRlbnRfdXJpKTtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgcmVzdWx0ID0gX2NvbnRleHQxMi5zZW50O1xuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMi5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQucmVwbHkocmVxdWVzdCwge1xuICAgICAgICAgICAgICAgIGZpbGU6IHJlc3VsdC5maWxlXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgX2NvbnRleHQxMi5wcmV2ID0gOTtcbiAgICAgICAgICAgICAgX2NvbnRleHQxMi50MCA9IF9jb250ZXh0MTJbXCJjYXRjaFwiXSgyKTtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcImVycm9yIHdoaWxlIGRvd25sb2FkaW5nIGEgZmlsZVwiLCBfY29udGV4dDEyLnQwKTtcbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVEcml2ZXJFcnJvcihfY29udGV4dDEyLnQwLCByZXF1ZXN0LCBcIlVuZXhwZWN0ZWQgZXJyb3Igd2hpbGUgZG93bmxvYWRpbmcgYSBmaWxlXCIpO1xuICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0MTIuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTEyLCB0aGlzLCBbWzIsIDldXSk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBoYW5kbGVEb3dubG9hZEZpbGUoX3gxMSkge1xuICAgICAgICByZXR1cm4gX2hhbmRsZURvd25sb2FkRmlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGhhbmRsZURvd25sb2FkRmlsZTtcbiAgICB9KClcbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVEcml2ZXJFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVEcml2ZXJFcnJvcihlLCByZXF1ZXN0LCBtZXNzYWdlKSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuZHJpdmVyLnByb2Nlc3NFcnJvcihlKTtcbiAgICAgIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgZXJyb3I6IF9vYmplY3RTcHJlYWQoe1xuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgfSwgZGF0YSlcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVNZXNzYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZXYpIHtcbiAgICAgIGlmICh0aGlzLmlzU3RvcHBlZCkgcmV0dXJuO1xuICAgICAgdmFyIGFjdGlvbkV2ID0gbmV3IEN1c3RvbUV2ZW50KFwiYWN0aW9uOlwiLmNvbmNhdChldi5kZXRhaWwuYWN0aW9uKSwge1xuICAgICAgICBkZXRhaWw6IGV2LmRldGFpbCxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgICB0aGlzLmVtaXQoXCJhY3Rpb246XCIuY29uY2F0KGV2LmRldGFpbC5hY3Rpb24pLCBhY3Rpb25Fdik7XG4gICAgICBpZiAoIWFjdGlvbkV2LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgc3dpdGNoIChldi5kZXRhaWwuYWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uQ29udGVudExvYWRlZDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUNvbnRlbnRMb2FkZWRBY3Rpb24oZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TdXBwb3J0ZWRBcGlWZXJzaW9uczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGx5VmVyc2lvbnMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TZW5kRXZlbnQ6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kRXZlbnQoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TZW5kVG9EZXZpY2U6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTZW5kVG9EZXZpY2UoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5HZXRPcGVuSURDcmVkZW50aWFsczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZU9JREMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5NU0MyOTMxTmF2aWdhdGU6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVOYXZpZ2F0ZShldi5kZXRhaWwpO1xuICAgICAgICAgIGNhc2UgX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzI5NzRSZW5lZ290aWF0ZUNhcGFiaWxpdGllczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUNhcGFiaWxpdGllc1JlbmVnb3RpYXRlKGV2LmRldGFpbCk7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uTVNDMjg3NlJlYWRFdmVudHM6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVSZWFkRXZlbnRzKGV2LmRldGFpbCk7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uV2F0Y2hUdXJuU2VydmVyczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVdhdGNoVHVyblNlcnZlcnMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5VbndhdGNoVHVyblNlcnZlcnM6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVVbndhdGNoVHVyblNlcnZlcnMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5NU0MzODY5UmVhZFJlbGF0aW9uczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVJlYWRSZWxhdGlvbnMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5NU0MzOTczVXNlckRpcmVjdG9yeVNlYXJjaDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZVVzZXJEaXJlY3RvcnlTZWFyY2goZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5CZWVwZXJSZWFkUm9vbUFjY291bnREYXRhOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlUmVhZFJvb21BY2NvdW50RGF0YShldi5kZXRhaWwpO1xuICAgICAgICAgIGNhc2UgX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzQwMzlHZXRNZWRpYUNvbmZpZ0FjdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUdldE1lZGlhQ29uZmlnKGV2LmRldGFpbCk7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uTVNDNDAzOVVwbG9hZEZpbGVBY3Rpb246XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVVcGxvYWRGaWxlKGV2LmRldGFpbCk7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uTVNDNDAzOURvd25sb2FkRmlsZUFjdGlvbjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZURvd25sb2FkRmlsZShldi5kZXRhaWwpO1xuICAgICAgICAgIGNhc2UgX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzQxNTdVcGRhdGVEZWxheWVkRXZlbnQ6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVVcGRhdGVEZWxheWVkRXZlbnQoZXYuZGV0YWlsKTtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwge1xuICAgICAgICAgICAgICBlcnJvcjoge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiVW5rbm93biBvciB1bnN1cHBvcnRlZCBhY3Rpb246IFwiICsgZXYuZGV0YWlsLmFjdGlvblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZm9ybXMgdGhlIHdpZGdldCB0aGF0IHRoZSBjbGllbnQncyB0aGVtZSBoYXMgY2hhbmdlZC5cbiAgICAgKiBAcGFyYW0gdGhlbWUgVGhlIHRoZW1lIGRhdGEsIGFzIGFuIG9iamVjdCB3aXRoIGFyYml0cmFyeSBjb250ZW50cy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVUaGVtZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB1cGRhdGVUaGVtZSh0aGVtZSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5UaGVtZUNoYW5nZSwgdGhlbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZm9ybXMgdGhlIHdpZGdldCB0aGF0IHRoZSBjbGllbnQncyBsYW5ndWFnZSBoYXMgY2hhbmdlZC5cbiAgICAgKiBAcGFyYW0gbGFuZyBUaGUgQkNQIDQ3IGlkZW50aWZpZXIgcmVwcmVzZW50aW5nIHRoZSBjbGllbnQncyBjdXJyZW50IGxhbmd1YWdlLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInVwZGF0ZUxhbmd1YWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZUxhbmd1YWdlKGxhbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uTGFuZ3VhZ2VDaGFuZ2UsIHtcbiAgICAgICAgbGFuZzogbGFuZ1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFrZXMgYSBzY3JlZW5zaG90IG9mIHRoZSB3aWRnZXQuXG4gICAgICogQHJldHVybnMgUmVzb2x2ZXMgdG8gdGhlIHdpZGdldCdzIHNjcmVlbnNob3QuXG4gICAgICogQHRocm93cyBUaHJvd3MgaWYgdGhlcmUgaXMgYSBwcm9ibGVtLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInRha2VTY3JlZW5zaG90XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRha2VTY3JlZW5zaG90KCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5UYWtlU2NyZWVuc2hvdCwge30pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFsZXJ0cyB0aGUgd2lkZ2V0IHRvIHdoZXRoZXIgb3Igbm90IGl0IGlzIGN1cnJlbnRseSB2aXNpYmxlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNWaXNpYmxlIFdoZXRoZXIgdGhlIHdpZGdldCBpcyB2aXNpYmxlIG9yIG5vdC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJV2lkZ2V0QXBpUmVzcG9uc2VEYXRhPn0gUmVzb2x2ZXMgd2hlbiB0aGUgd2lkZ2V0IGFja25vd2xlZGdlcyB0aGUgdXBkYXRlLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInVwZGF0ZVZpc2liaWxpdHlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlVmlzaWJpbGl0eShpc1Zpc2libGUpIHtcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uVXBkYXRlVmlzaWJpbGl0eSwge1xuICAgICAgICB2aXNpYmxlOiBpc1Zpc2libGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZW5kV2lkZ2V0Q29uZmlnXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRXaWRnZXRDb25maWcoZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5XaWRnZXRDb25maWcsIGRhdGEpLnRoZW4oKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibm90aWZ5TW9kYWxXaWRnZXRCdXR0b25DbGlja2VkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vdGlmeU1vZGFsV2lkZ2V0QnV0dG9uQ2xpY2tlZChpZCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5CdXR0b25DbGlja2VkLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSkudGhlbigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJub3RpZnlNb2RhbFdpZGdldENsb3NlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5vdGlmeU1vZGFsV2lkZ2V0Q2xvc2UoZGF0YSkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5DbG9zZU1vZGFsV2lkZ2V0LCBkYXRhKS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmVlZHMgYW4gZXZlbnQgdG8gdGhlIHdpZGdldC4gQXMgYSBjbGllbnQgeW91IGFyZSBleHBlY3RlZCB0byBjYWxsIHRoaXNcbiAgICAgKiBmb3IgZXZlcnkgbmV3IGV2ZW50IGluIGV2ZXJ5IHJvb20gdG8gd2hpY2ggeW91IGFyZSBqb2luZWQgb3IgaW52aXRlZC5cbiAgICAgKiBAcGFyYW0ge0lSb29tRXZlbnR9IHJhd0V2ZW50IFRoZSBldmVudCB0byAodHJ5IHRvKSBzZW5kIHRvIHRoZSB3aWRnZXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGN1cnJlbnRWaWV3ZWRSb29tSWQgVGhlIHJvb20gSUQgdGhlIHVzZXIgaXMgY3VycmVudGx5XG4gICAgICogICBpbnRlcmFjdGluZyB3aXRoLiBOb3QgdGhlIHJvb20gSUQgb2YgdGhlIGV2ZW50LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBSZXNvbHZlcyB3aGVuIGRlbGl2ZXJlZCBvciBpZiB0aGUgd2lkZ2V0IGlzIG5vdFxuICAgICAqICAgYWJsZSB0byByZWFkIHRoZSBldmVudCBkdWUgdG8gcGVybWlzc2lvbnMsIHJlamVjdHMgaWYgdGhlIHdpZGdldCBmYWlsZWRcbiAgICAgKiAgIHRvIGhhbmRsZSB0aGUgZXZlbnQuXG4gICAgICogQGRlcHJlY2F0ZWQgSXQgaXMgcmVjb21tZW5kZWQgdG8gY29tbXVuaWNhdGUgdGhlIHZpZXdlZCByb29tIElEIGJ5IGNhbGxpbmdcbiAgICAgKiAgIHtAbGluayBDbGllbnRXaWRnZXRBcGkuc2V0Vmlld2VkUm9vbUlkfSByYXRoZXIgdGhhbiBwYXNzaW5nIGl0IHRvIHRoaXNcbiAgICAgKiAgIG1ldGhvZC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJmZWVkRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9mZWVkRXZlbnQgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUxMyhyYXdFdmVudCwgY3VycmVudFZpZXdlZFJvb21JZCkge1xuICAgICAgICB2YXIgX3Jhd0V2ZW50JGNvbnRlbnQ7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlMTMkKF9jb250ZXh0MTMpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dDEzLnByZXYgPSBfY29udGV4dDEzLm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgaWYgKGN1cnJlbnRWaWV3ZWRSb29tSWQgIT09IHVuZGVmaW5lZCkgdGhpcy5zZXRWaWV3ZWRSb29tSWQoY3VycmVudFZpZXdlZFJvb21JZCk7XG4gICAgICAgICAgICAgIGlmICghKHJhd0V2ZW50LnJvb21faWQgIT09IHRoaXMudmlld2VkUm9vbUlkICYmICF0aGlzLmNhblVzZVJvb21UaW1lbGluZShyYXdFdmVudC5yb29tX2lkKSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDEzLm5leHQgPSAzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDEzLmFicnVwdChcInJldHVyblwiKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgaWYgKCEocmF3RXZlbnQuc3RhdGVfa2V5ICE9PSB1bmRlZmluZWQgJiYgcmF3RXZlbnQuc3RhdGVfa2V5ICE9PSBudWxsKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0MTMubmV4dCA9IDg7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2FuUmVjZWl2ZVN0YXRlRXZlbnQocmF3RXZlbnQudHlwZSwgcmF3RXZlbnQuc3RhdGVfa2V5KSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0MTMubmV4dCA9IDY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0MTMuYWJydXB0KFwicmV0dXJuXCIpO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICBfY29udGV4dDEzLm5leHQgPSAxMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNhblJlY2VpdmVSb29tRXZlbnQocmF3RXZlbnQudHlwZSwgKF9yYXdFdmVudCRjb250ZW50ID0gcmF3RXZlbnQuY29udGVudCkgPT09IG51bGwgfHwgX3Jhd0V2ZW50JGNvbnRlbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9yYXdFdmVudCRjb250ZW50W1wibXNndHlwZVwiXSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDEzLm5leHQgPSAxMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMy5hYnJ1cHQoXCJyZXR1cm5cIik7XG4gICAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgICBfY29udGV4dDEzLm5leHQgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5TZW5kRXZlbnQsXG4gICAgICAgICAgICAgIC8vIGl0J3MgY29tcGF0aWJsZSwgYnV0IG1pc3NpbmcgdGhlIGluZGV4IHNpZ25hdHVyZVxuICAgICAgICAgICAgICByYXdFdmVudCk7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxMy5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMTMsIHRoaXMpO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gZmVlZEV2ZW50KF94MTIsIF94MTMpIHtcbiAgICAgICAgcmV0dXJuIF9mZWVkRXZlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmZWVkRXZlbnQ7XG4gICAgfSgpXG4gICAgLyoqXG4gICAgICogRmVlZHMgYSB0by1kZXZpY2UgZXZlbnQgdG8gdGhlIHdpZGdldC4gQXMgYSBjbGllbnQgeW91IGFyZSBleHBlY3RlZCB0b1xuICAgICAqIGNhbGwgdGhpcyBmb3IgZXZlcnkgdG8tZGV2aWNlIGV2ZW50IHlvdSByZWNlaXZlLlxuICAgICAqIEBwYXJhbSB7SVJvb21FdmVudH0gcmF3RXZlbnQgVGhlIGV2ZW50IHRvICh0cnkgdG8pIHNlbmQgdG8gdGhlIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGVuY3J5cHRlZCBXaGV0aGVyIHRoZSBldmVudCBjb250ZW50cyB3ZXJlIGVuY3J5cHRlZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gUmVzb2x2ZXMgd2hlbiBkZWxpdmVyZWQgb3IgaWYgdGhlIHdpZGdldCBpcyBub3RcbiAgICAgKiAgIGFibGUgdG8gcmVjZWl2ZSB0aGUgZXZlbnQgZHVlIHRvIHBlcm1pc3Npb25zLCByZWplY3RzIGlmIHRoZSB3aWRnZXRcbiAgICAgKiAgIGZhaWxlZCB0byBoYW5kbGUgdGhlIGV2ZW50LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcImZlZWRUb0RldmljZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2ZlZWRUb0RldmljZSA9IF9hc3luY1RvR2VuZXJhdG9yKCAvKiNfX1BVUkVfXyovX3JlZ2VuZXJhdG9yUnVudGltZSgpLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTE0KHJhd0V2ZW50LCBlbmNyeXB0ZWQpIHtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUxNCQoX2NvbnRleHQxNCkge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0MTQucHJldiA9IF9jb250ZXh0MTQubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAoIXRoaXMuY2FuUmVjZWl2ZVRvRGV2aWNlRXZlbnQocmF3RXZlbnQudHlwZSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDE0Lm5leHQgPSAzO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0MTQubmV4dCA9IDM7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uU2VuZFRvRGV2aWNlLCAvLyBpdCdzIGNvbXBhdGlibGUsIGJ1dCBtaXNzaW5nIHRoZSBpbmRleCBzaWduYXR1cmVcbiAgICAgICAgICAgICAgX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKHt9LCByYXdFdmVudCksIHt9LCB7XG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkOiBlbmNyeXB0ZWRcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxNC5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMTQsIHRoaXMpO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gZmVlZFRvRGV2aWNlKF94MTQsIF94MTUpIHtcbiAgICAgICAgcmV0dXJuIF9mZWVkVG9EZXZpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmZWVkVG9EZXZpY2U7XG4gICAgfSgpXG4gIH0sIHtcbiAgICBrZXk6IFwic2V0Vmlld2VkUm9vbUlkXCIsXG4gICAgdmFsdWU6XG4gICAgLyoqXG4gICAgICogSW5kaWNhdGUgdGhhdCBhIHJvb20gaXMgYmVpbmcgdmlld2VkIChtYWtpbmcgaXQgcG9zc2libGUgZm9yIHRoZSB3aWRnZXRcbiAgICAgKiB0byBpbnRlcmFjdCB3aXRoIGl0KS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzZXRWaWV3ZWRSb29tSWQocm9vbUlkKSB7XG4gICAgICB0aGlzLnZpZXdlZFJvb21JZCA9IHJvb21JZDtcbiAgICAgIC8vIElmIHRoZSB3aWRnZXQgZG9lc24ndCBoYXZlIHRpbWVsaW5lIHBlcm1pc3Npb25zIGZvciB0aGUgcm9vbSB0aGVuXG4gICAgICAvLyB0aGlzIGlzIGl0cyBvcHBvcnR1bml0eSB0byBsZWFybiB0aGUgcm9vbSBzdGF0ZS4gV2UgcHVzaCB0aGUgZW50aXJlXG4gICAgICAvLyByb29tIHN0YXRlLCB3aGljaCBjb3VsZCBiZSByZWR1bmRhbnQgaWYgdGhpcyByb29tIGhhZCBiZWVuIHZpZXdlZFxuICAgICAgLy8gb25jZSBiZWZvcmUsIGJ1dCBpdCdzIGVhc2llciB0aGFuIHNlbGVjdGl2ZWx5IHB1c2hpbmcganVzdCB0aGUgYml0c1xuICAgICAgLy8gb2Ygc3RhdGUgdGhhdCBjaGFuZ2VkIHdoaWxlIHRoZSByb29tIHdhcyBpbiB0aGUgYmFja2dyb3VuZC5cbiAgICAgIGlmIChyb29tSWQgIT09IG51bGwgJiYgIXRoaXMuY2FuVXNlUm9vbVRpbWVsaW5lKHJvb21JZCkpIHRoaXMucHVzaFJvb21TdGF0ZShyb29tSWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmbHVzaFJvb21TdGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX2ZsdXNoUm9vbVN0YXRlID0gX2FzeW5jVG9HZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlMTUoKSB7XG4gICAgICAgIHZhciBldmVudHMsIF9pdGVyYXRvcjYsIF9zdGVwNiwgZXZlbnRUeXBlTWFwLCBfaXRlcmF0b3I3LCBfc3RlcDcsIHN0YXRlS2V5TWFwO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTE1JChfY29udGV4dDE1KSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQxNS5wcmV2ID0gX2NvbnRleHQxNS5uZXh0KSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIF9jb250ZXh0MTUucHJldiA9IDA7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgIF9jb250ZXh0MTUubmV4dCA9IDM7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wdXNoUm9vbVN0YXRlVGFza3MpKTtcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgaWYgKHRoaXMucHVzaFJvb21TdGF0ZVRhc2tzLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQxNS5uZXh0ID0gMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICBldmVudHMgPSBbXTtcbiAgICAgICAgICAgICAgX2l0ZXJhdG9yNiA9IF9jcmVhdGVGb3JPZkl0ZXJhdG9ySGVscGVyKHRoaXMucHVzaFJvb21TdGF0ZVJlc3VsdC52YWx1ZXMoKSk7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yIChfaXRlcmF0b3I2LnMoKTsgIShfc3RlcDYgPSBfaXRlcmF0b3I2Lm4oKSkuZG9uZTspIHtcbiAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZU1hcCA9IF9zdGVwNi52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIF9pdGVyYXRvcjcgPSBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihldmVudFR5cGVNYXAudmFsdWVzKCkpO1xuICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChfaXRlcmF0b3I3LnMoKTsgIShfc3RlcDcgPSBfaXRlcmF0b3I3Lm4oKSkuZG9uZTspIHtcbiAgICAgICAgICAgICAgICAgICAgICBzdGF0ZUtleU1hcCA9IF9zdGVwNy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICBldmVudHMucHVzaC5hcHBseShldmVudHMsIF90b0NvbnN1bWFibGVBcnJheShzdGF0ZUtleU1hcC52YWx1ZXMoKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yNy5lKGVycik7XG4gICAgICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3I3LmYoKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvcjYuZShlcnIpO1xuICAgICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvcjYuZigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0MTUubmV4dCA9IDk7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFdpZGdldFZlcnNpb25zKCk7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgIGlmICghX2NvbnRleHQxNS5zZW50LmluY2x1ZGVzKF9BcGlWZXJzaW9uLlVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyNzYyX1VQREFURV9TVEFURSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDE1Lm5leHQgPSAxMjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBfY29udGV4dDE1Lm5leHQgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5VcGRhdGVTdGF0ZSwge1xuICAgICAgICAgICAgICAgIHN0YXRlOiBldmVudHNcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICBfY29udGV4dDE1LnByZXYgPSAxMjtcbiAgICAgICAgICAgICAgdGhpcy5mbHVzaFJvb21TdGF0ZVRhc2sgPSBudWxsO1xuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQxNS5maW5pc2goMTIpO1xuICAgICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0MTUuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTE1LCB0aGlzLCBbWzAsLCAxMiwgMTVdXSk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBmbHVzaFJvb21TdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIF9mbHVzaFJvb21TdGF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZsdXNoUm9vbVN0YXRlO1xuICAgIH0oKVxuICAgIC8qKlxuICAgICAqIFJlYWQgdGhlIHJvb20ncyBzdGF0ZSBhbmQgcHVzaCBhbGwgZW50cmllcyB0aGF0IHRoZSB3aWRnZXQgaXMgYWxsb3dlZCB0b1xuICAgICAqIHJlYWQgdGhyb3VnaCB0byB0aGUgd2lkZ2V0LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInB1c2hSb29tU3RhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcHVzaFJvb21TdGF0ZShyb29tSWQpIHtcbiAgICAgIHZhciBfdGhpczEyID0gdGhpcztcbiAgICAgIHZhciBfaXRlcmF0b3I4ID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIodGhpcy5hbGxvd2VkRXZlbnRzKSxcbiAgICAgICAgX3N0ZXA4O1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoKSB7XG4gICAgICAgICAgdmFyIGNhcCA9IF9zdGVwOC52YWx1ZTtcbiAgICAgICAgICBpZiAoY2FwLmtpbmQgPT09IF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnRLaW5kLlN0YXRlICYmIGNhcC5kaXJlY3Rpb24gPT09IF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSkge1xuICAgICAgICAgICAgdmFyIF9jYXAka2V5U3RyLCBfdGhpczEyJGZsdXNoUm9vbVN0YXQ7XG4gICAgICAgICAgICAvLyBJbml0aWF0ZSB0aGUgdGFza1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IF90aGlzMTIuZHJpdmVyLnJlYWRSb29tU3RhdGUocm9vbUlkLCBjYXAuZXZlbnRUeXBlLCAoX2NhcCRrZXlTdHIgPSBjYXAua2V5U3RyKSAhPT0gbnVsbCAmJiBfY2FwJGtleVN0ciAhPT0gdm9pZCAwID8gX2NhcCRrZXlTdHIgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBldmVudHMudGhlbihmdW5jdGlvbiAoZXZlbnRzKSB7XG4gICAgICAgICAgICAgIC8vIFdoZW4gY29tcGxldGUsIHF1ZXVlIHRoZSByZXN1bHRpbmcgZXZlbnRzIHRvIGJlXG4gICAgICAgICAgICAgIC8vIHB1c2hlZCB0byB0aGUgd2lkZ2V0XG4gICAgICAgICAgICAgIHZhciBfaXRlcmF0b3I5ID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIoZXZlbnRzKSxcbiAgICAgICAgICAgICAgICBfc3RlcDk7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yIChfaXRlcmF0b3I5LnMoKTsgIShfc3RlcDkgPSBfaXRlcmF0b3I5Lm4oKSkuZG9uZTspIHtcbiAgICAgICAgICAgICAgICAgIHZhciBldmVudCA9IF9zdGVwOS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgIHZhciBldmVudFR5cGVNYXAgPSBfdGhpczEyLnB1c2hSb29tU3RhdGVSZXN1bHQuZ2V0KHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpczEyLnB1c2hSb29tU3RhdGVSZXN1bHQuc2V0KHJvb21JZCwgZXZlbnRUeXBlTWFwKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHZhciBzdGF0ZUtleU1hcCA9IGV2ZW50VHlwZU1hcC5nZXQoY2FwLmV2ZW50VHlwZSk7XG4gICAgICAgICAgICAgICAgICBpZiAoc3RhdGVLZXlNYXAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZUtleU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlTWFwLnNldChjYXAuZXZlbnRUeXBlLCBzdGF0ZUtleU1hcCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoIXN0YXRlS2V5TWFwLmhhcyhldmVudC5zdGF0ZV9rZXkpKSBzdGF0ZUtleU1hcC5zZXQoZXZlbnQuc3RhdGVfa2V5LCBldmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I5LmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBfaXRlcmF0b3I5LmYoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gcmVhZCByb29tIHN0YXRlIGZvciBcIi5jb25jYXQocm9vbUlkLCBcIiAoXCIpLmNvbmNhdChjYXAuZXZlbnRUeXBlLCBcIiwgXCIpLmNvbmNhdChjYXAua2V5U3RyLCBcIilcIiksIGUpO1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIC8vIE1hcmsgcmVxdWVzdCBhcyBubyBsb25nZXIgcGVuZGluZ1xuICAgICAgICAgICAgICBfdGhpczEyLnB1c2hSb29tU3RhdGVUYXNrc1tcImRlbGV0ZVwiXSh0YXNrKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBNYXJrIHRhc2sgYXMgcGVuZGluZ1xuICAgICAgICAgICAgX3RoaXMxMi5wdXNoUm9vbVN0YXRlVGFza3MuYWRkKHRhc2spO1xuICAgICAgICAgICAgLy8gQXNzdW1pbmcgbm8gb3RoZXIgdGFza3MgYXJlIGFscmVhZHkgaGFwcGVuaW5nIGNvbmN1cnJlbnRseSxcbiAgICAgICAgICAgIC8vIHNjaGVkdWxlIHRoZSB3aWRnZXQgYWN0aW9uIHRoYXQgYWN0dWFsbHkgcHVzaGVzIHRoZSBldmVudHNcbiAgICAgICAgICAgIChfdGhpczEyJGZsdXNoUm9vbVN0YXQgPSBfdGhpczEyLmZsdXNoUm9vbVN0YXRlVGFzaykgIT09IG51bGwgJiYgX3RoaXMxMiRmbHVzaFJvb21TdGF0ICE9PSB2b2lkIDAgPyBfdGhpczEyJGZsdXNoUm9vbVN0YXQgOiBfdGhpczEyLmZsdXNoUm9vbVN0YXRlVGFzayA9IF90aGlzMTIuZmx1c2hSb29tU3RhdGUoKTtcbiAgICAgICAgICAgIF90aGlzMTIuZmx1c2hSb29tU3RhdGVUYXNrW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gcHVzaCByb29tIHN0YXRlXCIsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKF9pdGVyYXRvcjgucygpOyAhKF9zdGVwOCA9IF9pdGVyYXRvcjgubigpKS5kb25lOykge1xuICAgICAgICAgIF9sb29wKCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBfaXRlcmF0b3I4LmUoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9pdGVyYXRvcjguZigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZlZWRzIGEgcm9vbSBzdGF0ZSB1cGRhdGUgdG8gdGhlIHdpZGdldC4gQXMgYSBjbGllbnQgeW91IGFyZSBleHBlY3RlZCB0b1xuICAgICAqIGNhbGwgdGhpcyBmb3IgZXZlcnkgc3RhdGUgdXBkYXRlIGluIGV2ZXJ5IHJvb20gdG8gd2hpY2ggeW91IGFyZSBqb2luZWQgb3JcbiAgICAgKiBpbnZpdGVkLlxuICAgICAqIEBwYXJhbSB7SVJvb21FdmVudH0gcmF3RXZlbnQgVGhlIHN0YXRlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHVwZGF0ZWRcbiAgICAgKiAgIHJvb20gc3RhdGUgZW50cnkuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IFJlc29sdmVzIHdoZW4gZGVsaXZlcmVkIG9yIGlmIHRoZSB3aWRnZXQgaXMgbm90XG4gICAgICogICBhYmxlIHRvIHJlY2VpdmUgdGhlIHJvb20gc3RhdGUgZHVlIHRvIHBlcm1pc3Npb25zLCByZWplY3RzIGlmIHRoZVxuICAgICAqICAgd2lkZ2V0IGZhaWxlZCB0byBoYW5kbGUgdGhlIHVwZGF0ZS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJmZWVkU3RhdGVVcGRhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9mZWVkU3RhdGVVcGRhdGUgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUxNihyYXdFdmVudCkge1xuICAgICAgICB2YXIgZXZlbnRUeXBlTWFwLCBzdGF0ZUtleU1hcDtcbiAgICAgICAgcmV0dXJuIF9yZWdlbmVyYXRvclJ1bnRpbWUoKS53cmFwKGZ1bmN0aW9uIF9jYWxsZWUxNiQoX2NvbnRleHQxNikge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0MTYucHJldiA9IF9jb250ZXh0MTYubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpZiAoIShyYXdFdmVudC5zdGF0ZV9rZXkgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDE2Lm5leHQgPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vdCBhIHN0YXRlIGV2ZW50XCIpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICBpZiAoISgocmF3RXZlbnQucm9vbV9pZCA9PT0gdGhpcy52aWV3ZWRSb29tSWQgfHwgdGhpcy5jYW5Vc2VSb29tVGltZWxpbmUocmF3RXZlbnQucm9vbV9pZCkpICYmIHRoaXMuY2FuUmVjZWl2ZVN0YXRlRXZlbnQocmF3RXZlbnQudHlwZSwgcmF3RXZlbnQuc3RhdGVfa2V5KSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDE2Lm5leHQgPSAyMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoISh0aGlzLnB1c2hSb29tU3RhdGVUYXNrcy5zaXplID09PSAwKSkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0MTYubmV4dCA9IDExO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0MTYubmV4dCA9IDY7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFdpZGdldFZlcnNpb25zKCk7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgIGlmICghX2NvbnRleHQxNi5zZW50LmluY2x1ZGVzKF9BcGlWZXJzaW9uLlVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyNzYyX1VQREFURV9TVEFURSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDE2Lm5leHQgPSA5O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0MTYubmV4dCA9IDk7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uVXBkYXRlU3RhdGUsIHtcbiAgICAgICAgICAgICAgICBzdGF0ZTogW3Jhd0V2ZW50XVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgX2NvbnRleHQxNi5uZXh0ID0gMjE7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgICAgLy8gTHVtcCB0aGUgdXBkYXRlIGluIHdpdGggd2hhdGV2ZXIgZGF0YSB3aWxsIGJlIHNlbnQgaW4gdGhlXG4gICAgICAgICAgICAgIC8vIGluaXRpYWwgcHVzaCBsYXRlci4gRXZlbiBpZiB3ZSBzZXQgaXQgdG8gYW4gXCJvdXRkYXRlZFwiIGVudHJ5XG4gICAgICAgICAgICAgIC8vIGhlcmUsIHdlIGNhbiBjb3VudCBvbiBhbnkgbmV3ZXIgZW50cmllcyBiZWluZyBwYXNzZWQgdG8gdGhpc1xuICAgICAgICAgICAgICAvLyBzYW1lIG1ldGhvZCBldmVudHVhbGx5OyB0aGlzIHdvbid0IGNhdXNlIHN0dWNrIHN0YXRlLlxuICAgICAgICAgICAgICBldmVudFR5cGVNYXAgPSB0aGlzLnB1c2hSb29tU3RhdGVSZXN1bHQuZ2V0KHJhd0V2ZW50LnJvb21faWQpO1xuICAgICAgICAgICAgICBpZiAoZXZlbnRUeXBlTWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBldmVudFR5cGVNYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoUm9vbVN0YXRlUmVzdWx0LnNldChyYXdFdmVudC5yb29tX2lkLCBldmVudFR5cGVNYXApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHN0YXRlS2V5TWFwID0gZXZlbnRUeXBlTWFwLmdldChyYXdFdmVudC50eXBlKTtcbiAgICAgICAgICAgICAgaWYgKHN0YXRlS2V5TWFwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUtleU1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICBldmVudFR5cGVNYXAuc2V0KHJhd0V2ZW50LnR5cGUsIHN0YXRlS2V5TWFwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoIXN0YXRlS2V5TWFwLmhhcyhyYXdFdmVudC50eXBlKSkgc3RhdGVLZXlNYXAuc2V0KHJhd0V2ZW50LnN0YXRlX2tleSwgcmF3RXZlbnQpO1xuICAgICAgICAgICAgY2FzZSAxNjpcbiAgICAgICAgICAgICAgX2NvbnRleHQxNi5uZXh0ID0gMTg7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChfdG9Db25zdW1hYmxlQXJyYXkodGhpcy5wdXNoUm9vbVN0YXRlVGFza3MpKTtcbiAgICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICAgIGlmICh0aGlzLnB1c2hSb29tU3RhdGVUYXNrcy5zaXplID4gMCkge1xuICAgICAgICAgICAgICAgIF9jb250ZXh0MTYubmV4dCA9IDE2O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIDE5OlxuICAgICAgICAgICAgICBfY29udGV4dDE2Lm5leHQgPSAyMTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2hSb29tU3RhdGVUYXNrO1xuICAgICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0MTYuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTE2LCB0aGlzKTtcbiAgICAgIH0pKTtcbiAgICAgIGZ1bmN0aW9uIGZlZWRTdGF0ZVVwZGF0ZShfeDE2KSB7XG4gICAgICAgIHJldHVybiBfZmVlZFN0YXRlVXBkYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmVlZFN0YXRlVXBkYXRlO1xuICAgIH0oKVxuICB9XSk7XG4gIHJldHVybiBDbGllbnRXaWRnZXRBcGk7XG59KF9ldmVudHMuRXZlbnRFbWl0dGVyKTtcbmV4cG9ydHMuQ2xpZW50V2lkZ2V0QXBpID0gQ2xpZW50V2lkZ2V0QXBpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Q2xpZW50V2lkZ2V0QXBpLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5TeW1ib2xzID0gdm9pZCAwO1xuLypcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xudmFyIFN5bWJvbHMgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKFN5bWJvbHMpIHtcbiAgU3ltYm9sc1tcIkFueVJvb21cIl0gPSBcIipcIjtcbiAgcmV0dXJuIFN5bWJvbHM7XG59KHt9KTtcbmV4cG9ydHMuU3ltYm9scyA9IFN5bWJvbHM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1TeW1ib2xzLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfSwgX3R5cGVvZihvYmopOyB9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5XaWRnZXRBcGlSZXNwb25zZUVycm9yID0gZXhwb3J0cy5XaWRnZXRBcGkgPSB2b2lkIDA7XG52YXIgX2V2ZW50cyA9IHJlcXVpcmUoXCJldmVudHNcIik7XG52YXIgX1dpZGdldEFwaURpcmVjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvV2lkZ2V0QXBpRGlyZWN0aW9uXCIpO1xudmFyIF9BcGlWZXJzaW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9BcGlWZXJzaW9uXCIpO1xudmFyIF9Qb3N0bWVzc2FnZVRyYW5zcG9ydCA9IHJlcXVpcmUoXCIuL3RyYW5zcG9ydC9Qb3N0bWVzc2FnZVRyYW5zcG9ydFwiKTtcbnZhciBfV2lkZ2V0QXBpQWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9XaWRnZXRBcGlBY3Rpb25cIik7XG52YXIgX0dldE9wZW5JREFjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvR2V0T3BlbklEQWN0aW9uXCIpO1xudmFyIF9XaWRnZXRUeXBlID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9XaWRnZXRUeXBlXCIpO1xudmFyIF9Nb2RhbFdpZGdldEFjdGlvbnMgPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL01vZGFsV2lkZ2V0QWN0aW9uc1wiKTtcbnZhciBfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5ID0gcmVxdWlyZShcIi4vbW9kZWxzL1dpZGdldEV2ZW50Q2FwYWJpbGl0eVwiKTtcbnZhciBfU3ltYm9scyA9IHJlcXVpcmUoXCIuL1N5bWJvbHNcIik7XG5mdW5jdGlvbiBfcmVnZW5lcmF0b3JSdW50aW1lKCkgeyBcInVzZSBzdHJpY3RcIjsgLyohIHJlZ2VuZXJhdG9yLXJ1bnRpbWUgLS0gQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuIC0tIGxpY2Vuc2UgKE1JVCk6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9ibG9iL21haW4vTElDRU5TRSAqLyBfcmVnZW5lcmF0b3JSdW50aW1lID0gZnVuY3Rpb24gX3JlZ2VuZXJhdG9yUnVudGltZSgpIHsgcmV0dXJuIGV4cG9ydHM7IH07IHZhciBleHBvcnRzID0ge30sIE9wID0gT2JqZWN0LnByb3RvdHlwZSwgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHksIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5IHx8IGZ1bmN0aW9uIChvYmosIGtleSwgZGVzYykgeyBvYmpba2V5XSA9IGRlc2MudmFsdWU7IH0sICRTeW1ib2wgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCA/IFN5bWJvbCA6IHt9LCBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCIsIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIiwgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiOyBmdW5jdGlvbiBkZWZpbmUob2JqLCBrZXksIHZhbHVlKSB7IHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiAhMCwgY29uZmlndXJhYmxlOiAhMCwgd3JpdGFibGU6ICEwIH0pLCBvYmpba2V5XTsgfSB0cnkgeyBkZWZpbmUoe30sIFwiXCIpOyB9IGNhdGNoIChlcnIpIHsgZGVmaW5lID0gZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkgeyByZXR1cm4gb2JqW2tleV0gPSB2YWx1ZTsgfTsgfSBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7IHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yLCBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSksIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7IHJldHVybiBkZWZpbmVQcm9wZXJ0eShnZW5lcmF0b3IsIFwiX2ludm9rZVwiLCB7IHZhbHVlOiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIH0pLCBnZW5lcmF0b3I7IH0gZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7IHRyeSB7IHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTsgfSBjYXRjaCAoZXJyKSB7IHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTsgfSB9IGV4cG9ydHMud3JhcCA9IHdyYXA7IHZhciBDb250aW51ZVNlbnRpbmVsID0ge307IGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9IGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge30gZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fSB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTsgZGVmaW5lKEl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSk7IHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiwgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJiBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpICYmIChJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlKTsgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0gR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpOyBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7IFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHsgZGVmaW5lKHByb3RvdHlwZSwgbWV0aG9kLCBmdW5jdGlvbiAoYXJnKSB7IHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpOyB9KTsgfSk7IH0gZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7IGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7IHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpOyBpZiAoXCJ0aHJvd1wiICE9PSByZWNvcmQudHlwZSkgeyB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZywgdmFsdWUgPSByZXN1bHQudmFsdWU7IHJldHVybiB2YWx1ZSAmJiBcIm9iamVjdFwiID09IF90eXBlb2YodmFsdWUpICYmIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikgPyBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7IGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7IH0sIGZ1bmN0aW9uIChlcnIpIHsgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpOyB9KSA6IFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24gKHVud3JhcHBlZCkgeyByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQsIHJlc29sdmUocmVzdWx0KTsgfSwgZnVuY3Rpb24gKGVycm9yKSB7IHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTsgfSk7IH0gcmVqZWN0KHJlY29yZC5hcmcpOyB9IHZhciBwcmV2aW91c1Byb21pc2U7IGRlZmluZVByb3BlcnR5KHRoaXMsIFwiX2ludm9rZVwiLCB7IHZhbHVlOiBmdW5jdGlvbiB2YWx1ZShtZXRob2QsIGFyZykgeyBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHsgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTsgfSk7IH0gcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9IHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLCBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZykgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpOyB9IH0pOyB9IGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkgeyB2YXIgc3RhdGUgPSBcInN1c3BlbmRlZFN0YXJ0XCI7IHJldHVybiBmdW5jdGlvbiAobWV0aG9kLCBhcmcpIHsgaWYgKFwiZXhlY3V0aW5nXCIgPT09IHN0YXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpOyBpZiAoXCJjb21wbGV0ZWRcIiA9PT0gc3RhdGUpIHsgaWYgKFwidGhyb3dcIiA9PT0gbWV0aG9kKSB0aHJvdyBhcmc7IHJldHVybiBkb25lUmVzdWx0KCk7IH0gZm9yIChjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZCwgY29udGV4dC5hcmcgPSBhcmc7OykgeyB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlOyBpZiAoZGVsZWdhdGUpIHsgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7IGlmIChkZWxlZ2F0ZVJlc3VsdCkgeyBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlOyByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7IH0gfSBpZiAoXCJuZXh0XCIgPT09IGNvbnRleHQubWV0aG9kKSBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7ZWxzZSBpZiAoXCJ0aHJvd1wiID09PSBjb250ZXh0Lm1ldGhvZCkgeyBpZiAoXCJzdXNwZW5kZWRTdGFydFwiID09PSBzdGF0ZSkgdGhyb3cgc3RhdGUgPSBcImNvbXBsZXRlZFwiLCBjb250ZXh0LmFyZzsgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7IH0gZWxzZSBcInJldHVyblwiID09PSBjb250ZXh0Lm1ldGhvZCAmJiBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7IHN0YXRlID0gXCJleGVjdXRpbmdcIjsgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpOyBpZiAoXCJub3JtYWxcIiA9PT0gcmVjb3JkLnR5cGUpIHsgaWYgKHN0YXRlID0gY29udGV4dC5kb25lID8gXCJjb21wbGV0ZWRcIiA6IFwic3VzcGVuZGVkWWllbGRcIiwgcmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7IHJldHVybiB7IHZhbHVlOiByZWNvcmQuYXJnLCBkb25lOiBjb250ZXh0LmRvbmUgfTsgfSBcInRocm93XCIgPT09IHJlY29yZC50eXBlICYmIChzdGF0ZSA9IFwiY29tcGxldGVkXCIsIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiLCBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmcpOyB9IH07IH0gZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkgeyB2YXIgbWV0aG9kTmFtZSA9IGNvbnRleHQubWV0aG9kLCBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2ROYW1lXTsgaWYgKHVuZGVmaW5lZCA9PT0gbWV0aG9kKSByZXR1cm4gY29udGV4dC5kZWxlZ2F0ZSA9IG51bGwsIFwidGhyb3dcIiA9PT0gbWV0aG9kTmFtZSAmJiBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSAmJiAoY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiLCBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZCwgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCksIFwidGhyb3dcIiA9PT0gY29udGV4dC5tZXRob2QpIHx8IFwicmV0dXJuXCIgIT09IG1ldGhvZE5hbWUgJiYgKGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiLCBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICdcIiArIG1ldGhvZE5hbWUgKyBcIicgbWV0aG9kXCIpKSwgQ29udGludWVTZW50aW5lbDsgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTsgaWYgKFwidGhyb3dcIiA9PT0gcmVjb3JkLnR5cGUpIHJldHVybiBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIiwgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnLCBjb250ZXh0LmRlbGVnYXRlID0gbnVsbCwgQ29udGludWVTZW50aW5lbDsgdmFyIGluZm8gPSByZWNvcmQuYXJnOyByZXR1cm4gaW5mbyA/IGluZm8uZG9uZSA/IChjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZSwgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYywgXCJyZXR1cm5cIiAhPT0gY29udGV4dC5tZXRob2QgJiYgKGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCIsIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkKSwgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGwsIENvbnRpbnVlU2VudGluZWwpIDogaW5mbyA6IChjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIiwgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIiksIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsLCBDb250aW51ZVNlbnRpbmVsKTsgfSBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykgeyB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9OyAxIGluIGxvY3MgJiYgKGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXSksIDIgaW4gbG9jcyAmJiAoZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl0sIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXSksIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTsgfSBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7IHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9OyByZWNvcmQudHlwZSA9IFwibm9ybWFsXCIsIGRlbGV0ZSByZWNvcmQuYXJnLCBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkOyB9IGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHsgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XSwgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpLCB0aGlzLnJlc2V0KCEwKTsgfSBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHsgaWYgKGl0ZXJhYmxlKSB7IHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTsgaWYgKGl0ZXJhdG9yTWV0aG9kKSByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7IGlmIChcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGl0ZXJhYmxlLm5leHQpIHJldHVybiBpdGVyYWJsZTsgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7IHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkgeyBmb3IgKDsgKytpIDwgaXRlcmFibGUubGVuZ3RoOykgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkgcmV0dXJuIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXSwgbmV4dC5kb25lID0gITEsIG5leHQ7IHJldHVybiBuZXh0LnZhbHVlID0gdW5kZWZpbmVkLCBuZXh0LmRvbmUgPSAhMCwgbmV4dDsgfTsgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7IH0gfSByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07IH0gZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHsgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogITAgfTsgfSByZXR1cm4gR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsIGRlZmluZVByb3BlcnR5KEdwLCBcImNvbnN0cnVjdG9yXCIsIHsgdmFsdWU6IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCBjb25maWd1cmFibGU6ICEwIH0pLCBkZWZpbmVQcm9wZXJ0eShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgXCJjb25zdHJ1Y3RvclwiLCB7IHZhbHVlOiBHZW5lcmF0b3JGdW5jdGlvbiwgY29uZmlndXJhYmxlOiAhMCB9KSwgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBkZWZpbmUoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpLCBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbiAoZ2VuRnVuKSB7IHZhciBjdG9yID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBnZW5GdW4gJiYgZ2VuRnVuLmNvbnN0cnVjdG9yOyByZXR1cm4gISFjdG9yICYmIChjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIgPT09IChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkpOyB9LCBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbiAoZ2VuRnVuKSB7IHJldHVybiBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSkgOiAoZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLCBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKSksIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKSwgZ2VuRnVuOyB9LCBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24gKGFyZykgeyByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTsgfSwgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKSwgZGVmaW5lKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlLCBhc3luY0l0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9KSwgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvciwgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uIChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHsgdm9pZCAwID09PSBQcm9taXNlSW1wbCAmJiAoUHJvbWlzZUltcGwgPSBQcm9taXNlKTsgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcih3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSwgUHJvbWlzZUltcGwpOyByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pID8gaXRlciA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkgeyByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTsgfSk7IH0sIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCksIGRlZmluZShHcCwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yXCIpLCBkZWZpbmUoR3AsIGl0ZXJhdG9yU3ltYm9sLCBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9KSwgZGVmaW5lKEdwLCBcInRvU3RyaW5nXCIsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7IH0pLCBleHBvcnRzLmtleXMgPSBmdW5jdGlvbiAodmFsKSB7IHZhciBvYmplY3QgPSBPYmplY3QodmFsKSwga2V5cyA9IFtdOyBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSBrZXlzLnB1c2goa2V5KTsgcmV0dXJuIGtleXMucmV2ZXJzZSgpLCBmdW5jdGlvbiBuZXh0KCkgeyBmb3IgKDsga2V5cy5sZW5ndGg7KSB7IHZhciBrZXkgPSBrZXlzLnBvcCgpOyBpZiAoa2V5IGluIG9iamVjdCkgcmV0dXJuIG5leHQudmFsdWUgPSBrZXksIG5leHQuZG9uZSA9ICExLCBuZXh0OyB9IHJldHVybiBuZXh0LmRvbmUgPSAhMCwgbmV4dDsgfTsgfSwgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXMsIENvbnRleHQucHJvdG90eXBlID0geyBjb25zdHJ1Y3RvcjogQ29udGV4dCwgcmVzZXQ6IGZ1bmN0aW9uIHJlc2V0KHNraXBUZW1wUmVzZXQpIHsgaWYgKHRoaXMucHJldiA9IDAsIHRoaXMubmV4dCA9IDAsIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQsIHRoaXMuZG9uZSA9ICExLCB0aGlzLmRlbGVnYXRlID0gbnVsbCwgdGhpcy5tZXRob2QgPSBcIm5leHRcIiwgdGhpcy5hcmcgPSB1bmRlZmluZWQsIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpLCAhc2tpcFRlbXBSZXNldCkgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSBcInRcIiA9PT0gbmFtZS5jaGFyQXQoMCkgJiYgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiYgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSAmJiAodGhpc1tuYW1lXSA9IHVuZGVmaW5lZCk7IH0sIHN0b3A6IGZ1bmN0aW9uIHN0b3AoKSB7IHRoaXMuZG9uZSA9ICEwOyB2YXIgcm9vdFJlY29yZCA9IHRoaXMudHJ5RW50cmllc1swXS5jb21wbGV0aW9uOyBpZiAoXCJ0aHJvd1wiID09PSByb290UmVjb3JkLnR5cGUpIHRocm93IHJvb3RSZWNvcmQuYXJnOyByZXR1cm4gdGhpcy5ydmFsOyB9LCBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24gZGlzcGF0Y2hFeGNlcHRpb24oZXhjZXB0aW9uKSB7IGlmICh0aGlzLmRvbmUpIHRocm93IGV4Y2VwdGlvbjsgdmFyIGNvbnRleHQgPSB0aGlzOyBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHsgcmV0dXJuIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiLCByZWNvcmQuYXJnID0gZXhjZXB0aW9uLCBjb250ZXh0Lm5leHQgPSBsb2MsIGNhdWdodCAmJiAoY29udGV4dC5tZXRob2QgPSBcIm5leHRcIiwgY29udGV4dC5hcmcgPSB1bmRlZmluZWQpLCAhIWNhdWdodDsgfSBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXSwgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjsgaWYgKFwicm9vdFwiID09PSBlbnRyeS50cnlMb2MpIHJldHVybiBoYW5kbGUoXCJlbmRcIik7IGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7IHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpLCBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTsgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHsgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCAhMCk7IGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpOyB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7IGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgITApOyB9IGVsc2UgeyBpZiAoIWhhc0ZpbmFsbHkpIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpOyBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTsgfSB9IH0gfSwgYWJydXB0OiBmdW5jdGlvbiBhYnJ1cHQodHlwZSwgYXJnKSB7IGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHsgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldOyBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJiBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHsgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5OyBicmVhazsgfSB9IGZpbmFsbHlFbnRyeSAmJiAoXCJicmVha1wiID09PSB0eXBlIHx8IFwiY29udGludWVcIiA9PT0gdHlwZSkgJiYgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiYgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jICYmIChmaW5hbGx5RW50cnkgPSBudWxsKTsgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307IHJldHVybiByZWNvcmQudHlwZSA9IHR5cGUsIHJlY29yZC5hcmcgPSBhcmcsIGZpbmFsbHlFbnRyeSA/ICh0aGlzLm1ldGhvZCA9IFwibmV4dFwiLCB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYywgQ29udGludWVTZW50aW5lbCkgOiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7IH0sIGNvbXBsZXRlOiBmdW5jdGlvbiBjb21wbGV0ZShyZWNvcmQsIGFmdGVyTG9jKSB7IGlmIChcInRocm93XCIgPT09IHJlY29yZC50eXBlKSB0aHJvdyByZWNvcmQuYXJnOyByZXR1cm4gXCJicmVha1wiID09PSByZWNvcmQudHlwZSB8fCBcImNvbnRpbnVlXCIgPT09IHJlY29yZC50eXBlID8gdGhpcy5uZXh0ID0gcmVjb3JkLmFyZyA6IFwicmV0dXJuXCIgPT09IHJlY29yZC50eXBlID8gKHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZywgdGhpcy5tZXRob2QgPSBcInJldHVyblwiLCB0aGlzLm5leHQgPSBcImVuZFwiKSA6IFwibm9ybWFsXCIgPT09IHJlY29yZC50eXBlICYmIGFmdGVyTG9jICYmICh0aGlzLm5leHQgPSBhZnRlckxvYyksIENvbnRpbnVlU2VudGluZWw7IH0sIGZpbmlzaDogZnVuY3Rpb24gZmluaXNoKGZpbmFsbHlMb2MpIHsgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkgeyB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07IGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSByZXR1cm4gdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyksIHJlc2V0VHJ5RW50cnkoZW50cnkpLCBDb250aW51ZVNlbnRpbmVsOyB9IH0sIFwiY2F0Y2hcIjogZnVuY3Rpb24gX2NhdGNoKHRyeUxvYykgeyBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7IHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTsgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7IHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uOyBpZiAoXCJ0aHJvd1wiID09PSByZWNvcmQudHlwZSkgeyB2YXIgdGhyb3duID0gcmVjb3JkLmFyZzsgcmVzZXRUcnlFbnRyeShlbnRyeSk7IH0gcmV0dXJuIHRocm93bjsgfSB9IHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTsgfSwgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24gZGVsZWdhdGVZaWVsZChpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykgeyByZXR1cm4gdGhpcy5kZWxlZ2F0ZSA9IHsgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsIG5leHRMb2M6IG5leHRMb2MgfSwgXCJuZXh0XCIgPT09IHRoaXMubWV0aG9kICYmICh0aGlzLmFyZyA9IHVuZGVmaW5lZCksIENvbnRpbnVlU2VudGluZWw7IH0gfSwgZXhwb3J0czsgfVxuZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykgeyB0cnkgeyB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7IHZhciB2YWx1ZSA9IGluZm8udmFsdWU7IH0gY2F0Y2ggKGVycm9yKSB7IHJlamVjdChlcnJvcik7IHJldHVybjsgfSBpZiAoaW5mby5kb25lKSB7IHJlc29sdmUodmFsdWUpOyB9IGVsc2UgeyBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7IH0gfVxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHsgcmV0dXJuIGZ1bmN0aW9uICgpIHsgdmFyIHNlbGYgPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzOyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7IGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7IGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTsgfSBmdW5jdGlvbiBfdGhyb3coZXJyKSB7IGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpOyB9IF9uZXh0KHVuZGVmaW5lZCk7IH0pOyB9OyB9XG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHsgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTsgZW51bWVyYWJsZU9ubHkgJiYgKHN5bWJvbHMgPSBzeW1ib2xzLmZpbHRlcihmdW5jdGlvbiAoc3ltKSB7IHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgc3ltKS5lbnVtZXJhYmxlOyB9KSksIGtleXMucHVzaC5hcHBseShrZXlzLCBzeW1ib2xzKTsgfSByZXR1cm4ga2V5czsgfVxuZnVuY3Rpb24gX29iamVjdFNwcmVhZCh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IG51bGwgIT0gYXJndW1lbnRzW2ldID8gYXJndW1lbnRzW2ldIDoge307IGkgJSAyID8gb3duS2V5cyhPYmplY3Qoc291cmNlKSwgITApLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTsgfSkgOiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSkgOiBvd25LZXlzKE9iamVjdChzb3VyY2UpKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7IH0pOyB9IHJldHVybiB0YXJnZXQ7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsga2V5ID0gX3RvUHJvcGVydHlLZXkoa2V5KTsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIF90b1Byb3BlcnR5S2V5KGRlc2NyaXB0b3Iua2V5KSwgZGVzY3JpcHRvcik7IH0gfVxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uc3RydWN0b3IsIFwicHJvdG90eXBlXCIsIHsgd3JpdGFibGU6IGZhbHNlIH0pOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KGFyZykgeyB2YXIga2V5ID0gX3RvUHJpbWl0aXZlKGFyZywgXCJzdHJpbmdcIik7IHJldHVybiBfdHlwZW9mKGtleSkgPT09IFwic3ltYm9sXCIgPyBrZXkgOiBTdHJpbmcoa2V5KTsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKGlucHV0LCBoaW50KSB7IGlmIChfdHlwZW9mKGlucHV0KSAhPT0gXCJvYmplY3RcIiB8fCBpbnB1dCA9PT0gbnVsbCkgcmV0dXJuIGlucHV0OyB2YXIgcHJpbSA9IGlucHV0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmIChwcmltICE9PSB1bmRlZmluZWQpIHsgdmFyIHJlcyA9IHByaW0uY2FsbChpbnB1dCwgaGludCB8fCBcImRlZmF1bHRcIik7IGlmIChfdHlwZW9mKHJlcykgIT09IFwib2JqZWN0XCIpIHJldHVybiByZXM7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKGhpbnQgPT09IFwic3RyaW5nXCIgPyBTdHJpbmcgOiBOdW1iZXIpKGlucHV0KTsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzdWJDbGFzcywgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpOyB9XG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cbmZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHsgdmFyIF9jYWNoZSA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IHVuZGVmaW5lZDsgX3dyYXBOYXRpdmVTdXBlciA9IGZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHsgaWYgKENsYXNzID09PSBudWxsIHx8ICFfaXNOYXRpdmVGdW5jdGlvbihDbGFzcykpIHJldHVybiBDbGFzczsgaWYgKHR5cGVvZiBDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTsgfSBpZiAodHlwZW9mIF9jYWNoZSAhPT0gXCJ1bmRlZmluZWRcIikgeyBpZiAoX2NhY2hlLmhhcyhDbGFzcykpIHJldHVybiBfY2FjaGUuZ2V0KENsYXNzKTsgX2NhY2hlLnNldChDbGFzcywgV3JhcHBlcik7IH0gZnVuY3Rpb24gV3JhcHBlcigpIHsgcmV0dXJuIF9jb25zdHJ1Y3QoQ2xhc3MsIGFyZ3VtZW50cywgX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yKTsgfSBXcmFwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBXcmFwcGVyLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyByZXR1cm4gX3NldFByb3RvdHlwZU9mKFdyYXBwZXIsIENsYXNzKTsgfTsgcmV0dXJuIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpOyB9XG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHsgaWYgKF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkgeyBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3QuYmluZCgpOyB9IGVsc2UgeyBfY29uc3RydWN0ID0gZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7IHZhciBhID0gW251bGxdOyBhLnB1c2guYXBwbHkoYSwgYXJncyk7IHZhciBDb25zdHJ1Y3RvciA9IEZ1bmN0aW9uLmJpbmQuYXBwbHkoUGFyZW50LCBhKTsgdmFyIGluc3RhbmNlID0gbmV3IENvbnN0cnVjdG9yKCk7IGlmIChDbGFzcykgX3NldFByb3RvdHlwZU9mKGluc3RhbmNlLCBDbGFzcy5wcm90b3R5cGUpOyByZXR1cm4gaW5zdGFuY2U7IH07IH0gcmV0dXJuIF9jb25zdHJ1Y3QuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsgfVxuZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHsgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlOyBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlOyBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlOyB0cnkgeyBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7IHJldHVybiB0cnVlOyB9IGNhdGNoIChlKSB7IHJldHVybiBmYWxzZTsgfSB9XG5mdW5jdGlvbiBfaXNOYXRpdmVGdW5jdGlvbihmbikgeyByZXR1cm4gRnVuY3Rpb24udG9TdHJpbmcuY2FsbChmbikuaW5kZXhPZihcIltuYXRpdmUgY29kZV1cIikgIT09IC0xOyB9XG5mdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2YuYmluZCgpIDogZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHsgby5fX3Byb3RvX18gPSBwOyByZXR1cm4gbzsgfTsgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTsgfVxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mLmJpbmQoKSA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cbmZ1bmN0aW9uIF9hd2FpdEFzeW5jR2VuZXJhdG9yKHZhbHVlKSB7IHJldHVybiBuZXcgX092ZXJsb2FkWWllbGQodmFsdWUsIDApOyB9XG5mdW5jdGlvbiBfd3JhcEFzeW5jR2VuZXJhdG9yKGZuKSB7IHJldHVybiBmdW5jdGlvbiAoKSB7IHJldHVybiBuZXcgX0FzeW5jR2VuZXJhdG9yKGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpOyB9OyB9XG5mdW5jdGlvbiBfQXN5bmNHZW5lcmF0b3IoZ2VuKSB7IHZhciBmcm9udCwgYmFjazsgZnVuY3Rpb24gcmVzdW1lKGtleSwgYXJnKSB7IHRyeSB7IHZhciByZXN1bHQgPSBnZW5ba2V5XShhcmcpLCB2YWx1ZSA9IHJlc3VsdC52YWx1ZSwgb3ZlcmxvYWRlZCA9IHZhbHVlIGluc3RhbmNlb2YgX092ZXJsb2FkWWllbGQ7IFByb21pc2UucmVzb2x2ZShvdmVybG9hZGVkID8gdmFsdWUudiA6IHZhbHVlKS50aGVuKGZ1bmN0aW9uIChhcmcpIHsgaWYgKG92ZXJsb2FkZWQpIHsgdmFyIG5leHRLZXkgPSBcInJldHVyblwiID09PSBrZXkgPyBcInJldHVyblwiIDogXCJuZXh0XCI7IGlmICghdmFsdWUuayB8fCBhcmcuZG9uZSkgcmV0dXJuIHJlc3VtZShuZXh0S2V5LCBhcmcpOyBhcmcgPSBnZW5bbmV4dEtleV0oYXJnKS52YWx1ZTsgfSBzZXR0bGUocmVzdWx0LmRvbmUgPyBcInJldHVyblwiIDogXCJub3JtYWxcIiwgYXJnKTsgfSwgZnVuY3Rpb24gKGVycikgeyByZXN1bWUoXCJ0aHJvd1wiLCBlcnIpOyB9KTsgfSBjYXRjaCAoZXJyKSB7IHNldHRsZShcInRocm93XCIsIGVycik7IH0gfSBmdW5jdGlvbiBzZXR0bGUodHlwZSwgdmFsdWUpIHsgc3dpdGNoICh0eXBlKSB7IGNhc2UgXCJyZXR1cm5cIjogZnJvbnQucmVzb2x2ZSh7IHZhbHVlOiB2YWx1ZSwgZG9uZTogITAgfSk7IGJyZWFrOyBjYXNlIFwidGhyb3dcIjogZnJvbnQucmVqZWN0KHZhbHVlKTsgYnJlYWs7IGRlZmF1bHQ6IGZyb250LnJlc29sdmUoeyB2YWx1ZTogdmFsdWUsIGRvbmU6ICExIH0pOyB9IChmcm9udCA9IGZyb250Lm5leHQpID8gcmVzdW1lKGZyb250LmtleSwgZnJvbnQuYXJnKSA6IGJhY2sgPSBudWxsOyB9IHRoaXMuX2ludm9rZSA9IGZ1bmN0aW9uIChrZXksIGFyZykgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgeyB2YXIgcmVxdWVzdCA9IHsga2V5OiBrZXksIGFyZzogYXJnLCByZXNvbHZlOiByZXNvbHZlLCByZWplY3Q6IHJlamVjdCwgbmV4dDogbnVsbCB9OyBiYWNrID8gYmFjayA9IGJhY2submV4dCA9IHJlcXVlc3QgOiAoZnJvbnQgPSBiYWNrID0gcmVxdWVzdCwgcmVzdW1lKGtleSwgYXJnKSk7IH0pOyB9LCBcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIGdlbltcInJldHVyblwiXSAmJiAodGhpc1tcInJldHVyblwiXSA9IHZvaWQgMCk7IH1cbl9Bc3luY0dlbmVyYXRvci5wcm90b3R5cGVbXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBfQXN5bmNHZW5lcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbiAoYXJnKSB7IHJldHVybiB0aGlzLl9pbnZva2UoXCJuZXh0XCIsIGFyZyk7IH0sIF9Bc3luY0dlbmVyYXRvci5wcm90b3R5cGVbXCJ0aHJvd1wiXSA9IGZ1bmN0aW9uIChhcmcpIHsgcmV0dXJuIHRoaXMuX2ludm9rZShcInRocm93XCIsIGFyZyk7IH0sIF9Bc3luY0dlbmVyYXRvci5wcm90b3R5cGVbXCJyZXR1cm5cIl0gPSBmdW5jdGlvbiAoYXJnKSB7IHJldHVybiB0aGlzLl9pbnZva2UoXCJyZXR1cm5cIiwgYXJnKTsgfTtcbmZ1bmN0aW9uIF9PdmVybG9hZFlpZWxkKHZhbHVlLCBraW5kKSB7IHRoaXMudiA9IHZhbHVlLCB0aGlzLmsgPSBraW5kOyB9IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBDb3B5cmlnaHQgMjAyMCAtIDIwMjQgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG52YXIgV2lkZ2V0QXBpUmVzcG9uc2VFcnJvciA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0Vycm9yKSB7XG4gIF9pbmhlcml0cyhXaWRnZXRBcGlSZXNwb25zZUVycm9yLCBfRXJyb3IpO1xuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKFdpZGdldEFwaVJlc3BvbnNlRXJyb3IpO1xuICBmdW5jdGlvbiBXaWRnZXRBcGlSZXNwb25zZUVycm9yKG1lc3NhZ2UsIGRhdGEpIHtcbiAgICB2YXIgX3RoaXMyO1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXaWRnZXRBcGlSZXNwb25zZUVycm9yKTtcbiAgICBfdGhpczIgPSBfc3VwZXIuY2FsbCh0aGlzLCBtZXNzYWdlKTtcbiAgICBfdGhpczIuZGF0YSA9IGRhdGE7XG4gICAgcmV0dXJuIF90aGlzMjtcbiAgfVxuICByZXR1cm4gX2NyZWF0ZUNsYXNzKFdpZGdldEFwaVJlc3BvbnNlRXJyb3IpO1xufSggLyojX19QVVJFX18qL193cmFwTmF0aXZlU3VwZXIoRXJyb3IpKTtcbi8qKlxuICogQVBJIGhhbmRsZXIgZm9yIHdpZGdldHMuIFRoaXMgcmFpc2VzIGV2ZW50cyBmb3IgZWFjaCBhY3Rpb25cbiAqIHJlY2VpdmVkIGFzIGBhY3Rpb246JHthY3Rpb259YCAoZWc6IFwiYWN0aW9uOnNjcmVlbnNob3RcIikuXG4gKiBEZWZhdWx0IGhhbmRsaW5nIGNhbiBiZSBwcmV2ZW50ZWQgYnkgdXNpbmcgcHJldmVudERlZmF1bHQoKVxuICogb24gdGhlIHJhaXNlZCBldmVudC4gVGhlIGRlZmF1bHQgaGFuZGxpbmcgdmFyaWVzIGZvciBlYWNoXG4gKiBhY3Rpb246IG9uZXMgd2hpY2ggdGhlIFNESyBjYW4gaGFuZGxlIHNhZmVseSBhcmUgYWNrbm93bGVkZ2VkXG4gKiBhcHByb3ByaWF0ZWx5IGFuZCBvbmVzIHdoaWNoIGFyZSB1bmhhbmRsZWQgKGN1c3RvbSBvciByZXF1aXJlXG4gKiB0aGUgd2lkZ2V0IHRvIGRvIHNvbWV0aGluZykgYXJlIHJlamVjdGVkIHdpdGggYW4gZXJyb3IuXG4gKlxuICogRXZlbnRzIHdoaWNoIGFyZSBwcmV2ZW50RGVmYXVsdCgpZWQgbXVzdCByZXBseSB1c2luZyB0aGVcbiAqIHRyYW5zcG9ydC4gVGhlIGV2ZW50cyByYWlzZWQgd2lsbCBoYXZlIGEgZGV0YWlsIG9mIGFuXG4gKiBJV2lkZ2V0QXBpUmVxdWVzdCBpbnRlcmZhY2UuXG4gKlxuICogV2hlbiB0aGUgV2lkZ2V0QXBpIGlzIHJlYWR5IHRvIHN0YXJ0IHNlbmRpbmcgcmVxdWVzdHMsIGl0IHdpbGxcbiAqIHJhaXNlIGEgXCJyZWFkeVwiIEN1c3RvbUV2ZW50LiBBZnRlciB0aGUgcmVhZHkgZXZlbnQgZmlyZXMsIGFjdGlvbnNcbiAqIGNhbiBiZSBzZW50IGFuZCB0aGUgdHJhbnNwb3J0IHdpbGwgYmUgcmVhZHkuXG4gKi9cbmV4cG9ydHMuV2lkZ2V0QXBpUmVzcG9uc2VFcnJvciA9IFdpZGdldEFwaVJlc3BvbnNlRXJyb3I7XG5XaWRnZXRBcGlSZXNwb25zZUVycm9yLnByb3RvdHlwZS5uYW1lID0gV2lkZ2V0QXBpUmVzcG9uc2VFcnJvci5uYW1lO1xudmFyIFdpZGdldEFwaSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0V2ZW50RW1pdHRlcikge1xuICBfaW5oZXJpdHMoV2lkZ2V0QXBpLCBfRXZlbnRFbWl0dGVyKTtcbiAgdmFyIF9zdXBlcjIgPSBfY3JlYXRlU3VwZXIoV2lkZ2V0QXBpKTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQVBJIGhhbmRsZXIgZm9yIHRoZSBnaXZlbiB3aWRnZXQuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXRJZCBUaGUgd2lkZ2V0IElEIHRvIGxpc3RlbiBmb3IuIElmIG5vdCBzdXBwbGllZCB0aGVuXG4gICAqIHRoZSBBUEkgd2lsbCB1c2UgdGhlIHdpZGdldCBJRCBmcm9tIHRoZSBmaXJzdCB2YWxpZCByZXF1ZXN0IGl0IHJlY2VpdmVzLlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2xpZW50T3JpZ2luIFRoZSBvcmlnaW4gb2YgdGhlIGNsaWVudCwgb3IgbnVsbCBpZiBub3Qga25vd24uXG4gICAqL1xuICBmdW5jdGlvbiBXaWRnZXRBcGkoKSB7XG4gICAgdmFyIF90aGlzMztcbiAgICB2YXIgd2lkZ2V0SWQgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IG51bGw7XG4gICAgdmFyIGNsaWVudE9yaWdpbiA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgV2lkZ2V0QXBpKTtcbiAgICBfdGhpczMgPSBfc3VwZXIyLmNhbGwodGhpcyk7XG4gICAgX3RoaXMzLmNsaWVudE9yaWdpbiA9IGNsaWVudE9yaWdpbjtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpLCBcInRyYW5zcG9ydFwiLCB2b2lkIDApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIFwiY2FwYWJpbGl0aWVzRmluaXNoZWRcIiwgZmFsc2UpO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIFwic3VwcG9ydHNNU0MyOTc0UmVuZWdvdGlhdGVcIiwgZmFsc2UpO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIFwicmVxdWVzdGVkQ2FwYWJpbGl0aWVzXCIsIFtdKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpczMpLCBcImFwcHJvdmVkQ2FwYWJpbGl0aWVzXCIsIHZvaWQgMCk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSwgXCJjYWNoZWRDbGllbnRWZXJzaW9uc1wiLCB2b2lkIDApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMyksIFwidHVyblNlcnZlcldhdGNoZXJzXCIsIDApO1xuICAgIGlmICghd2luZG93LnBhcmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcGFyZW50IHdpbmRvdy4gVGhpcyB3aWRnZXQgZG9lc24ndCBhcHBlYXIgdG8gYmUgZW1iZWRkZWQgcHJvcGVybHkuXCIpO1xuICAgIH1cbiAgICBfdGhpczMudHJhbnNwb3J0ID0gbmV3IF9Qb3N0bWVzc2FnZVRyYW5zcG9ydC5Qb3N0bWVzc2FnZVRyYW5zcG9ydChfV2lkZ2V0QXBpRGlyZWN0aW9uLldpZGdldEFwaURpcmVjdGlvbi5Gcm9tV2lkZ2V0LCB3aWRnZXRJZCwgd2luZG93LnBhcmVudCwgd2luZG93KTtcbiAgICBfdGhpczMudHJhbnNwb3J0LnRhcmdldE9yaWdpbiA9IGNsaWVudE9yaWdpbjtcbiAgICBfdGhpczMudHJhbnNwb3J0Lm9uKFwibWVzc2FnZVwiLCBfdGhpczMuaGFuZGxlTWVzc2FnZS5iaW5kKF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMzKSkpO1xuICAgIHJldHVybiBfdGhpczM7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpZiB0aGUgd2lkZ2V0IHdhcyBncmFudGVkIGEgcGFydGljdWxhciBjYXBhYmlsaXR5LiBOb3RlIHRoYXQgb25cbiAgICogY2xpZW50cyB3aGVyZSB0aGUgY2FwYWJpbGl0aWVzIGFyZSBub3QgZmVkIGJhY2sgdG8gdGhlIHdpZGdldCB0aGlzIGZ1bmN0aW9uXG4gICAqIHdpbGwgcmVseSBvbiByZXF1ZXN0ZWQgY2FwYWJpbGl0aWVzIGluc3RlYWQuXG4gICAqIEBwYXJhbSB7Q2FwYWJpbGl0eX0gY2FwYWJpbGl0eSBUaGUgY2FwYWJpbGl0eSB0byBjaGVjayBmb3IgYXBwcm92YWwgb2YuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSBUcnVlIGlmIHRoZSB3aWRnZXQgaGFzIGFwcHJvdmFsIGZvciB0aGUgZ2l2ZW4gY2FwYWJpbGl0eS5cbiAgICovXG4gIF9jcmVhdGVDbGFzcyhXaWRnZXRBcGksIFt7XG4gICAga2V5OiBcImhhc0NhcGFiaWxpdHlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaGFzQ2FwYWJpbGl0eShjYXBhYmlsaXR5KSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0aGlzLmFwcHJvdmVkQ2FwYWJpbGl0aWVzKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHByb3ZlZENhcGFiaWxpdGllcy5pbmNsdWRlcyhjYXBhYmlsaXR5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlcXVlc3RlZENhcGFiaWxpdGllcy5pbmNsdWRlcyhjYXBhYmlsaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGEgY2FwYWJpbGl0eSBmcm9tIHRoZSBjbGllbnQuIEl0IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsXG4gICAgICogYnV0IHdpbGwgYmUgYXNrZWQgZm9yLlxuICAgICAqIEBwYXJhbSB7Q2FwYWJpbGl0eX0gY2FwYWJpbGl0eSBUaGUgY2FwYWJpbGl0eSB0byByZXF1ZXN0LlxuICAgICAqIEB0aHJvd3MgVGhyb3dzIGlmIHRoZSBjYXBhYmlsaXRpZXMgbmVnb3RpYXRpb24gaGFzIGFscmVhZHkgc3RhcnRlZCBhbmQgdGhlXG4gICAgICogd2lkZ2V0IGlzIHVuYWJsZSB0byByZXF1ZXN0IGFkZGl0aW9uYWwgY2FwYWJpbGl0aWVzLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlcXVlc3RDYXBhYmlsaXR5KGNhcGFiaWxpdHkpIHtcbiAgICAgIGlmICh0aGlzLmNhcGFiaWxpdGllc0ZpbmlzaGVkICYmICF0aGlzLnN1cHBvcnRzTVNDMjk3NFJlbmVnb3RpYXRlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhcGFiaWxpdGllcyBoYXZlIGFscmVhZHkgYmVlbiBuZWdvdGlhdGVkXCIpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZXF1ZXN0ZWRDYXBhYmlsaXRpZXMucHVzaChjYXBhYmlsaXR5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0IGNhcGFiaWxpdGllcyBmcm9tIHRoZSBjbGllbnQuIFRoZXkgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsXG4gICAgICogYnV0IHdpbGwgYmUgYXNrZWQgZm9yIGlmIHRoZSBuZWdvdGlhdGlvbiBoYXMgbm90IGFscmVhZHkgaGFwcGVuZWQuXG4gICAgICogQHBhcmFtIHtDYXBhYmlsaXR5W119IGNhcGFiaWxpdGllcyBUaGUgY2FwYWJpbGl0aWVzIHRvIHJlcXVlc3QuXG4gICAgICogQHRocm93cyBUaHJvd3MgaWYgdGhlIGNhcGFiaWxpdGllcyBuZWdvdGlhdGlvbiBoYXMgYWxyZWFkeSBzdGFydGVkLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXRpZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdGllcyhjYXBhYmlsaXRpZXMpIHtcbiAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuICAgICAgY2FwYWJpbGl0aWVzLmZvckVhY2goZnVuY3Rpb24gKGNhcCkge1xuICAgICAgICByZXR1cm4gX3RoaXM0LnJlcXVlc3RDYXBhYmlsaXR5KGNhcCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyB0aGUgY2FwYWJpbGl0eSB0byBpbnRlcmFjdCB3aXRoIHJvb21zIG90aGVyIHRoYW4gdGhlIHVzZXIncyBjdXJyZW50bHlcbiAgICAgKiB2aWV3ZWQgcm9vbS4gQXBwbGllcyB0byBldmVudCByZWNlaXZpbmcgYW5kIHNlbmRpbmcuXG4gICAgICogQHBhcmFtIHtzdHJpbmcgfCBTeW1ib2xzLkFueVJvb219IHJvb21JZCBUaGUgcm9vbSBJRCwgb3IgYFN5bWJvbHMuQW55Um9vbWAgdG9cbiAgICAgKiBkZW5vdGUgYWxsIGtub3duIHJvb21zLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5Rm9yUm9vbVRpbWVsaW5lXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlcXVlc3RDYXBhYmlsaXR5Rm9yUm9vbVRpbWVsaW5lKHJvb21JZCkge1xuICAgICAgdGhpcy5yZXF1ZXN0Q2FwYWJpbGl0eShcIm9yZy5tYXRyaXgubXNjMjc2Mi50aW1lbGluZTpcIi5jb25jYXQocm9vbUlkKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIGNhcGFiaWxpdHkgdG8gc2VuZCBhIGdpdmVuIHN0YXRlIGV2ZW50IHdpdGggb3B0aW9uYWwgZXhwbGljaXRcbiAgICAgKiBzdGF0ZSBrZXkuIEl0IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGVcbiAgICAgKiBuZWdvdGlhdGlvbiBoYXMgbm90IGFscmVhZHkgaGFwcGVuZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBUaGUgc3RhdGUgZXZlbnQgdHlwZSB0byBhc2sgZm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZUtleSBJZiBzcGVjaWZpZWQsIHRoZSBzcGVjaWZpYyBzdGF0ZSBrZXkgdG8gcmVxdWVzdC5cbiAgICAgKiBPdGhlcndpc2UgYWxsIHN0YXRlIGtleXMgd2lsbCBiZSByZXF1ZXN0ZWQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVxdWVzdENhcGFiaWxpdHlUb1NlbmRTdGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0Q2FwYWJpbGl0eVRvU2VuZFN0YXRlKGV2ZW50VHlwZSwgc3RhdGVLZXkpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yU3RhdGVFdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlNlbmQsIGV2ZW50VHlwZSwgc3RhdGVLZXkpLnJhdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIGNhcGFiaWxpdHkgdG8gcmVjZWl2ZSBhIGdpdmVuIHN0YXRlIGV2ZW50IHdpdGggb3B0aW9uYWwgZXhwbGljaXRcbiAgICAgKiBzdGF0ZSBrZXkuIEl0IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGVcbiAgICAgKiBuZWdvdGlhdGlvbiBoYXMgbm90IGFscmVhZHkgaGFwcGVuZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBUaGUgc3RhdGUgZXZlbnQgdHlwZSB0byBhc2sgZm9yLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZUtleSBJZiBzcGVjaWZpZWQsIHRoZSBzcGVjaWZpYyBzdGF0ZSBrZXkgdG8gcmVxdWVzdC5cbiAgICAgKiBPdGhlcndpc2UgYWxsIHN0YXRlIGtleXMgd2lsbCBiZSByZXF1ZXN0ZWQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVxdWVzdENhcGFiaWxpdHlUb1JlY2VpdmVTdGF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0Q2FwYWJpbGl0eVRvUmVjZWl2ZVN0YXRlKGV2ZW50VHlwZSwgc3RhdGVLZXkpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yU3RhdGVFdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlJlY2VpdmUsIGV2ZW50VHlwZSwgc3RhdGVLZXkpLnJhdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIGNhcGFiaWxpdHkgdG8gc2VuZCBhIGdpdmVuIHRvLWRldmljZSBldmVudC4gSXQgaXMgbm90XG4gICAgICogZ3VhcmFudGVlZCB0byBiZSBhbGxvd2VkLCBidXQgd2lsbCBiZSBhc2tlZCBmb3IgaWYgdGhlIG5lZ290aWF0aW9uIGhhc1xuICAgICAqIG5vdCBhbHJlYWR5IGhhcHBlbmVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgVGhlIHJvb20gZXZlbnQgdHlwZSB0byBhc2sgZm9yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5VG9TZW5kVG9EZXZpY2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdHlUb1NlbmRUb0RldmljZShldmVudFR5cGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yVG9EZXZpY2VFdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlNlbmQsIGV2ZW50VHlwZSkucmF3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyB0aGUgY2FwYWJpbGl0eSB0byByZWNlaXZlIGEgZ2l2ZW4gdG8tZGV2aWNlIGV2ZW50LiBJdCBpcyBub3RcbiAgICAgKiBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGUgbmVnb3RpYXRpb24gaGFzXG4gICAgICogbm90IGFscmVhZHkgaGFwcGVuZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBUaGUgcm9vbSBldmVudCB0eXBlIHRvIGFzayBmb3IuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVxdWVzdENhcGFiaWxpdHlUb1JlY2VpdmVUb0RldmljZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0Q2FwYWJpbGl0eVRvUmVjZWl2ZVRvRGV2aWNlKGV2ZW50VHlwZSkge1xuICAgICAgdGhpcy5yZXF1ZXN0Q2FwYWJpbGl0eShfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LldpZGdldEV2ZW50Q2FwYWJpbGl0eS5mb3JUb0RldmljZUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSwgZXZlbnRUeXBlKS5yYXcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIHRoZSBjYXBhYmlsaXR5IHRvIHNlbmQgYSBnaXZlbiByb29tIGV2ZW50LiBJdCBpcyBub3QgZ3VhcmFudGVlZCB0byBiZVxuICAgICAqIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGUgbmVnb3RpYXRpb24gaGFzIG5vdCBhbHJlYWR5IGhhcHBlbmVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgVGhlIHJvb20gZXZlbnQgdHlwZSB0byBhc2sgZm9yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5VG9TZW5kRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdHlUb1NlbmRFdmVudChldmVudFR5cGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yUm9vbUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uU2VuZCwgZXZlbnRUeXBlKS5yYXcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIHRoZSBjYXBhYmlsaXR5IHRvIHJlY2VpdmUgYSBnaXZlbiByb29tIGV2ZW50LiBJdCBpcyBub3QgZ3VhcmFudGVlZCB0byBiZVxuICAgICAqIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGUgbmVnb3RpYXRpb24gaGFzIG5vdCBhbHJlYWR5IGhhcHBlbmVkLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFR5cGUgVGhlIHJvb20gZXZlbnQgdHlwZSB0byBhc2sgZm9yLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5VG9SZWNlaXZlRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdHlUb1JlY2VpdmVFdmVudChldmVudFR5cGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yUm9vbUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSwgZXZlbnRUeXBlKS5yYXcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlcXVlc3RzIHRoZSBjYXBhYmlsaXR5IHRvIHNlbmQgYSBnaXZlbiBtZXNzYWdlIGV2ZW50IHdpdGggb3B0aW9uYWwgZXhwbGljaXRcbiAgICAgKiBgbXNndHlwZWAuIEl0IGlzIG5vdCBndWFyYW50ZWVkIHRvIGJlIGFsbG93ZWQsIGJ1dCB3aWxsIGJlIGFza2VkIGZvciBpZiB0aGVcbiAgICAgKiBuZWdvdGlhdGlvbiBoYXMgbm90IGFscmVhZHkgaGFwcGVuZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1zZ3R5cGUgSWYgc3BlY2lmaWVkLCB0aGUgc3BlY2lmaWMgbXNndHlwZSB0byByZXF1ZXN0LlxuICAgICAqIE90aGVyd2lzZSBhbGwgbWVzc2FnZSB0eXBlcyB3aWxsIGJlIHJlcXVlc3RlZC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJyZXF1ZXN0Q2FwYWJpbGl0eVRvU2VuZE1lc3NhZ2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdHlUb1NlbmRNZXNzYWdlKG1zZ3R5cGUpIHtcbiAgICAgIHRoaXMucmVxdWVzdENhcGFiaWxpdHkoX1dpZGdldEV2ZW50Q2FwYWJpbGl0eS5XaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yUm9vbU1lc3NhZ2VFdmVudChfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlNlbmQsIG1zZ3R5cGUpLnJhdyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgdGhlIGNhcGFiaWxpdHkgdG8gcmVjZWl2ZSBhIGdpdmVuIG1lc3NhZ2UgZXZlbnQgd2l0aCBvcHRpb25hbCBleHBsaWNpdFxuICAgICAqIGBtc2d0eXBlYC4gSXQgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmUgYWxsb3dlZCwgYnV0IHdpbGwgYmUgYXNrZWQgZm9yIGlmIHRoZVxuICAgICAqIG5lZ290aWF0aW9uIGhhcyBub3QgYWxyZWFkeSBoYXBwZW5lZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbXNndHlwZSBJZiBzcGVjaWZpZWQsIHRoZSBzcGVjaWZpYyBtc2d0eXBlIHRvIHJlcXVlc3QuXG4gICAgICogT3RoZXJ3aXNlIGFsbCBtZXNzYWdlIHR5cGVzIHdpbGwgYmUgcmVxdWVzdGVkLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlcXVlc3RDYXBhYmlsaXR5VG9SZWNlaXZlTWVzc2FnZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0Q2FwYWJpbGl0eVRvUmVjZWl2ZU1lc3NhZ2UobXNndHlwZSkge1xuICAgICAgdGhpcy5yZXF1ZXN0Q2FwYWJpbGl0eShfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LldpZGdldEV2ZW50Q2FwYWJpbGl0eS5mb3JSb29tTWVzc2FnZUV2ZW50KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuRXZlbnREaXJlY3Rpb24uUmVjZWl2ZSwgbXNndHlwZSkucmF3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyB0aGUgY2FwYWJpbGl0eSB0byByZWNlaXZlIGEgZ2l2ZW4gaXRlbSBpbiByb29tIGFjY291bnQgZGF0YS4gSXQgaXMgbm90IGd1YXJhbnRlZWQgdG8gYmVcbiAgICAgKiBhbGxvd2VkLCBidXQgd2lsbCBiZSBhc2tlZCBmb3IgaWYgdGhlIG5lZ290aWF0aW9uIGhhcyBub3QgYWxyZWFkeSBoYXBwZW5lZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFRoZSBzdGF0ZSBldmVudCB0eXBlIHRvIGFzayBmb3IuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVxdWVzdENhcGFiaWxpdHlUb1JlY2VpdmVSb29tQWNjb3VudERhdGFcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVxdWVzdENhcGFiaWxpdHlUb1JlY2VpdmVSb29tQWNjb3VudERhdGEoZXZlbnRUeXBlKSB7XG4gICAgICB0aGlzLnJlcXVlc3RDYXBhYmlsaXR5KF9XaWRnZXRFdmVudENhcGFiaWxpdHkuV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LmZvclJvb21BY2NvdW50RGF0YShfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LkV2ZW50RGlyZWN0aW9uLlJlY2VpdmUsIGV2ZW50VHlwZSkucmF3KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXF1ZXN0cyBhbiBPcGVuSUQgQ29ubmVjdCB0b2tlbiBmcm9tIHRoZSBjbGllbnQgZm9yIHRoZSBjdXJyZW50bHkgbG9nZ2VkIGluXG4gICAgICogdXNlci4gVGhpcyB0b2tlbiBjYW4gYmUgdmFsaWRhdGVkIHNlcnZlci1zaWRlIHdpdGggdGhlIGZlZGVyYXRpb24gQVBJLiBOb3RlXG4gICAgICogdGhhdCB0aGUgd2lkZ2V0IGlzIHJlc3BvbnNpYmxlIGZvciB2YWxpZGF0aW5nIHRoZSB0b2tlbiBhbmQgY2FjaGluZyBhbnkgcmVzdWx0c1xuICAgICAqIGl0IG5lZWRzLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPElPcGVuSURDcmVkZW50aWFscz59IFJlc29sdmVzIHRvIGEgdG9rZW4gZm9yIHZlcmlmaWNhdGlvbi5cbiAgICAgKiBAdGhyb3dzIFRocm93cyBpZiB0aGUgdXNlciByZWplY3RlZCB0aGUgcmVxdWVzdCBvciB0aGUgcmVxdWVzdCBmYWlsZWQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVxdWVzdE9wZW5JRENvbm5lY3RUb2tlblwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXF1ZXN0T3BlbklEQ29ubmVjdFRva2VuKCkge1xuICAgICAgdmFyIF90aGlzNSA9IHRoaXM7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBfdGhpczUudHJhbnNwb3J0LnNlbmRDb21wbGV0ZShfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uR2V0T3BlbklEQ3JlZGVudGlhbHMsIHt9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgIHZhciByZGF0YSA9IHJlc3BvbnNlLnJlc3BvbnNlO1xuICAgICAgICAgIGlmIChyZGF0YS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuQWxsb3dlZCkge1xuICAgICAgICAgICAgcmVzb2x2ZShyZGF0YSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZGF0YS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuQmxvY2tlZCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlVzZXIgZGVjbGluZWQgdG8gdmVyaWZ5IHRoZWlyIGlkZW50aXR5XCIpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJkYXRhLnN0YXRlID09PSBfR2V0T3BlbklEQWN0aW9uLk9wZW5JRFJlcXVlc3RTdGF0ZS5QZW5kaW5nVXNlckNvbmZpcm1hdGlvbikge1xuICAgICAgICAgICAgdmFyIGhhbmRsZXJGbiA9IGZ1bmN0aW9uIGhhbmRsZXJGbihldikge1xuICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IGV2LmRldGFpbDtcbiAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuZGF0YS5vcmlnaW5hbF9yZXF1ZXN0X2lkICE9PSByZXNwb25zZS5yZXF1ZXN0SWQpIHJldHVybjtcbiAgICAgICAgICAgICAgaWYgKHJlcXVlc3QuZGF0YS5zdGF0ZSA9PT0gX0dldE9wZW5JREFjdGlvbi5PcGVuSURSZXF1ZXN0U3RhdGUuQWxsb3dlZCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5kYXRhKTtcbiAgICAgICAgICAgICAgICBfdGhpczUudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHt9KTsgLy8gYWNrXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5kYXRhLnN0YXRlID09PSBfR2V0T3BlbklEQWN0aW9uLk9wZW5JRFJlcXVlc3RTdGF0ZS5CbG9ja2VkKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlVzZXIgZGVjbGluZWQgdG8gdmVyaWZ5IHRoZWlyIGlkZW50aXR5XCIpKTtcbiAgICAgICAgICAgICAgICBfdGhpczUudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHt9KTsgLy8gYWNrXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGUgb24gcmVwbHk6IFwiICsgcmRhdGEuc3RhdGUpKTtcbiAgICAgICAgICAgICAgICBfdGhpczUudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICAgICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiSW52YWxpZCBzdGF0ZVwiXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgX3RoaXM1Lm9mZihcImFjdGlvbjpcIi5jb25jYXQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5PcGVuSURDcmVkZW50aWFscyksIGhhbmRsZXJGbik7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX3RoaXM1Lm9uKFwiYWN0aW9uOlwiLmNvbmNhdChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLk9wZW5JRENyZWRlbnRpYWxzKSwgaGFuZGxlckZuKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGU6IFwiICsgcmRhdGEuc3RhdGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pW1wiY2F0Y2hcIl0ocmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFza3MgdGhlIGNsaWVudCBmb3IgYWRkaXRpb25hbCBjYXBhYmlsaXRpZXMuIENhcGFiaWxpdGllcyBjYW4gYmUgcXVldWVkIGZvciB0aGlzXG4gICAgICogcmVxdWVzdCB3aXRoIHRoZSByZXF1ZXN0Q2FwYWJpbGl0eSgpIGZ1bmN0aW9ucy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gUmVzb2x2ZXMgd2hlbiBjb21wbGV0ZS4gTm90ZSB0aGF0IHRoZSBwcm9taXNlIHJlc29sdmVzIHdoZW5cbiAgICAgKiB0aGUgY2FwYWJpbGl0aWVzIHJlcXVlc3QgaGFzIGdvbmUgdGhyb3VnaCwgbm90IHdoZW4gdGhlIGNhcGFiaWxpdGllcyBhcmUgYXBwcm92ZWQvZGVuaWVkLlxuICAgICAqIFVzZSB0aGUgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uTm90aWZ5Q2FwYWJpbGl0aWVzIGFjdGlvbiB0byBkZXRlY3QgY2hhbmdlcy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVSZXF1ZXN0ZWRDYXBhYmlsaXRpZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlUmVxdWVzdGVkQ2FwYWJpbGl0aWVzKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzI5NzRSZW5lZ290aWF0ZUNhcGFiaWxpdGllcywge1xuICAgICAgICBjYXBhYmlsaXRpZXM6IHRoaXMucmVxdWVzdGVkQ2FwYWJpbGl0aWVzXG4gICAgICB9KS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGVsbCB0aGUgY2xpZW50IHRoYXQgdGhlIGNvbnRlbnQgaGFzIGJlZW4gbG9hZGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSBjbGllbnQgYWNrbm93bGVkZ2VzIHRoZSByZXF1ZXN0LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInNlbmRDb250ZW50TG9hZGVkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRDb250ZW50TG9hZGVkKCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLkNvbnRlbnRMb2FkZWQsIHt9KS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYSBzdGlja2VyIHRvIHRoZSBjbGllbnQuXG4gICAgICogQHBhcmFtIHtJU3RpY2tlckFjdGlvblJlcXVlc3REYXRhfSBzdGlja2VyIFRoZSBzdGlja2VyIHRvIHNlbmQuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIGNsaWVudCBhY2tub3dsZWRnZXMgdGhlIHJlcXVlc3QuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwic2VuZFN0aWNrZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZFN0aWNrZXIoc3RpY2tlcikge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLlNlbmRTdGlja2VyLCBzdGlja2VyKS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNrcyB0aGUgY2xpZW50IHRvIHNldCB0aGUgYWx3YXlzLW9uLXNjcmVlbiBzdGF0dXMgZm9yIHRoaXMgd2lkZ2V0LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgVGhlIG5ldyBzdGF0ZSB0byByZXF1ZXN0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBSZXNvbHZlIHdpdGggdHJ1ZSBpZiB0aGUgY2xpZW50IHdhcyBhYmxlIHRvIGZ1bGZpbGxcbiAgICAgKiB0aGUgcmVxdWVzdCwgcmVzb2x2ZXMgdG8gZmFsc2Ugb3RoZXJ3aXNlLiBSZWplY3RzIGlmIGFuIGVycm9yIG9jY3VycmVkLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInNldEFsd2F5c09uU2NyZWVuXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldEFsd2F5c09uU2NyZWVuKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uVXBkYXRlQWx3YXlzT25TY3JlZW4sIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgcmV0dXJuIHJlcy5zdWNjZXNzO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3BlbnMgYSBtb2RhbCB3aWRnZXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVybCBUaGUgVVJMIHRvIHRoZSBtb2RhbCB3aWRnZXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge0lNb2RhbFdpZGdldE9wZW5SZXF1ZXN0RGF0YUJ1dHRvbltdfSBidXR0b25zIFRoZSBidXR0b25zIHRvIGhhdmUgb24gdGhlIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge0lNb2RhbFdpZGdldENyZWF0ZURhdGF9IGRhdGEgRGF0YSB0byBzdXBwbHkgdG8gdGhlIG1vZGFsIHdpZGdldC5cbiAgICAgKiBAcGFyYW0ge1dpZGdldFR5cGV9IHR5cGUgVGhlIHR5cGUgb2YgbW9kYWwgd2lkZ2V0LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBSZXNvbHZlcyB3aGVuIHRoZSBtb2RhbCB3aWRnZXQgaGFzIGJlZW4gb3BlbmVkLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcIm9wZW5Nb2RhbFdpZGdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuTW9kYWxXaWRnZXQodXJsLCBuYW1lKSB7XG4gICAgICB2YXIgYnV0dG9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogW107XG4gICAgICB2YXIgZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDoge307XG4gICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ICYmIGFyZ3VtZW50c1s0XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzRdIDogX1dpZGdldFR5cGUuTWF0cml4V2lkZ2V0VHlwZS5DdXN0b207XG4gICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uT3Blbk1vZGFsV2lkZ2V0LCB7XG4gICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgIHVybDogdXJsLFxuICAgICAgICBuYW1lOiBuYW1lLFxuICAgICAgICBidXR0b25zOiBidXR0b25zLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xvc2VzIHRoZSBtb2RhbCB3aWRnZXQuIFRoZSB3aWRnZXQncyBzZXNzaW9uIHdpbGwgYmUgdGVybWluYXRlZCBzaG9ydGx5IGFmdGVyLlxuICAgICAqIEBwYXJhbSB7SU1vZGFsV2lkZ2V0UmV0dXJuRGF0YX0gZGF0YSBPcHRpb25hbCBkYXRhIHRvIGNsb3NlIHRoZSBtb2RhbCB3aWRnZXQgd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gUmVzb2x2ZXMgd2hlbiBjb21wbGV0ZS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJjbG9zZU1vZGFsV2lkZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlTW9kYWxXaWRnZXQoKSB7XG4gICAgICB2YXIgZGF0YSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uQ2xvc2VNb2RhbFdpZGdldCwgZGF0YSkudGhlbigpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZW5kUm9vbUV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRSb29tRXZlbnQoZXZlbnRUeXBlLCBjb250ZW50LCByb29tSWQsIGRlbGF5LCBwYXJlbnREZWxheUlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZW5kRXZlbnQoZXZlbnRUeXBlLCB1bmRlZmluZWQsIGNvbnRlbnQsIHJvb21JZCwgZGVsYXksIHBhcmVudERlbGF5SWQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZW5kU3RhdGVFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kU3RhdGVFdmVudChldmVudFR5cGUsIHN0YXRlS2V5LCBjb250ZW50LCByb29tSWQsIGRlbGF5LCBwYXJlbnREZWxheUlkKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZW5kRXZlbnQoZXZlbnRUeXBlLCBzdGF0ZUtleSwgY29udGVudCwgcm9vbUlkLCBkZWxheSwgcGFyZW50RGVsYXlJZCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbmRFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnRUeXBlLCBzdGF0ZUtleSwgY29udGVudCwgcm9vbUlkLCBkZWxheSwgcGFyZW50RGVsYXlJZCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLlNlbmRFdmVudCwgX29iamVjdFNwcmVhZChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoX29iamVjdFNwcmVhZCh7XG4gICAgICAgIHR5cGU6IGV2ZW50VHlwZSxcbiAgICAgICAgY29udGVudDogY29udGVudFxuICAgICAgfSwgc3RhdGVLZXkgIT09IHVuZGVmaW5lZCAmJiB7XG4gICAgICAgIHN0YXRlX2tleTogc3RhdGVLZXlcbiAgICAgIH0pLCByb29tSWQgIT09IHVuZGVmaW5lZCAmJiB7XG4gICAgICAgIHJvb21faWQ6IHJvb21JZFxuICAgICAgfSksIGRlbGF5ICE9PSB1bmRlZmluZWQgJiYge1xuICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgIH0pLCBwYXJlbnREZWxheUlkICE9PSB1bmRlZmluZWQgJiYge1xuICAgICAgICBwYXJlbnRfZGVsYXlfaWQ6IHBhcmVudERlbGF5SWRcbiAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBUaGlzIGN1cnJlbnRseSByZWxpZXMgb24gYW4gdW5zdGFibGUgTVNDIChNU0M0MTU3KS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVEZWxheWVkRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRGVsYXllZEV2ZW50KGRlbGF5SWQsIGFjdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzQxNTdVcGRhdGVEZWxheWVkRXZlbnQsIHtcbiAgICAgICAgZGVsYXlfaWQ6IGRlbGF5SWQsXG4gICAgICAgIGFjdGlvbjogYWN0aW9uXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBhIHRvLWRldmljZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFRoZSB0eXBlIG9mIGV2ZW50cyBiZWluZyBzZW50LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5jcnlwdGVkIFdoZXRoZXIgdG8gZW5jcnlwdCB0aGUgbWVzc2FnZSBjb250ZW50cy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGVudE1hcCBBIG1hcCBmcm9tIHVzZXIgSURzIHRvIGRldmljZSBJRHMgdG8gbWVzc2FnZSBjb250ZW50cy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJU2VuZFRvRGV2aWNlRnJvbVdpZGdldFJlc3BvbnNlRGF0YT59IFJlc29sdmVzIHdoZW4gY29tcGxldGUuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwic2VuZFRvRGV2aWNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRUb0RldmljZShldmVudFR5cGUsIGVuY3J5cHRlZCwgY29udGVudE1hcCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLlNlbmRUb0RldmljZSwge1xuICAgICAgICB0eXBlOiBldmVudFR5cGUsXG4gICAgICAgIGVuY3J5cHRlZDogZW5jcnlwdGVkLFxuICAgICAgICBtZXNzYWdlczogY29udGVudE1hcFxuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInJlYWRSb29tQWNjb3VudERhdGFcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZFJvb21BY2NvdW50RGF0YShldmVudFR5cGUsIHJvb21JZHMpIHtcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0eXBlOiBldmVudFR5cGVcbiAgICAgIH07XG4gICAgICBpZiAocm9vbUlkcykge1xuICAgICAgICBpZiAocm9vbUlkcy5pbmNsdWRlcyhfU3ltYm9scy5TeW1ib2xzLkFueVJvb20pKSB7XG4gICAgICAgICAgZGF0YS5yb29tX2lkcyA9IF9TeW1ib2xzLlN5bWJvbHMuQW55Um9vbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhLnJvb21faWRzID0gcm9vbUlkcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLkJlZXBlclJlYWRSb29tQWNjb3VudERhdGEsIGRhdGEpLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgcmV0dXJuIHIuZXZlbnRzO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInJlYWRSb29tRXZlbnRzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRSb29tRXZlbnRzKGV2ZW50VHlwZSwgbGltaXQsIG1zZ3R5cGUsIHJvb21JZHMsIHNpbmNlKSB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogZXZlbnRUeXBlLFxuICAgICAgICBtc2d0eXBlOiBtc2d0eXBlXG4gICAgICB9O1xuICAgICAgaWYgKGxpbWl0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgZGF0YS5saW1pdCA9IGxpbWl0O1xuICAgICAgfVxuICAgICAgaWYgKHJvb21JZHMpIHtcbiAgICAgICAgaWYgKHJvb21JZHMuaW5jbHVkZXMoX1N5bWJvbHMuU3ltYm9scy5BbnlSb29tKSkge1xuICAgICAgICAgIGRhdGEucm9vbV9pZHMgPSBfU3ltYm9scy5TeW1ib2xzLkFueVJvb207XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YS5yb29tX2lkcyA9IHJvb21JZHM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzaW5jZSkge1xuICAgICAgICBkYXRhLnNpbmNlID0gc2luY2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uTVNDMjg3NlJlYWRFdmVudHMsIGRhdGEpLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgcmV0dXJuIHIuZXZlbnRzO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgYWxsIHJlbGF0ZWQgZXZlbnRzIGdpdmVuIGEga25vd24gZXZlbnRJZC5cbiAgICAgKiBAcGFyYW0gZXZlbnRJZCBUaGUgaWQgb2YgdGhlIHBhcmVudCBldmVudCB0byBiZSByZWFkLlxuICAgICAqIEBwYXJhbSByb29tSWQgVGhlIHJvb20gdG8gbG9vayB3aXRoaW4uIFdoZW4gdW5kZWZpbmVkLCB0aGUgdXNlcidzIGN1cnJlbnRseVxuICAgICAqIHZpZXdlZCByb29tLlxuICAgICAqIEBwYXJhbSByZWxhdGlvblR5cGUgVGhlIHJlbGF0aW9uc2hpcCB0eXBlIG9mIGNoaWxkIGV2ZW50cyB0byBzZWFyY2ggZm9yLlxuICAgICAqIFdoZW4gdW5kZWZpbmVkLCBhbGwgcmVsYXRpb25zIGFyZSByZXR1cm5lZC5cbiAgICAgKiBAcGFyYW0gZXZlbnRUeXBlIFRoZSBldmVudCB0eXBlIG9mIGNoaWxkIGV2ZW50cyB0byBzZWFyY2ggZm9yLiBXaGVuIHVuZGVmaW5lZCxcbiAgICAgKiBhbGwgcmVsYXRlZCBldmVudHMgYXJlIHJldHVybmVkLlxuICAgICAqIEBwYXJhbSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIHJldHJpZXZlIHBlciByb29tLiBJZiBub3RcbiAgICAgKiBzdXBwbGllZCwgdGhlIHNlcnZlciB3aWxsIGFwcGx5IGEgZGVmYXVsdCBsaW1pdC5cbiAgICAgKiBAcGFyYW0gZnJvbSBUaGUgcGFnaW5hdGlvbiB0b2tlbiB0byBzdGFydCByZXR1cm5pbmcgcmVzdWx0cyBmcm9tLCBhc1xuICAgICAqIHJlY2VpdmVkIGZyb20gYSBwcmV2aW91cyBjYWxsLiBJZiBub3Qgc3VwcGxpZWQsIHJlc3VsdHMgc3RhcnQgYXQgdGhlIG1vc3RcbiAgICAgKiByZWNlbnQgdG9wb2xvZ2ljYWwgZXZlbnQga25vd24gdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0gdG8gVGhlIHBhZ2luYXRpb24gdG9rZW4gdG8gc3RvcCByZXR1cm5pbmcgcmVzdWx0cyBhdC4gSWYgbm90XG4gICAgICogc3VwcGxpZWQsIHJlc3VsdHMgY29udGludWUgdXAgdG8gbGltaXQgb3IgdW50aWwgdGhlcmUgYXJlIG5vIG1vcmUgZXZlbnRzLlxuICAgICAqIEBwYXJhbSBkaXJlY3Rpb24gVGhlIGRpcmVjdGlvbiB0byBzZWFyY2ggZm9yIGFjY29yZGluZyB0byBNU0MzNzE1LlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVzIHRvIHRoZSByb29tIHJlbGF0aW9ucy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJyZWFkRXZlbnRSZWxhdGlvbnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9yZWFkRXZlbnRSZWxhdGlvbnMgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWUoZXZlbnRJZCwgcm9vbUlkLCByZWxhdGlvblR5cGUsIGV2ZW50VHlwZSwgbGltaXQsIGZyb20sIHRvLCBkaXJlY3Rpb24pIHtcbiAgICAgICAgdmFyIHZlcnNpb25zLCBkYXRhO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZSQoX2NvbnRleHQpIHtcbiAgICAgICAgICB3aGlsZSAoMSkgc3dpdGNoIChfY29udGV4dC5wcmV2ID0gX2NvbnRleHQubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBfY29udGV4dC5uZXh0ID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50VmVyc2lvbnMoKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgdmVyc2lvbnMgPSBfY29udGV4dC5zZW50O1xuICAgICAgICAgICAgICBpZiAodmVyc2lvbnMuaW5jbHVkZXMoX0FwaVZlcnNpb24uVW5zdGFibGVBcGlWZXJzaW9uLk1TQzM4NjkpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQubmV4dCA9IDU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHJlYWRfcmVsYXRpb25zIGFjdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjbGllbnQuXCIpO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGV2ZW50X2lkOiBldmVudElkLFxuICAgICAgICAgICAgICAgIHJlbF90eXBlOiByZWxhdGlvblR5cGUsXG4gICAgICAgICAgICAgICAgZXZlbnRfdHlwZTogZXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICB0bzogdG8sXG4gICAgICAgICAgICAgICAgZnJvbTogZnJvbSxcbiAgICAgICAgICAgICAgICBsaW1pdDogbGltaXQsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBkaXJlY3Rpb25cbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0LmFicnVwdChcInJldHVyblwiLCB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5NU0MzODY5UmVhZFJlbGF0aW9ucywgZGF0YSkpO1xuICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgY2FzZSBcImVuZFwiOlxuICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZSwgdGhpcyk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiByZWFkRXZlbnRSZWxhdGlvbnMoX3gsIF94MiwgX3gzLCBfeDQsIF94NSwgX3g2LCBfeDcsIF94OCkge1xuICAgICAgICByZXR1cm4gX3JlYWRFdmVudFJlbGF0aW9ucy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlYWRFdmVudFJlbGF0aW9ucztcbiAgICB9KClcbiAgfSwge1xuICAgIGtleTogXCJyZWFkU3RhdGVFdmVudHNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZFN0YXRlRXZlbnRzKGV2ZW50VHlwZSwgbGltaXQsIHN0YXRlS2V5LCByb29tSWRzKSB7XG4gICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogZXZlbnRUeXBlLFxuICAgICAgICBzdGF0ZV9rZXk6IHN0YXRlS2V5ID09PSB1bmRlZmluZWQgPyB0cnVlIDogc3RhdGVLZXlcbiAgICAgIH07XG4gICAgICBpZiAobGltaXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRhLmxpbWl0ID0gbGltaXQ7XG4gICAgICB9XG4gICAgICBpZiAocm9vbUlkcykge1xuICAgICAgICBpZiAocm9vbUlkcy5pbmNsdWRlcyhfU3ltYm9scy5TeW1ib2xzLkFueVJvb20pKSB7XG4gICAgICAgICAgZGF0YS5yb29tX2lkcyA9IF9TeW1ib2xzLlN5bWJvbHMuQW55Um9vbTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhLnJvb21faWRzID0gcm9vbUlkcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzI4NzZSZWFkRXZlbnRzLCBkYXRhKS50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgIHJldHVybiByLmV2ZW50cztcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSBidXR0b24gYXMgZGlzYWJsZWQgb3IgZW5hYmxlZCBvbiB0aGUgbW9kYWwgd2lkZ2V0LiBCdXR0b25zIGFyZSBlbmFibGVkIGJ5IGRlZmF1bHQuXG4gICAgICogQHBhcmFtIHtNb2RhbEJ1dHRvbklEfSBidXR0b25JZCBUaGUgYnV0dG9uIElEIHRvIGVuYWJsZS9kaXNhYmxlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNFbmFibGVkIFdoZXRoZXIgb3Igbm90IHRoZSBidXR0b24gaXMgZW5hYmxlZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gUmVzb2x2ZXMgd2hlbiBjb21wbGV0ZS5cbiAgICAgKiBAdGhyb3dzIFRocm93cyBpZiB0aGUgYnV0dG9uIGNhbm5vdCBiZSBkaXNhYmxlZCwgb3IgdGhlIGNsaWVudCByZWZ1c2VzIHRvIGRpc2FibGUgdGhlIGJ1dHRvbi5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJzZXRNb2RhbEJ1dHRvbkVuYWJsZWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2V0TW9kYWxCdXR0b25FbmFibGVkKGJ1dHRvbklkLCBpc0VuYWJsZWQpIHtcbiAgICAgIGlmIChidXR0b25JZCA9PT0gX01vZGFsV2lkZ2V0QWN0aW9ucy5CdWlsdEluTW9kYWxCdXR0b25JRC5DbG9zZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgY2xvc2UgYnV0dG9uIGNhbm5vdCBiZSBkaXNhYmxlZFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TZXRNb2RhbEJ1dHRvbkVuYWJsZWQsIHtcbiAgICAgICAgYnV0dG9uOiBidXR0b25JZCxcbiAgICAgICAgZW5hYmxlZDogaXNFbmFibGVkXG4gICAgICB9KS50aGVuKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdHMgdG8gbmF2aWdhdGUgdGhlIGNsaWVudCB0byB0aGUgZ2l2ZW4gVVJJLiBUaGlzIGNhbiBvbmx5IGJlIGNhbGxlZCB3aXRoIE1hdHJpeCBVUklzXG4gICAgICogKGN1cnJlbnRseSBvbmx5IG1hdHJpeC50bywgYnV0IGluIGZ1dHVyZSBhIE1hdHJpeCBVUkkgc2NoZW1lIHdpbGwgYmUgZGVmaW5lZCkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVyaSBUaGUgVVJJIHRvIG5hdmlnYXRlIHRvLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBSZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICAgICAqIEB0aHJvd3MgVGhyb3dzIGlmIHRoZSBVUkkgaXMgaW52YWxpZCBvciBjYW5ub3QgYmUgcHJvY2Vzc2VkLlxuICAgICAqIEBkZXByZWNhdGVkIFRoaXMgY3VycmVudGx5IHJlbGllcyBvbiBhbiB1bnN0YWJsZSBNU0MgKE1TQzI5MzEpLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcIm5hdmlnYXRlVG9cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbmF2aWdhdGVUbyh1cmkpIHtcbiAgICAgIGlmICghdXJpIHx8ICF1cmkuc3RhcnRzV2l0aChcImh0dHBzOi8vbWF0cml4LnRvLyNcIikpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBtYXRyaXgudG8gVVJJXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzI5MzFOYXZpZ2F0ZSwge1xuICAgICAgICB1cmk6IHVyaVxuICAgICAgfSkudGhlbigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyB3YXRjaGluZyBmb3IgVFVSTiBzZXJ2ZXJzLCB5aWVsZGluZyBhbiBpbml0aWFsIHNldCBvZiBjcmVkZW50aWFscyBhcyBzb29uIGFzIHBvc3NpYmxlLFxuICAgICAqIGFuZCB0aGVyZWFmdGVyIHlpZWxkaW5nIG5ldyBjcmVkZW50aWFscyB3aGVuZXZlciB0aGUgcHJldmlvdXMgb25lcyBleHBpcmUuXG4gICAgICogQHlpZWxkcyB7SVR1cm5TZXJ2ZXJ9IFRoZSBUVVJOIHNlcnZlciBVUklzIGFuZCBjcmVkZW50aWFscyBjdXJyZW50bHkgYXZhaWxhYmxlIHRvIHRoZSB3aWRnZXQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VHVyblNlcnZlcnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VHVyblNlcnZlcnMoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgcmV0dXJuIF93cmFwQXN5bmNHZW5lcmF0b3IoIC8qI19fUFVSRV9fKi9fcmVnZW5lcmF0b3JSdW50aW1lKCkubWFyayhmdW5jdGlvbiBfY2FsbGVlMygpIHtcbiAgICAgICAgdmFyIHNldFR1cm5TZXJ2ZXIsIG9uVXBkYXRlVHVyblNlcnZlcnM7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlMyQoX2NvbnRleHQzKSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQzLnByZXYgPSBfY29udGV4dDMubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBvblVwZGF0ZVR1cm5TZXJ2ZXJzID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3JlZiA9IF9hc3luY1RvR2VuZXJhdG9yKCAvKiNfX1BVUkVfXyovX3JlZ2VuZXJhdG9yUnVudGltZSgpLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTIoZXYpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlMiQoX2NvbnRleHQyKSB7XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0Mi5wcmV2ID0gX2NvbnRleHQyLm5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VHVyblNlcnZlcihldi5kZXRhaWwuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dDIubmV4dCA9IDQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwge30pO1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2NvbnRleHQyLnN0b3AoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSwgX2NhbGxlZTIpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gb25VcGRhdGVUdXJuU2VydmVycyhfeDkpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVmLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSgpOyAvLyBTdGFydCBsaXN0ZW5pbmcgZm9yIHVwZGF0ZXMgYmVmb3JlIHdlIGV2ZW4gc3RhcnQgd2F0Y2hpbmcsIHRvIGNhdGNoXG4gICAgICAgICAgICAgIC8vIFRVUk4gZGF0YSB0aGF0IGlzIHNlbnQgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgX3RoaXMub24oXCJhY3Rpb246XCIuY29uY2F0KF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uVXBkYXRlVHVyblNlcnZlcnMpLCBvblVwZGF0ZVR1cm5TZXJ2ZXJzKTtcblxuICAgICAgICAgICAgICAvLyBPbmx5IHNlbmQgdGhlICd3YXRjaCcgYWN0aW9uIGlmIHdlIGFyZW4ndCBhbHJlYWR5IHdhdGNoaW5nXG4gICAgICAgICAgICAgIGlmICghKF90aGlzLnR1cm5TZXJ2ZXJXYXRjaGVycyA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDEyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0My5wcmV2ID0gMztcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSA2O1xuICAgICAgICAgICAgICByZXR1cm4gX2F3YWl0QXN5bmNHZW5lcmF0b3IoX3RoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLldhdGNoVHVyblNlcnZlcnMsIHt9KSk7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBfY29udGV4dDMucHJldiA9IDg7XG4gICAgICAgICAgICAgIF9jb250ZXh0My50MCA9IF9jb250ZXh0M1tcImNhdGNoXCJdKDMpO1xuICAgICAgICAgICAgICBfdGhpcy5vZmYoXCJhY3Rpb246XCIuY29uY2F0KF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uVXBkYXRlVHVyblNlcnZlcnMpLCBvblVwZGF0ZVR1cm5TZXJ2ZXJzKTtcbiAgICAgICAgICAgICAgdGhyb3cgX2NvbnRleHQzLnQwO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgX3RoaXMudHVyblNlcnZlcldhdGNoZXJzKys7XG4gICAgICAgICAgICAgIF9jb250ZXh0My5wcmV2ID0gMTM7XG4gICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICBpZiAoIXRydWUpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDIxO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMTc7XG4gICAgICAgICAgICAgIHJldHVybiBfYXdhaXRBc3luY0dlbmVyYXRvcihuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXRUdXJuU2VydmVyID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgY2FzZSAxNzpcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxOTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5zZW50O1xuICAgICAgICAgICAgY2FzZSAxOTpcbiAgICAgICAgICAgICAgX2NvbnRleHQzLm5leHQgPSAxNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgICBfY29udGV4dDMucHJldiA9IDIxO1xuICAgICAgICAgICAgICAvLyBUaGUgbG9vcCB3YXMgYnJva2VuIGJ5IHRoZSBjYWxsZXIgLSBjbGVhbiB1cFxuICAgICAgICAgICAgICBfdGhpcy5vZmYoXCJhY3Rpb246XCIuY29uY2F0KF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uVXBkYXRlVHVyblNlcnZlcnMpLCBvblVwZGF0ZVR1cm5TZXJ2ZXJzKTtcblxuICAgICAgICAgICAgICAvLyBTaW5jZSBzZW5kaW5nIHRoZSAndW53YXRjaCcgYWN0aW9uIHdpbGwgZW5kIHVwZGF0ZXMgZm9yIGFsbCBvdGhlclxuICAgICAgICAgICAgICAvLyBjb25zdW1lcnMsIG9ubHkgc2VuZCBpdCBpZiB3ZSdyZSB0aGUgb25seSBjb25zdW1lciByZW1haW5pbmdcbiAgICAgICAgICAgICAgX3RoaXMudHVyblNlcnZlcldhdGNoZXJzLS07XG4gICAgICAgICAgICAgIGlmICghKF90aGlzLnR1cm5TZXJ2ZXJXYXRjaGVycyA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDMubmV4dCA9IDI3O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF9jb250ZXh0My5uZXh0ID0gMjc7XG4gICAgICAgICAgICAgIHJldHVybiBfYXdhaXRBc3luY0dlbmVyYXRvcihfdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uVW53YXRjaFR1cm5TZXJ2ZXJzLCB7fSkpO1xuICAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5maW5pc2goMjEpO1xuICAgICAgICAgICAgY2FzZSAyODpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0My5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlMywgbnVsbCwgW1szLCA4XSwgWzEzLCwgMjEsIDI4XV0pO1xuICAgICAgfSkpKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIGZvciB1c2VycyBpbiB0aGUgdXNlciBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHNlYXJjaFRlcm0gVGhlIHRlcm0gdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcGFyYW0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuLiBJZiBub3Qgc3VwcGxpZWQsIHRoZVxuICAgICAqIEByZXR1cm5zIFJlc29sdmVzIHRvIHRoZSBzZWFyY2ggcmVzdWx0cy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJzZWFyY2hVc2VyRGlyZWN0b3J5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfc2VhcmNoVXNlckRpcmVjdG9yeSA9IF9hc3luY1RvR2VuZXJhdG9yKCAvKiNfX1BVUkVfXyovX3JlZ2VuZXJhdG9yUnVudGltZSgpLm1hcmsoZnVuY3Rpb24gX2NhbGxlZTQoc2VhcmNoVGVybSwgbGltaXQpIHtcbiAgICAgICAgdmFyIHZlcnNpb25zLCBkYXRhO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTQkKF9jb250ZXh0NCkge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0NC5wcmV2ID0gX2NvbnRleHQ0Lm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDbGllbnRWZXJzaW9ucygpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICB2ZXJzaW9ucyA9IF9jb250ZXh0NC5zZW50O1xuICAgICAgICAgICAgICBpZiAodmVyc2lvbnMuaW5jbHVkZXMoX0FwaVZlcnNpb24uVW5zdGFibGVBcGlWZXJzaW9uLk1TQzM5NzMpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ0Lm5leHQgPSA1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSB1c2VyX2RpcmVjdG9yeV9zZWFyY2ggYWN0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGNsaWVudC5cIik7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoX3Rlcm06IHNlYXJjaFRlcm0sXG4gICAgICAgICAgICAgICAgbGltaXQ6IGxpbWl0XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDQuYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzM5NzNVc2VyRGlyZWN0b3J5U2VhcmNoLCBkYXRhKSk7XG4gICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDQuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTQsIHRoaXMpO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gc2VhcmNoVXNlckRpcmVjdG9yeShfeDEwLCBfeDExKSB7XG4gICAgICAgIHJldHVybiBfc2VhcmNoVXNlckRpcmVjdG9yeS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNlYXJjaFVzZXJEaXJlY3Rvcnk7XG4gICAgfSgpXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb25maWcgZm9yIHRoZSBtZWRpYSByZXBvc2l0b3J5LlxuICAgICAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY29uZmlnLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcImdldE1lZGlhQ29uZmlnXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBfZ2V0TWVkaWFDb25maWcgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWU1KCkge1xuICAgICAgICB2YXIgdmVyc2lvbnMsIGRhdGE7XG4gICAgICAgIHJldHVybiBfcmVnZW5lcmF0b3JSdW50aW1lKCkud3JhcChmdW5jdGlvbiBfY2FsbGVlNSQoX2NvbnRleHQ1KSB7XG4gICAgICAgICAgd2hpbGUgKDEpIHN3aXRjaCAoX2NvbnRleHQ1LnByZXYgPSBfY29udGV4dDUubmV4dCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENsaWVudFZlcnNpb25zKCk7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgIHZlcnNpb25zID0gX2NvbnRleHQ1LnNlbnQ7XG4gICAgICAgICAgICAgIGlmICh2ZXJzaW9ucy5pbmNsdWRlcyhfQXBpVmVyc2lvbi5VbnN0YWJsZUFwaVZlcnNpb24uTVNDNDAzOSkpIHtcbiAgICAgICAgICAgICAgICBfY29udGV4dDUubmV4dCA9IDU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGdldF9tZWRpYV9jb25maWcgYWN0aW9uIGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGNsaWVudC5cIik7XG4gICAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0NS5hYnJ1cHQoXCJyZXR1cm5cIiwgdGhpcy50cmFuc3BvcnQuc2VuZChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaUZyb21XaWRnZXRBY3Rpb24uTVNDNDAzOUdldE1lZGlhQ29uZmlnQWN0aW9uLCBkYXRhKSk7XG4gICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDUuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTUsIHRoaXMpO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gZ2V0TWVkaWFDb25maWcoKSB7XG4gICAgICAgIHJldHVybiBfZ2V0TWVkaWFDb25maWcuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBnZXRNZWRpYUNvbmZpZztcbiAgICB9KClcbiAgICAvKipcbiAgICAgKiBVcGxvYWQgYSBmaWxlIHRvIHRoZSBtZWRpYSByZXBvc2l0b3J5IG9uIHRoZSBob21lc2VydmVyLlxuICAgICAqIEBwYXJhbSBmaWxlIC0gVGhlIG9iamVjdCB0byB1cGxvYWQuIFNvbWV0aGluZyB0aGF0IGNhbiBiZSBzZW50IHRvXG4gICAgICogICAgICAgICAgICAgICBYTUxIdHRwUmVxdWVzdC5zZW5kICh0eXBpY2FsbHkgYSBGaWxlKS5cbiAgICAgKiBAcmV0dXJucyBSZXNvbHZlcyB0byB0aGUgbG9jYXRpb24gb2YgdGhlIHVwbG9hZGVkIGZpbGUuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwidXBsb2FkRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgX3VwbG9hZEZpbGUgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWU2KGZpbGUpIHtcbiAgICAgICAgdmFyIHZlcnNpb25zLCBkYXRhO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTYkKF9jb250ZXh0Nikge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0Ni5wcmV2ID0gX2NvbnRleHQ2Lm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ2Lm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDbGllbnRWZXJzaW9ucygpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICB2ZXJzaW9ucyA9IF9jb250ZXh0Ni5zZW50O1xuICAgICAgICAgICAgICBpZiAodmVyc2lvbnMuaW5jbHVkZXMoX0FwaVZlcnNpb24uVW5zdGFibGVBcGlWZXJzaW9uLk1TQzQwMzkpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ2Lm5leHQgPSA1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSB1cGxvYWRfZmlsZSBhY3Rpb24gaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgY2xpZW50LlwiKTtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBmaWxlOiBmaWxlXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDYuYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzQwMzlVcGxvYWRGaWxlQWN0aW9uLCBkYXRhKSk7XG4gICAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICBjYXNlIFwiZW5kXCI6XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDYuc3RvcCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgX2NhbGxlZTYsIHRoaXMpO1xuICAgICAgfSkpO1xuICAgICAgZnVuY3Rpb24gdXBsb2FkRmlsZShfeDEyKSB7XG4gICAgICAgIHJldHVybiBfdXBsb2FkRmlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVwbG9hZEZpbGU7XG4gICAgfSgpXG4gICAgLyoqXG4gICAgICogRG93bmxvYWQgYSBmaWxlIGZyb20gdGhlIG1lZGlhIHJlcG9zaXRvcnkgb24gdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICogQHBhcmFtIGNvbnRlbnRVcmkgLSBNWEMgVVJJIG9mIHRoZSBmaWxlIHRvIGRvd25sb2FkLlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVzIHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJkb3dubG9hZEZpbGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIF9kb3dubG9hZEZpbGUgPSBfYXN5bmNUb0dlbmVyYXRvciggLyojX19QVVJFX18qL19yZWdlbmVyYXRvclJ1bnRpbWUoKS5tYXJrKGZ1bmN0aW9uIF9jYWxsZWU3KGNvbnRlbnRVcmkpIHtcbiAgICAgICAgdmFyIHZlcnNpb25zLCBkYXRhO1xuICAgICAgICByZXR1cm4gX3JlZ2VuZXJhdG9yUnVudGltZSgpLndyYXAoZnVuY3Rpb24gX2NhbGxlZTckKF9jb250ZXh0Nykge1xuICAgICAgICAgIHdoaWxlICgxKSBzd2l0Y2ggKF9jb250ZXh0Ny5wcmV2ID0gX2NvbnRleHQ3Lm5leHQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSAyO1xuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDbGllbnRWZXJzaW9ucygpO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICB2ZXJzaW9ucyA9IF9jb250ZXh0Ny5zZW50O1xuICAgICAgICAgICAgICBpZiAodmVyc2lvbnMuaW5jbHVkZXMoX0FwaVZlcnNpb24uVW5zdGFibGVBcGlWZXJzaW9uLk1TQzQwMzkpKSB7XG4gICAgICAgICAgICAgICAgX2NvbnRleHQ3Lm5leHQgPSA1O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoZSBkb3dubG9hZF9maWxlIGFjdGlvbiBpcyBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBjbGllbnQuXCIpO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGNvbnRlbnRfdXJpOiBjb250ZW50VXJpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHJldHVybiBfY29udGV4dDcuYWJydXB0KFwicmV0dXJuXCIsIHRoaXMudHJhbnNwb3J0LnNlbmQoX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uLk1TQzQwMzlEb3dubG9hZEZpbGVBY3Rpb24sIGRhdGEpKTtcbiAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIGNhc2UgXCJlbmRcIjpcbiAgICAgICAgICAgICAgcmV0dXJuIF9jb250ZXh0Ny5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBfY2FsbGVlNywgdGhpcyk7XG4gICAgICB9KSk7XG4gICAgICBmdW5jdGlvbiBkb3dubG9hZEZpbGUoX3gxMykge1xuICAgICAgICByZXR1cm4gX2Rvd25sb2FkRmlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRvd25sb2FkRmlsZTtcbiAgICB9KClcbiAgICAvKipcbiAgICAgKiBTdGFydHMgdGhlIGNvbW11bmljYXRpb24gY2hhbm5lbC4gVGhpcyBzaG91bGQgYmUgZG9uZSBlYXJseSB0byBlbnN1cmVcbiAgICAgKiB0aGF0IG1lc3NhZ2VzIGFyZSBub3QgbWlzc2VkLiBDb21tdW5pY2F0aW9uIGNhbiBvbmx5IGJlIHN0b3BwZWQgYnkgdGhlIGNsaWVudC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJzdGFydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuICAgICAgdGhpcy50cmFuc3BvcnQuc3RhcnQoKTtcbiAgICAgIHRoaXMuZ2V0Q2xpZW50VmVyc2lvbnMoKS50aGVuKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGlmICh2LmluY2x1ZGVzKF9BcGlWZXJzaW9uLlVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyOTc0KSkge1xuICAgICAgICAgIF90aGlzNi5zdXBwb3J0c01TQzI5NzRSZW5lZ290aWF0ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVNZXNzYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZXYpIHtcbiAgICAgIHZhciBhY3Rpb25FdiA9IG5ldyBDdXN0b21FdmVudChcImFjdGlvbjpcIi5jb25jYXQoZXYuZGV0YWlsLmFjdGlvbiksIHtcbiAgICAgICAgZGV0YWlsOiBldi5kZXRhaWwsXG4gICAgICAgIGNhbmNlbGFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5lbWl0KFwiYWN0aW9uOlwiLmNvbmNhdChldi5kZXRhaWwuYWN0aW9uKSwgYWN0aW9uRXYpO1xuICAgICAgaWYgKCFhY3Rpb25Fdi5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgIHN3aXRjaCAoZXYuZGV0YWlsLmFjdGlvbikge1xuICAgICAgICAgIGNhc2UgX1dpZGdldEFwaUFjdGlvbi5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5TdXBwb3J0ZWRBcGlWZXJzaW9uczpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGx5VmVyc2lvbnMoZXYuZGV0YWlsKTtcbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uQ2FwYWJpbGl0aWVzOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlQ2FwYWJpbGl0aWVzKGV2LmRldGFpbCk7XG4gICAgICAgICAgY2FzZSBfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLlVwZGF0ZVZpc2liaWxpdHk6XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCB7fSk7XG4gICAgICAgICAgLy8gYWNrIHRvIGF2b2lkIGVycm9yIHNwYW1cbiAgICAgICAgICBjYXNlIF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24uTm90aWZ5Q2FwYWJpbGl0aWVzOlxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LnJlcGx5KGV2LmRldGFpbCwge30pO1xuICAgICAgICAgIC8vIGFjayB0byBhdm9pZCBlcnJvciBzcGFtXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIHtcbiAgICAgICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcIlVua25vd24gb3IgdW5zdXBwb3J0ZWQgYWN0aW9uOiBcIiArIGV2LmRldGFpbC5hY3Rpb25cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVwbHlWZXJzaW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXBseVZlcnNpb25zKHJlcXVlc3QpIHtcbiAgICAgIHRoaXMudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgc3VwcG9ydGVkX3ZlcnNpb25zOiBfQXBpVmVyc2lvbi5DdXJyZW50QXBpVmVyc2lvbnNcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRDbGllbnRWZXJzaW9uc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDbGllbnRWZXJzaW9ucygpIHtcbiAgICAgIHZhciBfdGhpczcgPSB0aGlzO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5jYWNoZWRDbGllbnRWZXJzaW9ucykpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLmNhY2hlZENsaWVudFZlcnNpb25zKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5zZW5kKF9XaWRnZXRBcGlBY3Rpb24uV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbi5TdXBwb3J0ZWRBcGlWZXJzaW9ucywge30pLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgX3RoaXM3LmNhY2hlZENsaWVudFZlcnNpb25zID0gci5zdXBwb3J0ZWRfdmVyc2lvbnM7XG4gICAgICAgIHJldHVybiByLnN1cHBvcnRlZF92ZXJzaW9ucztcbiAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwibm9uLWZhdGFsIGVycm9yIGdldHRpbmcgc3VwcG9ydGVkIGNsaWVudCB2ZXJzaW9uczogXCIsIGUpO1xuICAgICAgICByZXR1cm4gW107XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlQ2FwYWJpbGl0aWVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZUNhcGFiaWxpdGllcyhyZXF1ZXN0KSB7XG4gICAgICB2YXIgX3RoaXM4ID0gdGhpcztcbiAgICAgIGlmICh0aGlzLmNhcGFiaWxpdGllc0ZpbmlzaGVkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5yZXBseShyZXF1ZXN0LCB7XG4gICAgICAgICAgZXJyb3I6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiQ2FwYWJpbGl0eSBuZWdvdGlhdGlvbiBhbHJlYWR5IGNvbXBsZXRlZFwiXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VlIGlmIHdlIGNhbiBleHBlY3QgYSBjYXBhYmlsaXRpZXMgbm90aWZpY2F0aW9uIG9yIG5vdFxuICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2xpZW50VmVyc2lvbnMoKS50aGVuKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIGlmICh2LmluY2x1ZGVzKF9BcGlWZXJzaW9uLlVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyODcxKSkge1xuICAgICAgICAgIF90aGlzOC5vbmNlKFwiYWN0aW9uOlwiLmNvbmNhdChfV2lkZ2V0QXBpQWN0aW9uLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uLk5vdGlmeUNhcGFiaWxpdGllcyksIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgX3RoaXM4LmFwcHJvdmVkQ2FwYWJpbGl0aWVzID0gZXYuZGV0YWlsLmRhdGEuYXBwcm92ZWQ7XG4gICAgICAgICAgICBfdGhpczguZW1pdChcInJlYWR5XCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGlmIHdlIGNhbid0IGV4cGVjdCBub3RpZmljYXRpb24sIHdlJ3JlIGFzIGRvbmUgYXMgd2UgY2FuIGJlXG4gICAgICAgICAgX3RoaXM4LmVtaXQoXCJyZWFkeVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluIGVpdGhlciBjYXNlLCByZXBseSB0byB0aGF0IGNhcGFiaWxpdGllcyByZXF1ZXN0XG4gICAgICAgIF90aGlzOC5jYXBhYmlsaXRpZXNGaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBfdGhpczgudHJhbnNwb3J0LnJlcGx5KHJlcXVlc3QsIHtcbiAgICAgICAgICBjYXBhYmlsaXRpZXM6IF90aGlzOC5yZXF1ZXN0ZWRDYXBhYmlsaXRpZXNcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIFdpZGdldEFwaTtcbn0oX2V2ZW50cy5FdmVudEVtaXR0ZXIpO1xuZXhwb3J0cy5XaWRnZXRBcGkgPSBXaWRnZXRBcGk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1XaWRnZXRBcGkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLldpZGdldERyaXZlciA9IHZvaWQgMDtcbnZhciBfID0gcmVxdWlyZShcIi4uXCIpO1xuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyByZXR1cm4gX3R5cGVvZiA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIFwic3ltYm9sXCIgPT0gdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH0sIF90eXBlb2Yob2JqKTsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkoYXJnKSB7IHZhciBrZXkgPSBfdG9QcmltaXRpdmUoYXJnLCBcInN0cmluZ1wiKTsgcmV0dXJuIF90eXBlb2Yoa2V5KSA9PT0gXCJzeW1ib2xcIiA/IGtleSA6IFN0cmluZyhrZXkpOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUoaW5wdXQsIGhpbnQpIHsgaWYgKF90eXBlb2YoaW5wdXQpICE9PSBcIm9iamVjdFwiIHx8IGlucHV0ID09PSBudWxsKSByZXR1cm4gaW5wdXQ7IHZhciBwcmltID0gaW5wdXRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHByaW0gIT09IHVuZGVmaW5lZCkgeyB2YXIgcmVzID0gcHJpbS5jYWxsKGlucHV0LCBoaW50IHx8IFwiZGVmYXVsdFwiKTsgaWYgKF90eXBlb2YocmVzKSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHJlczsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoaGludCA9PT0gXCJzdHJpbmdcIiA/IFN0cmluZyA6IE51bWJlcikoaW5wdXQpOyB9IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQ29weXJpZ2h0IDIwMjAgLSAyMDI0IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgZnVuY3Rpb25zIGFuZCBiZWhhdmlvdXIgdGhlIHdpZGdldC1hcGkgaXMgdW5hYmxlIHRvXG4gKiBkbywgc3VjaCBhcyBwcm9tcHRpbmcgdGhlIHVzZXIgZm9yIGluZm9ybWF0aW9uIG9yIGludGVyYWN0aW5nIHdpdGhcbiAqIHRoZSBVSS4gQ2xpZW50cyBhcmUgZXhwZWN0ZWQgdG8gaW1wbGVtZW50IHRoaXMgY2xhc3MgYW5kIG92ZXJyaWRlXG4gKiBhbnkgZnVuY3Rpb25zIHRoZXkgbmVlZC93YW50IHRvIHN1cHBvcnQuXG4gKlxuICogVGhpcyBjbGFzcyBhc3N1bWVzIHRoZSBjbGllbnQgd2lsbCBoYXZlIGEgY29udGV4dCBvZiBhIFdpZGdldFxuICogaW5zdGFuY2UgYWxyZWFkeS5cbiAqL1xudmFyIFdpZGdldERyaXZlciA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFdpZGdldERyaXZlcigpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgV2lkZ2V0RHJpdmVyKTtcbiAgfVxuICBfY3JlYXRlQ2xhc3MoV2lkZ2V0RHJpdmVyLCBbe1xuICAgIGtleTogXCJ2YWxpZGF0ZUNhcGFiaWxpdGllc1wiLFxuICAgIHZhbHVlOlxuICAgIC8qKlxuICAgICAqIFZlcmlmaWVzIHRoZSB3aWRnZXQncyByZXF1ZXN0ZWQgY2FwYWJpbGl0aWVzLCByZXR1cm5pbmcgdGhlIG9uZXNcbiAgICAgKiBpdCBpcyBhcHByb3ZlZCB0byB1c2UuIE11dGF0aW5nIHRoZSByZXF1ZXN0ZWQgY2FwYWJpbGl0aWVzIHdpbGxcbiAgICAgKiBoYXZlIG5vIGVmZmVjdC5cbiAgICAgKlxuICAgICAqIFRoaXMgU0hPVUxEIHJlc3VsdCBpbiB0aGUgdXNlciBiZWluZyBwcm9tcHRlZCB0byBhcHByb3ZlL2RlbnlcbiAgICAgKiBjYXBhYmlsaXRpZXMuXG4gICAgICpcbiAgICAgKiBCeSBkZWZhdWx0IHRoaXMgcmVqZWN0cyBhbGwgY2FwYWJpbGl0aWVzIChyZXR1cm5zIGFuIGVtcHR5IHNldCkuXG4gICAgICogQHBhcmFtIHtTZXQ8Q2FwYWJpbGl0eT59IHJlcXVlc3RlZCBUaGUgc2V0IG9mIHJlcXVlc3RlZCBjYXBhYmlsaXRpZXMuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8U2V0PENhcGFiaWxpdHk+Pn0gUmVzb2x2ZXMgdG8gdGhlIGFsbG93ZWQgY2FwYWJpbGl0aWVzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlQ2FwYWJpbGl0aWVzKHJlcXVlc3RlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgU2V0KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbmRzIGFuIGV2ZW50IGludG8gYSByb29tLiBJZiBgcm9vbUlkYCBpcyBmYWxzeSwgdGhlIGNsaWVudCBzaG91bGQgc2VuZCB0aGUgZXZlbnRcbiAgICAgKiBpbnRvIHRoZSByb29tIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb29raW5nIGF0LiBUaGUgd2lkZ2V0IEFQSSB3aWxsIGhhdmUgYWxyZWFkeVxuICAgICAqIHZlcmlmaWVkIHRoYXQgdGhlIHdpZGdldCBpcyBjYXBhYmxlIG9mIHNlbmRpbmcgdGhlIGV2ZW50IHRvIHRoYXQgcm9vbS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFRoZSBldmVudCB0eXBlIHRvIGJlIHNlbnQuXG4gICAgICogQHBhcmFtIHsqfSBjb250ZW50IFRoZSBjb250ZW50IGZvciB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3RhdGVLZXkgVGhlIHN0YXRlIGtleSBpZiB0aGlzIGlzIGEgc3RhdGUgZXZlbnQsIG90aGVyd2lzZSBudWxsLlxuICAgICAqIE1heSBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gcm9vbUlkIFRoZSByb29tIElEIHRvIHNlbmQgdGhlIGV2ZW50IHRvLiBJZiBmYWxzeSwgdGhlIHJvb20gdGhlXG4gICAgICogdXNlciBpcyBjdXJyZW50bHkgbG9va2luZyBhdC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJU2VuZEV2ZW50RGV0YWlscz59IFJlc29sdmVzIHdoZW4gdGhlIGV2ZW50IGhhcyBiZWVuIHNlbnQgd2l0aFxuICAgICAqIGRldGFpbHMgb2YgdGhhdCBldmVudC5cbiAgICAgKiBAdGhyb3dzIFJlamVjdGVkIHdoZW4gdGhlIGV2ZW50IGNvdWxkIG5vdCBiZSBzZW50LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInNlbmRFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kRXZlbnQoZXZlbnRUeXBlLCBjb250ZW50KSB7XG4gICAgICB2YXIgc3RhdGVLZXkgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gICAgICB2YXIgcm9vbUlkID0gYXJndW1lbnRzLmxlbmd0aCA+IDMgJiYgYXJndW1lbnRzWzNdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbM10gOiBudWxsO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkZhaWxlZCB0byBvdmVycmlkZSBmdW5jdGlvblwiKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGV4cGVyaW1lbnRhbCBQYXJ0IG9mIE1TQzQxNDAgJiBNU0M0MTU3XG4gICAgICogU2VuZHMgYSBkZWxheWVkIGV2ZW50IGludG8gYSByb29tLiBJZiBgcm9vbUlkYCBpcyBmYWxzeSwgdGhlIGNsaWVudCBzaG91bGQgc2VuZCBpdFxuICAgICAqIGludG8gdGhlIHJvb20gdGhlIHVzZXIgaXMgY3VycmVudGx5IGxvb2tpbmcgYXQuIFRoZSB3aWRnZXQgQVBJIHdpbGwgaGF2ZSBhbHJlYWR5XG4gICAgICogdmVyaWZpZWQgdGhhdCB0aGUgd2lkZ2V0IGlzIGNhcGFibGUgb2Ygc2VuZGluZyB0aGUgZXZlbnQgdG8gdGhhdCByb29tLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfG51bGx9IGRlbGF5IEhvdyBtdWNoIGxhdGVyIHRvIHNlbmQgdGhlIGV2ZW50LCBvciBudWxsIHRvIG5vdCBzZW5kIHRoZVxuICAgICAqIGV2ZW50IGF1dG9tYXRpY2FsbHkuIE1heSBub3QgYmUgbnVsbCBpZiB7QGxpbmsgcGFyZW50RGVsYXlJZH0gaXMgbnVsbC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xudWxsfSBwYXJlbnREZWxheUlkIFRoZSBJRCBvZiB0aGUgZGVsYXllZCBldmVudCB0aGlzIG9uZSBpcyBncm91cGVkIHdpdGgsXG4gICAgICogb3IgbnVsbCBpZiBpdCB3aWxsIGJlIHB1dCBpbiBhIG5ldyBncm91cC4gTWF5IG5vdCBiZSBudWxsIGlmIHtAbGluayBkZWxheX0gaXMgbnVsbC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIFRoZSBldmVudCB0eXBlIG9mIHRoZSBldmVudCB0byBiZSBzZW50LlxuICAgICAqIEBwYXJhbSB7Kn0gY29udGVudCBUaGUgY29udGVudCBmb3IgdGhlIGV2ZW50IHRvIGJlIHNlbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8bnVsbH0gc3RhdGVLZXkgVGhlIHN0YXRlIGtleSBpZiB0aGUgZXZlbnQgdG8gYmUgc2VudCBhIHN0YXRlIGV2ZW50LFxuICAgICAqIG90aGVyd2lzZSBudWxsLiBNYXkgYmUgYW4gZW1wdHkgc3RyaW5nLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IHJvb21JZCBUaGUgcm9vbSBJRCB0byBzZW5kIHRoZSBldmVudCB0by4gSWYgZmFsc3ksIHRoZSByb29tIHRoZVxuICAgICAqIHVzZXIgaXMgY3VycmVudGx5IGxvb2tpbmcgYXQuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8SVNlbmREZWxheWVkRXZlbnREZXRhaWxzPn0gUmVzb2x2ZXMgd2hlbiB0aGUgZGVsYXllZCBldmVudCBoYXMgYmVlblxuICAgICAqIHByZXBhcmVkIHdpdGggZGV0YWlscyBvZiBob3cgdG8gcmVmZXIgdG8gaXQgZm9yIHVwZGF0aW5nL3NlbmRpbmcvY2FuY2VsaW5nIGl0IGxhdGVyLlxuICAgICAqIEB0aHJvd3MgUmVqZWN0ZWQgd2hlbiB0aGUgZGVsYXllZCBldmVudCBjb3VsZCBub3QgYmUgc2VudC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJzZW5kRGVsYXllZEV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmREZWxheWVkRXZlbnQoZGVsYXksIHBhcmVudERlbGF5SWQsIGV2ZW50VHlwZSwgY29udGVudCkge1xuICAgICAgdmFyIHN0YXRlS2V5ID0gYXJndW1lbnRzLmxlbmd0aCA+IDQgJiYgYXJndW1lbnRzWzRdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbNF0gOiBudWxsO1xuICAgICAgdmFyIHJvb21JZCA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzVdIDogbnVsbDtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJGYWlsZWQgdG8gb3ZlcnJpZGUgZnVuY3Rpb25cIikpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBleHBlcmltZW50YWwgUGFydCBvZiBNU0M0MTQwICYgTVNDNDE1N1xuICAgICAqIFJ1biB0aGUgc3BlY2lmaWVkIHtAbGluayBhY3Rpb259IGZvciB0aGUgZGVsYXllZCBldmVudCBtYXRjaGluZyB0aGUgcHJvdmlkZWQge0BsaW5rIGRlbGF5SWR9LlxuICAgICAqIEB0aHJvd3MgUmVqZWN0ZWQgd2hlbiB0aGVyZSBpcyBubyBtYXRjaGluZyBkZWxheWVkIGV2ZW50LCBvciB3aGVuIHRoZSBhY3Rpb24gZmFpbGVkIHRvIHJ1bi5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ1cGRhdGVEZWxheWVkRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBkYXRlRGVsYXllZEV2ZW50KGRlbGF5SWQsIGFjdGlvbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkZhaWxlZCB0byBvdmVycmlkZSBmdW5jdGlvblwiKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VuZHMgYSB0by1kZXZpY2UgZXZlbnQuIFRoZSB3aWRnZXQgQVBJIHdpbGwgaGF2ZSBhbHJlYWR5IHZlcmlmaWVkIHRoYXQgdGhlIHdpZGdldFxuICAgICAqIGlzIGNhcGFibGUgb2Ygc2VuZGluZyB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50VHlwZSBUaGUgZXZlbnQgdHlwZSB0byBiZSBzZW50LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5jcnlwdGVkIFdoZXRoZXIgdG8gZW5jcnlwdCB0aGUgbWVzc2FnZSBjb250ZW50cy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gY29udGVudE1hcCBBIG1hcCBmcm9tIHVzZXIgSUQgYW5kIGRldmljZSBJRCB0byBldmVudCBjb250ZW50LlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBSZXNvbHZlcyB3aGVuIHRoZSBldmVudCBoYXMgYmVlbiBzZW50LlxuICAgICAqIEB0aHJvd3MgUmVqZWN0ZWQgd2hlbiB0aGUgZXZlbnQgY291bGQgbm90IGJlIHNlbnQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwic2VuZFRvRGV2aWNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRUb0RldmljZShldmVudFR5cGUsIGVuY3J5cHRlZCwgY29udGVudE1hcCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkZhaWxlZCB0byBvdmVycmlkZSBmdW5jdGlvblwiKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlYWRzIGFuIGVsZW1lbnQgb2Ygcm9vbSBhY2NvdW50IGRhdGEuIFRoZSB3aWRnZXQgQVBJIHdpbGwgaGF2ZSBhbHJlYWR5IHZlcmlmaWVkIHRoYXQgdGhlIHdpZGdldCBpc1xuICAgICAqIGNhcGFibGUgb2YgcmVjZWl2aW5nIHRoZSBgZXZlbnRUeXBlYCBvZiB0aGUgcmVxdWVzdGVkIGluZm9ybWF0aW9uLiBJZiBgcm9vbUlkc2AgaXMgc3VwcGxpZWQsIGl0IG1heVxuICAgICAqIGNvbnRhaW4gYFN5bWJvbHMuQW55Um9vbWAgdG8gZGVub3RlIHRoYXQgdGhlIHBpZWNlIG9mIHJvb20gYWNjb3VudCBkYXRhIGluIGVhY2ggb2YgdGhlIGNsaWVudCdzIGtub3duXG4gICAgICogcm9vbXMgc2hvdWxkIGJlIHJldHVybmVkLiBXaGVuIGBudWxsYCwgb25seSB0aGUgcm9vbSB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9va2luZyBhdCBzaG91bGQgYmUgY29uc2lkZXJlZC5cbiAgICAgKiBAcGFyYW0gZXZlbnRUeXBlIFRoZSBldmVudCB0eXBlIHRvIGJlIHJlYWQuXG4gICAgICogQHBhcmFtIHJvb21JZHMgV2hlbiBudWxsLCB0aGUgdXNlcidzIGN1cnJlbnRseSB2aWV3ZWQgcm9vbS4gT3RoZXJ3aXNlLCB0aGUgbGlzdCBvZiByb29tIElEc1xuICAgICAqIHRvIGxvb2sgd2l0aGluLCBwb3NzaWJseSBjb250YWluaW5nIFN5bWJvbHMuQW55Um9vbSB0byBkZW5vdGUgYWxsIGtub3duIHJvb21zLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPElSb29tQWNjb3VudERhdGFbXT59IFJlc29sdmVzIHRvIHRoZSBlbGVtZW50IG9mIHJvb20gYWNjb3VudCBkYXRhLCBvciBhbiBlbXB0eSBhcnJheS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJyZWFkUm9vbUFjY291bnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRSb29tQWNjb3VudERhdGEoZXZlbnRUeXBlKSB7XG4gICAgICB2YXIgcm9vbUlkcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIGFsbCBldmVudHMgb2YgdGhlIGdpdmVuIHR5cGUsIGFuZCBvcHRpb25hbGx5IGBtc2d0eXBlYCAoaWYgYXBwbGljYWJsZS9kZWZpbmVkKSxcbiAgICAgKiB0aGUgdXNlciBoYXMgYWNjZXNzIHRvLiBUaGUgd2lkZ2V0IEFQSSB3aWxsIGhhdmUgYWxyZWFkeSB2ZXJpZmllZCB0aGF0IHRoZSB3aWRnZXQgaXNcbiAgICAgKiBjYXBhYmxlIG9mIHJlY2VpdmluZyB0aGUgZXZlbnRzLiBMZXNzIGV2ZW50cyB0aGFuIHRoZSBsaW1pdCBhcmUgYWxsb3dlZCB0byBiZSByZXR1cm5lZCxcbiAgICAgKiBidXQgbm90IG1vcmUuIElmIGByb29tSWRzYCBpcyBzdXBwbGllZCwgaXQgbWF5IGNvbnRhaW4gYFN5bWJvbHMuQW55Um9vbWAgdG8gZGVub3RlIHRoYXRcbiAgICAgKiBgbGltaXRgIGluIGVhY2ggb2YgdGhlIGNsaWVudCdzIGtub3duIHJvb21zIHNob3VsZCBiZSByZXR1cm5lZC4gV2hlbiBgbnVsbGAsIG9ubHkgdGhlXG4gICAgICogcm9vbSB0aGUgdXNlciBpcyBjdXJyZW50bHkgbG9va2luZyBhdCBzaG91bGQgYmUgY29uc2lkZXJlZC4gSWYgYHNpbmNlYCBpcyBzcGVjaWZpZWQgYnV0XG4gICAgICogdGhlIGV2ZW50IElEIGlzbid0IHByZXNlbnQgaW4gdGhlIG51bWJlciBvZiBldmVudHMgZmV0Y2hlZCBieSB0aGUgY2xpZW50IGR1ZSB0byBgbGltaXRgLFxuICAgICAqIHRoZSBjbGllbnQgd2lsbCByZXR1cm4gYWxsIHRoZSBldmVudHMuXG4gICAgICogQHBhcmFtIGV2ZW50VHlwZSBUaGUgZXZlbnQgdHlwZSB0byBiZSByZWFkLlxuICAgICAqIEBwYXJhbSBtc2d0eXBlIFRoZSBtc2d0eXBlIG9mIHRoZSBldmVudHMgdG8gYmUgcmVhZCwgaWYgYXBwbGljYWJsZS9kZWZpbmVkLlxuICAgICAqIEBwYXJhbSBzdGF0ZUtleSBUaGUgc3RhdGUga2V5IG9mIHRoZSBldmVudHMgdG8gYmUgcmVhZCwgaWYgYXBwbGljYWJsZS9kZWZpbmVkLlxuICAgICAqIEBwYXJhbSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIHJldHJpZXZlIHBlciByb29tLiBXaWxsIGJlIHplcm8gdG8gZGVub3RlIFwiYXMgbWFueVxuICAgICAqIGFzIHBvc3NpYmxlXCIuXG4gICAgICogQHBhcmFtIHJvb21JZHMgV2hlbiBudWxsLCB0aGUgdXNlcidzIGN1cnJlbnRseSB2aWV3ZWQgcm9vbS4gT3RoZXJ3aXNlLCB0aGUgbGlzdCBvZiByb29tIElEc1xuICAgICAqIHRvIGxvb2sgd2l0aGluLCBwb3NzaWJseSBjb250YWluaW5nIFN5bWJvbHMuQW55Um9vbSB0byBkZW5vdGUgYWxsIGtub3duIHJvb21zLlxuICAgICAqIEBwYXJhbSBzaW5jZSBXaGVuIG51bGwsIHJldHJpZXZlcyB0aGUgbnVtYmVyIG9mIGV2ZW50cyBzcGVjaWZpZWQgYnkgdGhlIFwibGltaXRcIiBwYXJhbWV0ZXIuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgZXZlbnQgSUQgYXQgd2hpY2ggb25seSBzdWJzZXF1ZW50IGV2ZW50cyB3aWxsIGJlIHJldHVybmVkLCBhcyBtYW55IGFzIHNwZWNpZmllZFxuICAgICAqIGluIFwibGltaXRcIi5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJUm9vbUV2ZW50W10+fSBSZXNvbHZlcyB0byB0aGUgcm9vbSBldmVudHMsIG9yIGFuIGVtcHR5IGFycmF5LlxuICAgICAqIEBkZXByZWNhdGVkIENsaWVudHMgYXJlIGFkdmlzZWQgdG8gaW1wbGVtZW50IHtAbGluayBXaWRnZXREcml2ZXIucmVhZFJvb21UaW1lbGluZX0gaW5zdGVhZC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJyZWFkUm9vbUV2ZW50c1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZWFkUm9vbUV2ZW50cyhldmVudFR5cGUsIG1zZ3R5cGUsIGxpbWl0KSB7XG4gICAgICB2YXIgcm9vbUlkcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogbnVsbDtcbiAgICAgIHZhciBzaW5jZSA9IGFyZ3VtZW50cy5sZW5ndGggPiA0ID8gYXJndW1lbnRzWzRdIDogdW5kZWZpbmVkO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgYWxsIGV2ZW50cyBvZiB0aGUgZ2l2ZW4gdHlwZSwgYW5kIG9wdGlvbmFsbHkgc3RhdGUga2V5IChpZiBhcHBsaWNhYmxlL2RlZmluZWQpLFxuICAgICAqIHRoZSB1c2VyIGhhcyBhY2Nlc3MgdG8uIFRoZSB3aWRnZXQgQVBJIHdpbGwgaGF2ZSBhbHJlYWR5IHZlcmlmaWVkIHRoYXQgdGhlIHdpZGdldCBpc1xuICAgICAqIGNhcGFibGUgb2YgcmVjZWl2aW5nIHRoZSBldmVudHMuIExlc3MgZXZlbnRzIHRoYW4gdGhlIGxpbWl0IGFyZSBhbGxvd2VkIHRvIGJlIHJldHVybmVkLFxuICAgICAqIGJ1dCBub3QgbW9yZS4gSWYgYHJvb21JZHNgIGlzIHN1cHBsaWVkLCBpdCBtYXkgY29udGFpbiBgU3ltYm9scy5BbnlSb29tYCB0byBkZW5vdGUgdGhhdFxuICAgICAqIGBsaW1pdGAgaW4gZWFjaCBvZiB0aGUgY2xpZW50J3Mga25vd24gcm9vbXMgc2hvdWxkIGJlIHJldHVybmVkLiBXaGVuIGBudWxsYCwgb25seSB0aGVcbiAgICAgKiByb29tIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBsb29raW5nIGF0IHNob3VsZCBiZSBjb25zaWRlcmVkLlxuICAgICAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gYmUgcmVhZC5cbiAgICAgKiBAcGFyYW0gc3RhdGVLZXkgVGhlIHN0YXRlIGtleSBvZiB0aGUgZXZlbnRzIHRvIGJlIHJlYWQsIGlmIGFwcGxpY2FibGUvZGVmaW5lZC5cbiAgICAgKiBAcGFyYW0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byByZXRyaWV2ZS4gV2lsbCBiZSB6ZXJvIHRvIGRlbm90ZSBcImFzIG1hbnlcbiAgICAgKiBhcyBwb3NzaWJsZVwiLlxuICAgICAqIEBwYXJhbSByb29tSWRzIFdoZW4gbnVsbCwgdGhlIHVzZXIncyBjdXJyZW50bHkgdmlld2VkIHJvb20uIE90aGVyd2lzZSwgdGhlIGxpc3Qgb2Ygcm9vbSBJRHNcbiAgICAgKiB0byBsb29rIHdpdGhpbiwgcG9zc2libHkgY29udGFpbmluZyBTeW1ib2xzLkFueVJvb20gdG8gZGVub3RlIGFsbCBrbm93biByb29tcy5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJUm9vbUV2ZW50W10+fSBSZXNvbHZlcyB0byB0aGUgc3RhdGUgZXZlbnRzLCBvciBhbiBlbXB0eSBhcnJheS5cbiAgICAgKiBAZGVwcmVjYXRlZCBDbGllbnRzIGFyZSBhZHZpc2VkIHRvIGltcGxlbWVudCB7QGxpbmsgV2lkZ2V0RHJpdmVyLnJlYWRSb29tVGltZWxpbmV9IGluc3RlYWQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVhZFN0YXRlRXZlbnRzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRTdGF0ZUV2ZW50cyhldmVudFR5cGUsIHN0YXRlS2V5LCBsaW1pdCkge1xuICAgICAgdmFyIHJvb21JZHMgPSBhcmd1bWVudHMubGVuZ3RoID4gMyAmJiBhcmd1bWVudHNbM10gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1szXSA6IG51bGw7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyBhbGwgZXZlbnRzIG9mIHRoZSBnaXZlbiB0eXBlLCBhbmQgb3B0aW9uYWxseSBgbXNndHlwZWAgKGlmIGFwcGxpY2FibGUvZGVmaW5lZCksXG4gICAgICogdGhlIHVzZXIgaGFzIGFjY2VzcyB0by4gVGhlIHdpZGdldCBBUEkgd2lsbCBoYXZlIGFscmVhZHkgdmVyaWZpZWQgdGhhdCB0aGUgd2lkZ2V0IGlzXG4gICAgICogY2FwYWJsZSBvZiByZWNlaXZpbmcgdGhlIGV2ZW50cy4gTGVzcyBldmVudHMgdGhhbiB0aGUgbGltaXQgYXJlIGFsbG93ZWQgdG8gYmUgcmV0dXJuZWQsXG4gICAgICogYnV0IG5vdCBtb3JlLlxuICAgICAqIEBwYXJhbSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRvIGxvb2sgd2l0aGluLlxuICAgICAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHR5cGUgdG8gYmUgcmVhZC5cbiAgICAgKiBAcGFyYW0gbXNndHlwZSBUaGUgbXNndHlwZSBvZiB0aGUgZXZlbnRzIHRvIGJlIHJlYWQsIGlmIGFwcGxpY2FibGUvZGVmaW5lZC5cbiAgICAgKiBAcGFyYW0gc3RhdGVLZXkgVGhlIHN0YXRlIGtleSBvZiB0aGUgZXZlbnRzIHRvIGJlIHJlYWQsIGlmIGFwcGxpY2FibGUvZGVmaW5lZC5cbiAgICAgKiBAcGFyYW0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byByZXRyaWV2ZS4gV2lsbCBiZSB6ZXJvIHRvIGRlbm90ZSBcImFzIG1hbnkgYXNcbiAgICAgKiBwb3NzaWJsZVwiLlxuICAgICAqIEBwYXJhbSBzaW5jZSBXaGVuIG51bGwsIHJldHJpZXZlcyB0aGUgbnVtYmVyIG9mIGV2ZW50cyBzcGVjaWZpZWQgYnkgdGhlIFwibGltaXRcIiBwYXJhbWV0ZXIuXG4gICAgICogT3RoZXJ3aXNlLCB0aGUgZXZlbnQgSUQgYXQgd2hpY2ggb25seSBzdWJzZXF1ZW50IGV2ZW50cyB3aWxsIGJlIHJldHVybmVkLCBhcyBtYW55IGFzIHNwZWNpZmllZFxuICAgICAqIGluIFwibGltaXRcIi5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxJUm9vbUV2ZW50W10+fSBSZXNvbHZlcyB0byB0aGUgcm9vbSBldmVudHMsIG9yIGFuIGVtcHR5IGFycmF5LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInJlYWRSb29tVGltZWxpbmVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVhZFJvb21UaW1lbGluZShyb29tSWQsIGV2ZW50VHlwZSwgbXNndHlwZSwgc3RhdGVLZXksIGxpbWl0LCBzaW5jZSkge1xuICAgICAgLy8gRm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkgd2UgdHJ5IHRoZSBkZXByZWNhdGVkIG1ldGhvZHMsIGluIGNhc2VcbiAgICAgIC8vIHRoZXkncmUgaW1wbGVtZW50ZWRcbiAgICAgIGlmIChzdGF0ZUtleSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5yZWFkUm9vbUV2ZW50cyhldmVudFR5cGUsIG1zZ3R5cGUsIGxpbWl0LCBbcm9vbUlkXSwgc2luY2UpO2Vsc2UgcmV0dXJuIHRoaXMucmVhZFN0YXRlRXZlbnRzKGV2ZW50VHlwZSwgc3RhdGVLZXksIGxpbWl0LCBbcm9vbUlkXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIGN1cnJlbnQgdmFsdWVzIG9mIGFsbCBtYXRjaGluZyByb29tIHN0YXRlIGVudHJpZXMuXG4gICAgICogQHBhcmFtIHJvb21JZCBUaGUgSUQgb2YgdGhlIHJvb20uXG4gICAgICogQHBhcmFtIGV2ZW50VHlwZSBUaGUgZXZlbnQgdHlwZSBvZiB0aGUgZW50cmllcyB0byBiZSByZWFkLlxuICAgICAqIEBwYXJhbSBzdGF0ZUtleSBUaGUgc3RhdGUga2V5IG9mIHRoZSBlbnRyeSB0byBiZSByZWFkLiBJZiB1bmRlZmluZWQsXG4gICAgICogYWxsIHJvb20gc3RhdGUgZW50cmllcyB3aXRoIGEgbWF0Y2hpbmcgZXZlbnQgdHlwZSBzaG91bGQgYmUgcmV0dXJuZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2U8SVJvb21FdmVudFtdPn0gUmVzb2x2ZXMgdG8gdGhlIGV2ZW50cyByZXByZXNlbnRpbmcgdGhlXG4gICAgICogY3VycmVudCB2YWx1ZXMgb2YgdGhlIHJvb20gc3RhdGUgZW50cmllcy5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJyZWFkUm9vbVN0YXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRSb29tU3RhdGUocm9vbUlkLCBldmVudFR5cGUsIHN0YXRlS2V5KSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFkU3RhdGVFdmVudHMoZXZlbnRUeXBlLCBzdGF0ZUtleSwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIFtyb29tSWRdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyBhbGwgZXZlbnRzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gYSBnaXZlbiBldmVudC4gVGhlIHdpZGdldCBBUEkgd2lsbFxuICAgICAqIGhhdmUgYWxyZWFkeSB2ZXJpZmllZCB0aGF0IHRoZSB3aWRnZXQgaXMgY2FwYWJsZSBvZiByZWNlaXZpbmcgdGhlIGV2ZW50LFxuICAgICAqIG9yIHdpbGwgbWFrZSBzdXJlIHRvIHJlamVjdCBhY2Nlc3MgdG8gZXZlbnRzIHdoaWNoIGFyZSByZXR1cm5lZCBmcm9tIHRoaXNcbiAgICAgKiBmdW5jdGlvbiwgYnV0IGFyZSBub3QgY2FwYWJsZSBvZiByZWNlaXZpbmcuIElmIGByZWxhdGlvblR5cGVgIG9yIGBldmVudFR5cGVgXG4gICAgICogYXJlIHNldCwgdGhlIHJldHVybmVkIGV2ZW50cyBzaG91bGQgYWxyZWFkeSBiZSBmaWx0ZXJlZC4gTGVzcyBldmVudHMgdGhhblxuICAgICAqIHRoZSBsaW1pdCBhcmUgYWxsb3dlZCB0byBiZSByZXR1cm5lZCwgYnV0IG5vdCBtb3JlLlxuICAgICAqIEBwYXJhbSBldmVudElkIFRoZSBpZCBvZiB0aGUgcGFyZW50IGV2ZW50IHRvIGJlIHJlYWQuXG4gICAgICogQHBhcmFtIHJvb21JZCBUaGUgcm9vbSB0byBsb29rIHdpdGhpbi4gV2hlbiB1bmRlZmluZWQsIHRoZSB1c2VyJ3NcbiAgICAgKiBjdXJyZW50bHkgdmlld2VkIHJvb20uXG4gICAgICogQHBhcmFtIHJlbGF0aW9uVHlwZSBUaGUgcmVsYXRpb25zaGlwIHR5cGUgb2YgY2hpbGQgZXZlbnRzIHRvIHNlYXJjaCBmb3IuXG4gICAgICogV2hlbiB1bmRlZmluZWQsIGFsbCByZWxhdGlvbnMgYXJlIHJldHVybmVkLlxuICAgICAqIEBwYXJhbSBldmVudFR5cGUgVGhlIGV2ZW50IHR5cGUgb2YgY2hpbGQgZXZlbnRzIHRvIHNlYXJjaCBmb3IuIFdoZW4gdW5kZWZpbmVkLFxuICAgICAqIGFsbCByZWxhdGVkIGV2ZW50cyBhcmUgcmV0dXJuZWQuXG4gICAgICogQHBhcmFtIGZyb20gVGhlIHBhZ2luYXRpb24gdG9rZW4gdG8gc3RhcnQgcmV0dXJuaW5nIHJlc3VsdHMgZnJvbSwgYXNcbiAgICAgKiByZWNlaXZlZCBmcm9tIGEgcHJldmlvdXMgY2FsbC4gSWYgbm90IHN1cHBsaWVkLCByZXN1bHRzIHN0YXJ0IGF0IHRoZSBtb3N0XG4gICAgICogcmVjZW50IHRvcG9sb2dpY2FsIGV2ZW50IGtub3duIHRvIHRoZSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHRvIFRoZSBwYWdpbmF0aW9uIHRva2VuIHRvIHN0b3AgcmV0dXJuaW5nIHJlc3VsdHMgYXQuIElmIG5vdFxuICAgICAqIHN1cHBsaWVkLCByZXN1bHRzIGNvbnRpbnVlIHVwIHRvIGxpbWl0IG9yIHVudGlsIHRoZXJlIGFyZSBubyBtb3JlIGV2ZW50cy5cbiAgICAgKiBAcGFyYW0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byByZXRyaWV2ZSBwZXIgcm9vbS4gSWYgbm90XG4gICAgICogc3VwcGxpZWQsIHRoZSBzZXJ2ZXIgd2lsbCBhcHBseSBhIGRlZmF1bHQgbGltaXQuXG4gICAgICogQHBhcmFtIGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIHRvIHNlYXJjaCBmb3IgYWNjb3JkaW5nIHRvIE1TQzM3MTVcbiAgICAgKiBAcmV0dXJucyBSZXNvbHZlcyB0byB0aGUgcm9vbSByZWxhdGlvbnMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmVhZEV2ZW50UmVsYXRpb25zXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlYWRFdmVudFJlbGF0aW9ucyhldmVudElkLCByb29tSWQsIHJlbGF0aW9uVHlwZSwgZXZlbnRUeXBlLCBmcm9tLCB0bywgbGltaXQsIGRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIGNodW5rOiBbXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNrcyB0aGUgdXNlciBmb3IgcGVybWlzc2lvbiB0byB2YWxpZGF0ZSB0aGVpciBpZGVudGl0eSB0aHJvdWdoIE9wZW5JRCBDb25uZWN0LiBUaGVcbiAgICAgKiBpbnRlcmZhY2UgZm9yIHRoaXMgZnVuY3Rpb24gaXMgYW4gb2JzZXJ2YWJsZSB3aGljaCBhY2NlcHRzIHRoZSBzdGF0ZSBtYWNoaW5lIG9mIHRoZVxuICAgICAqIE9JREMgZXhjaGFuZ2UgZmxvdy4gRm9yIGV4YW1wbGUsIGlmIHRoZSBjbGllbnQvdXNlciBibG9ja3MgdGhlIHJlcXVlc3QgdGhlbiBpdCB3b3VsZFxuICAgICAqIGZlZWQgYmFjayBhIGB7c3RhdGU6IEJsb2NrZWR9YCBpbnRvIHRoZSBvYnNlcnZhYmxlLiBTaW1pbGFybHksIGlmIHRoZSB1c2VyIGFscmVhZHlcbiAgICAgKiBhcHByb3ZlZCB0aGUgd2lkZ2V0IHRoZW4gYSBge3N0YXRlOiBBbGxvd2VkfWAgd291bGQgYmUgZmVkIGludG8gdGhlIG9ic2VydmFibGUgYWxvbmdzaWRlXG4gICAgICogdGhlIHRva2VuIGl0c2VsZi4gSWYgdGhlIGNsaWVudCBpcyBhc2tpbmcgZm9yIHBlcm1pc3Npb24sIGl0IHNob3VsZCBmZWVkIGluIGFcbiAgICAgKiBge3N0YXRlOiBQZW5kaW5nVXNlckNvbmZpcm1hdGlvbn1gIGZvbGxvd2VkIGJ5IHRoZSByZWxldmFudCBBbGxvd2VkIG9yIEJsb2NrZWQgc3RhdGUuXG4gICAgICpcbiAgICAgKiBUaGUgd2lkZ2V0IEFQSSB3aWxsIHJlamVjdCB0aGUgd2lkZ2V0J3MgcmVxdWVzdCB3aXRoIGFuIGVycm9yIGlmIHRoaXMgY29udHJhY3QgaXMgbm90XG4gICAgICogbWV0IHByb3Blcmx5LiBCeSBkZWZhdWx0LCB0aGUgd2lkZ2V0IGRyaXZlciB3aWxsIGJsb2NrIGFsbCBPSURDIHJlcXVlc3RzLlxuICAgICAqIEBwYXJhbSB7U2ltcGxlT2JzZXJ2YWJsZTxJT3BlbklEVXBkYXRlPn0gb2JzZXJ2ZXIgVGhlIG9ic2VydmFibGUgdG8gZmVlZCB1cGRhdGVzIGludG8uXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwiYXNrT3BlbklEXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFza09wZW5JRChvYnNlcnZlcikge1xuICAgICAgb2JzZXJ2ZXIudXBkYXRlKHtcbiAgICAgICAgc3RhdGU6IF8uT3BlbklEUmVxdWVzdFN0YXRlLkJsb2NrZWRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5hdmlnYXRlcyB0aGUgY2xpZW50IHdpdGggYSBtYXRyaXgudG8gVVJJLiBJbiBmdXR1cmUgdGhpcyBmdW5jdGlvbiB3aWxsIGFsc28gYmUgcHJvdmlkZWRcbiAgICAgKiB3aXRoIHRoZSBNYXRyaXggVVJJcyBvbmNlIG1hdHJpeC50byBpcyByZXBsYWNlZC4gVGhlIGdpdmVuIFVSSSB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuXG4gICAgICogbGlnaHRseSBjaGVja2VkIHRvIGVuc3VyZSBpdCBsb29rcyBsaWtlIGEgdmFsaWQgVVJJLCB0aG91Z2ggdGhlIGltcGxlbWVudGF0aW9uIGlzIHJlY29tbWVuZGVkXG4gICAgICogdG8gZG8gZnVydGhlciBjaGVja3Mgb24gdGhlIFVSSS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJpIFRoZSBVUkkgdG8gbmF2aWdhdGUgdG8uXG4gICAgICogQHJldHVybnMge1Byb21pc2U8dm9pZD59IFJlc29sdmVzIHdoZW4gY29tcGxldGUuXG4gICAgICogQHRocm93cyBUaHJvd3MgaWYgdGhlcmUncyBhIHByb2JsZW0gd2l0aCB0aGUgbmF2aWdhdGlvbiwgc3VjaCBhcyBpbnZhbGlkIGZvcm1hdC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJuYXZpZ2F0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBuYXZpZ2F0ZSh1cmkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5hdmlnYXRpb24gaXMgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBvbGxzIGZvciBUVVJOIHNlcnZlciBkYXRhLCB5aWVsZGluZyBhbiBpbml0aWFsIHNldCBvZiBjcmVkZW50aWFscyBhcyBzb29uIGFzIHBvc3NpYmxlLCBhbmRcbiAgICAgKiB0aGVyZWFmdGVyIHlpZWxkaW5nIG5ldyBjcmVkZW50aWFscyB3aGVuZXZlciB0aGUgcHJldmlvdXMgb25lcyBleHBpcmUuIFRoZSB3aWRnZXQgQVBJIHdpbGxcbiAgICAgKiBoYXZlIGFscmVhZHkgdmVyaWZpZWQgdGhhdCB0aGUgd2lkZ2V0IGhhcyBwZXJtaXNzaW9uIHRvIGFjY2VzcyBUVVJOIHNlcnZlcnMuXG4gICAgICogQHlpZWxkcyB7SVR1cm5TZXJ2ZXJ9IFRoZSBUVVJOIHNlcnZlciBVUklzIGFuZCBjcmVkZW50aWFscyBjdXJyZW50bHkgYXZhaWxhYmxlIHRvIHRoZSBjbGllbnQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VHVyblNlcnZlcnNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0VHVyblNlcnZlcnMoKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUVVJOIHNlcnZlciBzdXBwb3J0IGlzIG5vdCBpbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWFyY2ggZm9yIHVzZXJzIGluIHRoZSB1c2VyIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gc2VhcmNoVGVybSBUaGUgdGVybSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgcmVzdWx0cyB0byByZXR1cm4uIElmIG5vdCBzdXBwbGllZCwgdGhlXG4gICAgICogQHJldHVybnMgUmVzb2x2ZXMgdG8gdGhlIHNlYXJjaCByZXN1bHRzLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInNlYXJjaFVzZXJEaXJlY3RvcnlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VhcmNoVXNlckRpcmVjdG9yeShzZWFyY2hUZXJtLCBsaW1pdCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIGxpbWl0ZWQ6IGZhbHNlLFxuICAgICAgICByZXN1bHRzOiBbXVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjb25maWcgZm9yIHRoZSBtZWRpYSByZXBvc2l0b3J5LlxuICAgICAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgd2l0aCBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY29uZmlnLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcImdldE1lZGlhQ29uZmlnXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldE1lZGlhQ29uZmlnKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2V0IG1lZGlhIGNvbmZpZyBpcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXBsb2FkIGEgZmlsZSB0byB0aGUgbWVkaWEgcmVwb3NpdG9yeSBvbiB0aGUgaG9tZXNlcnZlci5cbiAgICAgKiBAcGFyYW0gZmlsZSAtIFRoZSBvYmplY3QgdG8gdXBsb2FkLiBTb21ldGhpbmcgdGhhdCBjYW4gYmUgc2VudCB0b1xuICAgICAqICAgICAgICAgICAgICAgWE1MSHR0cFJlcXVlc3Quc2VuZCAodHlwaWNhbGx5IGEgRmlsZSkuXG4gICAgICogQHJldHVybnMgUmVzb2x2ZXMgdG8gdGhlIGxvY2F0aW9uIG9mIHRoZSB1cGxvYWRlZCBmaWxlLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInVwbG9hZEZpbGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gdXBsb2FkRmlsZShmaWxlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVcGxvYWQgZmlsZSBpcyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRG93bmxvYWQgYSBmaWxlIGZyb20gdGhlIG1lZGlhIHJlcG9zaXRvcnkgb24gdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICogQHBhcmFtIGNvbnRlbnRVcmkgLSBNWEMgVVJJIG9mIHRoZSBmaWxlIHRvIGRvd25sb2FkLlxuICAgICAqIEByZXR1cm5zIFJlc29sdmVzIHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJkb3dubG9hZEZpbGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZG93bmxvYWRGaWxlKGNvbnRlbnRVcmkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvd25sb2FkIGZpbGUgaXMgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIElEcyBvZiBhbGwgam9pbmVkIG9yIGludml0ZWQgcm9vbXMgY3VycmVudGx5IGtub3duIHRvIHRoZVxuICAgICAqIGNsaWVudC5cbiAgICAgKiBAcmV0dXJucyBUaGUgcm9vbSBJRHMuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0S25vd25Sb29tc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRLbm93blJvb21zKCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUXVlcnlpbmcga25vd24gcm9vbXMgaXMgbm90IGltcGxlbWVudGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEV4cHJlc3NlcyBhbiBlcnJvciB0aHJvd24gYnkgdGhpcyBkcml2ZXIgaW4gYSBmb3JtYXQgY29tcGF0aWJsZSB3aXRoIHRoZSBXaWRnZXQgQVBJLlxuICAgICAqIEBwYXJhbSBlcnJvciBUaGUgZXJyb3IgdG8gaGFuZGxlLlxuICAgICAqIEByZXR1cm5zIFRoZSBlcnJvciBleHByZXNzZWQgYXMgYSB7QGxpbmsgSVdpZGdldEFwaUVycm9yUmVzcG9uc2VEYXRhRGV0YWlsc30sXG4gICAgICogb3IgdW5kZWZpbmVkIGlmIGl0IGNhbm5vdCBiZSBleHByZXNzZWQgYXMgb25lLlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInByb2Nlc3NFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzRXJyb3IoZXJyb3IpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9XSk7XG4gIHJldHVybiBXaWRnZXREcml2ZXI7XG59KCk7XG5leHBvcnRzLldpZGdldERyaXZlciA9IFdpZGdldERyaXZlcjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdpZGdldERyaXZlci5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbnZhciBfV2lkZ2V0QXBpID0gcmVxdWlyZShcIi4vV2lkZ2V0QXBpXCIpO1xuT2JqZWN0LmtleXMoX1dpZGdldEFwaSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX1dpZGdldEFwaVtrZXldKSByZXR1cm47XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9XaWRnZXRBcGlba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX0NsaWVudFdpZGdldEFwaSA9IHJlcXVpcmUoXCIuL0NsaWVudFdpZGdldEFwaVwiKTtcbk9iamVjdC5rZXlzKF9DbGllbnRXaWRnZXRBcGkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9DbGllbnRXaWRnZXRBcGlba2V5XSkgcmV0dXJuO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfQ2xpZW50V2lkZ2V0QXBpW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9TeW1ib2xzID0gcmVxdWlyZShcIi4vU3ltYm9sc1wiKTtcbk9iamVjdC5rZXlzKF9TeW1ib2xzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfU3ltYm9sc1trZXldKSByZXR1cm47XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9TeW1ib2xzW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9Qb3N0bWVzc2FnZVRyYW5zcG9ydCA9IHJlcXVpcmUoXCIuL3RyYW5zcG9ydC9Qb3N0bWVzc2FnZVRyYW5zcG9ydFwiKTtcbk9iamVjdC5rZXlzKF9Qb3N0bWVzc2FnZVRyYW5zcG9ydCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX1Bvc3RtZXNzYWdlVHJhbnNwb3J0W2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1Bvc3RtZXNzYWdlVHJhbnNwb3J0W2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9XaWRnZXRUeXBlID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9XaWRnZXRUeXBlXCIpO1xuT2JqZWN0LmtleXMoX1dpZGdldFR5cGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9XaWRnZXRUeXBlW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1dpZGdldFR5cGVba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX0lXaWRnZXRBcGlFcnJvclJlc3BvbnNlID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9JV2lkZ2V0QXBpRXJyb3JSZXNwb25zZVwiKTtcbk9iamVjdC5rZXlzKF9JV2lkZ2V0QXBpRXJyb3JSZXNwb25zZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX0lXaWRnZXRBcGlFcnJvclJlc3BvbnNlW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX0lXaWRnZXRBcGlFcnJvclJlc3BvbnNlW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9XaWRnZXRBcGlBY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL1dpZGdldEFwaUFjdGlvblwiKTtcbk9iamVjdC5rZXlzKF9XaWRnZXRBcGlBY3Rpb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9XaWRnZXRBcGlBY3Rpb25ba2V5XSkgcmV0dXJuO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfV2lkZ2V0QXBpQWN0aW9uW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9XaWRnZXRBcGlEaXJlY3Rpb24gPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL1dpZGdldEFwaURpcmVjdGlvblwiKTtcbk9iamVjdC5rZXlzKF9XaWRnZXRBcGlEaXJlY3Rpb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9XaWRnZXRBcGlEaXJlY3Rpb25ba2V5XSkgcmV0dXJuO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfV2lkZ2V0QXBpRGlyZWN0aW9uW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9BcGlWZXJzaW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9BcGlWZXJzaW9uXCIpO1xuT2JqZWN0LmtleXMoX0FwaVZlcnNpb24pLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9BcGlWZXJzaW9uW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX0FwaVZlcnNpb25ba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX0NhcGFiaWxpdGllcyA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvQ2FwYWJpbGl0aWVzXCIpO1xuT2JqZWN0LmtleXMoX0NhcGFiaWxpdGllcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX0NhcGFiaWxpdGllc1trZXldKSByZXR1cm47XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9DYXBhYmlsaXRpZXNba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX0dldE9wZW5JREFjdGlvbiA9IHJlcXVpcmUoXCIuL2ludGVyZmFjZXMvR2V0T3BlbklEQWN0aW9uXCIpO1xuT2JqZWN0LmtleXMoX0dldE9wZW5JREFjdGlvbikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX0dldE9wZW5JREFjdGlvbltrZXldKSByZXR1cm47XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9HZXRPcGVuSURBY3Rpb25ba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX1dpZGdldEtpbmQgPSByZXF1aXJlKFwiLi9pbnRlcmZhY2VzL1dpZGdldEtpbmRcIik7XG5PYmplY3Qua2V5cyhfV2lkZ2V0S2luZCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX1dpZGdldEtpbmRba2V5XSkgcmV0dXJuO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfV2lkZ2V0S2luZFtrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfTW9kYWxCdXR0b25LaW5kID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9Nb2RhbEJ1dHRvbktpbmRcIik7XG5PYmplY3Qua2V5cyhfTW9kYWxCdXR0b25LaW5kKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfTW9kYWxCdXR0b25LaW5kW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX01vZGFsQnV0dG9uS2luZFtrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfTW9kYWxXaWRnZXRBY3Rpb25zID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9Nb2RhbFdpZGdldEFjdGlvbnNcIik7XG5PYmplY3Qua2V5cyhfTW9kYWxXaWRnZXRBY3Rpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfTW9kYWxXaWRnZXRBY3Rpb25zW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX01vZGFsV2lkZ2V0QWN0aW9uc1trZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uID0gcmVxdWlyZShcIi4vaW50ZXJmYWNlcy9VcGRhdGVEZWxheWVkRXZlbnRBY3Rpb25cIik7XG5PYmplY3Qua2V5cyhfVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1VwZGF0ZURlbGF5ZWRFdmVudEFjdGlvbltrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5ID0gcmVxdWlyZShcIi4vbW9kZWxzL1dpZGdldEV2ZW50Q2FwYWJpbGl0eVwiKTtcbk9iamVjdC5rZXlzKF9XaWRnZXRFdmVudENhcGFiaWxpdHkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9XaWRnZXRFdmVudENhcGFiaWxpdHlba2V5XSkgcmV0dXJuO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBfV2lkZ2V0RXZlbnRDYXBhYmlsaXR5W2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF91cmwgPSByZXF1aXJlKFwiLi9tb2RlbHMvdmFsaWRhdGlvbi91cmxcIik7XG5PYmplY3Qua2V5cyhfdXJsKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfdXJsW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX3VybFtrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfdXRpbHMgPSByZXF1aXJlKFwiLi9tb2RlbHMvdmFsaWRhdGlvbi91dGlsc1wiKTtcbk9iamVjdC5rZXlzKF91dGlscykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX3V0aWxzW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX3V0aWxzW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9XaWRnZXQgPSByZXF1aXJlKFwiLi9tb2RlbHMvV2lkZ2V0XCIpO1xuT2JqZWN0LmtleXMoX1dpZGdldCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX1dpZGdldFtrZXldKSByZXR1cm47XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIF9XaWRnZXRba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX1dpZGdldFBhcnNlciA9IHJlcXVpcmUoXCIuL21vZGVscy9XaWRnZXRQYXJzZXJcIik7XG5PYmplY3Qua2V5cyhfV2lkZ2V0UGFyc2VyKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfV2lkZ2V0UGFyc2VyW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1dpZGdldFBhcnNlcltrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbnZhciBfdXJsVGVtcGxhdGUgPSByZXF1aXJlKFwiLi90ZW1wbGF0aW5nL3VybC10ZW1wbGF0ZVwiKTtcbk9iamVjdC5rZXlzKF91cmxUZW1wbGF0ZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiIHx8IGtleSA9PT0gXCJfX2VzTW9kdWxlXCIpIHJldHVybjtcbiAgaWYgKGtleSBpbiBleHBvcnRzICYmIGV4cG9ydHNba2V5XSA9PT0gX3VybFRlbXBsYXRlW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX3VybFRlbXBsYXRlW2tleV07XG4gICAgfVxuICB9KTtcbn0pO1xudmFyIF9TaW1wbGVPYnNlcnZhYmxlID0gcmVxdWlyZShcIi4vdXRpbC9TaW1wbGVPYnNlcnZhYmxlXCIpO1xuT2JqZWN0LmtleXMoX1NpbXBsZU9ic2VydmFibGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICBpZiAoa2V5ID09PSBcImRlZmF1bHRcIiB8fCBrZXkgPT09IFwiX19lc01vZHVsZVwiKSByZXR1cm47XG4gIGlmIChrZXkgaW4gZXhwb3J0cyAmJiBleHBvcnRzW2tleV0gPT09IF9TaW1wbGVPYnNlcnZhYmxlW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1NpbXBsZU9ic2VydmFibGVba2V5XTtcbiAgICB9XG4gIH0pO1xufSk7XG52YXIgX1dpZGdldERyaXZlciA9IHJlcXVpcmUoXCIuL2RyaXZlci9XaWRnZXREcml2ZXJcIik7XG5PYmplY3Qua2V5cyhfV2lkZ2V0RHJpdmVyKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgaWYgKGtleSA9PT0gXCJkZWZhdWx0XCIgfHwga2V5ID09PSBcIl9fZXNNb2R1bGVcIikgcmV0dXJuO1xuICBpZiAoa2V5IGluIGV4cG9ydHMgJiYgZXhwb3J0c1trZXldID09PSBfV2lkZ2V0RHJpdmVyW2tleV0pIHJldHVybjtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gX1dpZGdldERyaXZlcltrZXldO1xuICAgIH1cbiAgfSk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5VbnN0YWJsZUFwaVZlcnNpb24gPSBleHBvcnRzLk1hdHJpeEFwaVZlcnNpb24gPSBleHBvcnRzLkN1cnJlbnRBcGlWZXJzaW9ucyA9IHZvaWQgMDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbnZhciBNYXRyaXhBcGlWZXJzaW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChNYXRyaXhBcGlWZXJzaW9uKSB7XG4gIE1hdHJpeEFwaVZlcnNpb25bXCJQcmVyZWxlYXNlMVwiXSA9IFwiMC4wLjFcIjtcbiAgTWF0cml4QXBpVmVyc2lvbltcIlByZXJlbGVhc2UyXCJdID0gXCIwLjAuMlwiO1xuICByZXR1cm4gTWF0cml4QXBpVmVyc2lvbjtcbn0oe30pOyAvL1YwMTAgPSBcIjAuMS4wXCIsIC8vIGZpcnN0IHJlbGVhc2VcbmV4cG9ydHMuTWF0cml4QXBpVmVyc2lvbiA9IE1hdHJpeEFwaVZlcnNpb247XG52YXIgVW5zdGFibGVBcGlWZXJzaW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChVbnN0YWJsZUFwaVZlcnNpb24pIHtcbiAgVW5zdGFibGVBcGlWZXJzaW9uW1wiTVNDMjc2MlwiXSA9IFwib3JnLm1hdHJpeC5tc2MyNzYyXCI7XG4gIFVuc3RhYmxlQXBpVmVyc2lvbltcIk1TQzI3NjJfVVBEQVRFX1NUQVRFXCJdID0gXCJvcmcubWF0cml4Lm1zYzI3NjJfdXBkYXRlX3N0YXRlXCI7XG4gIFVuc3RhYmxlQXBpVmVyc2lvbltcIk1TQzI4NzFcIl0gPSBcIm9yZy5tYXRyaXgubXNjMjg3MVwiO1xuICBVbnN0YWJsZUFwaVZlcnNpb25bXCJNU0MyODczXCJdID0gXCJvcmcubWF0cml4Lm1zYzI4NzNcIjtcbiAgVW5zdGFibGVBcGlWZXJzaW9uW1wiTVNDMjkzMVwiXSA9IFwib3JnLm1hdHJpeC5tc2MyOTMxXCI7XG4gIFVuc3RhYmxlQXBpVmVyc2lvbltcIk1TQzI5NzRcIl0gPSBcIm9yZy5tYXRyaXgubXNjMjk3NFwiO1xuICBVbnN0YWJsZUFwaVZlcnNpb25bXCJNU0MyODc2XCJdID0gXCJvcmcubWF0cml4Lm1zYzI4NzZcIjtcbiAgVW5zdGFibGVBcGlWZXJzaW9uW1wiTVNDMzgxOVwiXSA9IFwib3JnLm1hdHJpeC5tc2MzODE5XCI7XG4gIFVuc3RhYmxlQXBpVmVyc2lvbltcIk1TQzM4NDZcIl0gPSBcInRvd24ucm9iaW4ubXNjMzg0NlwiO1xuICBVbnN0YWJsZUFwaVZlcnNpb25bXCJNU0MzODY5XCJdID0gXCJvcmcubWF0cml4Lm1zYzM4NjlcIjtcbiAgVW5zdGFibGVBcGlWZXJzaW9uW1wiTVNDMzk3M1wiXSA9IFwib3JnLm1hdHJpeC5tc2MzOTczXCI7XG4gIFVuc3RhYmxlQXBpVmVyc2lvbltcIk1TQzQwMzlcIl0gPSBcIm9yZy5tYXRyaXgubXNjNDAzOVwiO1xuICByZXR1cm4gVW5zdGFibGVBcGlWZXJzaW9uO1xufSh7fSk7XG5leHBvcnRzLlVuc3RhYmxlQXBpVmVyc2lvbiA9IFVuc3RhYmxlQXBpVmVyc2lvbjtcbnZhciBDdXJyZW50QXBpVmVyc2lvbnMgPSBbTWF0cml4QXBpVmVyc2lvbi5QcmVyZWxlYXNlMSwgTWF0cml4QXBpVmVyc2lvbi5QcmVyZWxlYXNlMixcbi8vTWF0cml4QXBpVmVyc2lvbi5WMDEwLFxuVW5zdGFibGVBcGlWZXJzaW9uLk1TQzI3NjIsIFVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyNzYyX1VQREFURV9TVEFURSwgVW5zdGFibGVBcGlWZXJzaW9uLk1TQzI4NzEsIFVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyODczLCBVbnN0YWJsZUFwaVZlcnNpb24uTVNDMjkzMSwgVW5zdGFibGVBcGlWZXJzaW9uLk1TQzI5NzQsIFVuc3RhYmxlQXBpVmVyc2lvbi5NU0MyODc2LCBVbnN0YWJsZUFwaVZlcnNpb24uTVNDMzgxOSwgVW5zdGFibGVBcGlWZXJzaW9uLk1TQzM4NDYsIFVuc3RhYmxlQXBpVmVyc2lvbi5NU0MzODY5LCBVbnN0YWJsZUFwaVZlcnNpb24uTVNDMzk3MywgVW5zdGFibGVBcGlWZXJzaW9uLk1TQzQwMzldO1xuZXhwb3J0cy5DdXJyZW50QXBpVmVyc2lvbnMgPSBDdXJyZW50QXBpVmVyc2lvbnM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1BcGlWZXJzaW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5WaWRlb0NvbmZlcmVuY2VDYXBhYmlsaXRpZXMgPSBleHBvcnRzLlN0aWNrZXJwaWNrZXJDYXBhYmlsaXRpZXMgPSBleHBvcnRzLk1hdHJpeENhcGFiaWxpdGllcyA9IHZvaWQgMDtcbmV4cG9ydHMuZ2V0VGltZWxpbmVSb29tSURGcm9tQ2FwYWJpbGl0eSA9IGdldFRpbWVsaW5lUm9vbUlERnJvbUNhcGFiaWxpdHk7XG5leHBvcnRzLmlzVGltZWxpbmVDYXBhYmlsaXR5ID0gaXNUaW1lbGluZUNhcGFiaWxpdHk7XG5leHBvcnRzLmlzVGltZWxpbmVDYXBhYmlsaXR5Rm9yID0gaXNUaW1lbGluZUNhcGFiaWxpdHlGb3I7XG4vKlxuICogQ29weXJpZ2h0IDIwMjAgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xudmFyIE1hdHJpeENhcGFiaWxpdGllcyA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoTWF0cml4Q2FwYWJpbGl0aWVzKSB7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIlNjcmVlbnNob3RzXCJdID0gXCJtLmNhcGFiaWxpdHkuc2NyZWVuc2hvdFwiO1xuICBNYXRyaXhDYXBhYmlsaXRpZXNbXCJTdGlja2VyU2VuZGluZ1wiXSA9IFwibS5zdGlja2VyXCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIkFsd2F5c09uU2NyZWVuXCJdID0gXCJtLmFsd2F5c19vbl9zY3JlZW5cIjtcbiAgTWF0cml4Q2FwYWJpbGl0aWVzW1wiUmVxdWlyZXNDbGllbnRcIl0gPSBcImlvLmVsZW1lbnQucmVxdWlyZXNfY2xpZW50XCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIk1TQzI5MzFOYXZpZ2F0ZVwiXSA9IFwib3JnLm1hdHJpeC5tc2MyOTMxLm5hdmlnYXRlXCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIk1TQzM4NDZUdXJuU2VydmVyc1wiXSA9IFwidG93bi5yb2Jpbi5tc2MzODQ2LnR1cm5fc2VydmVyc1wiO1xuICBNYXRyaXhDYXBhYmlsaXRpZXNbXCJNU0MzOTczVXNlckRpcmVjdG9yeVNlYXJjaFwiXSA9IFwib3JnLm1hdHJpeC5tc2MzOTczLnVzZXJfZGlyZWN0b3J5X3NlYXJjaFwiO1xuICBNYXRyaXhDYXBhYmlsaXRpZXNbXCJNU0M0MDM5VXBsb2FkRmlsZVwiXSA9IFwib3JnLm1hdHJpeC5tc2M0MDM5LnVwbG9hZF9maWxlXCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIk1TQzQwMzlEb3dubG9hZEZpbGVcIl0gPSBcIm9yZy5tYXRyaXgubXNjNDAzOS5kb3dubG9hZF9maWxlXCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIk1TQzQxNTdTZW5kRGVsYXllZEV2ZW50XCJdID0gXCJvcmcubWF0cml4Lm1zYzQxNTcuc2VuZC5kZWxheWVkX2V2ZW50XCI7XG4gIE1hdHJpeENhcGFiaWxpdGllc1tcIk1TQzQxNTdVcGRhdGVEZWxheWVkRXZlbnRcIl0gPSBcIm9yZy5tYXRyaXgubXNjNDE1Ny51cGRhdGVfZGVsYXllZF9ldmVudFwiO1xuICByZXR1cm4gTWF0cml4Q2FwYWJpbGl0aWVzO1xufSh7fSk7XG5leHBvcnRzLk1hdHJpeENhcGFiaWxpdGllcyA9IE1hdHJpeENhcGFiaWxpdGllcztcbnZhciBTdGlja2VycGlja2VyQ2FwYWJpbGl0aWVzID0gW01hdHJpeENhcGFiaWxpdGllcy5TdGlja2VyU2VuZGluZ107XG5leHBvcnRzLlN0aWNrZXJwaWNrZXJDYXBhYmlsaXRpZXMgPSBTdGlja2VycGlja2VyQ2FwYWJpbGl0aWVzO1xudmFyIFZpZGVvQ29uZmVyZW5jZUNhcGFiaWxpdGllcyA9IFtNYXRyaXhDYXBhYmlsaXRpZXMuQWx3YXlzT25TY3JlZW5dO1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgYSBjYXBhYmlsaXR5IGlzIGEgY2FwYWJpbGl0eSBmb3IgYSB0aW1lbGluZS5cbiAqIEBwYXJhbSB7Q2FwYWJpbGl0eX0gY2FwYWJpbGl0eSBUaGUgY2FwYWJpbGl0eSB0byB0ZXN0LlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYSB0aW1lbGluZSBjYXBhYmlsaXR5LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydHMuVmlkZW9Db25mZXJlbmNlQ2FwYWJpbGl0aWVzID0gVmlkZW9Db25mZXJlbmNlQ2FwYWJpbGl0aWVzO1xuZnVuY3Rpb24gaXNUaW1lbGluZUNhcGFiaWxpdHkoY2FwYWJpbGl0eSkge1xuICAvLyBUT0RPOiBDaGFuZ2Ugd2hlbiBNU0MyNzYyIGJlY29tZXMgc3RhYmxlLlxuICByZXR1cm4gY2FwYWJpbGl0eSA9PT0gbnVsbCB8fCBjYXBhYmlsaXR5ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjYXBhYmlsaXR5LnN0YXJ0c1dpdGgoXCJvcmcubWF0cml4Lm1zYzI3NjIudGltZWxpbmU6XCIpO1xufVxuXG4vKipcbiAqIERldGVybWluZXMgaWYgYSBjYXBhYmlsaXR5IGlzIGEgdGltZWxpbmUgY2FwYWJpbGl0eSBmb3IgdGhlIGdpdmVuIHJvb20uXG4gKiBAcGFyYW0ge0NhcGFiaWxpdHl9IGNhcGFiaWxpdHkgVGhlIGNhcGFiaWxpdHkgdG8gdGVzdC5cbiAqIEBwYXJhbSB7c3RyaW5nIHwgU3ltYm9scy5BbnlSb29tfSByb29tSWQgVGhlIHJvb20gSUQsIG9yIGBTeW1ib2xzLkFueVJvb21gIGZvciB0aGF0IGRlc2lnbmF0aW9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFRydWUgaWYgYSBtYXRjaGluZyBjYXBhYmlsaXR5LCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGlzVGltZWxpbmVDYXBhYmlsaXR5Rm9yKGNhcGFiaWxpdHksIHJvb21JZCkge1xuICByZXR1cm4gY2FwYWJpbGl0eSA9PT0gXCJvcmcubWF0cml4Lm1zYzI3NjIudGltZWxpbmU6XCIuY29uY2F0KHJvb21JZCk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgcm9vbSBJRCBkZXNjcmliZWQgYnkgYSB0aW1lbGluZSBjYXBhYmlsaXR5LlxuICogQHBhcmFtIHtzdHJpbmd9IGNhcGFiaWxpdHkgVGhlIGNhcGFiaWxpdHkgdG8gcGFyc2UuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcm9vbSBJRC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGltZWxpbmVSb29tSURGcm9tQ2FwYWJpbGl0eShjYXBhYmlsaXR5KSB7XG4gIHJldHVybiBjYXBhYmlsaXR5LnN1YnN0cmluZyhjYXBhYmlsaXR5LmluZGV4T2YoXCI6XCIpICsgMSk7XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD1DYXBhYmlsaXRpZXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk9wZW5JRFJlcXVlc3RTdGF0ZSA9IHZvaWQgMDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbnZhciBPcGVuSURSZXF1ZXN0U3RhdGUgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKE9wZW5JRFJlcXVlc3RTdGF0ZSkge1xuICBPcGVuSURSZXF1ZXN0U3RhdGVbXCJBbGxvd2VkXCJdID0gXCJhbGxvd2VkXCI7XG4gIE9wZW5JRFJlcXVlc3RTdGF0ZVtcIkJsb2NrZWRcIl0gPSBcImJsb2NrZWRcIjtcbiAgT3BlbklEUmVxdWVzdFN0YXRlW1wiUGVuZGluZ1VzZXJDb25maXJtYXRpb25cIl0gPSBcInJlcXVlc3RcIjtcbiAgcmV0dXJuIE9wZW5JRFJlcXVlc3RTdGF0ZTtcbn0oe30pO1xuZXhwb3J0cy5PcGVuSURSZXF1ZXN0U3RhdGUgPSBPcGVuSURSZXF1ZXN0U3RhdGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1HZXRPcGVuSURBY3Rpb24uanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmlzRXJyb3JSZXNwb25zZSA9IGlzRXJyb3JSZXNwb25zZTtcbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgcmV0dXJuIF90eXBlb2YgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBcInN5bWJvbFwiID09IHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9LCBfdHlwZW9mKG9iaik7IH1cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCAtIDIwMjQgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogVGhlIGZvcm1hdCBvZiBlcnJvcnMgcmV0dXJuZWQgYnkgTWF0cml4IEFQSSByZXF1ZXN0c1xuICogbWFkZSBieSBhIFdpZGdldERyaXZlci5cbiAqL1xuXG5mdW5jdGlvbiBpc0Vycm9yUmVzcG9uc2UocmVzcG9uc2VEYXRhKSB7XG4gIHZhciBlcnJvciA9IHJlc3BvbnNlRGF0YS5lcnJvcjtcbiAgcmV0dXJuIF90eXBlb2YoZXJyb3IpID09PSBcIm9iamVjdFwiICYmIGVycm9yICE9PSBudWxsICYmIFwibWVzc2FnZVwiIGluIGVycm9yICYmIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSBcInN0cmluZ1wiO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9SVdpZGdldEFwaUVycm9yUmVzcG9uc2UuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1vZGFsQnV0dG9uS2luZCA9IHZvaWQgMDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbnZhciBNb2RhbEJ1dHRvbktpbmQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKE1vZGFsQnV0dG9uS2luZCkge1xuICBNb2RhbEJ1dHRvbktpbmRbXCJQcmltYXJ5XCJdID0gXCJtLnByaW1hcnlcIjtcbiAgTW9kYWxCdXR0b25LaW5kW1wiU2Vjb25kYXJ5XCJdID0gXCJtLnNlY29uZGFyeVwiO1xuICBNb2RhbEJ1dHRvbktpbmRbXCJXYXJuaW5nXCJdID0gXCJtLndhcm5pbmdcIjtcbiAgTW9kYWxCdXR0b25LaW5kW1wiRGFuZ2VyXCJdID0gXCJtLmRhbmdlclwiO1xuICBNb2RhbEJ1dHRvbktpbmRbXCJMaW5rXCJdID0gXCJtLmxpbmtcIjtcbiAgcmV0dXJuIE1vZGFsQnV0dG9uS2luZDtcbn0oe30pO1xuZXhwb3J0cy5Nb2RhbEJ1dHRvbktpbmQgPSBNb2RhbEJ1dHRvbktpbmQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Nb2RhbEJ1dHRvbktpbmQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLkJ1aWx0SW5Nb2RhbEJ1dHRvbklEID0gdm9pZCAwO1xuLypcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xudmFyIEJ1aWx0SW5Nb2RhbEJ1dHRvbklEID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChCdWlsdEluTW9kYWxCdXR0b25JRCkge1xuICBCdWlsdEluTW9kYWxCdXR0b25JRFtcIkNsb3NlXCJdID0gXCJtLmNsb3NlXCI7XG4gIHJldHVybiBCdWlsdEluTW9kYWxCdXR0b25JRDtcbn0oe30pOyAvLyBUeXBlcyBmb3IgYSBub3JtYWwgbW9kYWwgcmVxdWVzdGluZyB0aGUgb3BlbmluZyBhIG1vZGFsIHdpZGdldFxuLy8gVHlwZXMgZm9yIGEgbW9kYWwgd2lkZ2V0IHJlY2VpdmluZyBub3RpZmljYXRpb25zIHRoYXQgaXRzIGJ1dHRvbnMgaGF2ZSBiZWVuIHByZXNzZWRcbi8vIFR5cGVzIGZvciBhIG1vZGFsIHdpZGdldCByZXF1ZXN0aW5nIGNsb3NlXG4vLyBUeXBlcyBmb3IgYSBub3JtYWwgd2lkZ2V0IGJlaW5nIG5vdGlmaWVkIHRoYXQgdGhlIG1vZGFsIHdpZGdldCBpdCBvcGVuZWQgaGFzIGJlZW4gY2xvc2VkXG5leHBvcnRzLkJ1aWx0SW5Nb2RhbEJ1dHRvbklEID0gQnVpbHRJbk1vZGFsQnV0dG9uSUQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1Nb2RhbFdpZGdldEFjdGlvbnMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlVwZGF0ZURlbGF5ZWRFdmVudEFjdGlvbiA9IHZvaWQgMDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCAtIDIwMjQgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG52YXIgVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChVcGRhdGVEZWxheWVkRXZlbnRBY3Rpb24pIHtcbiAgVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uW1wiQ2FuY2VsXCJdID0gXCJjYW5jZWxcIjtcbiAgVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uW1wiUmVzdGFydFwiXSA9IFwicmVzdGFydFwiO1xuICBVcGRhdGVEZWxheWVkRXZlbnRBY3Rpb25bXCJTZW5kXCJdID0gXCJzZW5kXCI7XG4gIHJldHVybiBVcGRhdGVEZWxheWVkRXZlbnRBY3Rpb247XG59KHt9KTtcbmV4cG9ydHMuVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uID0gVXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9VXBkYXRlRGVsYXllZEV2ZW50QWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbiA9IGV4cG9ydHMuV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbiA9IHZvaWQgMDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbnZhciBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb24pIHtcbiAgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb25bXCJTdXBwb3J0ZWRBcGlWZXJzaW9uc1wiXSA9IFwic3VwcG9ydGVkX2FwaV92ZXJzaW9uc1wiO1xuICBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbltcIkNhcGFiaWxpdGllc1wiXSA9IFwiY2FwYWJpbGl0aWVzXCI7XG4gIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uW1wiTm90aWZ5Q2FwYWJpbGl0aWVzXCJdID0gXCJub3RpZnlfY2FwYWJpbGl0aWVzXCI7XG4gIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uW1wiVGhlbWVDaGFuZ2VcIl0gPSBcInRoZW1lX2NoYW5nZVwiO1xuICBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbltcIkxhbmd1YWdlQ2hhbmdlXCJdID0gXCJsYW5ndWFnZV9jaGFuZ2VcIjtcbiAgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb25bXCJUYWtlU2NyZWVuc2hvdFwiXSA9IFwic2NyZWVuc2hvdFwiO1xuICBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbltcIlVwZGF0ZVZpc2liaWxpdHlcIl0gPSBcInZpc2liaWxpdHlcIjtcbiAgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb25bXCJPcGVuSURDcmVkZW50aWFsc1wiXSA9IFwib3BlbmlkX2NyZWRlbnRpYWxzXCI7XG4gIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uW1wiV2lkZ2V0Q29uZmlnXCJdID0gXCJ3aWRnZXRfY29uZmlnXCI7XG4gIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uW1wiQ2xvc2VNb2RhbFdpZGdldFwiXSA9IFwiY2xvc2VfbW9kYWxcIjtcbiAgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb25bXCJCdXR0b25DbGlja2VkXCJdID0gXCJidXR0b25fY2xpY2tlZFwiO1xuICBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbltcIlNlbmRFdmVudFwiXSA9IFwic2VuZF9ldmVudFwiO1xuICBXaWRnZXRBcGlUb1dpZGdldEFjdGlvbltcIlNlbmRUb0RldmljZVwiXSA9IFwic2VuZF90b19kZXZpY2VcIjtcbiAgV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb25bXCJVcGRhdGVTdGF0ZVwiXSA9IFwidXBkYXRlX3N0YXRlXCI7XG4gIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uW1wiVXBkYXRlVHVyblNlcnZlcnNcIl0gPSBcInVwZGF0ZV90dXJuX3NlcnZlcnNcIjtcbiAgcmV0dXJuIFdpZGdldEFwaVRvV2lkZ2V0QWN0aW9uO1xufSh7fSk7XG5leHBvcnRzLldpZGdldEFwaVRvV2lkZ2V0QWN0aW9uID0gV2lkZ2V0QXBpVG9XaWRnZXRBY3Rpb247XG52YXIgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbikge1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiU3VwcG9ydGVkQXBpVmVyc2lvbnNcIl0gPSBcInN1cHBvcnRlZF9hcGlfdmVyc2lvbnNcIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIkNvbnRlbnRMb2FkZWRcIl0gPSBcImNvbnRlbnRfbG9hZGVkXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJTZW5kU3RpY2tlclwiXSA9IFwibS5zdGlja2VyXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJVcGRhdGVBbHdheXNPblNjcmVlblwiXSA9IFwic2V0X2Fsd2F5c19vbl9zY3JlZW5cIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIkdldE9wZW5JRENyZWRlbnRpYWxzXCJdID0gXCJnZXRfb3BlbmlkXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJDbG9zZU1vZGFsV2lkZ2V0XCJdID0gXCJjbG9zZV9tb2RhbFwiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiT3Blbk1vZGFsV2lkZ2V0XCJdID0gXCJvcGVuX21vZGFsXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJTZXRNb2RhbEJ1dHRvbkVuYWJsZWRcIl0gPSBcInNldF9idXR0b25fZW5hYmxlZFwiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiU2VuZEV2ZW50XCJdID0gXCJzZW5kX2V2ZW50XCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJTZW5kVG9EZXZpY2VcIl0gPSBcInNlbmRfdG9fZGV2aWNlXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJXYXRjaFR1cm5TZXJ2ZXJzXCJdID0gXCJ3YXRjaF90dXJuX3NlcnZlcnNcIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIlVud2F0Y2hUdXJuU2VydmVyc1wiXSA9IFwidW53YXRjaF90dXJuX3NlcnZlcnNcIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIkJlZXBlclJlYWRSb29tQWNjb3VudERhdGFcIl0gPSBcImNvbS5iZWVwZXIucmVhZF9yb29tX2FjY291bnRfZGF0YVwiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiTVNDMjg3NlJlYWRFdmVudHNcIl0gPSBcIm9yZy5tYXRyaXgubXNjMjg3Ni5yZWFkX2V2ZW50c1wiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiTVNDMjkzMU5hdmlnYXRlXCJdID0gXCJvcmcubWF0cml4Lm1zYzI5MzEubmF2aWdhdGVcIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIk1TQzI5NzRSZW5lZ290aWF0ZUNhcGFiaWxpdGllc1wiXSA9IFwib3JnLm1hdHJpeC5tc2MyOTc0LnJlcXVlc3RfY2FwYWJpbGl0aWVzXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJNU0MzODY5UmVhZFJlbGF0aW9uc1wiXSA9IFwib3JnLm1hdHJpeC5tc2MzODY5LnJlYWRfcmVsYXRpb25zXCI7XG4gIFdpZGdldEFwaUZyb21XaWRnZXRBY3Rpb25bXCJNU0MzOTczVXNlckRpcmVjdG9yeVNlYXJjaFwiXSA9IFwib3JnLm1hdHJpeC5tc2MzOTczLnVzZXJfZGlyZWN0b3J5X3NlYXJjaFwiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiTVNDNDAzOUdldE1lZGlhQ29uZmlnQWN0aW9uXCJdID0gXCJvcmcubWF0cml4Lm1zYzQwMzkuZ2V0X21lZGlhX2NvbmZpZ1wiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiTVNDNDAzOVVwbG9hZEZpbGVBY3Rpb25cIl0gPSBcIm9yZy5tYXRyaXgubXNjNDAzOS51cGxvYWRfZmlsZVwiO1xuICBXaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uW1wiTVNDNDAzOURvd25sb2FkRmlsZUFjdGlvblwiXSA9IFwib3JnLm1hdHJpeC5tc2M0MDM5LmRvd25sb2FkX2ZpbGVcIjtcbiAgV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbltcIk1TQzQxNTdVcGRhdGVEZWxheWVkRXZlbnRcIl0gPSBcIm9yZy5tYXRyaXgubXNjNDE1Ny51cGRhdGVfZGVsYXllZF9ldmVudFwiO1xuICByZXR1cm4gV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbjtcbn0oe30pO1xuZXhwb3J0cy5XaWRnZXRBcGlGcm9tV2lkZ2V0QWN0aW9uID0gV2lkZ2V0QXBpRnJvbVdpZGdldEFjdGlvbjtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdpZGdldEFwaUFjdGlvbi5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuV2lkZ2V0QXBpRGlyZWN0aW9uID0gdm9pZCAwO1xuZXhwb3J0cy5pbnZlcnRlZERpcmVjdGlvbiA9IGludmVydGVkRGlyZWN0aW9uO1xuLypcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xudmFyIFdpZGdldEFwaURpcmVjdGlvbiA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoV2lkZ2V0QXBpRGlyZWN0aW9uKSB7XG4gIFdpZGdldEFwaURpcmVjdGlvbltcIlRvV2lkZ2V0XCJdID0gXCJ0b1dpZGdldFwiO1xuICBXaWRnZXRBcGlEaXJlY3Rpb25bXCJGcm9tV2lkZ2V0XCJdID0gXCJmcm9tV2lkZ2V0XCI7XG4gIHJldHVybiBXaWRnZXRBcGlEaXJlY3Rpb247XG59KHt9KTtcbmV4cG9ydHMuV2lkZ2V0QXBpRGlyZWN0aW9uID0gV2lkZ2V0QXBpRGlyZWN0aW9uO1xuZnVuY3Rpb24gaW52ZXJ0ZWREaXJlY3Rpb24oZGlyKSB7XG4gIGlmIChkaXIgPT09IFdpZGdldEFwaURpcmVjdGlvbi5Ub1dpZGdldCkge1xuICAgIHJldHVybiBXaWRnZXRBcGlEaXJlY3Rpb24uRnJvbVdpZGdldDtcbiAgfSBlbHNlIGlmIChkaXIgPT09IFdpZGdldEFwaURpcmVjdGlvbi5Gcm9tV2lkZ2V0KSB7XG4gICAgcmV0dXJuIFdpZGdldEFwaURpcmVjdGlvbi5Ub1dpZGdldDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGRpcmVjdGlvblwiKTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V2lkZ2V0QXBpRGlyZWN0aW9uLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5XaWRnZXRLaW5kID0gdm9pZCAwO1xuLypcbiAqIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xudmFyIFdpZGdldEtpbmQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKFdpZGdldEtpbmQpIHtcbiAgV2lkZ2V0S2luZFtcIlJvb21cIl0gPSBcInJvb21cIjtcbiAgV2lkZ2V0S2luZFtcIkFjY291bnRcIl0gPSBcImFjY291bnRcIjtcbiAgV2lkZ2V0S2luZFtcIk1vZGFsXCJdID0gXCJtb2RhbFwiO1xuICByZXR1cm4gV2lkZ2V0S2luZDtcbn0oe30pO1xuZXhwb3J0cy5XaWRnZXRLaW5kID0gV2lkZ2V0S2luZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVdpZGdldEtpbmQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLk1hdHJpeFdpZGdldFR5cGUgPSB2b2lkIDA7XG4vKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG52YXIgTWF0cml4V2lkZ2V0VHlwZSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoTWF0cml4V2lkZ2V0VHlwZSkge1xuICBNYXRyaXhXaWRnZXRUeXBlW1wiQ3VzdG9tXCJdID0gXCJtLmN1c3RvbVwiO1xuICBNYXRyaXhXaWRnZXRUeXBlW1wiSml0c2lNZWV0XCJdID0gXCJtLmppdHNpXCI7XG4gIE1hdHJpeFdpZGdldFR5cGVbXCJTdGlja2VycGlja2VyXCJdID0gXCJtLnN0aWNrZXJwaWNrZXJcIjtcbiAgcmV0dXJuIE1hdHJpeFdpZGdldFR5cGU7XG59KHt9KTtcbmV4cG9ydHMuTWF0cml4V2lkZ2V0VHlwZSA9IE1hdHJpeFdpZGdldFR5cGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1XaWRnZXRUeXBlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5XaWRnZXQgPSB2b2lkIDA7XG52YXIgX3V0aWxzID0gcmVxdWlyZShcIi4vdmFsaWRhdGlvbi91dGlsc1wiKTtcbnZhciBfID0gcmVxdWlyZShcIi4uXCIpO1xuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiOyByZXR1cm4gX3R5cGVvZiA9IFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIFwic3ltYm9sXCIgPT0gdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH0sIF90eXBlb2Yob2JqKTsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkoYXJnKSB7IHZhciBrZXkgPSBfdG9QcmltaXRpdmUoYXJnLCBcInN0cmluZ1wiKTsgcmV0dXJuIF90eXBlb2Yoa2V5KSA9PT0gXCJzeW1ib2xcIiA/IGtleSA6IFN0cmluZyhrZXkpOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUoaW5wdXQsIGhpbnQpIHsgaWYgKF90eXBlb2YoaW5wdXQpICE9PSBcIm9iamVjdFwiIHx8IGlucHV0ID09PSBudWxsKSByZXR1cm4gaW5wdXQ7IHZhciBwcmltID0gaW5wdXRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHByaW0gIT09IHVuZGVmaW5lZCkgeyB2YXIgcmVzID0gcHJpbS5jYWxsKGlucHV0LCBoaW50IHx8IFwiZGVmYXVsdFwiKTsgaWYgKF90eXBlb2YocmVzKSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHJlczsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoaGludCA9PT0gXCJzdHJpbmdcIiA/IFN0cmluZyA6IE51bWJlcikoaW5wdXQpOyB9IC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBiYXJlc3QgZm9ybSBvZiB3aWRnZXQuXG4gKi9cbnZhciBXaWRnZXQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBXaWRnZXQoZGVmaW5pdGlvbikge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXaWRnZXQpO1xuICAgIHRoaXMuZGVmaW5pdGlvbiA9IGRlZmluaXRpb247XG4gICAgaWYgKCF0aGlzLmRlZmluaXRpb24pIHRocm93IG5ldyBFcnJvcihcIkRlZmluaXRpb24gaXMgcmVxdWlyZWRcIik7XG4gICAgKDAsIF91dGlscy5hc3NlcnRQcmVzZW50KShkZWZpbml0aW9uLCBcImlkXCIpO1xuICAgICgwLCBfdXRpbHMuYXNzZXJ0UHJlc2VudCkoZGVmaW5pdGlvbiwgXCJjcmVhdG9yVXNlcklkXCIpO1xuICAgICgwLCBfdXRpbHMuYXNzZXJ0UHJlc2VudCkoZGVmaW5pdGlvbiwgXCJ0eXBlXCIpO1xuICAgICgwLCBfdXRpbHMuYXNzZXJ0UHJlc2VudCkoZGVmaW5pdGlvbiwgXCJ1cmxcIik7XG4gIH1cblxuICAvKipcbiAgICogVGhlIHVzZXIgSUQgd2hvIGNyZWF0ZWQgdGhlIHdpZGdldC5cbiAgICovXG4gIF9jcmVhdGVDbGFzcyhXaWRnZXQsIFt7XG4gICAga2V5OiBcImNyZWF0b3JVc2VySWRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRlZmluaXRpb24uY3JlYXRvclVzZXJJZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdHlwZSBvZiB3aWRnZXQuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwidHlwZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi50eXBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBJRCBvZiB0aGUgd2lkZ2V0LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcImlkXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBuYW1lIG9mIHRoZSB3aWRnZXQsIG9yIG51bGwgaWYgbm90IHNldC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJuYW1lXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLm5hbWUgfHwgbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgdGl0bGUgZm9yIHRoZSB3aWRnZXQsIG9yIG51bGwgaWYgbm90IHNldC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ0aXRsZVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMucmF3RGF0YS50aXRsZSB8fCBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSB0ZW1wbGF0ZWQgVVJMIGZvciB0aGUgd2lkZ2V0LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInRlbXBsYXRlVXJsXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kZWZpbml0aW9uLnVybDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3JpZ2luIGZvciB0aGlzIHdpZGdldC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJvcmlnaW5cIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiBuZXcgVVJMKHRoaXMudGVtcGxhdGVVcmwpLm9yaWdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIG9yIG5vdCB0aGUgY2xpZW50IHNob3VsZCB3YWl0IGZvciB0aGUgaWZyYW1lIHRvIGxvYWQuIERlZmF1bHRzXG4gICAgICogdG8gdHJ1ZS5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJ3YWl0Rm9ySWZyYW1lTG9hZFwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgaWYgKHRoaXMuZGVmaW5pdGlvbi53YWl0Rm9ySWZyYW1lTG9hZCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmRlZmluaXRpb24ud2FpdEZvcklmcmFtZUxvYWQgPT09IHRydWUpIHJldHVybiB0cnVlO1xuICAgICAgcmV0dXJuIHRydWU7IC8vIGRlZmF1bHQgdHJ1ZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSByYXcgZGF0YSBmb3IgdGhlIHdpZGdldC4gVGhpcyB3aWxsIGFsd2F5cyBiZSBkZWZpbmVkLCB0aG91Z2hcbiAgICAgKiBtYXkgYmUgZW1wdHkuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicmF3RGF0YVwiLFxuICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVmaW5pdGlvbi5kYXRhIHx8IHt9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBjb21wbGV0ZSB3aWRnZXQgVVJMIGZvciB0aGUgY2xpZW50IHRvIHJlbmRlci5cbiAgICAgKiBAcGFyYW0ge0lUZW1wbGF0ZVBhcmFtc30gcGFyYW1zIFRoZSB0ZW1wbGF0ZSBwYXJhbWV0ZXJzLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgdGVtcGxhdGVkIFVSTC5cbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogXCJnZXRDb21wbGV0ZVVybFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRDb21wbGV0ZVVybChwYXJhbXMpIHtcbiAgICAgIHJldHVybiAoMCwgXy5ydW5UZW1wbGF0ZSkodGhpcy50ZW1wbGF0ZVVybCwgdGhpcy5kZWZpbml0aW9uLCBwYXJhbXMpO1xuICAgIH1cbiAgfV0pO1xuICByZXR1cm4gV2lkZ2V0O1xufSgpO1xuZXhwb3J0cy5XaWRnZXQgPSBXaWRnZXQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1XaWRnZXQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLldpZGdldEV2ZW50Q2FwYWJpbGl0eSA9IGV4cG9ydHMuRXZlbnRLaW5kID0gZXhwb3J0cy5FdmVudERpcmVjdGlvbiA9IHZvaWQgMDtcbmZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7IFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjsgcmV0dXJuIF90eXBlb2YgPSBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBcInN5bWJvbFwiID09IHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgU3ltYm9sICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9LCBfdHlwZW9mKG9iaik7IH1cbmZ1bmN0aW9uIF9jcmVhdGVGb3JPZkl0ZXJhdG9ySGVscGVyKG8sIGFsbG93QXJyYXlMaWtlKSB7IHZhciBpdCA9IHR5cGVvZiBTeW1ib2wgIT09IFwidW5kZWZpbmVkXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdIHx8IG9bXCJAQGl0ZXJhdG9yXCJdOyBpZiAoIWl0KSB7IGlmIChBcnJheS5pc0FycmF5KG8pIHx8IChpdCA9IF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvKSkgfHwgYWxsb3dBcnJheUxpa2UgJiYgbyAmJiB0eXBlb2Ygby5sZW5ndGggPT09IFwibnVtYmVyXCIpIHsgaWYgKGl0KSBvID0gaXQ7IHZhciBpID0gMDsgdmFyIEYgPSBmdW5jdGlvbiBGKCkge307IHJldHVybiB7IHM6IEYsIG46IGZ1bmN0aW9uIG4oKSB7IGlmIChpID49IG8ubGVuZ3RoKSByZXR1cm4geyBkb25lOiB0cnVlIH07IHJldHVybiB7IGRvbmU6IGZhbHNlLCB2YWx1ZTogb1tpKytdIH07IH0sIGU6IGZ1bmN0aW9uIGUoX2UpIHsgdGhyb3cgX2U7IH0sIGY6IEYgfTsgfSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGl0ZXJhdGUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7IH0gdmFyIG5vcm1hbENvbXBsZXRpb24gPSB0cnVlLCBkaWRFcnIgPSBmYWxzZSwgZXJyOyByZXR1cm4geyBzOiBmdW5jdGlvbiBzKCkgeyBpdCA9IGl0LmNhbGwobyk7IH0sIG46IGZ1bmN0aW9uIG4oKSB7IHZhciBzdGVwID0gaXQubmV4dCgpOyBub3JtYWxDb21wbGV0aW9uID0gc3RlcC5kb25lOyByZXR1cm4gc3RlcDsgfSwgZTogZnVuY3Rpb24gZShfZTIpIHsgZGlkRXJyID0gdHJ1ZTsgZXJyID0gX2UyOyB9LCBmOiBmdW5jdGlvbiBmKCkgeyB0cnkgeyBpZiAoIW5vcm1hbENvbXBsZXRpb24gJiYgaXRbXCJyZXR1cm5cIl0gIT0gbnVsbCkgaXRbXCJyZXR1cm5cIl0oKTsgfSBmaW5hbGx5IHsgaWYgKGRpZEVycikgdGhyb3cgZXJyOyB9IH0gfTsgfVxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikgeyBpZiAoIW8pIHJldHVybjsgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpOyBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lOyBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTsgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pOyB9XG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikgeyBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBuZXcgQXJyYXkobGVuKTsgaSA8IGxlbjsgaSsrKSBhcnIyW2ldID0gYXJyW2ldOyByZXR1cm4gYXJyMjsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX3RvUHJvcGVydHlLZXkoYXJnKSB7IHZhciBrZXkgPSBfdG9QcmltaXRpdmUoYXJnLCBcInN0cmluZ1wiKTsgcmV0dXJuIF90eXBlb2Yoa2V5KSA9PT0gXCJzeW1ib2xcIiA/IGtleSA6IFN0cmluZyhrZXkpOyB9XG5mdW5jdGlvbiBfdG9QcmltaXRpdmUoaW5wdXQsIGhpbnQpIHsgaWYgKF90eXBlb2YoaW5wdXQpICE9PSBcIm9iamVjdFwiIHx8IGlucHV0ID09PSBudWxsKSByZXR1cm4gaW5wdXQ7IHZhciBwcmltID0gaW5wdXRbU3ltYm9sLnRvUHJpbWl0aXZlXTsgaWYgKHByaW0gIT09IHVuZGVmaW5lZCkgeyB2YXIgcmVzID0gcHJpbS5jYWxsKGlucHV0LCBoaW50IHx8IFwiZGVmYXVsdFwiKTsgaWYgKF90eXBlb2YocmVzKSAhPT0gXCJvYmplY3RcIikgcmV0dXJuIHJlczsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkBAdG9QcmltaXRpdmUgbXVzdCByZXR1cm4gYSBwcmltaXRpdmUgdmFsdWUuXCIpOyB9IHJldHVybiAoaGludCA9PT0gXCJzdHJpbmdcIiA/IFN0cmluZyA6IE51bWJlcikoaW5wdXQpOyB9XG4vKlxuICogQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG52YXIgRXZlbnRLaW5kID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChFdmVudEtpbmQpIHtcbiAgRXZlbnRLaW5kW1wiRXZlbnRcIl0gPSBcImV2ZW50XCI7XG4gIEV2ZW50S2luZFtcIlN0YXRlXCJdID0gXCJzdGF0ZV9ldmVudFwiO1xuICBFdmVudEtpbmRbXCJUb0RldmljZVwiXSA9IFwidG9fZGV2aWNlXCI7XG4gIEV2ZW50S2luZFtcIlJvb21BY2NvdW50XCJdID0gXCJyb29tX2FjY291bnRcIjtcbiAgcmV0dXJuIEV2ZW50S2luZDtcbn0oe30pO1xuZXhwb3J0cy5FdmVudEtpbmQgPSBFdmVudEtpbmQ7XG52YXIgRXZlbnREaXJlY3Rpb24gPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKEV2ZW50RGlyZWN0aW9uKSB7XG4gIEV2ZW50RGlyZWN0aW9uW1wiU2VuZFwiXSA9IFwic2VuZFwiO1xuICBFdmVudERpcmVjdGlvbltcIlJlY2VpdmVcIl0gPSBcInJlY2VpdmVcIjtcbiAgcmV0dXJuIEV2ZW50RGlyZWN0aW9uO1xufSh7fSk7XG5leHBvcnRzLkV2ZW50RGlyZWN0aW9uID0gRXZlbnREaXJlY3Rpb247XG52YXIgV2lkZ2V0RXZlbnRDYXBhYmlsaXR5ID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gV2lkZ2V0RXZlbnRDYXBhYmlsaXR5KGRpcmVjdGlvbiwgZXZlbnRUeXBlLCBraW5kLCBrZXlTdHIsIHJhdykge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXaWRnZXRFdmVudENhcGFiaWxpdHkpO1xuICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgIHRoaXMuZXZlbnRUeXBlID0gZXZlbnRUeXBlO1xuICAgIHRoaXMua2luZCA9IGtpbmQ7XG4gICAgdGhpcy5rZXlTdHIgPSBrZXlTdHI7XG4gICAgdGhpcy5yYXcgPSByYXc7XG4gIH1cbiAgX2NyZWF0ZUNsYXNzKFdpZGdldEV2ZW50Q2FwYWJpbGl0eSwgW3tcbiAgICBrZXk6IFwibWF0Y2hlc0FzU3RhdGVFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBtYXRjaGVzQXNTdGF0ZUV2ZW50KGRpcmVjdGlvbiwgZXZlbnRUeXBlLCBzdGF0ZUtleSkge1xuICAgICAgaWYgKHRoaXMua2luZCAhPT0gRXZlbnRLaW5kLlN0YXRlKSByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHN0YXRlIGV2ZW50XG4gICAgICBpZiAodGhpcy5kaXJlY3Rpb24gIT09IGRpcmVjdGlvbikgcmV0dXJuIGZhbHNlOyAvLyBkaXJlY3Rpb24gbWlzbWF0Y2hcbiAgICAgIGlmICh0aGlzLmV2ZW50VHlwZSAhPT0gZXZlbnRUeXBlKSByZXR1cm4gZmFsc2U7IC8vIGV2ZW50IHR5cGUgbWlzbWF0Y2hcbiAgICAgIGlmICh0aGlzLmtleVN0ciA9PT0gbnVsbCkgcmV0dXJuIHRydWU7IC8vIGFsbCBzdGF0ZSBrZXlzIGFyZSBhbGxvd2VkXG4gICAgICBpZiAodGhpcy5rZXlTdHIgPT09IHN0YXRlS2V5KSByZXR1cm4gdHJ1ZTsgLy8gdGhpcyBzdGF0ZSBrZXkgaXMgYWxsb3dlZFxuXG4gICAgICAvLyBEZWZhdWx0IG5vdCBhbGxvd2VkXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcIm1hdGNoZXNBc1RvRGV2aWNlRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWF0Y2hlc0FzVG9EZXZpY2VFdmVudChkaXJlY3Rpb24sIGV2ZW50VHlwZSkge1xuICAgICAgaWYgKHRoaXMua2luZCAhPT0gRXZlbnRLaW5kLlRvRGV2aWNlKSByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHRvLWRldmljZSBldmVudFxuICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uICE9PSBkaXJlY3Rpb24pIHJldHVybiBmYWxzZTsgLy8gZGlyZWN0aW9uIG1pc21hdGNoXG4gICAgICBpZiAodGhpcy5ldmVudFR5cGUgIT09IGV2ZW50VHlwZSkgcmV0dXJuIGZhbHNlOyAvLyBldmVudCB0eXBlIG1pc21hdGNoXG5cbiAgICAgIC8vIENoZWNrcyBwYXNzZWQsIHRoZSBldmVudCBpcyBhbGxvd2VkXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF0Y2hlc0FzUm9vbUV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1hdGNoZXNBc1Jvb21FdmVudChkaXJlY3Rpb24sIGV2ZW50VHlwZSkge1xuICAgICAgdmFyIG1zZ3R5cGUgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gICAgICBpZiAodGhpcy5raW5kICE9PSBFdmVudEtpbmQuRXZlbnQpIHJldHVybiBmYWxzZTsgLy8gbm90IGEgcm9vbSBldmVudFxuICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uICE9PSBkaXJlY3Rpb24pIHJldHVybiBmYWxzZTsgLy8gZGlyZWN0aW9uIG1pc21hdGNoXG4gICAgICBpZiAodGhpcy5ldmVudFR5cGUgIT09IGV2ZW50VHlwZSkgcmV0dXJuIGZhbHNlOyAvLyBldmVudCB0eXBlIG1pc21hdGNoXG5cbiAgICAgIGlmICh0aGlzLmV2ZW50VHlwZSA9PT0gXCJtLnJvb20ubWVzc2FnZVwiKSB7XG4gICAgICAgIGlmICh0aGlzLmtleVN0ciA9PT0gbnVsbCkgcmV0dXJuIHRydWU7IC8vIGFsbCBtZXNzYWdlIHR5cGVzIGFyZSBhbGxvd2VkXG4gICAgICAgIGlmICh0aGlzLmtleVN0ciA9PT0gbXNndHlwZSkgcmV0dXJuIHRydWU7IC8vIHRoaXMgbWVzc2FnZSB0eXBlIGlzIGFsbG93ZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBhbHJlYWR5IHBhc3NlZCB0aGUgY2hlY2sgZm9yIGlmIHRoZSBldmVudCBpcyBhbGxvd2VkXG4gICAgICB9XG5cbiAgICAgIC8vIERlZmF1bHQgbm90IGFsbG93ZWRcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwibWF0Y2hlc0FzUm9vbUFjY291bnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG1hdGNoZXNBc1Jvb21BY2NvdW50RGF0YShkaXJlY3Rpb24sIGV2ZW50VHlwZSkge1xuICAgICAgaWYgKHRoaXMua2luZCAhPT0gRXZlbnRLaW5kLlJvb21BY2NvdW50KSByZXR1cm4gZmFsc2U7IC8vIG5vdCByb29tIGFjY291bnQgZGF0YVxuICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uICE9PSBkaXJlY3Rpb24pIHJldHVybiBmYWxzZTsgLy8gZGlyZWN0aW9uIG1pc21hdGNoXG4gICAgICBpZiAodGhpcy5ldmVudFR5cGUgIT09IGV2ZW50VHlwZSkgcmV0dXJuIGZhbHNlOyAvLyBldmVudCB0eXBlIG1pc21hdGNoXG5cbiAgICAgIC8vIENoZWNrcyBwYXNzZWQsIHRoZSBldmVudCBpcyBhbGxvd2VkXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1dLCBbe1xuICAgIGtleTogXCJmb3JTdGF0ZUV2ZW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvclN0YXRlRXZlbnQoZGlyZWN0aW9uLCBldmVudFR5cGUsIHN0YXRlS2V5KSB7XG4gICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS4qIG5hbWVzcGFjZSBvbmNlIHRoZSBNU0MgbGFuZHMuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtd2lkZ2V0LWFwaS9pc3N1ZXMvMjJcbiAgICAgIGV2ZW50VHlwZSA9IGV2ZW50VHlwZS5yZXBsYWNlKC8jL2csIFwiXFxcXCNcIik7XG4gICAgICBzdGF0ZUtleSA9IHN0YXRlS2V5ICE9PSBudWxsICYmIHN0YXRlS2V5ICE9PSB1bmRlZmluZWQgPyBcIiNcIi5jb25jYXQoc3RhdGVLZXkpIDogXCJcIjtcbiAgICAgIHZhciBzdHIgPSBcIm9yZy5tYXRyaXgubXNjMjc2Mi5cIi5jb25jYXQoZGlyZWN0aW9uLCBcIi5zdGF0ZV9ldmVudDpcIikuY29uY2F0KGV2ZW50VHlwZSkuY29uY2F0KHN0YXRlS2V5KTtcblxuICAgICAgLy8gY2hlYXQgYnkgc2VuZGluZyBpdCB0aHJvdWdoIHRoZSBwcm9jZXNzb3JcbiAgICAgIHJldHVybiBXaWRnZXRFdmVudENhcGFiaWxpdHkuZmluZEV2ZW50Q2FwYWJpbGl0aWVzKFtzdHJdKVswXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZm9yVG9EZXZpY2VFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JUb0RldmljZUV2ZW50KGRpcmVjdGlvbiwgZXZlbnRUeXBlKSB7XG4gICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS4qIG5hbWVzcGFjZSBvbmNlIHRoZSBNU0MgbGFuZHMuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtd2lkZ2V0LWFwaS9pc3N1ZXMvNTZcbiAgICAgIHZhciBzdHIgPSBcIm9yZy5tYXRyaXgubXNjMzgxOS5cIi5jb25jYXQoZGlyZWN0aW9uLCBcIi50b19kZXZpY2U6XCIpLmNvbmNhdChldmVudFR5cGUpO1xuXG4gICAgICAvLyBjaGVhdCBieSBzZW5kaW5nIGl0IHRocm91Z2ggdGhlIHByb2Nlc3NvclxuICAgICAgcmV0dXJuIFdpZGdldEV2ZW50Q2FwYWJpbGl0eS5maW5kRXZlbnRDYXBhYmlsaXRpZXMoW3N0cl0pWzBdO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmb3JSb29tRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9yUm9vbUV2ZW50KGRpcmVjdGlvbiwgZXZlbnRUeXBlKSB7XG4gICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS4qIG5hbWVzcGFjZSBvbmNlIHRoZSBNU0MgbGFuZHMuXG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtd2lkZ2V0LWFwaS9pc3N1ZXMvMjJcbiAgICAgIHZhciBzdHIgPSBcIm9yZy5tYXRyaXgubXNjMjc2Mi5cIi5jb25jYXQoZGlyZWN0aW9uLCBcIi5ldmVudDpcIikuY29uY2F0KGV2ZW50VHlwZSk7XG5cbiAgICAgIC8vIGNoZWF0IGJ5IHNlbmRpbmcgaXQgdGhyb3VnaCB0aGUgcHJvY2Vzc29yXG4gICAgICByZXR1cm4gV2lkZ2V0RXZlbnRDYXBhYmlsaXR5LmZpbmRFdmVudENhcGFiaWxpdGllcyhbc3RyXSlbMF07XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImZvclJvb21NZXNzYWdlRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZm9yUm9vbU1lc3NhZ2VFdmVudChkaXJlY3Rpb24sIG1zZ3R5cGUpIHtcbiAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLiogbmFtZXNwYWNlIG9uY2UgdGhlIE1TQyBsYW5kcy5cbiAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC13aWRnZXQtYXBpL2lzc3Vlcy8yMlxuICAgICAgbXNndHlwZSA9IG1zZ3R5cGUgPT09IG51bGwgfHwgbXNndHlwZSA9PT0gdW5kZWZpbmVkID8gXCJcIiA6IG1zZ3R5cGU7XG4gICAgICB2YXIgc3RyID0gXCJvcmcubWF0cml4Lm1zYzI3NjIuXCIuY29uY2F0KGRpcmVjdGlvbiwgXCIuZXZlbnQ6bS5yb29tLm1lc3NhZ2UjXCIpLmNvbmNhdChtc2d0eXBlKTtcblxuICAgICAgLy8gY2hlYXQgYnkgc2VuZGluZyBpdCB0aHJvdWdoIHRoZSBwcm9jZXNzb3JcbiAgICAgIHJldHVybiBXaWRnZXRFdmVudENhcGFiaWxpdHkuZmluZEV2ZW50Q2FwYWJpbGl0aWVzKFtzdHJdKVswXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZm9yUm9vbUFjY291bnREYXRhXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZvclJvb21BY2NvdW50RGF0YShkaXJlY3Rpb24sIGV2ZW50VHlwZSkge1xuICAgICAgdmFyIHN0ciA9IFwiY29tLmJlZXBlci5jYXBhYmlsaXRpZXMuXCIuY29uY2F0KGRpcmVjdGlvbiwgXCIucm9vbV9hY2NvdW50X2RhdGE6XCIpLmNvbmNhdChldmVudFR5cGUpO1xuICAgICAgcmV0dXJuIFdpZGdldEV2ZW50Q2FwYWJpbGl0eS5maW5kRXZlbnRDYXBhYmlsaXRpZXMoW3N0cl0pWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhIGNhcGFiaWxpdGllcyByZXF1ZXN0IHRvIGZpbmQgYWxsIHRoZSBldmVudCBjYXBhYmlsaXR5IHJlcXVlc3RzLlxuICAgICAqIEBwYXJhbSB7SXRlcmFibGU8Q2FwYWJpbGl0eT59IGNhcGFiaWxpdGllcyBUaGUgY2FwYWJpbGl0aWVzIHJlcXVlc3RlZC90byBwYXJzZS5cbiAgICAgKiBAcmV0dXJucyB7V2lkZ2V0RXZlbnRDYXBhYmlsaXR5W119IEFuIGFycmF5IG9mIGV2ZW50IGNhcGFiaWxpdHkgcmVxdWVzdHMuIE1heSBiZSBlbXB0eSwgYnV0IG5ldmVyIG51bGwuXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwiZmluZEV2ZW50Q2FwYWJpbGl0aWVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRFdmVudENhcGFiaWxpdGllcyhjYXBhYmlsaXRpZXMpIHtcbiAgICAgIHZhciBwYXJzZWQgPSBbXTtcbiAgICAgIHZhciBfaXRlcmF0b3IgPSBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihjYXBhYmlsaXRpZXMpLFxuICAgICAgICBfc3RlcDtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAoX2l0ZXJhdG9yLnMoKTsgIShfc3RlcCA9IF9pdGVyYXRvci5uKCkpLmRvbmU7KSB7XG4gICAgICAgICAgdmFyIGNhcCA9IF9zdGVwLnZhbHVlO1xuICAgICAgICAgIHZhciBfZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICB2YXIgZXZlbnRTZWdtZW50ID0gdm9pZCAwO1xuICAgICAgICAgIHZhciBfa2luZCA9IG51bGw7XG5cbiAgICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS4qIG5hbWVzcGFjZSBvbmNlIHRoZSBNU0NzIGxhbmQuXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LXdpZGdldC1hcGkvaXNzdWVzLzIyXG4gICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LXdpZGdldC1hcGkvaXNzdWVzLzU2XG5cbiAgICAgICAgICBpZiAoY2FwLnN0YXJ0c1dpdGgoXCJvcmcubWF0cml4Lm1zYzI3NjIuc2VuZC5ldmVudDpcIikpIHtcbiAgICAgICAgICAgIF9kaXJlY3Rpb24gPSBFdmVudERpcmVjdGlvbi5TZW5kO1xuICAgICAgICAgICAgX2tpbmQgPSBFdmVudEtpbmQuRXZlbnQ7XG4gICAgICAgICAgICBldmVudFNlZ21lbnQgPSBjYXAuc3Vic3RyaW5nKFwib3JnLm1hdHJpeC5tc2MyNzYyLnNlbmQuZXZlbnQ6XCIubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNhcC5zdGFydHNXaXRoKFwib3JnLm1hdHJpeC5tc2MyNzYyLnNlbmQuc3RhdGVfZXZlbnQ6XCIpKSB7XG4gICAgICAgICAgICBfZGlyZWN0aW9uID0gRXZlbnREaXJlY3Rpb24uU2VuZDtcbiAgICAgICAgICAgIF9raW5kID0gRXZlbnRLaW5kLlN0YXRlO1xuICAgICAgICAgICAgZXZlbnRTZWdtZW50ID0gY2FwLnN1YnN0cmluZyhcIm9yZy5tYXRyaXgubXNjMjc2Mi5zZW5kLnN0YXRlX2V2ZW50OlwiLmxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjYXAuc3RhcnRzV2l0aChcIm9yZy5tYXRyaXgubXNjMzgxOS5zZW5kLnRvX2RldmljZTpcIikpIHtcbiAgICAgICAgICAgIF9kaXJlY3Rpb24gPSBFdmVudERpcmVjdGlvbi5TZW5kO1xuICAgICAgICAgICAgX2tpbmQgPSBFdmVudEtpbmQuVG9EZXZpY2U7XG4gICAgICAgICAgICBldmVudFNlZ21lbnQgPSBjYXAuc3Vic3RyaW5nKFwib3JnLm1hdHJpeC5tc2MzODE5LnNlbmQudG9fZGV2aWNlOlwiLmxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChjYXAuc3RhcnRzV2l0aChcIm9yZy5tYXRyaXgubXNjMjc2Mi5yZWNlaXZlLmV2ZW50OlwiKSkge1xuICAgICAgICAgICAgX2RpcmVjdGlvbiA9IEV2ZW50RGlyZWN0aW9uLlJlY2VpdmU7XG4gICAgICAgICAgICBfa2luZCA9IEV2ZW50S2luZC5FdmVudDtcbiAgICAgICAgICAgIGV2ZW50U2VnbWVudCA9IGNhcC5zdWJzdHJpbmcoXCJvcmcubWF0cml4Lm1zYzI3NjIucmVjZWl2ZS5ldmVudDpcIi5sZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2FwLnN0YXJ0c1dpdGgoXCJvcmcubWF0cml4Lm1zYzI3NjIucmVjZWl2ZS5zdGF0ZV9ldmVudDpcIikpIHtcbiAgICAgICAgICAgIF9kaXJlY3Rpb24gPSBFdmVudERpcmVjdGlvbi5SZWNlaXZlO1xuICAgICAgICAgICAgX2tpbmQgPSBFdmVudEtpbmQuU3RhdGU7XG4gICAgICAgICAgICBldmVudFNlZ21lbnQgPSBjYXAuc3Vic3RyaW5nKFwib3JnLm1hdHJpeC5tc2MyNzYyLnJlY2VpdmUuc3RhdGVfZXZlbnQ6XCIubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNhcC5zdGFydHNXaXRoKFwib3JnLm1hdHJpeC5tc2MzODE5LnJlY2VpdmUudG9fZGV2aWNlOlwiKSkge1xuICAgICAgICAgICAgX2RpcmVjdGlvbiA9IEV2ZW50RGlyZWN0aW9uLlJlY2VpdmU7XG4gICAgICAgICAgICBfa2luZCA9IEV2ZW50S2luZC5Ub0RldmljZTtcbiAgICAgICAgICAgIGV2ZW50U2VnbWVudCA9IGNhcC5zdWJzdHJpbmcoXCJvcmcubWF0cml4Lm1zYzM4MTkucmVjZWl2ZS50b19kZXZpY2U6XCIubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNhcC5zdGFydHNXaXRoKFwiY29tLmJlZXBlci5jYXBhYmlsaXRpZXMucmVjZWl2ZS5yb29tX2FjY291bnRfZGF0YTpcIikpIHtcbiAgICAgICAgICAgIF9kaXJlY3Rpb24gPSBFdmVudERpcmVjdGlvbi5SZWNlaXZlO1xuICAgICAgICAgICAgX2tpbmQgPSBFdmVudEtpbmQuUm9vbUFjY291bnQ7XG4gICAgICAgICAgICBldmVudFNlZ21lbnQgPSBjYXAuc3Vic3RyaW5nKFwiY29tLmJlZXBlci5jYXBhYmlsaXRpZXMucmVjZWl2ZS5yb29tX2FjY291bnRfZGF0YTpcIi5sZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoX2RpcmVjdGlvbiA9PT0gbnVsbCB8fCBfa2luZCA9PT0gbnVsbCB8fCBldmVudFNlZ21lbnQgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG5cbiAgICAgICAgICAvLyBUaGUgY2FwYWJpbGl0eSB1c2VzIGAjYCBhcyBhIHNlcGFyYXRvciBiZXR3ZWVuIGV2ZW50IHR5cGUgYW5kIHN0YXRlIGtleS9tc2d0eXBlLFxuICAgICAgICAgIC8vIHNvIHdlIHNwbGl0IG9uIHRoYXQuIEhvd2V2ZXIsIGEgIyBpcyBhbHNvIHZhbGlkIGluIGVpdGhlciBvbmUgb2YgdGhvc2Ugc28gd2VcbiAgICAgICAgICAvLyBqb2luIGFjY29yZGluZ2x5LlxuICAgICAgICAgIC8vIEVnOiBgbS5yb29tLm1lc3NhZ2UjI20udGV4dGAgaXMgXCJtLnJvb20ubWVzc2FnZVwiIGV2ZW50IHdpdGggbXNndHlwZSBcIiNtLnRleHRcIi5cbiAgICAgICAgICB2YXIgZXhwZWN0aW5nS2V5U3RyID0gZXZlbnRTZWdtZW50LnN0YXJ0c1dpdGgoXCJtLnJvb20ubWVzc2FnZSNcIikgfHwgX2tpbmQgPT09IEV2ZW50S2luZC5TdGF0ZTtcbiAgICAgICAgICB2YXIgX2tleVN0ciA9IG51bGw7XG4gICAgICAgICAgaWYgKGV2ZW50U2VnbWVudC5pbmNsdWRlcyhcIiNcIikgJiYgZXhwZWN0aW5nS2V5U3RyKSB7XG4gICAgICAgICAgICAvLyBEZXYgbm90ZTogcmVnZXggaXMgZGlmZmljdWx0IHRvIHdyaXRlLCBzbyBpbnN0ZWFkIHRoZSBydWxlcyBhcmUgbWFudWFsbHkgd3JpdHRlblxuICAgICAgICAgICAgLy8gb3V0LiBUaGlzIGlzIHByb2JhYmx5IGp1c3QgYXMgdW5kZXJzdGFuZGFibGUgYXMgYSBib3JpbmcgcmVnZXggdGhvdWdoLCBzbyB3aW4td2luP1xuXG4gICAgICAgICAgICAvLyBUZXN0IGNhc2VzOlxuICAgICAgICAgICAgLy8gc3RyICAgICAgICAgICAgICAgICAgICAgIGV2ZW50U2VnbWVudCAgICAgICAga2V5U3RyXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAvLyBtLnJvb20ubWVzc2FnZSMgICAgICAgICAgbS5yb29tLm1lc3NhZ2UgICAgICA8ZW1wdHkgc3RyaW5nPlxuICAgICAgICAgICAgLy8gbS5yb29tLm1lc3NhZ2UjdGVzdCAgICAgIG0ucm9vbS5tZXNzYWdlICAgICAgdGVzdFxuICAgICAgICAgICAgLy8gbS5yb29tLm1lc3NhZ2VcXCMgICAgICAgICBtLnJvb20ubWVzc2FnZSMgICAgIHRlc3RcbiAgICAgICAgICAgIC8vIG0ucm9vbS5tZXNzYWdlIyN0ZXN0ICAgICBtLnJvb20ubWVzc2FnZSAgICAgICN0ZXN0XG4gICAgICAgICAgICAvLyBtLnJvb20ubWVzc2FnZVxcIyN0ZXN0ICAgIG0ucm9vbS5tZXNzYWdlIyAgICAgdGVzdFxuICAgICAgICAgICAgLy8gbS5yb29tLm1lc3NhZ2VcXFxcIyN0ZXN0ICAgbS5yb29tLm1lc3NhZ2VcXCMgICAgdGVzdFxuICAgICAgICAgICAgLy8gbS5yb29tLm1lc3NhZ2VcXFxcIyMjdGVzdCAgbS5yb29tLm1lc3NhZ2VcXCMgICAgI3Rlc3RcblxuICAgICAgICAgICAgLy8gRmlyc3Qgc3RlcDogZXhwbG9kZSB0aGUgc3RyaW5nXG4gICAgICAgICAgICB2YXIgcGFydHMgPSBldmVudFNlZ21lbnQuc3BsaXQoXCIjXCIpO1xuXG4gICAgICAgICAgICAvLyBUbyBmb3JtIHRoZSBldmVudFNlZ21lbnQsIHdlJ2xsIGtlZXAgZmluZGluZyBwYXJ0cyBvZiB0aGUgZXhwbG9kZWQgc3RyaW5nIHVudGlsXG4gICAgICAgICAgICAvLyB0aGVyZSdzIG9uZSB0aGF0IGRvZXNuJ3QgZW5kIHdpdGggdGhlIGVzY2FwZSBjaGFyYWN0ZXIgKFxcKS4gV2UnbGwgdGhlbiBqb2luIHRob3NlXG4gICAgICAgICAgICAvLyBzZWdtZW50cyB0b2dldGhlciB3aXRoIHRoZSBleHBsb2RpbmcgY2hhcmFjdGVyLiBXZSBoYXZlIHRvIHJlbWVtYmVyIHRvIGNvbnN1bWUgdGhlXG4gICAgICAgICAgICAvLyBlc2NhcGUgY2hhcmFjdGVyIGFzIHdlbGwuXG4gICAgICAgICAgICB2YXIgaWR4ID0gcGFydHMuZmluZEluZGV4KGZ1bmN0aW9uIChwKSB7XG4gICAgICAgICAgICAgIHJldHVybiAhcC5lbmRzV2l0aChcIlxcXFxcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGV2ZW50U2VnbWVudCA9IHBhcnRzLnNsaWNlKDAsIGlkeCArIDEpLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICByZXR1cm4gcC5lbmRzV2l0aChcIlxcXFxcIikgPyBwLnN1YnN0cmluZygwLCBwLmxlbmd0aCAtIDEpIDogcDtcbiAgICAgICAgICAgIH0pLmpvaW4oXCIjXCIpO1xuXG4gICAgICAgICAgICAvLyBUaGUga2V5U3RyIGlzIHdoYXRldmVyIGlzIGxlZnQgb3Zlci5cbiAgICAgICAgICAgIF9rZXlTdHIgPSBwYXJ0cy5zbGljZShpZHggKyAxKS5qb2luKFwiI1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFyc2VkLnB1c2gobmV3IFdpZGdldEV2ZW50Q2FwYWJpbGl0eShfZGlyZWN0aW9uLCBldmVudFNlZ21lbnQsIF9raW5kLCBfa2V5U3RyLCBjYXApKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIF9pdGVyYXRvci5lKGVycik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBfaXRlcmF0b3IuZigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIFdpZGdldEV2ZW50Q2FwYWJpbGl0eTtcbn0oKTtcbmV4cG9ydHMuV2lkZ2V0RXZlbnRDYXBhYmlsaXR5ID0gV2lkZ2V0RXZlbnRDYXBhYmlsaXR5O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V2lkZ2V0RXZlbnRDYXBhYmlsaXR5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5XaWRnZXRQYXJzZXIgPSB2b2lkIDA7XG52YXIgX1dpZGdldCA9IHJlcXVpcmUoXCIuL1dpZGdldFwiKTtcbnZhciBfdXJsID0gcmVxdWlyZShcIi4vdmFsaWRhdGlvbi91cmxcIik7XG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfSwgX3R5cGVvZihvYmopOyB9XG5mdW5jdGlvbiBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihvLCBhbGxvd0FycmF5TGlrZSkgeyB2YXIgaXQgPSB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSB8fCBvW1wiQEBpdGVyYXRvclwiXTsgaWYgKCFpdCkgeyBpZiAoQXJyYXkuaXNBcnJheShvKSB8fCAoaXQgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobykpIHx8IGFsbG93QXJyYXlMaWtlICYmIG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSB7IGlmIChpdCkgbyA9IGl0OyB2YXIgaSA9IDA7IHZhciBGID0gZnVuY3Rpb24gRigpIHt9OyByZXR1cm4geyBzOiBGLCBuOiBmdW5jdGlvbiBuKCkgeyBpZiAoaSA+PSBvLmxlbmd0aCkgcmV0dXJuIHsgZG9uZTogdHJ1ZSB9OyByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IG9baSsrXSB9OyB9LCBlOiBmdW5jdGlvbiBlKF9lKSB7IHRocm93IF9lOyB9LCBmOiBGIH07IH0gdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBpdGVyYXRlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9IHZhciBub3JtYWxDb21wbGV0aW9uID0gdHJ1ZSwgZGlkRXJyID0gZmFsc2UsIGVycjsgcmV0dXJuIHsgczogZnVuY3Rpb24gcygpIHsgaXQgPSBpdC5jYWxsKG8pOyB9LCBuOiBmdW5jdGlvbiBuKCkgeyB2YXIgc3RlcCA9IGl0Lm5leHQoKTsgbm9ybWFsQ29tcGxldGlvbiA9IHN0ZXAuZG9uZTsgcmV0dXJuIHN0ZXA7IH0sIGU6IGZ1bmN0aW9uIGUoX2UyKSB7IGRpZEVyciA9IHRydWU7IGVyciA9IF9lMjsgfSwgZjogZnVuY3Rpb24gZigpIHsgdHJ5IHsgaWYgKCFub3JtYWxDb21wbGV0aW9uICYmIGl0W1wicmV0dXJuXCJdICE9IG51bGwpIGl0W1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChkaWRFcnIpIHRocm93IGVycjsgfSB9IH07IH1cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH1cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIF90b1Byb3BlcnR5S2V5KGRlc2NyaXB0b3Iua2V5KSwgZGVzY3JpcHRvcik7IH0gfVxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uc3RydWN0b3IsIFwicHJvdG90eXBlXCIsIHsgd3JpdGFibGU6IGZhbHNlIH0pOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cbmZ1bmN0aW9uIF90b1Byb3BlcnR5S2V5KGFyZykgeyB2YXIga2V5ID0gX3RvUHJpbWl0aXZlKGFyZywgXCJzdHJpbmdcIik7IHJldHVybiBfdHlwZW9mKGtleSkgPT09IFwic3ltYm9sXCIgPyBrZXkgOiBTdHJpbmcoa2V5KTsgfVxuZnVuY3Rpb24gX3RvUHJpbWl0aXZlKGlucHV0LCBoaW50KSB7IGlmIChfdHlwZW9mKGlucHV0KSAhPT0gXCJvYmplY3RcIiB8fCBpbnB1dCA9PT0gbnVsbCkgcmV0dXJuIGlucHV0OyB2YXIgcHJpbSA9IGlucHV0W1N5bWJvbC50b1ByaW1pdGl2ZV07IGlmIChwcmltICE9PSB1bmRlZmluZWQpIHsgdmFyIHJlcyA9IHByaW0uY2FsbChpbnB1dCwgaGludCB8fCBcImRlZmF1bHRcIik7IGlmIChfdHlwZW9mKHJlcykgIT09IFwib2JqZWN0XCIpIHJldHVybiByZXM7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJAQHRvUHJpbWl0aXZlIG11c3QgcmV0dXJuIGEgcHJpbWl0aXZlIHZhbHVlLlwiKTsgfSByZXR1cm4gKGhpbnQgPT09IFwic3RyaW5nXCIgPyBTdHJpbmcgOiBOdW1iZXIpKGlucHV0KTsgfSAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbnZhciBXaWRnZXRQYXJzZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBXaWRnZXRQYXJzZXIoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFdpZGdldFBhcnNlcik7XG4gIH0gLy8gcHJpdmF0ZSBjb25zdHJ1Y3RvciBiZWNhdXNlIHRoaXMgaXMgYSB1dGlsIGNsYXNzXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB3aWRnZXRzIGZyb20gdGhlIFwibS53aWRnZXRzXCIgYWNjb3VudCBkYXRhIGV2ZW50LiBUaGlzIHdpbGwgYWx3YXlzXG4gICAqIHJldHVybiBhbiBhcnJheSwgdGhvdWdoIG1heSBiZSBlbXB0eSBpZiBubyB2YWxpZCB3aWRnZXRzIHdlcmUgZm91bmQuXG4gICAqIEBwYXJhbSB7SUFjY291bnREYXRhV2lkZ2V0c30gY29udGVudCBUaGUgY29udGVudCBvZiB0aGUgXCJtLndpZGdldHNcIiBhY2NvdW50IGRhdGEuXG4gICAqIEByZXR1cm5zIHtXaWRnZXRbXX0gVGhlIHdpZGdldHMgaW4gYWNjb3VudCBkYXRhLCBvciBhbiBlbXB0eSBhcnJheS5cbiAgICovXG4gIF9jcmVhdGVDbGFzcyhXaWRnZXRQYXJzZXIsIG51bGwsIFt7XG4gICAga2V5OiBcInBhcnNlQWNjb3VudERhdGFcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFyc2VBY2NvdW50RGF0YShjb250ZW50KSB7XG4gICAgICBpZiAoIWNvbnRlbnQpIHJldHVybiBbXTtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgIGZvciAodmFyIF9pID0gMCwgX09iamVjdCRrZXlzID0gT2JqZWN0LmtleXMoY29udGVudCk7IF9pIDwgX09iamVjdCRrZXlzLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX3dpZGdldElkID0gX09iamVjdCRrZXlzW19pXTtcbiAgICAgICAgdmFyIHJvdWdoV2lkZ2V0ID0gY29udGVudFtfd2lkZ2V0SWRdO1xuICAgICAgICBpZiAoIXJvdWdoV2lkZ2V0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKHJvdWdoV2lkZ2V0LnR5cGUgIT09IFwibS53aWRnZXRcIiAmJiByb3VnaFdpZGdldC50eXBlICE9PSBcImltLnZlY3Rvci5tb2R1bGFyLndpZGdldHNcIikgY29udGludWU7XG4gICAgICAgIGlmICghcm91Z2hXaWRnZXQuc2VuZGVyKSBjb250aW51ZTtcbiAgICAgICAgdmFyIHByb2JhYmxlV2lkZ2V0SWQgPSByb3VnaFdpZGdldC5zdGF0ZV9rZXkgfHwgcm91Z2hXaWRnZXQuaWQ7XG4gICAgICAgIGlmIChwcm9iYWJsZVdpZGdldElkICE9PSBfd2lkZ2V0SWQpIGNvbnRpbnVlO1xuICAgICAgICB2YXIgYXNTdGF0ZUV2ZW50ID0ge1xuICAgICAgICAgIGNvbnRlbnQ6IHJvdWdoV2lkZ2V0LmNvbnRlbnQsXG4gICAgICAgICAgc2VuZGVyOiByb3VnaFdpZGdldC5zZW5kZXIsXG4gICAgICAgICAgdHlwZTogXCJtLndpZGdldFwiLFxuICAgICAgICAgIHN0YXRlX2tleTogX3dpZGdldElkLFxuICAgICAgICAgIGV2ZW50X2lkOiBcIiRleGFtcGxlXCIsXG4gICAgICAgICAgcm9vbV9pZDogXCIhZXhhbXBsZVwiLFxuICAgICAgICAgIG9yaWdpbl9zZXJ2ZXJfdHM6IDFcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHdpZGdldCA9IFdpZGdldFBhcnNlci5wYXJzZVJvb21XaWRnZXQoYXNTdGF0ZUV2ZW50KTtcbiAgICAgICAgaWYgKHdpZGdldCkgcmVzdWx0LnB1c2god2lkZ2V0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIGFsbCB0aGUgd2lkZ2V0cyBwb3NzaWJsZSBpbiB0aGUgZ2l2ZW4gYXJyYXkuIFRoaXMgd2lsbCBhbHdheXMgcmV0dXJuXG4gICAgICogYW4gYXJyYXksIHRob3VnaCBtYXkgYmUgZW1wdHkgaWYgbm8gd2lkZ2V0cyBjb3VsZCBiZSBwYXJzZWQuXG4gICAgICogQHBhcmFtIHtJU3RhdGVFdmVudFtdfSBjdXJyZW50U3RhdGUgVGhlIHJvb20gc3RhdGUgdG8gcGFyc2UuXG4gICAgICogQHJldHVybnMge1dpZGdldFtdfSBUaGUgd2lkZ2V0cyBpbiB0aGUgc3RhdGUsIG9yIGFuIGVtcHR5IGFycmF5LlxuICAgICAqL1xuICB9LCB7XG4gICAga2V5OiBcInBhcnNlV2lkZ2V0c0Zyb21Sb29tU3RhdGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcGFyc2VXaWRnZXRzRnJvbVJvb21TdGF0ZShjdXJyZW50U3RhdGUpIHtcbiAgICAgIGlmICghY3VycmVudFN0YXRlKSByZXR1cm4gW107XG4gICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICB2YXIgX2l0ZXJhdG9yID0gX2NyZWF0ZUZvck9mSXRlcmF0b3JIZWxwZXIoY3VycmVudFN0YXRlKSxcbiAgICAgICAgX3N0ZXA7XG4gICAgICB0cnkge1xuICAgICAgICBmb3IgKF9pdGVyYXRvci5zKCk7ICEoX3N0ZXAgPSBfaXRlcmF0b3IubigpKS5kb25lOykge1xuICAgICAgICAgIHZhciBzdGF0ZSA9IF9zdGVwLnZhbHVlO1xuICAgICAgICAgIHZhciB3aWRnZXQgPSBXaWRnZXRQYXJzZXIucGFyc2VSb29tV2lkZ2V0KHN0YXRlKTtcbiAgICAgICAgICBpZiAod2lkZ2V0KSByZXN1bHQucHVzaCh3aWRnZXQpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2l0ZXJhdG9yLmUoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9pdGVyYXRvci5mKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBhcnNlcyBhIHN0YXRlIGV2ZW50IGludG8gYSB3aWRnZXQuIElmIHRoZSBzdGF0ZSBldmVudCBkb2VzIG5vdCByZXByZXNlbnRcbiAgICAgKiBhIHdpZGdldCAod3JvbmcgZXZlbnQgdHlwZSwgaW52YWxpZCB3aWRnZXQsIGV0YykgdGhlbiBudWxsIGlzIHJldHVybmVkLlxuICAgICAqIEBwYXJhbSB7SVN0YXRlRXZlbnR9IHN0YXRlRXZlbnQgVGhlIHN0YXRlIGV2ZW50LlxuICAgICAqIEByZXR1cm5zIHtXaWRnZXR8bnVsbH0gVGhlIHdpZGdldCwgb3IgbnVsbCBpZiBpbnZhbGlkXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6IFwicGFyc2VSb29tV2lkZ2V0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHBhcnNlUm9vbVdpZGdldChzdGF0ZUV2ZW50KSB7XG4gICAgICBpZiAoIXN0YXRlRXZlbnQpIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBUT0RPOiBbTGVnYWN5XSBSZW1vdmUgbGVnYWN5IHN1cHBvcnRcbiAgICAgIGlmIChzdGF0ZUV2ZW50LnR5cGUgIT09IFwibS53aWRnZXRcIiAmJiBzdGF0ZUV2ZW50LnR5cGUgIT09IFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXYgbm90ZTogVGhyb3VnaG91dCB0aGlzIGZ1bmN0aW9uIHdlIGhhdmUgbnVsbCBzYWZldHkgdG8gZW5zdXJlIHRoYXRcbiAgICAgIC8vIGlmIHRoZSBjYWxsZXIgZGlkIG5vdCBzdXBwbHkgc29tZXRoaW5nIHVzZWZ1bCB0aGF0IHdlIGRvbid0IGVycm9yLiBUaGlzXG4gICAgICAvLyBpcyBkb25lIGFnYWluc3QgdGhlIHJlcXVpcmVtZW50cyBvZiB0aGUgaW50ZXJmYWNlIGJlY2F1c2Ugbm90IGV2ZXJ5b25lXG4gICAgICAvLyB3aWxsIGhhdmUgYW4gaW50ZXJmYWNlIHRvIHZhbGlkYXRlIGFnYWluc3QuXG5cbiAgICAgIHZhciBjb250ZW50ID0gc3RhdGVFdmVudC5jb250ZW50IHx8IHt9O1xuXG4gICAgICAvLyBGb3JtIG91ciBiZXN0IGFwcHJveGltYXRpb24gb2YgYSB3aWRnZXQgd2l0aCB0aGUgaW5mb3JtYXRpb24gd2UgaGF2ZVxuICAgICAgdmFyIGVzdGltYXRlZFdpZGdldCA9IHtcbiAgICAgICAgaWQ6IHN0YXRlRXZlbnQuc3RhdGVfa2V5LFxuICAgICAgICBjcmVhdG9yVXNlcklkOiBjb250ZW50W1wiY3JlYXRvclVzZXJJZFwiXSB8fCBzdGF0ZUV2ZW50LnNlbmRlcixcbiAgICAgICAgbmFtZTogY29udGVudFtcIm5hbWVcIl0sXG4gICAgICAgIHR5cGU6IGNvbnRlbnRbXCJ0eXBlXCJdLFxuICAgICAgICB1cmw6IGNvbnRlbnRbXCJ1cmxcIl0sXG4gICAgICAgIHdhaXRGb3JJZnJhbWVMb2FkOiBjb250ZW50W1wid2FpdEZvcklmcmFtZUxvYWRcIl0sXG4gICAgICAgIGRhdGE6IGNvbnRlbnRbXCJkYXRhXCJdXG4gICAgICB9O1xuXG4gICAgICAvLyBGaW5hbGx5LCBwcm9jZXNzIHRoYXQgd2lkZ2V0XG4gICAgICByZXR1cm4gV2lkZ2V0UGFyc2VyLnByb2Nlc3NFc3RpbWF0ZWRXaWRnZXQoZXN0aW1hdGVkV2lkZ2V0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicHJvY2Vzc0VzdGltYXRlZFdpZGdldFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBwcm9jZXNzRXN0aW1hdGVkV2lkZ2V0KHdpZGdldCkge1xuICAgICAgLy8gVmFsaWRhdGUgdGhhdCB0aGUgd2lkZ2V0IGhhcyB0aGUgYmVzdCBjaGFuY2Ugb2YgcGFzc2luZyBhcyBhIHdpZGdldFxuICAgICAgaWYgKCF3aWRnZXQuaWQgfHwgIXdpZGdldC5jcmVhdG9yVXNlcklkIHx8ICF3aWRnZXQudHlwZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICghKDAsIF91cmwuaXNWYWxpZFVybCkod2lkZ2V0LnVybCkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICAvLyBUT0RPOiBWYWxpZGF0ZSBkYXRhIGZvciBrbm93biB3aWRnZXQgdHlwZXNcbiAgICAgIHJldHVybiBuZXcgX1dpZGdldC5XaWRnZXQod2lkZ2V0KTtcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIFdpZGdldFBhcnNlcjtcbn0oKTtcbmV4cG9ydHMuV2lkZ2V0UGFyc2VyID0gV2lkZ2V0UGFyc2VyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9V2lkZ2V0UGFyc2VyLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5pc1ZhbGlkVXJsID0gaXNWYWxpZFVybDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZnVuY3Rpb24gaXNWYWxpZFVybCh2YWwpIHtcbiAgaWYgKCF2YWwpIHJldHVybiBmYWxzZTsgLy8gZWFzeTogbm90IHZhbGlkIGlmIG5vdCBwcmVzZW50XG5cbiAgdHJ5IHtcbiAgICB2YXIgcGFyc2VkID0gbmV3IFVSTCh2YWwpO1xuICAgIGlmIChwYXJzZWQucHJvdG9jb2wgIT09IFwiaHR0cFwiICYmIHBhcnNlZC5wcm90b2NvbCAhPT0gXCJodHRwc1wiKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBUeXBlRXJyb3IpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXJsLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5hc3NlcnRQcmVzZW50ID0gYXNzZXJ0UHJlc2VudDtcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmZ1bmN0aW9uIGFzc2VydFByZXNlbnQob2JqLCBrZXkpIHtcbiAgaWYgKCFvYmpba2V5XSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlwiLmNvbmNhdChTdHJpbmcoa2V5KSwgXCIgaXMgcmVxdWlyZWRcIikpO1xuICB9XG59XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucnVuVGVtcGxhdGUgPSBydW5UZW1wbGF0ZTtcbmV4cG9ydHMudG9TdHJpbmcgPSB0b1N0cmluZztcbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuZnVuY3Rpb24gcnVuVGVtcGxhdGUodXJsLCB3aWRnZXQsIHBhcmFtcykge1xuICAvLyBBbHdheXMgYXBwbHkgdGhlIHN1cHBsaWVkIHBhcmFtcyBvdmVyIHRvcCBvZiBkYXRhIHRvIGVuc3VyZSB0aGUgZGF0YSBjYW4ndCBsaWUgYWJvdXQgdGhlbS5cbiAgdmFyIHZhcmlhYmxlcyA9IE9iamVjdC5hc3NpZ24oe30sIHdpZGdldC5kYXRhLCB7XG4gICAgXCJtYXRyaXhfcm9vbV9pZFwiOiBwYXJhbXMud2lkZ2V0Um9vbUlkIHx8IFwiXCIsXG4gICAgXCJtYXRyaXhfdXNlcl9pZFwiOiBwYXJhbXMuY3VycmVudFVzZXJJZCxcbiAgICBcIm1hdHJpeF9kaXNwbGF5X25hbWVcIjogcGFyYW1zLnVzZXJEaXNwbGF5TmFtZSB8fCBwYXJhbXMuY3VycmVudFVzZXJJZCxcbiAgICBcIm1hdHJpeF9hdmF0YXJfdXJsXCI6IHBhcmFtcy51c2VySHR0cEF2YXRhclVybCB8fCBcIlwiLFxuICAgIFwibWF0cml4X3dpZGdldF9pZFwiOiB3aWRnZXQuaWQsXG4gICAgLy8gVE9ETzogQ29udmVydCB0byBzdGFibGUgKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvcHVsbC8yODczKVxuICAgIFwib3JnLm1hdHJpeC5tc2MyODczLmNsaWVudF9pZFwiOiBwYXJhbXMuY2xpZW50SWQgfHwgXCJcIixcbiAgICBcIm9yZy5tYXRyaXgubXNjMjg3My5jbGllbnRfdGhlbWVcIjogcGFyYW1zLmNsaWVudFRoZW1lIHx8IFwiXCIsXG4gICAgXCJvcmcubWF0cml4Lm1zYzI4NzMuY2xpZW50X2xhbmd1YWdlXCI6IHBhcmFtcy5jbGllbnRMYW5ndWFnZSB8fCBcIlwiLFxuICAgIC8vIFRPRE86IENvbnZlcnQgdG8gc3RhYmxlIChodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtc3BlYy1wcm9wb3NhbHMvcHVsbC8zODE5KVxuICAgIFwib3JnLm1hdHJpeC5tc2MzODE5Lm1hdHJpeF9kZXZpY2VfaWRcIjogcGFyYW1zLmRldmljZUlkIHx8IFwiXCIsXG4gICAgLy8gVE9ETzogQ29udmVydCB0byBzdGFibGUgKGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1zcGVjLXByb3Bvc2Fscy9wdWxsLzQwMzkpXG4gICAgXCJvcmcubWF0cml4Lm1zYzQwMzkubWF0cml4X2Jhc2VfdXJsXCI6IHBhcmFtcy5iYXNlVXJsIHx8IFwiXCJcbiAgfSk7XG4gIHZhciByZXN1bHQgPSB1cmw7XG4gIGZvciAodmFyIF9pID0gMCwgX09iamVjdCRrZXlzID0gT2JqZWN0LmtleXModmFyaWFibGVzKTsgX2kgPCBfT2JqZWN0JGtleXMubGVuZ3RoOyBfaSsrKSB7XG4gICAgdmFyIGtleSA9IF9PYmplY3Qka2V5c1tfaV07XG4gICAgLy8gUmVnZXggZXNjYXBlIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzY5Njk0ODYvNzAzNzM3OVxuICAgIHZhciBwYXR0ZXJuID0gXCIkXCIuY29uY2F0KGtleSkucmVwbGFjZSgvWy4qKz9eJHt9KCl8W1xcXVxcXFxdL2csIFwiXFxcXCQmXCIpOyAvLyAkJiBtZWFucyB0aGUgd2hvbGUgbWF0Y2hlZCBzdHJpbmdcbiAgICB2YXIgcmV4cCA9IG5ldyBSZWdFeHAocGF0dGVybiwgXCJnXCIpO1xuXG4gICAgLy8gVGhpcyBpcyB0ZWNobmljYWxseSBub3Qgd2hhdCB3ZSdyZSBzdXBwb3NlZCB0byBkbyBmb3IgYSBjb3VwbGUgb2YgcmVhc29uczpcbiAgICAvLyAxLiBXZSBhcmUgYXNzdW1pbmcgdGhhdCB0aGVyZSB3b24ndCBsYXRlciBiZSBhICRrZXkgbWF0Y2ggYWZ0ZXIgd2UgcmVwbGFjZSBhIHZhcmlhYmxlLlxuICAgIC8vIDIuIFdlIGFyZSBhc3N1bWluZyB0aGF0IHRoZSB2YXJpYWJsZSBpcyBpbiBhIHBsYWNlIHdoZXJlIGl0IGNhbiBiZSBlc2NhcGVkIChlZzogcGF0aCBvciBxdWVyeSBzdHJpbmcpLlxuICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKHJleHAsIGVuY29kZVVSSUNvbXBvbmVudCh0b1N0cmluZyh2YXJpYWJsZXNba2V5XSkpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gdG9TdHJpbmcoYSkge1xuICBpZiAoYSA9PT0gbnVsbCB8fCBhID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gXCJcIi5jb25jYXQoYSk7XG4gIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1iYXNlLXRvLXN0cmluZ1xuICByZXR1cm4gU3RyaW5nKGEpO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9dXJsLXRlbXBsYXRlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5Qb3N0bWVzc2FnZVRyYW5zcG9ydCA9IHZvaWQgMDtcbnZhciBfZXZlbnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTtcbnZhciBfID0gcmVxdWlyZShcIi4uXCIpO1xudmFyIF9leGNsdWRlZCA9IFtcIm1lc3NhZ2VcIl07XG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfSwgX3R5cGVvZihvYmopOyB9XG5mdW5jdGlvbiBfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMoc291cmNlLCBleGNsdWRlZCkgeyBpZiAoc291cmNlID09IG51bGwpIHJldHVybiB7fTsgdmFyIHRhcmdldCA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHNvdXJjZSwgZXhjbHVkZWQpOyB2YXIga2V5LCBpOyBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykgeyB2YXIgc291cmNlU3ltYm9sS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoc291cmNlKTsgZm9yIChpID0gMDsgaSA8IHNvdXJjZVN5bWJvbEtleXMubGVuZ3RoOyBpKyspIHsga2V5ID0gc291cmNlU3ltYm9sS2V5c1tpXTsgaWYgKGV4Y2x1ZGVkLmluZGV4T2Yoa2V5KSA+PSAwKSBjb250aW51ZTsgaWYgKCFPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoc291cmNlLCBrZXkpKSBjb250aW51ZTsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IHJldHVybiB0YXJnZXQ7IH1cbmZ1bmN0aW9uIF9vYmplY3RXaXRob3V0UHJvcGVydGllc0xvb3NlKHNvdXJjZSwgZXhjbHVkZWQpIHsgaWYgKHNvdXJjZSA9PSBudWxsKSByZXR1cm4ge307IHZhciB0YXJnZXQgPSB7fTsgdmFyIHNvdXJjZUtleXMgPSBPYmplY3Qua2V5cyhzb3VyY2UpOyB2YXIga2V5LCBpOyBmb3IgKGkgPSAwOyBpIDwgc291cmNlS2V5cy5sZW5ndGg7IGkrKykgeyBrZXkgPSBzb3VyY2VLZXlzW2ldOyBpZiAoZXhjbHVkZWQuaW5kZXhPZihrZXkpID49IDApIGNvbnRpbnVlOyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IHJldHVybiB0YXJnZXQ7IH1cbmZ1bmN0aW9uIG93bktleXMob2JqZWN0LCBlbnVtZXJhYmxlT25seSkgeyB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iamVjdCk7IGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7IHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpOyBlbnVtZXJhYmxlT25seSAmJiAoc3ltYm9scyA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChzeW0pIHsgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7IH0pKSwga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpOyB9IHJldHVybiBrZXlzOyB9XG5mdW5jdGlvbiBfb2JqZWN0U3ByZWFkKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gbnVsbCAhPSBhcmd1bWVudHNbaV0gPyBhcmd1bWVudHNbaV0gOiB7fTsgaSAlIDIgPyBvd25LZXlzKE9iamVjdChzb3VyY2UpLCAhMCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7IF9kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgc291cmNlW2tleV0pOyB9KSA6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhzb3VyY2UpKSA6IG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTsgfSk7IH0gcmV0dXJuIHRhcmdldDsgfVxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgX3RvUHJvcGVydHlLZXkoZGVzY3JpcHRvci5rZXkpLCBkZXNjcmlwdG9yKTsgfSB9XG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDb25zdHJ1Y3RvciwgXCJwcm90b3R5cGVcIiwgeyB3cml0YWJsZTogZmFsc2UgfSk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfVxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHN1YkNsYXNzLCBcInByb3RvdHlwZVwiLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTsgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7IH1cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZi5iaW5kKCkgOiBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkgeyBvLl9fcHJvdG9fXyA9IHA7IHJldHVybiBvOyB9OyByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApOyB9XG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkgeyB2YXIgaGFzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKTsgcmV0dXJuIGZ1bmN0aW9uIF9jcmVhdGVTdXBlckludGVybmFsKCkgeyB2YXIgU3VwZXIgPSBfZ2V0UHJvdG90eXBlT2YoRGVyaXZlZCksIHJlc3VsdDsgaWYgKGhhc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QpIHsgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjsgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTsgfSBlbHNlIHsgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTsgfSByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTsgfTsgfVxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkgeyByZXR1cm4gY2FsbDsgfSBlbHNlIGlmIChjYWxsICE9PSB2b2lkIDApIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkRlcml2ZWQgY29uc3RydWN0b3JzIG1heSBvbmx5IHJldHVybiBvYmplY3Qgb3IgdW5kZWZpbmVkXCIpOyB9IHJldHVybiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpOyB9XG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHsgaWYgKHNlbGYgPT09IHZvaWQgMCkgeyB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7IH0gcmV0dXJuIHNlbGY7IH1cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7IGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTsgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTsgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTsgdHJ5IHsgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpOyByZXR1cm4gdHJ1ZTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH0gfVxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHsgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mLmJpbmQoKSA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7IHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7IH07IHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsga2V5ID0gX3RvUHJvcGVydHlLZXkoa2V5KTsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHsgdmFyIGtleSA9IF90b1ByaW1pdGl2ZShhcmcsIFwic3RyaW5nXCIpOyByZXR1cm4gX3R5cGVvZihrZXkpID09PSBcInN5bWJvbFwiID8ga2V5IDogU3RyaW5nKGtleSk7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkgeyBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDsgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7IHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpOyBpZiAoX3R5cGVvZihyZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm4gcmVzOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7IH0gLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBDb3B5cmlnaHQgMjAyMCAtIDIwMjQgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuLyoqXG4gKiBUcmFuc3BvcnQgZm9yIHRoZSBXaWRnZXQgQVBJIG92ZXIgcG9zdE1lc3NhZ2UuXG4gKi9cbnZhciBQb3N0bWVzc2FnZVRyYW5zcG9ydCA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoX0V2ZW50RW1pdHRlcikge1xuICBfaW5oZXJpdHMoUG9zdG1lc3NhZ2VUcmFuc3BvcnQsIF9FdmVudEVtaXR0ZXIpO1xuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKFBvc3RtZXNzYWdlVHJhbnNwb3J0KTtcbiAgZnVuY3Rpb24gUG9zdG1lc3NhZ2VUcmFuc3BvcnQoc2VuZERpcmVjdGlvbiwgaW5pdGlhbFdpZGdldElkLCB0cmFuc3BvcnRXaW5kb3csIGluYm91bmRXaW5kb3cpIHtcbiAgICB2YXIgX3RoaXM7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFBvc3RtZXNzYWdlVHJhbnNwb3J0KTtcbiAgICBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpO1xuICAgIF90aGlzLnNlbmREaXJlY3Rpb24gPSBzZW5kRGlyZWN0aW9uO1xuICAgIF90aGlzLmluaXRpYWxXaWRnZXRJZCA9IGluaXRpYWxXaWRnZXRJZDtcbiAgICBfdGhpcy50cmFuc3BvcnRXaW5kb3cgPSB0cmFuc3BvcnRXaW5kb3c7XG4gICAgX3RoaXMuaW5ib3VuZFdpbmRvdyA9IGluYm91bmRXaW5kb3c7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcInN0cmljdE9yaWdpbkNoZWNrXCIsIGZhbHNlKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwidGFyZ2V0T3JpZ2luXCIsIFwiKlwiKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwidGltZW91dFNlY29uZHNcIiwgMTApO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJfcmVhZHlcIiwgZmFsc2UpO1xuICAgIF9kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzKSwgXCJfd2lkZ2V0SWRcIiwgbnVsbCk7XG4gICAgX2RlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMpLCBcIm91dGJvdW5kUmVxdWVzdHNcIiwgbmV3IE1hcCgpKTtcbiAgICBfZGVmaW5lUHJvcGVydHkoX2Fzc2VydFRoaXNJbml0aWFsaXplZChfdGhpcyksIFwic3RvcENvbnRyb2xsZXJcIiwgbmV3IEFib3J0Q29udHJvbGxlcigpKTtcbiAgICBfdGhpcy5fd2lkZ2V0SWQgPSBpbml0aWFsV2lkZ2V0SWQ7XG4gICAgcmV0dXJuIF90aGlzO1xuICB9XG4gIF9jcmVhdGVDbGFzcyhQb3N0bWVzc2FnZVRyYW5zcG9ydCwgW3tcbiAgICBrZXk6IFwicmVhZHlcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZWFkeTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwid2lkZ2V0SWRcIixcbiAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl93aWRnZXRJZCB8fCBudWxsO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJuZXh0UmVxdWVzdElkXCIsXG4gICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICB2YXIgaWRCYXNlID0gXCJ3aWRnZXRhcGktXCIuY29uY2F0KERhdGUubm93KCkpO1xuICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgIHZhciBpZCA9IGlkQmFzZTtcbiAgICAgIHdoaWxlICh0aGlzLm91dGJvdW5kUmVxdWVzdHMuaGFzKGlkKSkge1xuICAgICAgICBpZCA9IFwiXCIuY29uY2F0KGlkQmFzZSwgXCItXCIpLmNvbmNhdChpbmRleCsrKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVzZXJ2ZSB0aGUgSURcbiAgICAgIHRoaXMub3V0Ym91bmRSZXF1ZXN0cy5zZXQoaWQsIG51bGwpO1xuICAgICAgcmV0dXJuIGlkO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZW5kSW50ZXJuYWxcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZEludGVybmFsKG1lc3NhZ2UpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1Bvc3RtZXNzYWdlVHJhbnNwb3J0XSBTZW5kaW5nIG9iamVjdCB0byBcIi5jb25jYXQodGhpcy50YXJnZXRPcmlnaW4sIFwiOiBcIiksIG1lc3NhZ2UpO1xuICAgICAgdGhpcy50cmFuc3BvcnRXaW5kb3cucG9zdE1lc3NhZ2UobWVzc2FnZSwgdGhpcy50YXJnZXRPcmlnaW4pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJyZXBseVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXBseShyZXF1ZXN0LCByZXNwb25zZURhdGEpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbmRJbnRlcm5hbChfb2JqZWN0U3ByZWFkKF9vYmplY3RTcHJlYWQoe30sIHJlcXVlc3QpLCB7fSwge1xuICAgICAgICByZXNwb25zZTogcmVzcG9uc2VEYXRhXG4gICAgICB9KSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNlbmRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChhY3Rpb24sIGRhdGEpIHtcbiAgICAgIHJldHVybiB0aGlzLnNlbmRDb21wbGV0ZShhY3Rpb24sIGRhdGEpLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgcmV0dXJuIHIucmVzcG9uc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2VuZENvbXBsZXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmRDb21wbGV0ZShhY3Rpb24sIGRhdGEpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuICAgICAgaWYgKCF0aGlzLnJlYWR5IHx8ICF0aGlzLndpZGdldElkKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJOb3QgcmVhZHkgb3IgdW5rbm93biB3aWRnZXQgSURcIikpO1xuICAgICAgfVxuICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgIGFwaTogdGhpcy5zZW5kRGlyZWN0aW9uLFxuICAgICAgICB3aWRnZXRJZDogdGhpcy53aWRnZXRJZCxcbiAgICAgICAgcmVxdWVzdElkOiB0aGlzLm5leHRSZXF1ZXN0SWQsXG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9O1xuICAgICAgaWYgKGFjdGlvbiA9PT0gXy5XaWRnZXRBcGlUb1dpZGdldEFjdGlvbi5VcGRhdGVWaXNpYmlsaXR5KSB7XG4gICAgICAgIHJlcXVlc3RbXCJ2aXNpYmxlXCJdID0gZGF0YVtcInZpc2libGVcIl07XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHByUmVzb2x2ZSwgcHJSZWplY3QpIHtcbiAgICAgICAgdmFyIHJlc29sdmUgPSBmdW5jdGlvbiByZXNvbHZlKHJlc3BvbnNlKSB7XG4gICAgICAgICAgY2xlYW5VcCgpO1xuICAgICAgICAgIHByUmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZWplY3QgPSBmdW5jdGlvbiByZWplY3QoZXJyKSB7XG4gICAgICAgICAgY2xlYW5VcCgpO1xuICAgICAgICAgIHByUmVqZWN0KGVycik7XG4gICAgICAgIH07XG4gICAgICAgIHZhciB0aW1lcklkID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoXCJSZXF1ZXN0IHRpbWVkIG91dFwiKSk7XG4gICAgICAgIH0sIChfdGhpczIudGltZW91dFNlY29uZHMgfHwgMSkgKiAxMDAwKTtcbiAgICAgICAgdmFyIG9uU3RvcCA9IGZ1bmN0aW9uIG9uU3RvcCgpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihcIlRyYW5zcG9ydCBzdG9wcGVkXCIpKTtcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMyLnN0b3BDb250cm9sbGVyLnNpZ25hbC5hZGRFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25TdG9wKTtcbiAgICAgICAgdmFyIGNsZWFuVXAgPSBmdW5jdGlvbiBjbGVhblVwKCkge1xuICAgICAgICAgIF90aGlzMi5vdXRib3VuZFJlcXVlc3RzW1wiZGVsZXRlXCJdKHJlcXVlc3QucmVxdWVzdElkKTtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgX3RoaXMyLnN0b3BDb250cm9sbGVyLnNpZ25hbC5yZW1vdmVFdmVudExpc3RlbmVyKFwiYWJvcnRcIiwgb25TdG9wKTtcbiAgICAgICAgfTtcbiAgICAgICAgX3RoaXMyLm91dGJvdW5kUmVxdWVzdHMuc2V0KHJlcXVlc3QucmVxdWVzdElkLCB7XG4gICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgICByZXNvbHZlOiByZXNvbHZlLFxuICAgICAgICAgIHJlamVjdDogcmVqZWN0XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpczIuc2VuZEludGVybmFsKHJlcXVlc3QpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInN0YXJ0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgdmFyIF90aGlzMyA9IHRoaXM7XG4gICAgICB0aGlzLmluYm91bmRXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgIF90aGlzMy5oYW5kbGVNZXNzYWdlKGV2KTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcmVhZHkgPSB0cnVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzdG9wXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICB0aGlzLl9yZWFkeSA9IGZhbHNlO1xuICAgICAgdGhpcy5zdG9wQ29udHJvbGxlci5hYm9ydCgpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJoYW5kbGVNZXNzYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZU1lc3NhZ2UoZXYpIHtcbiAgICAgIGlmICh0aGlzLnN0b3BDb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSByZXR1cm47XG4gICAgICBpZiAoIWV2LmRhdGEpIHJldHVybjsgLy8gaW52YWxpZCBldmVudFxuXG4gICAgICBpZiAodGhpcy5zdHJpY3RPcmlnaW5DaGVjayAmJiBldi5vcmlnaW4gIT09IHdpbmRvdy5vcmlnaW4pIHJldHVybjsgLy8gYmFkIG9yaWdpblxuXG4gICAgICAvLyB0cmVhdCB0aGUgbWVzc2FnZSBhcyBhIHJlc3BvbnNlIGZpcnN0LCB0aGVuIGRvd25ncmFkZSB0byBhIHJlcXVlc3RcbiAgICAgIHZhciByZXNwb25zZSA9IGV2LmRhdGE7XG4gICAgICBpZiAoIXJlc3BvbnNlLmFjdGlvbiB8fCAhcmVzcG9uc2UucmVxdWVzdElkIHx8ICFyZXNwb25zZS53aWRnZXRJZCkgcmV0dXJuOyAvLyBpbnZhbGlkIHJlcXVlc3QvcmVzcG9uc2VcblxuICAgICAgaWYgKCFyZXNwb25zZS5yZXNwb25zZSkge1xuICAgICAgICAvLyBpdCdzIGEgcmVxdWVzdFxuICAgICAgICB2YXIgcmVxdWVzdCA9IHJlc3BvbnNlO1xuICAgICAgICBpZiAocmVxdWVzdC5hcGkgIT09ICgwLCBfLmludmVydGVkRGlyZWN0aW9uKSh0aGlzLnNlbmREaXJlY3Rpb24pKSByZXR1cm47IC8vIHdyb25nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLmhhbmRsZVJlcXVlc3QocmVxdWVzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpdCdzIGEgcmVzcG9uc2VcbiAgICAgICAgaWYgKHJlc3BvbnNlLmFwaSAhPT0gdGhpcy5zZW5kRGlyZWN0aW9uKSByZXR1cm47IC8vIHdyb25nIGRpcmVjdGlvblxuICAgICAgICB0aGlzLmhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiaGFuZGxlUmVxdWVzdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHJlcXVlc3QpIHtcbiAgICAgIGlmICh0aGlzLndpZGdldElkKSB7XG4gICAgICAgIGlmICh0aGlzLndpZGdldElkICE9PSByZXF1ZXN0LndpZGdldElkKSByZXR1cm47IC8vIHdyb25nIHdpZGdldFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fd2lkZ2V0SWQgPSByZXF1ZXN0LndpZGdldElkO1xuICAgICAgfVxuICAgICAgdGhpcy5lbWl0KFwibWVzc2FnZVwiLCBuZXcgQ3VzdG9tRXZlbnQoXCJtZXNzYWdlXCIsIHtcbiAgICAgICAgZGV0YWlsOiByZXF1ZXN0XG4gICAgICB9KSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImhhbmRsZVJlc3BvbnNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlKSB7XG4gICAgICBpZiAocmVzcG9uc2Uud2lkZ2V0SWQgIT09IHRoaXMud2lkZ2V0SWQpIHJldHVybjsgLy8gd3Jvbmcgd2lkZ2V0XG5cbiAgICAgIHZhciByZXEgPSB0aGlzLm91dGJvdW5kUmVxdWVzdHMuZ2V0KHJlc3BvbnNlLnJlcXVlc3RJZCk7XG4gICAgICBpZiAoIXJlcSkgcmV0dXJuOyAvLyByZXNwb25zZSB0byBhbiB1bmtub3duIHJlcXVlc3RcblxuICAgICAgaWYgKCgwLCBfLmlzRXJyb3JSZXNwb25zZSkocmVzcG9uc2UucmVzcG9uc2UpKSB7XG4gICAgICAgIHZhciBfcmVzcG9uc2UkcmVzcG9uc2UkZXIgPSByZXNwb25zZS5yZXNwb25zZS5lcnJvcixcbiAgICAgICAgICBtZXNzYWdlID0gX3Jlc3BvbnNlJHJlc3BvbnNlJGVyLm1lc3NhZ2UsXG4gICAgICAgICAgZGF0YSA9IF9vYmplY3RXaXRob3V0UHJvcGVydGllcyhfcmVzcG9uc2UkcmVzcG9uc2UkZXIsIF9leGNsdWRlZCk7XG4gICAgICAgIHJlcS5yZWplY3QobmV3IF8uV2lkZ2V0QXBpUmVzcG9uc2VFcnJvcihtZXNzYWdlLCBkYXRhKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXEucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG4gIHJldHVybiBQb3N0bWVzc2FnZVRyYW5zcG9ydDtcbn0oX2V2ZW50cy5FdmVudEVtaXR0ZXIpO1xuZXhwb3J0cy5Qb3N0bWVzc2FnZVRyYW5zcG9ydCA9IFBvc3RtZXNzYWdlVHJhbnNwb3J0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UG9zdG1lc3NhZ2VUcmFuc3BvcnQuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLlNpbXBsZU9ic2VydmFibGUgPSB2b2lkIDA7XG5mdW5jdGlvbiBfdHlwZW9mKG9iaikgeyBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7IHJldHVybiBfdHlwZW9mID0gXCJmdW5jdGlvblwiID09IHR5cGVvZiBTeW1ib2wgJiYgXCJzeW1ib2xcIiA9PSB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIFN5bWJvbCAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfSwgX3R5cGVvZihvYmopOyB9XG5mdW5jdGlvbiBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcihvLCBhbGxvd0FycmF5TGlrZSkgeyB2YXIgaXQgPSB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXSB8fCBvW1wiQEBpdGVyYXRvclwiXTsgaWYgKCFpdCkgeyBpZiAoQXJyYXkuaXNBcnJheShvKSB8fCAoaXQgPSBfdW5zdXBwb3J0ZWRJdGVyYWJsZVRvQXJyYXkobykpIHx8IGFsbG93QXJyYXlMaWtlICYmIG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSB7IGlmIChpdCkgbyA9IGl0OyB2YXIgaSA9IDA7IHZhciBGID0gZnVuY3Rpb24gRigpIHt9OyByZXR1cm4geyBzOiBGLCBuOiBmdW5jdGlvbiBuKCkgeyBpZiAoaSA+PSBvLmxlbmd0aCkgcmV0dXJuIHsgZG9uZTogdHJ1ZSB9OyByZXR1cm4geyBkb25lOiBmYWxzZSwgdmFsdWU6IG9baSsrXSB9OyB9LCBlOiBmdW5jdGlvbiBlKF9lKSB7IHRocm93IF9lOyB9LCBmOiBGIH07IH0gdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBpdGVyYXRlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZS5cXG5JbiBvcmRlciB0byBiZSBpdGVyYWJsZSwgbm9uLWFycmF5IG9iamVjdHMgbXVzdCBoYXZlIGEgW1N5bWJvbC5pdGVyYXRvcl0oKSBtZXRob2QuXCIpOyB9IHZhciBub3JtYWxDb21wbGV0aW9uID0gdHJ1ZSwgZGlkRXJyID0gZmFsc2UsIGVycjsgcmV0dXJuIHsgczogZnVuY3Rpb24gcygpIHsgaXQgPSBpdC5jYWxsKG8pOyB9LCBuOiBmdW5jdGlvbiBuKCkgeyB2YXIgc3RlcCA9IGl0Lm5leHQoKTsgbm9ybWFsQ29tcGxldGlvbiA9IHN0ZXAuZG9uZTsgcmV0dXJuIHN0ZXA7IH0sIGU6IGZ1bmN0aW9uIGUoX2UyKSB7IGRpZEVyciA9IHRydWU7IGVyciA9IF9lMjsgfSwgZjogZnVuY3Rpb24gZigpIHsgdHJ5IHsgaWYgKCFub3JtYWxDb21wbGV0aW9uICYmIGl0W1wicmV0dXJuXCJdICE9IG51bGwpIGl0W1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChkaWRFcnIpIHRocm93IGVycjsgfSB9IH07IH1cbmZ1bmN0aW9uIF91bnN1cHBvcnRlZEl0ZXJhYmxlVG9BcnJheShvLCBtaW5MZW4pIHsgaWYgKCFvKSByZXR1cm47IGlmICh0eXBlb2YgbyA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KG8sIG1pbkxlbik7IHZhciBuID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLnNsaWNlKDgsIC0xKTsgaWYgKG4gPT09IFwiT2JqZWN0XCIgJiYgby5jb25zdHJ1Y3RvcikgbiA9IG8uY29uc3RydWN0b3IubmFtZTsgaWYgKG4gPT09IFwiTWFwXCIgfHwgbiA9PT0gXCJTZXRcIikgcmV0dXJuIEFycmF5LmZyb20obyk7IGlmIChuID09PSBcIkFyZ3VtZW50c1wiIHx8IC9eKD86VWl8SSludCg/Ojh8MTZ8MzIpKD86Q2xhbXBlZCk/QXJyYXkkLy50ZXN0KG4pKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTsgfVxuZnVuY3Rpb24gX2FycmF5TGlrZVRvQXJyYXkoYXJyLCBsZW4pIHsgaWYgKGxlbiA9PSBudWxsIHx8IGxlbiA+IGFyci5sZW5ndGgpIGxlbiA9IGFyci5sZW5ndGg7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gbmV3IEFycmF5KGxlbik7IGkgPCBsZW47IGkrKykgYXJyMltpXSA9IGFycltpXTsgcmV0dXJuIGFycjI7IH1cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIF90b1Byb3BlcnR5S2V5KGRlc2NyaXB0b3Iua2V5KSwgZGVzY3JpcHRvcik7IH0gfVxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ29uc3RydWN0b3IsIFwicHJvdG90eXBlXCIsIHsgd3JpdGFibGU6IGZhbHNlIH0pOyByZXR1cm4gQ29uc3RydWN0b3I7IH1cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsga2V5ID0gX3RvUHJvcGVydHlLZXkoa2V5KTsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5mdW5jdGlvbiBfdG9Qcm9wZXJ0eUtleShhcmcpIHsgdmFyIGtleSA9IF90b1ByaW1pdGl2ZShhcmcsIFwic3RyaW5nXCIpOyByZXR1cm4gX3R5cGVvZihrZXkpID09PSBcInN5bWJvbFwiID8ga2V5IDogU3RyaW5nKGtleSk7IH1cbmZ1bmN0aW9uIF90b1ByaW1pdGl2ZShpbnB1dCwgaGludCkgeyBpZiAoX3R5cGVvZihpbnB1dCkgIT09IFwib2JqZWN0XCIgfHwgaW5wdXQgPT09IG51bGwpIHJldHVybiBpbnB1dDsgdmFyIHByaW0gPSBpbnB1dFtTeW1ib2wudG9QcmltaXRpdmVdOyBpZiAocHJpbSAhPT0gdW5kZWZpbmVkKSB7IHZhciByZXMgPSBwcmltLmNhbGwoaW5wdXQsIGhpbnQgfHwgXCJkZWZhdWx0XCIpOyBpZiAoX3R5cGVvZihyZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm4gcmVzOyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQEB0b1ByaW1pdGl2ZSBtdXN0IHJldHVybiBhIHByaW1pdGl2ZSB2YWx1ZS5cIik7IH0gcmV0dXJuIChoaW50ID09PSBcInN0cmluZ1wiID8gU3RyaW5nIDogTnVtYmVyKShpbnB1dCk7IH1cbi8qXG4gKiBDb3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbnZhciBTaW1wbGVPYnNlcnZhYmxlID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU2ltcGxlT2JzZXJ2YWJsZShpbml0aWFsRm4pIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU2ltcGxlT2JzZXJ2YWJsZSk7XG4gICAgX2RlZmluZVByb3BlcnR5KHRoaXMsIFwibGlzdGVuZXJzXCIsIFtdKTtcbiAgICBpZiAoaW5pdGlhbEZuKSB0aGlzLmxpc3RlbmVycy5wdXNoKGluaXRpYWxGbik7XG4gIH1cbiAgX2NyZWF0ZUNsYXNzKFNpbXBsZU9ic2VydmFibGUsIFt7XG4gICAga2V5OiBcIm9uVXBkYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uVXBkYXRlKGZuKSB7XG4gICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKGZuKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwidXBkYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSh2YWwpIHtcbiAgICAgIHZhciBfaXRlcmF0b3IgPSBfY3JlYXRlRm9yT2ZJdGVyYXRvckhlbHBlcih0aGlzLmxpc3RlbmVycyksXG4gICAgICAgIF9zdGVwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgZm9yIChfaXRlcmF0b3IucygpOyAhKF9zdGVwID0gX2l0ZXJhdG9yLm4oKSkuZG9uZTspIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBfc3RlcC52YWx1ZTtcbiAgICAgICAgICBsaXN0ZW5lcih2YWwpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgX2l0ZXJhdG9yLmUoZXJyKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9pdGVyYXRvci5mKCk7XG4gICAgICB9XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImNsb3NlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSBbXTsgLy8gcmVzZXRcbiAgICB9XG4gIH1dKTtcbiAgcmV0dXJuIFNpbXBsZU9ic2VydmFibGU7XG59KCk7XG5leHBvcnRzLlNpbXBsZU9ic2VydmFibGUgPSBTaW1wbGVPYnNlcnZhYmxlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U2ltcGxlT2JzZXJ2YWJsZS5qcy5tYXAiLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUiA9IHR5cGVvZiBSZWZsZWN0ID09PSAnb2JqZWN0JyA/IFJlZmxlY3QgOiBudWxsXG52YXIgUmVmbGVjdEFwcGx5ID0gUiAmJiB0eXBlb2YgUi5hcHBseSA9PT0gJ2Z1bmN0aW9uJ1xuICA/IFIuYXBwbHlcbiAgOiBmdW5jdGlvbiBSZWZsZWN0QXBwbHkodGFyZ2V0LCByZWNlaXZlciwgYXJncykge1xuICAgIHJldHVybiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbCh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKTtcbiAgfVxuXG52YXIgUmVmbGVjdE93bktleXNcbmlmIChSICYmIHR5cGVvZiBSLm93bktleXMgPT09ICdmdW5jdGlvbicpIHtcbiAgUmVmbGVjdE93bktleXMgPSBSLm93bktleXNcbn0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICBSZWZsZWN0T3duS2V5cyA9IGZ1bmN0aW9uIFJlZmxlY3RPd25LZXlzKHRhcmdldCkge1xuICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpXG4gICAgICAuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHModGFyZ2V0KSk7XG4gIH07XG59IGVsc2Uge1xuICBSZWZsZWN0T3duS2V5cyA9IGZ1bmN0aW9uIFJlZmxlY3RPd25LZXlzKHRhcmdldCkge1xuICAgIHJldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBQcm9jZXNzRW1pdFdhcm5pbmcod2FybmluZykge1xuICBpZiAoY29uc29sZSAmJiBjb25zb2xlLndhcm4pIGNvbnNvbGUud2Fybih3YXJuaW5nKTtcbn1cblxudmFyIE51bWJlcklzTmFOID0gTnVtYmVyLmlzTmFOIHx8IGZ1bmN0aW9uIE51bWJlcklzTmFOKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgRXZlbnRFbWl0dGVyLmluaXQuY2FsbCh0aGlzKTtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xubW9kdWxlLmV4cG9ydHMub25jZSA9IG9uY2U7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzQ291bnQgPSAwO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBGdW5jdGlvbi4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGxpc3RlbmVyKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ251bWJlcicgfHwgYXJnIDwgMCB8fCBOdW1iZXJJc05hTihhcmcpKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiZGVmYXVsdE1heExpc3RlbmVyc1wiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBhcmcgKyAnLicpO1xuICAgIH1cbiAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICB9XG59KTtcblxuRXZlbnRFbWl0dGVyLmluaXQgPSBmdW5jdGlvbigpIHtcblxuICBpZiAodGhpcy5fZXZlbnRzID09PSB1bmRlZmluZWQgfHxcbiAgICAgIHRoaXMuX2V2ZW50cyA9PT0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoaXMpLl9ldmVudHMpIHtcbiAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59O1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMobikge1xuICBpZiAodHlwZW9mIG4gIT09ICdudW1iZXInIHx8IG4gPCAwIHx8IE51bWJlcklzTmFOKG4pKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSBvZiBcIm5cIiBpcyBvdXQgb2YgcmFuZ2UuIEl0IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyLiBSZWNlaXZlZCAnICsgbiArICcuJyk7XG4gIH1cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5mdW5jdGlvbiBfZ2V0TWF4TGlzdGVuZXJzKHRoYXQpIHtcbiAgaWYgKHRoYXQuX21heExpc3RlbmVycyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgcmV0dXJuIHRoYXQuX21heExpc3RlbmVycztcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBnZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiBfZ2V0TWF4TGlzdGVuZXJzKHRoaXMpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdCh0eXBlKSB7XG4gIHZhciBhcmdzID0gW107XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT09IHVuZGVmaW5lZCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgdmFyIGVyO1xuICAgIGlmIChhcmdzLmxlbmd0aCA+IDApXG4gICAgICBlciA9IGFyZ3NbMF07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIC8vIE5vdGU6IFRoZSBjb21tZW50cyBvbiB0aGUgYHRocm93YCBsaW5lcyBhcmUgaW50ZW50aW9uYWwsIHRoZXkgc2hvd1xuICAgICAgLy8gdXAgaW4gTm9kZSdzIG91dHB1dCBpZiB0aGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIGV4Y2VwdGlvbi5cbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH1cbiAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignVW5oYW5kbGVkIGVycm9yLicgKyAoZXIgPyAnICgnICsgZXIubWVzc2FnZSArICcpJyA6ICcnKSk7XG4gICAgZXJyLmNvbnRleHQgPSBlcjtcbiAgICB0aHJvdyBlcnI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IGV2ZW50c1t0eXBlXTtcblxuICBpZiAoaGFuZGxlciA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBSZWZsZWN0QXBwbHkoaGFuZGxlciwgdGhpcywgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIFJlZmxlY3RBcHBseShsaXN0ZW5lcnNbaV0sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGFyZ2V0Ll9ldmVudHNDb3VudCA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gICAgaWYgKGV2ZW50cy5uZXdMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YXJnZXQuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKGV4aXN0aW5nID09PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICBleGlzdGluZyA9IGV2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICAgICsrdGFyZ2V0Ll9ldmVudHNDb3VudDtcbiAgfSBlbHNlIHtcbiAgICBpZiAodHlwZW9mIGV4aXN0aW5nID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID1cbiAgICAgICAgcHJlcGVuZCA/IFtsaXN0ZW5lciwgZXhpc3RpbmddIDogW2V4aXN0aW5nLCBsaXN0ZW5lcl07XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgfSBlbHNlIGlmIChwcmVwZW5kKSB7XG4gICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhpc3RpbmcucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgICBtID0gX2dldE1heExpc3RlbmVycyh0YXJnZXQpO1xuICAgIGlmIChtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtICYmICFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAvLyBObyBlcnJvciBjb2RlIGZvciB0aGlzIHNpbmNlIGl0IGlzIGEgV2FybmluZ1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4XG4gICAgICB2YXIgdyA9IG5ldyBFcnJvcignUG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSBsZWFrIGRldGVjdGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyAnICsgU3RyaW5nKHR5cGUpICsgJyBsaXN0ZW5lcnMgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdhZGRlZC4gVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdCcpO1xuICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICB3LmVtaXR0ZXIgPSB0YXJnZXQ7XG4gICAgICB3LnR5cGUgPSB0eXBlO1xuICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgIFByb2Nlc3NFbWl0V2FybmluZyh3KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZExpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBfYWRkTGlzdGVuZXIodGhpcywgdHlwZSwgbGlzdGVuZXIsIHRydWUpO1xuICAgIH07XG5cbmZ1bmN0aW9uIG9uY2VXcmFwcGVyKCkge1xuICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICB0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsIHRoaXMud3JhcEZuKTtcbiAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO1xuICAgIHJldHVybiB0aGlzLmxpc3RlbmVyLmFwcGx5KHRoaXMudGFyZ2V0LCBhcmd1bWVudHMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9vbmNlV3JhcCh0YXJnZXQsIHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBzdGF0ZSA9IHsgZmlyZWQ6IGZhbHNlLCB3cmFwRm46IHVuZGVmaW5lZCwgdGFyZ2V0OiB0YXJnZXQsIHR5cGU6IHR5cGUsIGxpc3RlbmVyOiBsaXN0ZW5lciB9O1xuICB2YXIgd3JhcHBlZCA9IG9uY2VXcmFwcGVyLmJpbmQoc3RhdGUpO1xuICB3cmFwcGVkLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHN0YXRlLndyYXBGbiA9IHdyYXBwZWQ7XG4gIHJldHVybiB3cmFwcGVkO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuICB0aGlzLm9uKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucHJlcGVuZE9uY2VMaXN0ZW5lciA9XG4gICAgZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB0aGlzLnByZXBlbmRMaXN0ZW5lcih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbi8vIEVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZiBhbmQgb25seSBpZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGxpc3QsIGV2ZW50cywgcG9zaXRpb24sIGksIG9yaWdpbmFsTGlzdGVuZXI7XG5cbiAgICAgIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBsaXN0ID0gZXZlbnRzW3R5cGVdO1xuICAgICAgaWYgKGxpc3QgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fCBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xuICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc3BsaWNlT25lKGxpc3QsIHBvc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSlcbiAgICAgICAgICBldmVudHNbdHlwZV0gPSBsaXN0WzBdO1xuXG4gICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyh0eXBlKSB7XG4gICAgICB2YXIgbGlzdGVuZXJzLCBldmVudHMsIGk7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50c1t0eXBlXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgICBpZiAodHlwZW9mIGxpc3RlbmVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gICAgICB9IGVsc2UgaWYgKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG4gIGlmIChldmxpc3RlbmVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIFtdO1xuXG4gIGlmICh0eXBlb2YgZXZsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJylcbiAgICByZXR1cm4gdW53cmFwID8gW2V2bGlzdGVuZXIubGlzdGVuZXIgfHwgZXZsaXN0ZW5lcl0gOiBbZXZsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHVud3JhcCA/XG4gICAgdW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpIDogYXJyYXlDbG9uZShldmxpc3RlbmVyLCBldmxpc3RlbmVyLmxlbmd0aCk7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgdHJ1ZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJhd0xpc3RlbmVycyA9IGZ1bmN0aW9uIHJhd0xpc3RlbmVycyh0eXBlKSB7XG4gIHJldHVybiBfbGlzdGVuZXJzKHRoaXMsIHR5cGUsIGZhbHNlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxpc3RlbmVyQ291bnQuY2FsbChlbWl0dGVyLCB0eXBlKTtcbiAgfVxufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcbmZ1bmN0aW9uIGxpc3RlbmVyQ291bnQodHlwZSkge1xuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuXG4gIGlmIChldmVudHMgIT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGV2bGlzdGVuZXIubGVuZ3RoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiAwO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICByZXR1cm4gdGhpcy5fZXZlbnRzQ291bnQgPiAwID8gUmVmbGVjdE93bktleXModGhpcy5fZXZlbnRzKSA6IFtdO1xufTtcblxuZnVuY3Rpb24gYXJyYXlDbG9uZShhcnIsIG4pIHtcbiAgdmFyIGNvcHkgPSBuZXcgQXJyYXkobik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKVxuICAgIGNvcHlbaV0gPSBhcnJbaV07XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICg7IGluZGV4ICsgMSA8IGxpc3QubGVuZ3RoOyBpbmRleCsrKVxuICAgIGxpc3RbaW5kZXhdID0gbGlzdFtpbmRleCArIDFdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiB1bndyYXBMaXN0ZW5lcnMoYXJyKSB7XG4gIHZhciByZXQgPSBuZXcgQXJyYXkoYXJyLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmV0Lmxlbmd0aDsgKytpKSB7XG4gICAgcmV0W2ldID0gYXJyW2ldLmxpc3RlbmVyIHx8IGFycltpXTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBvbmNlKGVtaXR0ZXIsIG5hbWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICBmdW5jdGlvbiBlcnJvckxpc3RlbmVyKGVycikge1xuICAgICAgZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihuYW1lLCByZXNvbHZlcik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlcigpIHtcbiAgICAgIGlmICh0eXBlb2YgZW1pdHRlci5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGVycm9yTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgcmVzb2x2ZShbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgIH07XG5cbiAgICBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgcmVzb2x2ZXIsIHsgb25jZTogdHJ1ZSB9KTtcbiAgICBpZiAobmFtZSAhPT0gJ2Vycm9yJykge1xuICAgICAgYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgZXJyb3JMaXN0ZW5lciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEVycm9ySGFuZGxlcklmRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGhhbmRsZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCAnZXJyb3InLCBoYW5kbGVyLCBmbGFncyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsIG5hbWUsIGxpc3RlbmVyLCBmbGFncykge1xuICBpZiAodHlwZW9mIGVtaXR0ZXIub24gPT09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAoZmxhZ3Mub25jZSkge1xuICAgICAgZW1pdHRlci5vbmNlKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW1pdHRlci5vbihuYW1lLCBsaXN0ZW5lcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBFdmVudFRhcmdldCBkb2VzIG5vdCBoYXZlIGBlcnJvcmAgZXZlbnQgc2VtYW50aWNzIGxpa2UgTm9kZVxuICAgIC8vIEV2ZW50RW1pdHRlcnMsIHdlIGRvIG5vdCBsaXN0ZW4gZm9yIGBlcnJvcmAgZXZlbnRzIGhlcmUuXG4gICAgZW1pdHRlci5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmN0aW9uIHdyYXBMaXN0ZW5lcihhcmcpIHtcbiAgICAgIC8vIElFIGRvZXMgbm90IGhhdmUgYnVpbHRpbiBgeyBvbmNlOiB0cnVlIH1gIHN1cHBvcnQgc28gd2VcbiAgICAgIC8vIGhhdmUgdG8gZG8gaXQgbWFudWFsbHkuXG4gICAgICBpZiAoZmxhZ3Mub25jZSkge1xuICAgICAgICBlbWl0dGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgd3JhcExpc3RlbmVyKTtcbiAgICAgIH1cbiAgICAgIGxpc3RlbmVyKGFyZyk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIFwiZW1pdHRlclwiIGFyZ3VtZW50IG11c3QgYmUgb2YgdHlwZSBFdmVudEVtaXR0ZXIuIFJlY2VpdmVkIHR5cGUgJyArIHR5cGVvZiBlbWl0dGVyKTtcbiAgfVxufVxuIl19

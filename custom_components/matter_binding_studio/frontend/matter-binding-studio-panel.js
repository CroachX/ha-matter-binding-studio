const e = { env: { NODE_ENV: "production" } };
//#region \0rolldown/runtime.js
var t = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), n = /* @__PURE__ */ t(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) {
			if (n(c) !== null) m = !0, S || (S = !0, D());
			else {
				var t = n(l);
				t !== null && te(x, t.startTime - e);
			}
		}
	}
	var S = !1, ee = -1, C = 5, w = -1;
	function T() {
		return g ? !0 : !(e.unstable_now() - w < C);
	}
	function E() {
		if (g = !1, S) {
			var t = e.unstable_now();
			w = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(ee), ee = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && T());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && te(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? D() : S = !1;
			}
		}
	}
	var D;
	if (typeof y == "function") D = function() {
		y(E);
	};
	else if (typeof MessageChannel < "u") {
		var O = new MessageChannel(), k = O.port2;
		O.port1.onmessage = E, D = function() {
			k.postMessage(null);
		};
	} else D = function() {
		_(E, 0);
	};
	function te(t, n) {
		ee = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : C = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(ee), ee = -1) : h = !0, te(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, D()))), r;
	}, e.unstable_shouldYield = T, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), r = /* @__PURE__ */ t(((e, t) => {
	t.exports = n();
})), i = /* @__PURE__ */ t(((t) => {
	var n = Symbol.for("react.transitional.element"), r = Symbol.for("react.portal"), i = Symbol.for("react.fragment"), a = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), s = Symbol.for("react.consumer"), c = Symbol.for("react.context"), l = Symbol.for("react.forward_ref"), u = Symbol.for("react.suspense"), d = Symbol.for("react.memo"), f = Symbol.for("react.lazy"), p = Symbol.for("react.activity"), m = Symbol.iterator;
	function h(e) {
		return typeof e != "object" || !e ? null : (e = m && e[m] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var g = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, _ = Object.assign, v = {};
	function y(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	y.prototype.isReactComponent = {}, y.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, y.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function b() {}
	b.prototype = y.prototype;
	function x(e, t, n) {
		this.props = e, this.context = t, this.refs = v, this.updater = n || g;
	}
	var S = x.prototype = new b();
	S.constructor = x, _(S, y.prototype), S.isPureReactComponent = !0;
	var ee = Array.isArray;
	function C() {}
	var w = {
		H: null,
		A: null,
		T: null,
		S: null
	}, T = Object.prototype.hasOwnProperty;
	function E(e, t, r) {
		var i = r.ref;
		return {
			$$typeof: n,
			type: e,
			key: t,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function D(e, t) {
		return E(e.type, t, e.props);
	}
	function O(e) {
		return typeof e == "object" && !!e && e.$$typeof === n;
	}
	function k(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var te = /\/+/g;
	function ne(e, t) {
		return typeof e == "object" && e && e.key != null ? k("" + e.key) : t.toString(36);
	}
	function re(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(C, C) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function ie(e, t, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case n:
				case r:
					c = !0;
					break;
				case f: return c = e._init, ie(c(e._payload), t, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ne(e, 0) : a, ee(o) ? (i = "", c != null && (i = c.replace(te, "$&/") + "/"), ie(o, t, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(te, "$&/") + "/") + c)), t.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ee(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ne(a, u), c += ie(a, t, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ne(a, u++), c += ie(a, t, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ie(re(e), t, i, a, o);
			throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ae(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ie(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function oe(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var A = typeof reportError == "function" ? reportError : function(t) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var n = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof t == "object" && t && typeof t.message == "string" ? String(t.message) : String(t),
				error: t
			});
			if (!window.dispatchEvent(n)) return;
		} else if (typeof e == "object" && typeof e.emit == "function") {
			e.emit("uncaughtException", t);
			return;
		}
		console.error(t);
	}, j = {
		map: ae,
		forEach: function(e, t, n) {
			ae(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ae(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ae(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!O(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	t.Activity = p, t.Children = j, t.Component = y, t.Fragment = i, t.Profiler = o, t.PureComponent = x, t.StrictMode = a, t.Suspense = u, t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, t.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return w.H.useMemoCache(e);
		}
	}, t.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, t.cacheSignal = function() {
		return null;
	}, t.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = _({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !T.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return E(e.type, i, r);
	}, t.createContext = function(e) {
		return e = {
			$$typeof: c,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: s,
			_context: e
		}, e;
	}, t.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) T.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return E(e, a, i);
	}, t.createRef = function() {
		return { current: null };
	}, t.forwardRef = function(e) {
		return {
			$$typeof: l,
			render: e
		};
	}, t.isValidElement = O, t.lazy = function(e) {
		return {
			$$typeof: f,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: oe
		};
	}, t.memo = function(e, t) {
		return {
			$$typeof: d,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, t.startTransition = function(e) {
		var t = w.T, n = {};
		w.T = n;
		try {
			var r = e(), i = w.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, A);
		} catch (e) {
			A(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), w.T = t;
		}
	}, t.unstable_useCacheRefresh = function() {
		return w.H.useCacheRefresh();
	}, t.use = function(e) {
		return w.H.use(e);
	}, t.useActionState = function(e, t, n) {
		return w.H.useActionState(e, t, n);
	}, t.useCallback = function(e, t) {
		return w.H.useCallback(e, t);
	}, t.useContext = function(e) {
		return w.H.useContext(e);
	}, t.useDebugValue = function() {}, t.useDeferredValue = function(e, t) {
		return w.H.useDeferredValue(e, t);
	}, t.useEffect = function(e, t) {
		return w.H.useEffect(e, t);
	}, t.useEffectEvent = function(e) {
		return w.H.useEffectEvent(e);
	}, t.useId = function() {
		return w.H.useId();
	}, t.useImperativeHandle = function(e, t, n) {
		return w.H.useImperativeHandle(e, t, n);
	}, t.useInsertionEffect = function(e, t) {
		return w.H.useInsertionEffect(e, t);
	}, t.useLayoutEffect = function(e, t) {
		return w.H.useLayoutEffect(e, t);
	}, t.useMemo = function(e, t) {
		return w.H.useMemo(e, t);
	}, t.useOptimistic = function(e, t) {
		return w.H.useOptimistic(e, t);
	}, t.useReducer = function(e, t, n) {
		return w.H.useReducer(e, t, n);
	}, t.useRef = function(e) {
		return w.H.useRef(e);
	}, t.useState = function(e) {
		return w.H.useState(e);
	}, t.useSyncExternalStore = function(e, t, n) {
		return w.H.useSyncExternalStore(e, t, n);
	}, t.useTransition = function() {
		return w.H.useTransition();
	}, t.version = "19.2.8";
})), a = /* @__PURE__ */ t(((e, t) => {
	t.exports = i();
})), o = /* @__PURE__ */ t(((e) => {
	var t = a();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, o = Symbol.for("react.portal");
	function s(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: o,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var c = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function l(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return s(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = c.T, n = i.p;
		try {
			if (c.T = null, i.p = 2, e) return e();
		} finally {
			c.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") {
			if (typeof t == "object" && t) {
				if (t.as == null || t.as === "script") {
					var n = l(t.as, t.crossOrigin);
					i.d.M(e, {
						crossOrigin: n,
						integrity: typeof t.integrity == "string" ? t.integrity : void 0,
						nonce: typeof t.nonce == "string" ? t.nonce : void 0
					});
				}
			} else t ?? i.d.M(e);
		}
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin);
			i.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") {
			if (t) {
				var n = l(t.as, t.crossOrigin);
				i.d.m(e, {
					as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0
				});
			} else i.d.m(e);
		}
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return c.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return c.H.useHostTransitionStatus();
	}, e.version = "19.2.8";
})), s = /* @__PURE__ */ t(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = o();
})), c = /* @__PURE__ */ t(((t) => {
	var n = r(), i = a(), o = s();
	function c(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function l(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function u(e) {
		var t = e, n = e;
		if (e.alternate) for (; t.return;) t = t.return;
		else {
			e = t;
			do
				t = e, t.flags & 4098 && (n = t.return), e = t.return;
			while (e);
		}
		return t.tag === 3 ? n : null;
	}
	function d(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function f(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function p(e) {
		if (u(e) !== e) throw Error(c(188));
	}
	function m(e) {
		var t = e.alternate;
		if (!t) {
			if (t = u(e), t === null) throw Error(c(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var a = i.alternate;
			if (a === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === a.child) {
				for (a = i.child; a;) {
					if (a === n) return p(i), e;
					if (a === r) return p(i), t;
					a = a.sibling;
				}
				throw Error(c(188));
			}
			if (n.return !== r.return) n = i, r = a;
			else {
				for (var o = !1, s = i.child; s;) {
					if (s === n) {
						o = !0, n = i, r = a;
						break;
					}
					if (s === r) {
						o = !0, r = i, n = a;
						break;
					}
					s = s.sibling;
				}
				if (!o) {
					for (s = a.child; s;) {
						if (s === n) {
							o = !0, n = a, r = i;
							break;
						}
						if (s === r) {
							o = !0, r = a, n = i;
							break;
						}
						s = s.sibling;
					}
					if (!o) throw Error(c(189));
				}
			}
			if (n.alternate !== r) throw Error(c(190));
		}
		if (n.tag !== 3) throw Error(c(188));
		return n.stateNode.current === n ? e : t;
	}
	function h(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = h(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var g = Object.assign, _ = Symbol.for("react.element"), v = Symbol.for("react.transitional.element"), y = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), x = Symbol.for("react.strict_mode"), S = Symbol.for("react.profiler"), ee = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), te = Symbol.for("react.memo_cache_sentinel"), ne = Symbol.iterator;
	function re(e) {
		return typeof e != "object" || !e ? null : (e = ne && e[ne] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ie = Symbol.for("react.client.reference");
	function ae(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ie ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case b: return "Fragment";
			case S: return "Profiler";
			case x: return "StrictMode";
			case T: return "Suspense";
			case E: return "SuspenseList";
			case k: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case y: return "Portal";
			case C: return e.displayName || "Context";
			case ee: return (e._context.displayName || "Context") + ".Consumer";
			case w:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case D: return t = e.displayName || null, t === null ? ae(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return ae(e(t));
				} catch {}
		}
		return null;
	}
	var oe = Array.isArray, A = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, j = o.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, se = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ce = [], le = -1;
	function ue(e) {
		return { current: e };
	}
	function M(e) {
		0 > le || (e.current = ce[le], ce[le] = null, le--);
	}
	function N(e, t) {
		le++, ce[le] = e.current, e.current = t;
	}
	var de = ue(null), fe = ue(null), pe = ue(null), me = ue(null);
	function he(e, t) {
		switch (N(pe, t), N(fe, e), N(de, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? Hd(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = Hd(t), e = Ud(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		M(de), N(de, e);
	}
	function ge() {
		M(de), M(fe), M(pe);
	}
	function _e(e) {
		e.memoizedState !== null && N(me, e);
		var t = de.current, n = Ud(t, e.type);
		t !== n && (N(fe, e), N(de, n));
	}
	function ve(e) {
		fe.current === e && (M(de), M(fe)), me.current === e && (M(me), $f._currentValue = se);
	}
	var ye, be;
	function xe(e) {
		if (ye === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ye = t && t[1] || "", be = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ye + e + be;
	}
	var Se = !1;
	function Ce(e, t) {
		if (!e || Se) return "";
		Se = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							e.call(n.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			Se = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? xe(n) : "";
	}
	function we(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return xe(e.type);
			case 16: return xe("Lazy");
			case 13: return e.child !== t && t !== null ? xe("Suspense Fallback") : xe("Suspense");
			case 19: return xe("SuspenseList");
			case 0:
			case 15: return Ce(e.type, !1);
			case 11: return Ce(e.type.render, !1);
			case 1: return Ce(e.type, !0);
			case 31: return xe("Activity");
			default: return "";
		}
	}
	function Te(e) {
		try {
			var t = "", n = null;
			do
				t += we(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Ee = Object.prototype.hasOwnProperty, De = n.unstable_scheduleCallback, Oe = n.unstable_cancelCallback, ke = n.unstable_shouldYield, Ae = n.unstable_requestPaint, je = n.unstable_now, Me = n.unstable_getCurrentPriorityLevel, Ne = n.unstable_ImmediatePriority, Pe = n.unstable_UserBlockingPriority, Fe = n.unstable_NormalPriority, Ie = n.unstable_LowPriority, Le = n.unstable_IdlePriority, Re = n.log, ze = n.unstable_setDisableYieldValue, Be = null, Ve = null;
	function He(e) {
		if (typeof Re == "function" && ze(e), Ve && typeof Ve.setStrictMode == "function") try {
			Ve.setStrictMode(Be, e);
		} catch {}
	}
	var Ue = Math.clz32 ? Math.clz32 : Ke, We = Math.log, Ge = Math.LN2;
	function Ke(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (We(e) / Ge | 0) | 0;
	}
	var qe = 256, Je = 262144, Ye = 4194304;
	function Xe(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & 261888;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function Ze(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Xe(n))) : i = Xe(o) : i = Xe(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Xe(n))) : i = Xe(o)) : i = Xe(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Qe(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function $e(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function et() {
		var e = Ye;
		return Ye <<= 1, !(Ye & 62914560) && (Ye = 4194304), e;
	}
	function tt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function nt(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function rt(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Ue(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && it(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function it(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ue(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function at(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ue(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function ot(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : st(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function st(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function ct(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function lt() {
		var e = j.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : hp(e.type)) : e;
	}
	function ut(e, t) {
		var n = j.p;
		try {
			return j.p = e, t();
		} finally {
			j.p = n;
		}
	}
	var dt = Math.random().toString(36).slice(2), ft = "__reactFiber$" + dt, pt = "__reactProps$" + dt, mt = "__reactContainer$" + dt, ht = "__reactEvents$" + dt, gt = "__reactListeners$" + dt, _t = "__reactHandles$" + dt, vt = "__reactResources$" + dt, yt = "__reactMarker$" + dt;
	function bt(e) {
		delete e[ft], delete e[pt], delete e[ht], delete e[gt], delete e[_t];
	}
	function xt(e) {
		var t = e[ft];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[mt] || n[ft]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[ft]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function St(e) {
		if (e = e[ft] || e[mt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Ct(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(c(33));
	}
	function wt(e) {
		var t = e[vt];
		return t ||= e[vt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Tt(e) {
		e[yt] = !0;
	}
	var Et = /* @__PURE__ */ new Set(), Dt = {};
	function Ot(e, t) {
		kt(e, t), kt(e + "Capture", t);
	}
	function kt(e, t) {
		for (Dt[e] = t, e = 0; e < t.length; e++) Et.add(t[e]);
	}
	var At = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), jt = {}, Mt = {};
	function Nt(e) {
		return Ee.call(Mt, e) ? !0 : Ee.call(jt, e) ? !1 : At.test(e) ? Mt[e] = !0 : (jt[e] = !0, !1);
	}
	function Pt(e, t, n) {
		if (Nt(t)) {
			if (n === null) e.removeAttribute(t);
			else {
				switch (typeof n) {
					case "undefined":
					case "function":
					case "symbol":
						e.removeAttribute(t);
						return;
					case "boolean":
						var r = t.toLowerCase().slice(0, 5);
						if (r !== "data-" && r !== "aria-") {
							e.removeAttribute(t);
							return;
						}
				}
				e.setAttribute(t, "" + n);
			}
		}
	}
	function Ft(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, "" + n);
		}
	}
	function It(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, "" + r);
		}
	}
	function Lt(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function Rt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function zt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Bt(e) {
		if (!e._valueTracker) {
			var t = Rt(e) ? "checked" : "value";
			e._valueTracker = zt(e, t, "" + e[t]);
		}
	}
	function Vt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Rt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function Ht(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Ut = /[\n"\\]/g;
	function Wt(e) {
		return e.replace(Ut, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Gt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Lt(t)) : e.value !== "" + Lt(t) && (e.value = "" + Lt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : qt(e, o, Lt(n)) : qt(e, o, Lt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Lt(s) : e.removeAttribute("name");
	}
	function Kt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Bt(e);
				return;
			}
			n = n == null ? "" : "" + Lt(n), t = t == null ? n : "" + Lt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Bt(e);
	}
	function qt(e, t, n) {
		t === "number" && Ht(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Jt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Lt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Yt(e, t, n) {
		if (t != null && (t = "" + Lt(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + Lt(n);
	}
	function Xt(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(c(92));
				if (oe(r)) {
					if (1 < r.length) throw Error(c(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Lt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Bt(e);
	}
	function Zt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Qt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function $t(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Qt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function en(e, t, n) {
		if (t != null && typeof t != "object") throw Error(c(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && $t(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && $t(e, a, t[a]);
	}
	function tn(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var nn = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), rn = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function an(e) {
		return rn.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function on() {}
	var sn = null;
	function cn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var ln = null, un = null;
	function dn(e) {
		var t = St(e);
		if (t && (e = t.stateNode)) {
			var n = e[pt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Gt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Wt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[pt] || null;
								if (!i) throw Error(c(90));
								Gt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Vt(r);
					}
					break a;
				case "textarea":
					Yt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Jt(e, !!n.multiple, t, !1);
			}
		}
	}
	var fn = !1;
	function pn(e, t, n) {
		if (fn) return e(t, n);
		fn = !0;
		try {
			return e(t);
		} finally {
			if (fn = !1, (ln !== null || un !== null) && (xu(), ln && (t = ln, e = un, un = ln = null, dn(t), e))) for (t = 0; t < e.length; t++) dn(e[t]);
		}
	}
	function mn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[pt] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = e !== "button" && e !== "input" && e !== "select" && e !== "textarea"), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(c(231, t, typeof n));
		return n;
	}
	var hn = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), gn = !1;
	if (hn) try {
		var _n = {};
		Object.defineProperty(_n, "passive", { get: function() {
			gn = !0;
		} }), window.addEventListener("test", _n, _n), window.removeEventListener("test", _n, _n);
	} catch {
		gn = !1;
	}
	var vn = null, yn = null, bn = null;
	function xn() {
		if (bn) return bn;
		var e, t = yn, n = t.length, r, i = "value" in vn ? vn.value : vn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return bn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function Sn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Cn() {
		return !0;
	}
	function wn() {
		return !1;
	}
	function Tn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Cn : wn, this.isPropagationStopped = wn, this;
		}
		return g(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Cn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Cn);
			},
			persist: function() {},
			isPersistent: Cn
		}), t;
	}
	var En = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, Dn = Tn(En), On = g({}, En, {
		view: 0,
		detail: 0
	}), kn = Tn(On), An, jn, Mn, Nn = g({}, On, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: Wn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Mn && (Mn && e.type === "mousemove" ? (An = e.screenX - Mn.screenX, jn = e.screenY - Mn.screenY) : jn = An = 0, Mn = e), An);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : jn;
		}
	}), Pn = Tn(Nn), Fn = Tn(g({}, Nn, { dataTransfer: 0 })), In = Tn(g({}, On, { relatedTarget: 0 })), Ln = Tn(g({}, En, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Rn = Tn(g({}, En, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), zn = Tn(g({}, En, { data: 0 })), Bn = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, Vn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, Hn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Un(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Hn[e]) ? !!t[e] : !1;
	}
	function Wn() {
		return Un;
	}
	var Gn = Tn(g({}, On, {
		key: function(e) {
			if (e.key) {
				var t = Bn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = Sn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Vn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Wn,
		charCode: function(e) {
			return e.type === "keypress" ? Sn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? Sn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Kn = Tn(g({}, Nn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), qn = Tn(g({}, On, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Wn
	})), Jn = Tn(g({}, En, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Yn = Tn(g({}, Nn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Xn = Tn(g({}, En, {
		newState: 0,
		oldState: 0
	})), Zn = [
		9,
		13,
		27,
		32
	], Qn = hn && "CompositionEvent" in window, $n = null;
	hn && "documentMode" in document && ($n = document.documentMode);
	var er = hn && "TextEvent" in window && !$n, tr = hn && (!Qn || $n && 8 < $n && 11 >= $n), nr = " ", rr = !1;
	function ir(e, t) {
		switch (e) {
			case "keyup": return Zn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function ar(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var or = !1;
	function sr(e, t) {
		switch (e) {
			case "compositionend": return ar(t);
			case "keypress": return t.which === 32 ? (rr = !0, nr) : null;
			case "textInput": return e = t.data, e === nr && rr ? null : e;
			default: return null;
		}
	}
	function cr(e, t) {
		if (or) return e === "compositionend" || !Qn && ir(e, t) ? (e = xn(), bn = yn = vn = null, or = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return tr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var lr = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function ur(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!lr[e.type] : t === "textarea";
	}
	function dr(e, t, n, r) {
		ln ? un ? un.push(r) : un = [r] : ln = r, t = Dd(t, "onChange"), 0 < t.length && (n = new Dn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var fr = null, pr = null;
	function mr(e) {
		bd(e, 0);
	}
	function hr(e) {
		if (Vt(Ct(e))) return e;
	}
	function gr(e, t) {
		if (e === "change") return t;
	}
	var _r = !1;
	if (hn) {
		var vr;
		if (hn) {
			var yr = "oninput" in document;
			if (!yr) {
				var br = document.createElement("div");
				br.setAttribute("oninput", "return;"), yr = typeof br.oninput == "function";
			}
			vr = yr;
		} else vr = !1;
		_r = vr && (!document.documentMode || 9 < document.documentMode);
	}
	function xr() {
		fr && (fr.detachEvent("onpropertychange", Sr), pr = fr = null);
	}
	function Sr(e) {
		if (e.propertyName === "value" && hr(pr)) {
			var t = [];
			dr(t, pr, e, cn(e)), pn(mr, t);
		}
	}
	function Cr(e, t, n) {
		e === "focusin" ? (xr(), fr = t, pr = n, fr.attachEvent("onpropertychange", Sr)) : e === "focusout" && xr();
	}
	function wr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return hr(pr);
	}
	function Tr(e, t) {
		if (e === "click") return hr(t);
	}
	function Er(e, t) {
		if (e === "input" || e === "change") return hr(t);
	}
	function Dr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Or = typeof Object.is == "function" ? Object.is : Dr;
	function kr(e, t) {
		if (Or(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Ee.call(t, i) || !Or(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Ar(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function jr(e, t) {
		var n = Ar(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = Ar(n);
		}
	}
	function Mr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Mr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Nr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ht(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ht(e.document);
		}
		return t;
	}
	function Pr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Fr = hn && "documentMode" in document && 11 >= document.documentMode, Ir = null, Lr = null, Rr = null, zr = !1;
	function Br(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		zr || Ir == null || Ir !== Ht(r) || (r = Ir, "selectionStart" in r && Pr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Rr && kr(Rr, r) || (Rr = r, r = Dd(Lr, "onSelect"), 0 < r.length && (t = new Dn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Ir)));
	}
	function Vr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Hr = {
		animationend: Vr("Animation", "AnimationEnd"),
		animationiteration: Vr("Animation", "AnimationIteration"),
		animationstart: Vr("Animation", "AnimationStart"),
		transitionrun: Vr("Transition", "TransitionRun"),
		transitionstart: Vr("Transition", "TransitionStart"),
		transitioncancel: Vr("Transition", "TransitionCancel"),
		transitionend: Vr("Transition", "TransitionEnd")
	}, Ur = {}, Wr = {};
	hn && (Wr = document.createElement("div").style, "AnimationEvent" in window || (delete Hr.animationend.animation, delete Hr.animationiteration.animation, delete Hr.animationstart.animation), "TransitionEvent" in window || delete Hr.transitionend.transition);
	function Gr(e) {
		if (Ur[e]) return Ur[e];
		if (!Hr[e]) return e;
		var t = Hr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Wr) return Ur[e] = t[n];
		return e;
	}
	var Kr = Gr("animationend"), qr = Gr("animationiteration"), Jr = Gr("animationstart"), Yr = Gr("transitionrun"), Xr = Gr("transitionstart"), Zr = Gr("transitioncancel"), Qr = Gr("transitionend"), $r = /* @__PURE__ */ new Map(), ei = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	ei.push("scrollEnd");
	function ti(e, t) {
		$r.set(e, t), Ot(t, [e]);
	}
	var ni = typeof reportError == "function" ? reportError : function(t) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var n = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof t == "object" && t && typeof t.message == "string" ? String(t.message) : String(t),
				error: t
			});
			if (!window.dispatchEvent(n)) return;
		} else if (typeof e == "object" && typeof e.emit == "function") {
			e.emit("uncaughtException", t);
			return;
		}
		console.error(t);
	}, ri = [], ii = 0, ai = 0;
	function oi() {
		for (var e = ii, t = ai = ii = 0; t < e;) {
			var n = ri[t];
			ri[t++] = null;
			var r = ri[t];
			ri[t++] = null;
			var i = ri[t];
			ri[t++] = null;
			var a = ri[t];
			if (ri[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && ui(n, i, a);
		}
	}
	function si(e, t, n, r) {
		ri[ii++] = e, ri[ii++] = t, ri[ii++] = n, ri[ii++] = r, ai |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function ci(e, t, n, r) {
		return si(e, t, n, r), di(e);
	}
	function li(e, t) {
		return si(e, null, null, t), di(e);
	}
	function ui(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Ue(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function di(e) {
		if (50 < fu) throw fu = 0, pu = null, Error(c(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var fi = {};
	function pi(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function mi(e, t, n, r) {
		return new pi(e, t, n, r);
	}
	function hi(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function gi(e, t) {
		var n = e.alternate;
		return n === null ? (n = mi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function _i(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function vi(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") hi(e) && (o = 1);
		else if (typeof e == "string") o = Wf(e, n, de.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = mi(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case b: return yi(n.children, i, a, t);
			case x:
				o = 8, i |= 24;
				break;
			case S: return e = mi(12, n, t, i | 2), e.elementType = S, e.lanes = a, e;
			case T: return e = mi(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = mi(19, n, t, i), e.elementType = E, e.lanes = a, e;
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case C:
						o = 10;
						break a;
					case ee:
						o = 9;
						break a;
					case w:
						o = 11;
						break a;
					case D:
						o = 14;
						break a;
					case O:
						o = 16, r = null;
						break a;
				}
				o = 29, n = Error(c(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = mi(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function yi(e, t, n, r) {
		return e = mi(7, e, r, t), e.lanes = n, e;
	}
	function bi(e, t, n) {
		return e = mi(6, e, null, t), e.lanes = n, e;
	}
	function xi(e) {
		var t = mi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function Si(e, t, n) {
		return t = mi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ci = /* @__PURE__ */ new WeakMap();
	function wi(e, t) {
		if (typeof e == "object" && e) {
			var n = Ci.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: Te(t)
			}, Ci.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: Te(t)
		};
	}
	var Ti = [], Ei = 0, Di = null, Oi = 0, ki = [], Ai = 0, ji = null, Mi = 1, Ni = "";
	function Pi(e, t) {
		Ti[Ei++] = Oi, Ti[Ei++] = Di, Di = e, Oi = t;
	}
	function Fi(e, t, n) {
		ki[Ai++] = Mi, ki[Ai++] = Ni, ki[Ai++] = ji, ji = e;
		var r = Mi;
		e = Ni;
		var i = 32 - Ue(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ue(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Mi = 1 << 32 - Ue(t) + i | n << i | r, Ni = a + e;
		} else Mi = 1 << a | n << i | r, Ni = e;
	}
	function Ii(e) {
		e.return !== null && (Pi(e, 1), Fi(e, 1, 0));
	}
	function Li(e) {
		for (; e === Di;) Di = Ti[--Ei], Ti[Ei] = null, Oi = Ti[--Ei], Ti[Ei] = null;
		for (; e === ji;) ji = ki[--Ai], ki[Ai] = null, Ni = ki[--Ai], ki[Ai] = null, Mi = ki[--Ai], ki[Ai] = null;
	}
	function Ri(e, t) {
		ki[Ai++] = Mi, ki[Ai++] = Ni, ki[Ai++] = ji, Mi = t.id, Ni = t.overflow, ji = e;
	}
	var zi = null, P = null, F = !1, Bi = null, Vi = !1, Hi = Error(c(519));
	function Ui(e) {
		throw Yi(wi(Error(c(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Hi;
	}
	function Wi(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[ft] = e, t[pt] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < vd.length; n++) Q(vd[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), Kt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Xt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Nd(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = on), t = !0) : t = !1, t || Ui(e, !0);
	}
	function Gi(e) {
		for (zi = e.return; zi;) switch (zi.tag) {
			case 5:
			case 31:
			case 13:
				Vi = !1;
				return;
			case 27:
			case 3:
				Vi = !0;
				return;
			default: zi = zi.return;
		}
	}
	function Ki(e) {
		if (e !== zi) return !1;
		if (!F) return Gi(e), F = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || Wd(e.type, e.memoizedProps)), n = !n), n && P && Ui(e), Gi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(317));
			P = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(317));
			P = df(e);
		} else t === 27 ? (t = P, Qd(e.type) ? (e = uf, uf = null, P = e) : P = t) : P = zi ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function qi() {
		P = zi = null, F = !1;
	}
	function Ji() {
		var e = Bi;
		return e !== null && (Ql === null ? Ql = e : Ql.push.apply(Ql, e), Bi = null), e;
	}
	function Yi(e) {
		Bi === null ? Bi = [e] : Bi.push(e);
	}
	var Xi = ue(null), Zi = null, Qi = null;
	function $i(e, t, n) {
		N(Xi, t._currentValue), t._currentValue = n;
	}
	function ea(e) {
		e._currentValue = Xi.current, M(Xi);
	}
	function ta(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function na(e, t, n, r) {
		var i = e.child;
		for (i !== null && (i.return = e); i !== null;) {
			var a = i.dependencies;
			if (a !== null) {
				var o = i.child;
				a = a.firstContext;
				a: for (; a !== null;) {
					var s = a;
					a = i;
					for (var l = 0; l < t.length; l++) if (s.context === t[l]) {
						a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ta(a.return, n, e), r || (o = null);
						break a;
					}
					a = s.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(c(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), ta(o, n, e), o = null;
			} else o = i.child;
			if (o !== null) o.return = i;
			else for (o = i; o !== null;) {
				if (o === e) {
					o = null;
					break;
				}
				if (i = o.sibling, i !== null) {
					i.return = o.return, o = i;
					break;
				}
				o = o.return;
			}
			i = o;
		}
	}
	function ra(e, t, n, r) {
		e = null;
		for (var i = t, a = !1; i !== null;) {
			if (!a) {
				if (i.flags & 524288) a = !0;
				else if (i.flags & 262144) break;
			}
			if (i.tag === 10) {
				var o = i.alternate;
				if (o === null) throw Error(c(387));
				if (o = o.memoizedProps, o !== null) {
					var s = i.type;
					Or(i.pendingProps.value, o.value) || (e === null ? e = [s] : e.push(s));
				}
			} else if (i === me.current) {
				if (o = i.alternate, o === null) throw Error(c(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			i = i.return;
		}
		e !== null && na(t, e, n, r), t.flags |= 262144;
	}
	function ia(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Or(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function aa(e) {
		Zi = e, Qi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function oa(e) {
		return ca(Zi, e);
	}
	function sa(e, t) {
		return Zi === null && aa(e), ca(e, t);
	}
	function ca(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Qi === null) {
			if (e === null) throw Error(c(308));
			Qi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Qi = Qi.next = t;
		return n;
	}
	var la = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, ua = n.unstable_scheduleCallback, da = n.unstable_NormalPriority, I = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function fa() {
		return {
			controller: new la(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function pa(e) {
		e.refCount--, e.refCount === 0 && ua(da, function() {
			e.controller.abort();
		});
	}
	var ma = null, ha = 0, ga = 0, _a = null;
	function va(e, t) {
		if (ma === null) {
			var n = ma = [];
			ha = 0, ga = fd(), _a = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ha++, t.then(ya, ya), t;
	}
	function ya() {
		if (--ha === 0 && ma !== null) {
			_a !== null && (_a.status = "fulfilled");
			var e = ma;
			ma = null, ga = 0, _a = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function ba(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var xa = A.S;
	A.S = function(e, t) {
		tu = je(), typeof t == "object" && t && typeof t.then == "function" && va(e, t), xa !== null && xa(e, t);
	};
	var Sa = ue(null);
	function Ca() {
		var e = Sa.current;
		return e === null ? K.pooledCache : e;
	}
	function wa(e, t) {
		t === null ? N(Sa, Sa.current) : N(Sa, t.pool);
	}
	function Ta() {
		var e = Ca();
		return e === null ? null : {
			parent: I._currentValue,
			pool: e
		};
	}
	var Ea = Error(c(460)), Da = Error(c(474)), Oa = Error(c(542)), ka = { then: function() {} };
	function Aa(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function ja(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(on, on), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Fa(e), e;
			default:
				if (typeof t.status == "string") t.then(on, on);
				else {
					if (e = K, e !== null && 100 < e.shellSuspendCounter) throw Error(c(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, Fa(e), e;
				}
				throw Na = t, Ea;
		}
	}
	function Ma(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Na = e, Ea) : e;
		}
	}
	var Na = null;
	function Pa() {
		if (Na === null) throw Error(c(459));
		var e = Na;
		return Na = null, e;
	}
	function Fa(e) {
		if (e === Ea || e === Oa) throw Error(c(483));
	}
	var Ia = null, La = 0;
	function Ra(e) {
		var t = La;
		return La += 1, Ia === null && (Ia = []), ja(Ia, e, t);
	}
	function za(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Ba(e, t) {
		throw t.$$typeof === _ ? Error(c(525)) : (e = Object.prototype.toString.call(t), Error(c(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Va(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function i(e, t) {
			return e = gi(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function s(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = bi(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === b ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && Ma(a) === t.type) ? (t = i(t, n.props), za(t, n), t.return = e, t) : (t = vi(n.type, n.key, n.props, null, e.mode, r), za(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = Si(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = yi(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = bi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case v: return n = vi(t.type, t.key, t.props, null, e.mode, n), za(n, t), n.return = e, n;
					case y: return t = Si(t, e.mode, n), t.return = e, t;
					case O: return t = Ma(t), f(e, t, n);
				}
				if (oe(t) || re(t)) return t = yi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Ra(t), n);
				if (t.$$typeof === C) return f(e, sa(e, t), n);
				Ba(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? s(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case v: return n.key === i ? l(e, t, n, r) : null;
					case y: return n.key === i ? u(e, t, n, r) : null;
					case O: return n = Ma(n), p(e, t, n, r);
				}
				if (oe(n) || re(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Ra(n), r);
				if (n.$$typeof === C) return p(e, t, sa(e, n), r);
				Ba(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, s(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case v: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case y: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case O: return r = Ma(r), m(e, t, n, r, i);
				}
				if (oe(r) || re(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Ra(r), i);
				if (r.$$typeof === C) return m(e, t, n, sa(t, r), i);
				Ba(t, r);
			}
			return null;
		}
		function h(i, o, s, c) {
			for (var l = null, u = null, d = o, h = o = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), o = a(_, o, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), F && Pi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return F && Pi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), F && Pi(i, h), l;
		}
		function g(i, o, s, l) {
			if (s == null) throw Error(c(151));
			for (var u = null, d = null, h = o, g = o = 0, _ = null, v = s.next(); h !== null && !v.done; g++, v = s.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), o = a(y, o, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), F && Pi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = s.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return F && Pi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = s.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), F && Pi(i, g), u;
		}
		function _(e, r, a, s) {
			if (typeof a == "object" && a && a.type === b && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case v:
						a: {
							for (var l = a.key; r !== null;) {
								if (r.key === l) {
									if (l = a.type, l === b) {
										if (r.tag === 7) {
											n(e, r.sibling), s = i(r, a.props.children), s.return = e, e = s;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && Ma(l) === r.type) {
										n(e, r.sibling), s = i(r, a.props), za(s, a), s.return = e, e = s;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							a.type === b ? (s = yi(a.props.children, e.mode, s, a.key), s.return = e, e = s) : (s = vi(a.type, a.key, a.props, null, e.mode, s), za(s, a), s.return = e, e = s);
						}
						return o(e);
					case y:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) {
									if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
										n(e, r.sibling), s = i(r, a.children || []), s.return = e, e = s;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							s = Si(a, e.mode, s), s.return = e, e = s;
						}
						return o(e);
					case O: return a = Ma(a), _(e, r, a, s);
				}
				if (oe(a)) return h(e, r, a, s);
				if (re(a)) {
					if (l = re(a), typeof l != "function") throw Error(c(150));
					return a = l.call(a), g(e, r, a, s);
				}
				if (typeof a.then == "function") return _(e, r, Ra(a), s);
				if (a.$$typeof === C) return _(e, r, sa(e, a), s);
				Ba(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), s = i(r, a), s.return = e, e = s) : (n(e, r), s = bi(a, e.mode, s), s.return = e, e = s), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				La = 0;
				var i = _(e, t, n, r);
				return Ia = null, i;
			} catch (t) {
				if (t === Ea || t === Oa) throw t;
				var a = mi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var Ha = Va(!0), Ua = Va(!1), Wa = !1;
	function Ga(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function Ka(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function qa(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Ja(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, G & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = di(e), ui(e, null, n), t;
		}
		return si(e, r, t, n), di(e);
	}
	function Ya(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, at(e, n);
		}
	}
	function Xa(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
			return;
		}
		e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var Za = !1;
	function Qa() {
		if (Za) {
			var e = _a;
			if (e !== null) throw e;
		}
	}
	function $a(e, t, n, r) {
		Za = !1;
		var i = e.updateQueue;
		Wa = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (J & f) === f : (r & f) === f) {
					f !== 0 && f === ga && (Za = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, h = s;
						f = t;
						var _ = n;
						switch (h.tag) {
							case 1:
								if (m = h.payload, typeof m == "function") {
									d = m.call(_, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = h.payload, f = typeof m == "function" ? m.call(_, d, f) : m, f == null) break a;
								d = g({}, d, f);
								break a;
							case 2: Wa = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Kl |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function eo(e, t) {
		if (typeof e != "function") throw Error(c(191, e));
		e.call(t);
	}
	function to(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) eo(n[e], t);
	}
	var no = ue(null), ro = ue(0);
	function io(e, t) {
		e = Gl, N(ro, e), N(no, t), Gl = e | t.baseLanes;
	}
	function ao() {
		N(ro, Gl), N(no, no.current);
	}
	function oo() {
		Gl = ro.current, M(no), M(ro);
	}
	var so = ue(null), co = null;
	function lo(e) {
		var t = e.alternate;
		N(L, L.current & 1), N(so, e), co === null && (t === null || no.current !== null || t.memoizedState !== null) && (co = e);
	}
	function uo(e) {
		N(L, L.current), N(so, e), co === null && (co = e);
	}
	function fo(e) {
		e.tag === 22 ? (N(L, L.current), N(so, e), co === null && (co = e)) : po(e);
	}
	function po() {
		N(L, L.current), N(so, so.current);
	}
	function mo(e) {
		M(so), co === e && (co = null), M(L);
	}
	var L = ue(0);
	function ho(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || of(n) || sf(n))) return t;
			} else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var go = 0, R = null, z = null, B = null, _o = !1, vo = !1, yo = !1, bo = 0, xo = 0, So = null, Co = 0;
	function V() {
		throw Error(c(321));
	}
	function wo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Or(e[n], t[n])) return !1;
		return !0;
	}
	function To(e, t, n, r, i, a) {
		return go = a, R = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, A.H = e === null || e.memoizedState === null ? Vs : Hs, yo = !1, a = n(r, i), yo = !1, vo && (a = Do(t, n, r, i)), Eo(e), a;
	}
	function Eo(e) {
		A.H = Bs;
		var t = z !== null && z.next !== null;
		if (go = 0, B = z = R = null, _o = !1, xo = 0, So = null, t) throw Error(c(300));
		e === null || ac || (e = e.dependencies, e !== null && ia(e) && (ac = !0));
	}
	function Do(e, t, n, r) {
		R = e;
		var i = 0;
		do {
			if (vo && (So = null), xo = 0, vo = !1, 25 <= i) throw Error(c(301));
			if (i += 1, B = z = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			A.H = Us, a = t(n, r);
		} while (vo);
		return a;
	}
	function Oo() {
		var e = A.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? Po(t) : t, e = e.useState()[0], (z === null ? null : z.memoizedState) !== e && (R.flags |= 1024), t;
	}
	function ko() {
		var e = bo !== 0;
		return bo = 0, e;
	}
	function Ao(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function jo(e) {
		if (_o) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			_o = !1;
		}
		go = 0, B = z = R = null, vo = !1, xo = bo = 0, So = null;
	}
	function Mo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return B === null ? R.memoizedState = B = e : B = B.next = e, B;
	}
	function H() {
		if (z === null) {
			var e = R.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = z.next;
		var t = B === null ? R.memoizedState : B.next;
		if (t !== null) B = t, z = e;
		else {
			if (e === null) throw R.alternate === null ? Error(c(467)) : Error(c(310));
			z = e, e = {
				memoizedState: z.memoizedState,
				baseState: z.baseState,
				baseQueue: z.baseQueue,
				queue: z.queue,
				next: null
			}, B === null ? R.memoizedState = B = e : B = B.next = e;
		}
		return B;
	}
	function No() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function Po(e) {
		var t = xo;
		return xo += 1, So === null && (So = []), e = ja(So, e, t), t = R, (B === null ? t.memoizedState : B.next) === null && (t = t.alternate, A.H = t === null || t.memoizedState === null ? Vs : Hs), e;
	}
	function Fo(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Po(e);
			if (e.$$typeof === C) return oa(e);
		}
		throw Error(c(438, String(e)));
	}
	function Io(e) {
		var t = null, n = R.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = R.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = No(), R.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = te;
		return t.index++, n;
	}
	function Lo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Ro(e) {
		return zo(H(), z, e);
	}
	function zo(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(c(311));
		r.lastRenderedReducer = n;
		var i = e.baseQueue, a = r.pending;
		if (a !== null) {
			if (i !== null) {
				var o = i.next;
				i.next = a.next, a.next = o;
			}
			t.baseQueue = i = a, r.pending = null;
		}
		if (a = e.baseState, i === null) e.memoizedState = a;
		else {
			t = i.next;
			var s = o = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (go & f) === f : (J & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === ga && (d = !0);
					else if ((go & p) === p) {
						u = u.next, p === ga && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (s = l = f, o = a) : l = l.next = f, R.lanes |= p, Kl |= p;
					f = u.action, yo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (s = l = p, o = a) : l = l.next = p, R.lanes |= f, Kl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = s, !Or(a, e.memoizedState) && (ac = !0, d && (n = _a, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Bo(e) {
		var t = H(), n = t.queue;
		if (n === null) throw Error(c(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			Or(a, t.memoizedState) || (ac = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Vo(e, t, n) {
		var r = R, i = H(), a = F;
		if (a) {
			if (n === void 0) throw Error(c(407));
			n = n();
		} else n = t();
		var o = !Or((z || i).memoizedState, n);
		if (o && (i.memoizedState = n, ac = !0), i = i.queue, fs(Wo.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || B !== null && B.memoizedState.tag & 1) {
			if (r.flags |= 2048, ss(9, { destroy: void 0 }, Uo.bind(null, r, i, n, t), null), K === null) throw Error(c(349));
			a || go & 127 || Ho(r, t, n);
		}
		return n;
	}
	function Ho(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = R.updateQueue, t === null ? (t = No(), R.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Uo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Go(t) && Ko(e);
	}
	function Wo(e, t, n) {
		return n(function() {
			Go(t) && Ko(e);
		});
	}
	function Go(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Or(e, n);
		} catch {
			return !0;
		}
	}
	function Ko(e) {
		var t = li(e, 2);
		t !== null && gu(t, e, 2);
	}
	function qo(e) {
		var t = Mo();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), yo) {
				He(!0);
				try {
					n();
				} finally {
					He(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Lo,
			lastRenderedState: e
		}, t;
	}
	function Jo(e, t, n, r) {
		return e.baseState = n, zo(e, z, typeof r == "function" ? r : Lo);
	}
	function Yo(e, t, n, r, i) {
		if (Ls(e)) throw Error(c(485));
		if (e = t.action, e !== null) {
			var a = {
				payload: i,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					a.listeners.push(e);
				}
			};
			A.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Xo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Xo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = A.T, o = {};
			A.T = o;
			try {
				var s = n(i, r), c = A.S;
				c !== null && c(o, s), Zo(e, t, s);
			} catch (n) {
				$o(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), A.T = a;
			}
		} else try {
			a = n(i, r), Zo(e, t, a);
		} catch (n) {
			$o(e, t, n);
		}
	}
	function Zo(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Qo(e, t, n);
		}, function(n) {
			return $o(e, t, n);
		}) : Qo(e, t, n);
	}
	function Qo(e, t, n) {
		t.status = "fulfilled", t.value = n, es(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Xo(e, n)));
	}
	function $o(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, es(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function es(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function ts(e, t) {
		return t;
	}
	function ns(e, t) {
		if (F) {
			var n = K.formState;
			if (n !== null) {
				a: {
					var r = R;
					if (F) {
						if (P) {
							b: {
								for (var i = P, a = Vi; i.nodeType !== 8;) {
									if (!a) {
										i = null;
										break b;
									}
									if (i = lf(i.nextSibling), i === null) {
										i = null;
										break b;
									}
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								P = lf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Ui(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Mo(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ts,
			lastRenderedState: t
		}, n.queue = r, n = Ps.bind(null, R, r), r.dispatch = n, r = qo(!1), a = Is.bind(null, R, !1, r.queue), r = Mo(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Yo.bind(null, R, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function rs(e) {
		return is(H(), z, e);
	}
	function is(e, t, n) {
		if (t = zo(e, t, ts)[0], e = Ro(Lo)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = Po(t);
		} catch (e) {
			throw e === Ea ? Oa : e;
		}
		else r = t;
		t = H();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (R.flags |= 2048, ss(9, { destroy: void 0 }, as.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function as(e, t) {
		e.action = t;
	}
	function os(e) {
		var t = H(), n = z;
		if (n !== null) return is(t, n, e);
		H(), t = t.memoizedState, n = H();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function ss(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = R.updateQueue, t === null && (t = No(), R.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function cs() {
		return H().memoizedState;
	}
	function ls(e, t, n, r) {
		var i = Mo();
		R.flags |= e, i.memoizedState = ss(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function us(e, t, n, r) {
		var i = H();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		z !== null && r !== null && wo(r, z.memoizedState.deps) ? i.memoizedState = ss(t, a, n, r) : (R.flags |= e, i.memoizedState = ss(1 | t, a, n, r));
	}
	function ds(e, t) {
		ls(8390656, 8, e, t);
	}
	function fs(e, t) {
		us(2048, 8, e, t);
	}
	function ps(e) {
		R.flags |= 4;
		var t = R.updateQueue;
		if (t === null) t = No(), R.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function ms(e) {
		var t = H().memoizedState;
		return ps({
			ref: t,
			nextImpl: e
		}), function() {
			if (G & 2) throw Error(c(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function hs(e, t) {
		return us(4, 2, e, t);
	}
	function gs(e, t) {
		return us(4, 4, e, t);
	}
	function _s(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function vs(e, t, n) {
		n = n == null ? null : n.concat([e]), us(4, 4, _s.bind(null, t, e), n);
	}
	function ys() {}
	function bs(e, t) {
		var n = H();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && wo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function xs(e, t) {
		var n = H();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && wo(t, r[1])) return r[0];
		if (r = e(), yo) {
			He(!0);
			try {
				e();
			} finally {
				He(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function Ss(e, t, n) {
		return n === void 0 || go & 1073741824 && !(J & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = hu(), R.lanes |= e, Kl |= e, n);
	}
	function Cs(e, t, n, r) {
		return Or(n, t) ? n : no.current === null ? !(go & 42) || go & 1073741824 && !(J & 261930) ? (ac = !0, e.memoizedState = n) : (e = hu(), R.lanes |= e, Kl |= e, t) : (e = Ss(e, n, r), Or(e, t) || (ac = !0), e);
	}
	function ws(e, t, n, r, i) {
		var a = j.p;
		j.p = a !== 0 && 8 > a ? a : 8;
		var o = A.T, s = {};
		A.T = s, Is(e, !1, t, n);
		try {
			var c = i(), l = A.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Fs(e, t, ba(c, r), mu(e)) : Fs(e, t, r, mu(e));
		} catch (n) {
			Fs(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, mu());
		} finally {
			j.p = a, o !== null && s.types !== null && (o.types = s.types), A.T = o;
		}
	}
	function Ts() {}
	function Es(e, t, n, r) {
		if (e.tag !== 5) throw Error(c(476));
		var i = Ds(e).queue;
		ws(e, i, t, se, n === null ? Ts : function() {
			return Os(e), n(r);
		});
	}
	function Ds(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: se,
			baseState: se,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Lo,
				lastRenderedState: se
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Lo,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Os(e) {
		var t = Ds(e);
		t.next === null && (t = e.alternate.memoizedState), Fs(e, t.next.queue, {}, mu());
	}
	function ks() {
		return oa($f);
	}
	function As() {
		return H().memoizedState;
	}
	function js() {
		return H().memoizedState;
	}
	function Ms(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = mu();
					e = qa(n);
					var r = Ja(t, e, n);
					r !== null && (gu(r, t, n), Ya(r, t, n)), t = { cache: fa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Ns(e, t, n) {
		var r = mu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ls(e) ? Rs(t, n) : (n = ci(e, t, n, r), n !== null && (gu(n, e, r), zs(n, t, r)));
	}
	function Ps(e, t, n) {
		Fs(e, t, n, mu());
	}
	function Fs(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (Ls(e)) Rs(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Or(s, o)) return si(e, t, i, 0), K === null && oi(), !1;
			} catch {}
			if (n = ci(e, t, i, r), n !== null) return gu(n, e, r), zs(n, t, r), !0;
		}
		return !1;
	}
	function Is(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: fd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ls(e)) {
			if (t) throw Error(c(479));
		} else t = ci(e, n, r, 2), t !== null && gu(t, e, 2);
	}
	function Ls(e) {
		var t = e.alternate;
		return e === R || t !== null && t === R;
	}
	function Rs(e, t) {
		vo = _o = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function zs(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, at(e, n);
		}
	}
	var Bs = {
		readContext: oa,
		use: Fo,
		useCallback: V,
		useContext: V,
		useEffect: V,
		useImperativeHandle: V,
		useLayoutEffect: V,
		useInsertionEffect: V,
		useMemo: V,
		useReducer: V,
		useRef: V,
		useState: V,
		useDebugValue: V,
		useDeferredValue: V,
		useTransition: V,
		useSyncExternalStore: V,
		useId: V,
		useHostTransitionStatus: V,
		useFormState: V,
		useActionState: V,
		useOptimistic: V,
		useMemoCache: V,
		useCacheRefresh: V
	};
	Bs.useEffectEvent = V;
	var Vs = {
		readContext: oa,
		use: Fo,
		useCallback: function(e, t) {
			return Mo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: oa,
		useEffect: ds,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), ls(4194308, 4, _s.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return ls(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			ls(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Mo();
			t = t === void 0 ? null : t;
			var r = e();
			if (yo) {
				He(!0);
				try {
					e();
				} finally {
					He(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Mo();
			if (n !== void 0) {
				var i = n(t);
				if (yo) {
					He(!0);
					try {
						n(t);
					} finally {
						He(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Ns.bind(null, R, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Mo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = qo(e);
			var t = e.queue, n = Ps.bind(null, R, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: ys,
		useDeferredValue: function(e, t) {
			return Ss(Mo(), e, t);
		},
		useTransition: function() {
			var e = qo(!1);
			return e = ws.bind(null, R, e.queue, !0, !1), Mo().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = R, i = Mo();
			if (F) {
				if (n === void 0) throw Error(c(407));
				n = n();
			} else {
				if (n = t(), K === null) throw Error(c(349));
				J & 127 || Ho(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, ds(Wo.bind(null, r, a, e), [e]), r.flags |= 2048, ss(9, { destroy: void 0 }, Uo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Mo(), t = K.identifierPrefix;
			if (F) {
				var n = Ni, r = Mi;
				n = (r & ~(1 << 32 - Ue(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = bo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = Co++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: ks,
		useFormState: ns,
		useActionState: ns,
		useOptimistic: function(e) {
			var t = Mo();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = Is.bind(null, R, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Io,
		useCacheRefresh: function() {
			return Mo().memoizedState = Ms.bind(null, R);
		},
		useEffectEvent: function(e) {
			var t = Mo(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (G & 2) throw Error(c(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Hs = {
		readContext: oa,
		use: Fo,
		useCallback: bs,
		useContext: oa,
		useEffect: fs,
		useImperativeHandle: vs,
		useInsertionEffect: hs,
		useLayoutEffect: gs,
		useMemo: xs,
		useReducer: Ro,
		useRef: cs,
		useState: function() {
			return Ro(Lo);
		},
		useDebugValue: ys,
		useDeferredValue: function(e, t) {
			return Cs(H(), z.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Ro(Lo)[0], t = H().memoizedState;
			return [typeof e == "boolean" ? e : Po(e), t];
		},
		useSyncExternalStore: Vo,
		useId: As,
		useHostTransitionStatus: ks,
		useFormState: rs,
		useActionState: rs,
		useOptimistic: function(e, t) {
			return Jo(H(), z, e, t);
		},
		useMemoCache: Io,
		useCacheRefresh: js
	};
	Hs.useEffectEvent = ms;
	var Us = {
		readContext: oa,
		use: Fo,
		useCallback: bs,
		useContext: oa,
		useEffect: fs,
		useImperativeHandle: vs,
		useInsertionEffect: hs,
		useLayoutEffect: gs,
		useMemo: xs,
		useReducer: Bo,
		useRef: cs,
		useState: function() {
			return Bo(Lo);
		},
		useDebugValue: ys,
		useDeferredValue: function(e, t) {
			var n = H();
			return z === null ? Ss(n, e, t) : Cs(n, z.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Bo(Lo)[0], t = H().memoizedState;
			return [typeof e == "boolean" ? e : Po(e), t];
		},
		useSyncExternalStore: Vo,
		useId: As,
		useHostTransitionStatus: ks,
		useFormState: os,
		useActionState: os,
		useOptimistic: function(e, t) {
			var n = H();
			return z === null ? (n.baseState = e, [e, n.queue.dispatch]) : Jo(n, z, e, t);
		},
		useMemoCache: Io,
		useCacheRefresh: js
	};
	Us.useEffectEvent = ms;
	function Ws(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : g({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Gs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = mu(), i = qa(r);
			i.payload = t, n != null && (i.callback = n), t = Ja(e, i, r), t !== null && (gu(t, e, r), Ya(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = mu(), i = qa(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Ja(e, i, r), t !== null && (gu(t, e, r), Ya(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = mu(), r = qa(n);
			r.tag = 2, t != null && (r.callback = t), t = Ja(e, r, n), t !== null && (gu(t, e, n), Ya(t, e, n));
		}
	};
	function Ks(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !kr(n, r) || !kr(i, a) : !0;
	}
	function qs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Gs.enqueueReplaceState(t, t.state, null);
	}
	function Js(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = g({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Ys(e) {
		ni(e);
	}
	function Xs(e) {
		console.error(e);
	}
	function Zs(e) {
		ni(e);
	}
	function Qs(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function $s(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function ec(e, t, n) {
		return n = qa(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Qs(e, t);
		}, n;
	}
	function tc(e) {
		return e = qa(e), e.tag = 3, e;
	}
	function nc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				$s(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			$s(t, n, r), typeof i != "function" && (iu === null ? iu = /* @__PURE__ */ new Set([this]) : iu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function rc(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && ra(t, n, i, !0), n = so.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return co === null ? Ou() : n.alternate === null && X === 0 && (X = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), Ku(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === ka ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), Ku(e, r, i)), !1;
				}
				throw Error(c(435, n.tag));
			}
			return Ku(e, r, i), Ou(), !1;
		}
		if (F) return t = so.current, t === null ? (r !== Hi && (t = Error(c(423), { cause: r }), Yi(wi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = wi(r, n), i = ec(e.stateNode, r, i), Xa(e, i), X !== 4 && (X = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Hi && (e = Error(c(422), { cause: r }), Yi(wi(e, n)))), !1;
		var a = Error(c(520), { cause: r });
		if (a = wi(a, n), Zl === null ? Zl = [a] : Zl.push(a), X !== 4 && (X = 2), t === null) return !0;
		r = wi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = ec(n.stateNode, r, e), Xa(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (iu === null || !iu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = tc(i), nc(i, e, n, r), Xa(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var ic = Error(c(461)), ac = !1;
	function oc(e, t, n, r) {
		t.child = e === null ? Ua(t, null, n, r) : Ha(t, e.child, n, r);
	}
	function sc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return aa(t), r = To(e, t, n, o, a, i), s = ko(), e !== null && !ac ? (Ao(e, t, i), jc(e, t, i)) : (F && s && Ii(t), t.flags |= 1, oc(e, t, r, i), t.child);
	}
	function cc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !hi(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, lc(e, t, a, r, i)) : (e = vi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Mc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? kr : n, n(o, r) && e.ref === t.ref) return jc(e, t, i);
		}
		return t.flags |= 1, e = gi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function lc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (kr(a, r) && e.ref === t.ref) {
				if (ac = !1, t.pendingProps = r = a, Mc(e, i)) e.flags & 131072 && (ac = !0);
				else return t.lanes = e.lanes, jc(e, t, i);
			}
		}
		return _c(e, t, n, r, i);
	}
	function uc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return fc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && wa(t, a === null ? null : a.cachePool), a === null ? ao() : io(t, a), fo(t);
			else return r = t.lanes = 536870912, fc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && wa(t, null), ao(), po(t)) : (wa(t, a.cachePool), io(t, a), po(t), t.memoizedState = null);
		return oc(e, t, i, n), t.child;
	}
	function dc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function fc(e, t, n, r, i) {
		var a = Ca();
		return a = a === null ? null : {
			parent: I._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && wa(t, null), ao(), fo(t), e !== null && ra(e, t, r, !0), t.childLanes = i, null;
	}
	function pc(e, t) {
		return t = Ec({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function mc(e, t, n) {
		return Ha(t, e.child, null, n), e = pc(t, t.pendingProps), e.flags |= 2, mo(t), t.memoizedState = null, e;
	}
	function hc(e, t, n) {
		var r = t.pendingProps, i = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (F) {
				if (r.mode === "hidden") return e = pc(t, r), t.lanes = 536870912, dc(null, e);
				if (uo(t), (e = P) ? (e = af(e, Vi), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: ji === null ? null : {
						id: Mi,
						overflow: Ni
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = xi(e), n.return = t, t.child = n, zi = t, P = null)) : e = null, e === null) throw Ui(t);
				return t.lanes = 536870912, null;
			}
			return pc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (uo(t), i) {
				if (t.flags & 256) t.flags &= -257, t = mc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(c(558));
			} else if (ac || ra(e, t, n, !1), i = (n & e.childLanes) !== 0, ac || i) {
				if (r = K, r !== null && (o = ot(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, li(e, o), gu(r, e, o), ic;
				Ou(), t = mc(e, t, n);
			} else e = a.treeContext, P = lf(o.nextSibling), zi = t, F = !0, Bi = null, Vi = !1, e !== null && Ri(t, e), t = pc(t, r), t.flags |= 4096;
			return t;
		}
		return e = gi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function gc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(c(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function _c(e, t, n, r, i) {
		return aa(t), n = To(e, t, n, r, void 0, i), r = ko(), e !== null && !ac ? (Ao(e, t, i), jc(e, t, i)) : (F && r && Ii(t), t.flags |= 1, oc(e, t, n, i), t.child);
	}
	function vc(e, t, n, r, i, a) {
		return aa(t), t.updateQueue = null, n = Do(t, r, n, i), Eo(e), r = ko(), e !== null && !ac ? (Ao(e, t, a), jc(e, t, a)) : (F && r && Ii(t), t.flags |= 1, oc(e, t, n, a), t.child);
	}
	function yc(e, t, n, r, i) {
		if (aa(t), t.stateNode === null) {
			var a = fi, o = n.contextType;
			typeof o == "object" && o && (a = oa(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Gs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Ga(t), o = n.contextType, a.context = typeof o == "object" && o ? oa(o) : fi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ws(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Gs.enqueueReplaceState(a, a.state, null), $a(t, r, a, i), Qa(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Js(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = fi, typeof u == "object" && u && (o = oa(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && qs(t, a, r, o), Wa = !1;
			var f = t.memoizedState;
			a.state = f, $a(t, r, a, i), Qa(), l = t.memoizedState, s || f !== l || Wa ? (typeof d == "function" && (Ws(t, n, d, r), l = t.memoizedState), (c = Wa || Ks(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Ka(e, t), o = t.memoizedProps, u = Js(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = fi, typeof l == "object" && l && (c = oa(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && qs(t, a, r, c), Wa = !1, f = t.memoizedState, a.state = f, $a(t, r, a, i), Qa();
			var p = t.memoizedState;
			o !== d || f !== p || Wa || e !== null && e.dependencies !== null && ia(e.dependencies) ? (typeof s == "function" && (Ws(t, n, s, r), p = t.memoizedState), (u = Wa || Ks(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && ia(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, gc(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Ha(t, e.child, null, i), t.child = Ha(t, null, n, i)) : oc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = jc(e, t, i), e;
	}
	function bc(e, t, n, r) {
		return qi(), t.flags |= 256, oc(e, t, n, r), t.child;
	}
	var xc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Sc(e) {
		return {
			baseLanes: e,
			cachePool: Ta()
		};
	}
	function Cc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Yl), e;
	}
	function wc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(L.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (F) {
				if (i ? lo(t) : po(t), (e = P) ? (e = af(e, Vi), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: ji === null ? null : {
						id: Mi,
						overflow: Ni
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = xi(e), n.return = t, t.child = n, zi = t, P = null)) : e = null, e === null) throw Ui(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var s = r.children;
			return r = r.fallback, i ? (po(t), i = t.mode, s = Ec({
				mode: "hidden",
				children: s
			}, i), r = yi(r, i, n, null), s.return = t, r.return = t, s.sibling = r, t.child = s, r = t.child, r.memoizedState = Sc(n), r.childLanes = Cc(e, o, n), t.memoizedState = xc, dc(null, r)) : (lo(t), Tc(t, s));
		}
		var l = e.memoizedState;
		if (l !== null && (s = l.dehydrated, s !== null)) {
			if (a) t.flags & 256 ? (lo(t), t.flags &= -257, t = Dc(e, t, n)) : t.memoizedState === null ? (po(t), s = r.fallback, i = t.mode, r = Ec({
				mode: "visible",
				children: r.children
			}, i), s = yi(s, i, n, null), s.flags |= 2, r.return = t, s.return = t, r.sibling = s, t.child = r, Ha(t, e.child, null, n), r = t.child, r.memoizedState = Sc(n), r.childLanes = Cc(e, o, n), t.memoizedState = xc, t = dc(null, r)) : (po(t), t.child = e.child, t.flags |= 128, t = null);
			else if (lo(t), sf(s)) {
				if (o = s.nextSibling && s.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(c(419)), r.stack = "", r.digest = o, Yi({
					value: r,
					source: null,
					stack: null
				}), t = Dc(e, t, n);
			} else if (ac || ra(e, t, n, !1), o = (n & e.childLanes) !== 0, ac || o) {
				if (o = K, o !== null && (r = ot(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, li(e, r), gu(o, e, r), ic;
				of(s) || Ou(), t = Dc(e, t, n);
			} else of(s) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, P = lf(s.nextSibling), zi = t, F = !0, Bi = null, Vi = !1, e !== null && Ri(t, e), t = Tc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (po(t), s = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = gi(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (s = yi(s, i, n, null), s.flags |= 2) : s = gi(u, s), s.return = t, r.return = t, r.sibling = s, t.child = r, dc(null, r), r = t.child, s = e.child.memoizedState, s === null ? s = Sc(n) : (i = s.cachePool, i === null ? i = Ta() : (l = I._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), s = {
			baseLanes: s.baseLanes | n,
			cachePool: i
		}), r.memoizedState = s, r.childLanes = Cc(e, o, n), t.memoizedState = xc, dc(e.child, r)) : (lo(t), n = e.child, e = n.sibling, n = gi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Tc(e, t) {
		return t = Ec({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Ec(e, t) {
		return e = mi(22, e, null, t), e.lanes = 0, e;
	}
	function Dc(e, t, n) {
		return Ha(t, e.child, null, n), e = Tc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Oc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ta(e.return, t, n);
	}
	function kc(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function Ac(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = L.current, s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, N(L, o), oc(e, t, r, n), r = F ? Oi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Oc(e, n, t);
			else if (e.tag === 19) Oc(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && ho(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), kc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && ho(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				kc(t, !0, n, null, a, r);
				break;
			case "together":
				kc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function jc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Kl |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (ra(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(c(153));
		if (t.child !== null) {
			for (e = t.child, n = gi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = gi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Mc(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && ia(e)));
	}
	function Nc(e, t, n) {
		switch (t.tag) {
			case 3:
				he(t, t.stateNode.containerInfo), $i(t, I, e.memoizedState.cache), qi();
				break;
			case 27:
			case 5:
				_e(t);
				break;
			case 4:
				he(t, t.stateNode.containerInfo);
				break;
			case 10:
				$i(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, uo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (lo(t), e = jc(e, t, n), e === null ? null : e.sibling) : wc(e, t, n) : (lo(t), t.flags |= 128, null);
				lo(t);
				break;
			case 19:
				var i = !!(e.flags & 128);
				if (r = (n & t.childLanes) !== 0, r ||= (ra(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Ac(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), N(L, L.current), r) break;
				return null;
			case 22: return t.lanes = 0, uc(e, t, n, t.pendingProps);
			case 24: $i(t, I, e.memoizedState.cache);
		}
		return jc(e, t, n);
	}
	function Pc(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) ac = !0;
			else {
				if (!Mc(e, n) && !(t.flags & 128)) return ac = !1, Nc(e, t, n);
				ac = !!(e.flags & 131072);
			}
		} else ac = !1, F && t.flags & 1048576 && Fi(t, Oi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Ma(t.elementType), t.type = e, typeof e == "function") hi(e) ? (r = Js(e, r), t.tag = 1, t = yc(null, t, e, r, n)) : (t.tag = 0, t = _c(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = sc(null, t, e, r, n);
								break a;
							}
							if (i === D) {
								t.tag = 14, t = cc(null, t, e, r, n);
								break a;
							}
						}
						throw t = ae(e) || e, Error(c(306, t, ""));
					}
				}
				return t;
			case 0: return _c(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Js(r, t.pendingProps), yc(e, t, r, i, n);
			case 3:
				a: {
					if (he(t, t.stateNode.containerInfo), e === null) throw Error(c(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Ka(e, t), $a(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, $i(t, I, r), r !== a.cache && na(t, [I], n, !0), Qa(), r = o.element, a.isDehydrated) {
						if (a = {
							element: r,
							isDehydrated: !1,
							cache: o.cache
						}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
							t = bc(e, t, r, n);
							break a;
						}
						if (r !== i) {
							i = wi(Error(c(424)), t), Yi(i), t = bc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (P = lf(e.firstChild), zi = t, F = !0, Bi = null, Vi = !0, n = Ua(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (qi(), r === i) {
							t = jc(e, t, n);
							break a;
						}
						oc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return gc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : F || (n = t.type, e = t.pendingProps, r = Vd(pe.current).createElement(n), r[ft] = t, r[pt] = e, Fd(r, n, e), Tt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return _e(t), e === null && F && (r = t.stateNode = pf(t.type, t.pendingProps, pe.current), zi = t, Vi = !0, i = P, Qd(t.type) ? (uf = i, P = lf(r.firstChild)) : P = i), oc(e, t, t.pendingProps.children, n), gc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && F && ((i = r = P) && (r = nf(r, t.type, t.pendingProps, Vi), r === null ? i = !1 : (t.stateNode = r, zi = t, P = lf(r.firstChild), Vi = !1, i = !0)), i || Ui(t)), _e(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = To(e, t, Oo, null, null, n), $f._currentValue = i), gc(e, t), oc(e, t, r, n), t.child;
			case 6: return e === null && F && ((e = n = P) && (n = rf(n, t.pendingProps, Vi), n === null ? e = !1 : (t.stateNode = n, zi = t, P = null, e = !0)), e || Ui(t)), null;
			case 13: return wc(e, t, n);
			case 4: return he(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Ha(t, null, r, n) : oc(e, t, r, n), t.child;
			case 11: return sc(e, t, t.type, t.pendingProps, n);
			case 7: return oc(e, t, t.pendingProps, n), t.child;
			case 8: return oc(e, t, t.pendingProps.children, n), t.child;
			case 12: return oc(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, $i(t, t.type, r.value), oc(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, aa(t), i = oa(i), r = r(i), t.flags |= 1, oc(e, t, r, n), t.child;
			case 14: return cc(e, t, t.type, t.pendingProps, n);
			case 15: return lc(e, t, t.type, t.pendingProps, n);
			case 19: return Ac(e, t, n);
			case 31: return hc(e, t, n);
			case 22: return uc(e, t, n, t.pendingProps);
			case 24: return aa(t), r = oa(I), e === null ? (i = Ca(), i === null && (i = K, a = fa(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Ga(t), $i(t, I, i)) : ((e.lanes & n) !== 0 && (Ka(e, t), $a(t, null, null, n), Qa()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, $i(t, I, r), r !== i.cache && na(t, [I], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), $i(t, I, r))), oc(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(c(156, t.tag));
	}
	function Fc(e) {
		e.flags |= 4;
	}
	function Ic(e, t, n, r, i) {
		if ((t = !!(e.mode & 32)) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Tu()) e.flags |= 8192;
				else throw Na = ka, Da;
			}
		} else e.flags &= -16777217;
	}
	function Lc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Gf(t)) {
			if (Tu()) e.flags |= 8192;
			else throw Na = ka, Da;
		}
	}
	function Rc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : et(), e.lanes |= t, Xl |= t);
	}
	function zc(e, t) {
		if (!F) switch (e.tailMode) {
			case "hidden":
				t = e.tail;
				for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
				break;
			case "collapsed":
				n = e.tail;
				for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
		}
	}
	function U(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Bc(e, t, n) {
		var r = t.pendingProps;
		switch (Li(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return U(t), null;
			case 1: return U(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), ea(I), ge(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ki(t) ? Fc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ji())), U(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Fc(t), a === null ? (U(t), Ic(t, i, null, r, n)) : (U(t), Lc(t, a))) : a ? a === e.memoizedState ? (U(t), t.flags &= -16777217) : (Fc(t), U(t), Lc(t, a)) : (e = e.memoizedProps, e !== r && Fc(t), U(t), Ic(t, i, e, r, n)), null;
			case 27:
				if (ve(t), n = pe.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Fc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(c(166));
						return U(t), null;
					}
					e = de.current, Ki(t) ? Wi(t, e) : (e = pf(i, r, n), t.stateNode = e, Fc(t));
				}
				return U(t), null;
			case 5:
				if (ve(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Fc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(c(166));
						return U(t), null;
					}
					if (a = de.current, Ki(t)) Wi(t, a);
					else {
						var o = Vd(pe.current);
						switch (a) {
							case 1:
								a = o.createElementNS("http://www.w3.org/2000/svg", i);
								break;
							case 2:
								a = o.createElementNS("http://www.w3.org/1998/Math/MathML", i);
								break;
							default: switch (i) {
								case "svg":
									a = o.createElementNS("http://www.w3.org/2000/svg", i);
									break;
								case "math":
									a = o.createElementNS("http://www.w3.org/1998/Math/MathML", i);
									break;
								case "script":
									a = o.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild);
									break;
								case "select":
									a = typeof r.is == "string" ? o.createElement("select", { is: r.is }) : o.createElement("select"), r.multiple ? a.multiple = !0 : r.size && (a.size = r.size);
									break;
								default: a = typeof r.is == "string" ? o.createElement(i, { is: r.is }) : o.createElement(i);
							}
						}
						a[ft] = t, a[pt] = r;
						a: for (o = t.child; o !== null;) {
							if (o.tag === 5 || o.tag === 6) a.appendChild(o.stateNode);
							else if (o.tag !== 4 && o.tag !== 27 && o.child !== null) {
								o.child.return = o, o = o.child;
								continue;
							}
							if (o === t) break a;
							for (; o.sibling === null;) {
								if (o.return === null || o.return === t) break a;
								o = o.return;
							}
							o.sibling.return = o.return, o = o.sibling;
						}
						t.stateNode = a;
						a: switch (Fd(a, i, r), i) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && Fc(t);
					}
				}
				return U(t), Ic(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Fc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(c(166));
					if (e = pe.current, Ki(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = zi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[ft] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Nd(e.nodeValue, n)), e || Ui(t, !0);
					} else e = Vd(e).createTextNode(r), e[ft] = t, t.stateNode = e;
				}
				return U(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ki(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(c(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(557));
							e[ft] = t;
						} else qi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						U(t), e = !1;
					} else n = Ji(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (mo(t), t) : (mo(t), null);
					if (t.flags & 128) throw Error(c(558));
				}
				return U(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Ki(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(c(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(c(317));
							i[ft] = t;
						} else qi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						U(t), i = !1;
					} else i = Ji(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (mo(t), t) : (mo(t), null);
				}
				return mo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Rc(t, t.updateQueue), U(t), null);
			case 4: return ge(), e === null && Cd(t.stateNode.containerInfo), U(t), null;
			case 10: return ea(t.type), U(t), null;
			case 19:
				if (M(L), r = t.memoizedState, r === null) return U(t), null;
				if (i = !!(t.flags & 128), a = r.rendering, a === null) {
					if (i) zc(r, !1);
					else {
						if (X !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (a = ho(e), a !== null) {
								for (t.flags |= 128, zc(r, !1), e = a.updateQueue, t.updateQueue = e, Rc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) _i(n, e), n = n.sibling;
								return N(L, L.current & 1 | 2), F && Pi(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && je() > nu && (t.flags |= 128, i = !0, zc(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!i) {
						if (e = ho(a), e !== null) {
							if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Rc(t, e), zc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !F) return U(t), null;
						} else 2 * je() - r.renderingStartTime > nu && n !== 536870912 && (t.flags |= 128, i = !0, zc(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (U(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = je(), e.sibling = null, n = L.current, N(L, i ? n & 1 | 2 : n & 1), F && Pi(t, r.treeForkCount), e);
			case 22:
			case 23: return mo(t), oo(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (U(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : U(t), n = t.updateQueue, n !== null && Rc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && M(Sa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), ea(I), U(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(c(156, t.tag));
	}
	function Vc(e, t) {
		switch (Li(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return ea(I), ge(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return ve(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (mo(t), t.alternate === null) throw Error(c(340));
					qi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (mo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(c(340));
					qi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return M(L), null;
			case 4: return ge(), null;
			case 10: return ea(t.type), null;
			case 22:
			case 23: return mo(t), oo(), e !== null && M(Sa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return ea(I), null;
			case 25: return null;
			default: return null;
		}
	}
	function Hc(e, t) {
		switch (Li(t), t.tag) {
			case 3:
				ea(I), ge();
				break;
			case 26:
			case 27:
			case 5:
				ve(t);
				break;
			case 4:
				ge();
				break;
			case 31:
				t.memoizedState !== null && mo(t);
				break;
			case 13:
				mo(t);
				break;
			case 19:
				M(L);
				break;
			case 10:
				ea(t.type);
				break;
			case 22:
			case 23:
				mo(t), oo(), e !== null && M(Sa);
				break;
			case 24: ea(I);
		}
	}
	function Uc(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Wc(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Gc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				to(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function Kc(e, t, n) {
		n.props = Js(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function qc(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Jc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) {
			if (typeof r == "function") try {
				r();
			} catch (n) {
				Z(e, t, n);
			} finally {
				e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
			}
			else if (typeof n == "function") try {
				n(null);
			} catch (n) {
				Z(e, t, n);
			}
			else n.current = null;
		}
	}
	function Yc(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Xc(e, t, n) {
		try {
			var r = e.stateNode;
			Id(r, e.type, n, t), r[pt] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Zc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Qd(e.type) || e.tag === 4;
	}
	function Qc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Zc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Qd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function $c(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = on));
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for ($c(e, t, n), e = e.sibling; e !== null;) $c(e, t, n), e = e.sibling;
	}
	function el(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (el(e, t, n), e = e.sibling; e !== null;) el(e, t, n), e = e.sibling;
	}
	function tl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Fd(t, r, n), t[ft] = e, t[pt] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var nl = !1, rl = !1, il = !1, al = typeof WeakSet == "function" ? WeakSet : Set, ol = null;
	function sl(e, t) {
		if (e = e.containerInfo, zd = cp, e = Nr(e), Pr(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var i = r.anchorOffset, a = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, a.nodeType;
					} catch {
						n = null;
						break a;
					}
					var o = 0, s = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || i !== 0 && f.nodeType !== 3 || (s = o + i), f !== a || r !== 0 && f.nodeType !== 3 || (l = o + r), f.nodeType === 3 && (o += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === i && (s = o), p === a && ++d === r && (l = o), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					n = s === -1 || l === -1 ? null : {
						start: s,
						end: l
					};
				} else n = null;
			}
			n ||= {
				start: 0,
				end: 0
			};
		} else n = null;
		for (Bd = {
			focusedElem: e,
			selectionRange: n
		}, cp = !1, ol = t; ol !== null;) if (t = ol, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, ol = e;
		else for (; ol !== null;) {
			switch (t = ol, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Js(n.type, i);
							e = r.getSnapshotBeforeUpdate(h, a), r.__reactInternalSnapshotBeforeUpdate = e;
						} catch (e) {
							Z(n, n.return, e);
						}
					}
					break;
				case 3:
					if (e & 1024) {
						if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9) tf(e);
						else if (n === 1) switch (e.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								tf(e);
								break;
							default: e.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				default: if (e & 1024) throw Error(c(163));
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, ol = e;
				break;
			}
			ol = t.return;
		}
	}
	function cl(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				Sl(e, n), r & 4 && Uc(5, n);
				break;
			case 1:
				if (Sl(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Js(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Gc(n), r & 512 && qc(n, n.return);
				break;
			case 3:
				if (Sl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						to(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && tl(n);
			case 26:
			case 5:
				Sl(e, n), t === null && r & 4 && Yc(n), r & 512 && qc(n, n.return);
				break;
			case 12:
				Sl(e, n);
				break;
			case 31:
				Sl(e, n), r & 4 && pl(e, n);
				break;
			case 13:
				Sl(e, n), r & 4 && ml(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Yu.bind(null, n), cf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || nl, !r) {
					t = t !== null && t.memoizedState !== null || rl, i = nl;
					var a = rl;
					nl = r, (rl = t) && !a ? wl(e, n, !!(n.subtreeFlags & 8772)) : Sl(e, n), nl = i, rl = a;
				}
				break;
			case 30: break;
			default: Sl(e, n);
		}
	}
	function ll(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, ll(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && bt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var W = null, ul = !1;
	function dl(e, t, n) {
		for (n = n.child; n !== null;) fl(e, t, n), n = n.sibling;
	}
	function fl(e, t, n) {
		if (Ve && typeof Ve.onCommitFiberUnmount == "function") try {
			Ve.onCommitFiberUnmount(Be, n);
		} catch {}
		switch (n.tag) {
			case 26:
				rl || Jc(n, t), dl(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				rl || Jc(n, t);
				var r = W, i = ul;
				Qd(n.type) && (W = n.stateNode, ul = !1), dl(e, t, n), mf(n.stateNode), W = r, ul = i;
				break;
			case 5: rl || Jc(n, t);
			case 6:
				if (r = W, i = ul, W = null, dl(e, t, n), W = r, ul = i, W !== null) {
					if (ul) try {
						(W.nodeType === 9 ? W.body : W.nodeName === "HTML" ? W.ownerDocument.body : W).removeChild(n.stateNode);
					} catch (e) {
						Z(n, t, e);
					}
					else try {
						W.removeChild(n.stateNode);
					} catch (e) {
						Z(n, t, e);
					}
				}
				break;
			case 18:
				W !== null && (ul ? (e = W, $d(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Pp(e)) : $d(W, n.stateNode));
				break;
			case 4:
				r = W, i = ul, W = n.stateNode.containerInfo, ul = !0, dl(e, t, n), W = r, ul = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Wc(2, n, t), rl || Wc(4, n, t), dl(e, t, n);
				break;
			case 1:
				rl || (Jc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Kc(n, t, r)), dl(e, t, n);
				break;
			case 21:
				dl(e, t, n);
				break;
			case 22:
				rl = (r = rl) || n.memoizedState !== null, dl(e, t, n), rl = r;
				break;
			default: dl(e, t, n);
		}
	}
	function pl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Pp(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function ml(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Pp(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function hl(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new al()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new al()), t;
			default: throw Error(c(435, e.tag));
		}
	}
	function gl(e, t) {
		var n = hl(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Xu.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function _l(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, s = o;
			a: for (; s !== null;) {
				switch (s.tag) {
					case 27:
						if (Qd(s.type)) {
							W = s.stateNode, ul = !1;
							break a;
						}
						break;
					case 5:
						W = s.stateNode, ul = !1;
						break a;
					case 3:
					case 4:
						W = s.stateNode.containerInfo, ul = !0;
						break a;
				}
				s = s.return;
			}
			if (W === null) throw Error(c(160));
			fl(a, o, i), W = null, ul = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) yl(t, e), t = t.sibling;
	}
	var vl = null;
	function yl(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				_l(t, e), bl(e), r & 4 && (Wc(3, e, e.return), Uc(3, e), Wc(5, e, e.return));
				break;
			case 1:
				_l(t, e), bl(e), r & 512 && (rl || n === null || Jc(n, n.return)), r & 64 && nl && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = vl;
				if (_l(t, e), bl(e), r & 512 && (rl || n === null || Jc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) {
						if (r === null) {
							if (e.stateNode === null) {
								a: {
									r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
									b: switch (r) {
										case "title":
											a = i.getElementsByTagName("title")[0], (!a || a[yt] || a[ft] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Fd(a, r, n), a[ft] = e, Tt(a), r = a;
											break a;
										case "link":
											var o = Hf("link", "href", i).get(r + (n.href || ""));
											if (o) {
												for (var s = 0; s < o.length; s++) if (a = o[s], a.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && a.getAttribute("rel") === (n.rel == null ? null : n.rel) && a.getAttribute("title") === (n.title == null ? null : n.title) && a.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
													o.splice(s, 1);
													break b;
												}
											}
											a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
											break;
										case "meta":
											if (o = Hf("meta", "content", i).get(r + (n.content || ""))) {
												for (s = 0; s < o.length; s++) if (a = o[s], a.getAttribute("content") === (n.content == null ? null : "" + n.content) && a.getAttribute("name") === (n.name == null ? null : n.name) && a.getAttribute("property") === (n.property == null ? null : n.property) && a.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && a.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
													o.splice(s, 1);
													break b;
												}
											}
											a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
											break;
										default: throw Error(c(468, r));
									}
									a[ft] = e, Tt(a), r = a;
								}
								e.stateNode = r;
							} else Uf(i, e.type, e.stateNode);
						} else e.stateNode = Lf(i, r, e.memoizedProps);
					} else a === r ? r === null && e.stateNode !== null && Xc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Uf(i, e.type, e.stateNode) : Lf(i, r, e.memoizedProps));
				}
				break;
			case 27:
				_l(t, e), bl(e), r & 512 && (rl || n === null || Jc(n, n.return)), n !== null && r & 4 && Xc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (_l(t, e), bl(e), r & 512 && (rl || n === null || Jc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Zt(i, "");
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Xc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (il = !0);
				break;
			case 6:
				if (_l(t, e), bl(e), r & 4) {
					if (e.stateNode === null) throw Error(c(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Vf = null, i = vl, vl = _f(t.containerInfo), _l(t, e), vl = i, bl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Pp(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				il && (il = !1, xl(e));
				break;
			case 4:
				r = vl, vl = _f(e.stateNode.containerInfo), _l(t, e), bl(e), vl = r;
				break;
			case 12:
				_l(t, e), bl(e);
				break;
			case 31:
				_l(t, e), bl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, gl(e, r)));
				break;
			case 13:
				_l(t, e), bl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (eu = je()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, gl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = nl, d = rl;
				if (nl = u || i, rl = d || l, _l(t, e), rl = d, nl = u, bl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || nl || rl || Cl(e)), n = null, t = e;;) {
					if (t.tag === 5 || t.tag === 26) {
						if (n === null) {
							l = n = t;
							try {
								if (a = l.stateNode, i) o = a.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none";
								else {
									s = l.stateNode;
									var f = l.memoizedProps.style, p = f != null && f.hasOwnProperty("display") ? f.display : null;
									s.style.display = p == null || typeof p == "boolean" ? "" : ("" + p).trim();
								}
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? ef(m, !0) : ef(l.stateNode, !1);
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
						t.child.return = t, t = t.child;
						continue;
					}
					if (t === e) break a;
					for (; t.sibling === null;) {
						if (t.return === null || t.return === e) break a;
						n === t && (n = null), t = t.return;
					}
					n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
				}
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, gl(e, n))));
				break;
			case 19:
				_l(t, e), bl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, gl(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: _l(t, e), bl(e);
		}
	}
	function bl(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Zc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(c(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						el(e, Qc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Zt(a, ""), n.flags &= -33), el(e, Qc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						$c(e, Qc(e), o);
						break;
					default: throw Error(c(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function xl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			xl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function Sl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) cl(e, t.alternate, t), t = t.sibling;
	}
	function Cl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Wc(4, t, t.return), Cl(t);
					break;
				case 1:
					Jc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Kc(t, t.return, n), Cl(t);
					break;
				case 27: mf(t.stateNode);
				case 26:
				case 5:
					Jc(t, t.return), Cl(t);
					break;
				case 22:
					t.memoizedState === null && Cl(t);
					break;
				case 30:
					Cl(t);
					break;
				default: Cl(t);
			}
			e = e.sibling;
		}
	}
	function wl(e, t, n) {
		for (n &&= !!(t.subtreeFlags & 8772), t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					wl(i, a, n), Uc(4, a);
					break;
				case 1:
					if (wl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) eo(c[i], s);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					n && o & 64 && Gc(a), qc(a, a.return);
					break;
				case 27: tl(a);
				case 26:
				case 5:
					wl(i, a, n), n && r === null && o & 4 && Yc(a), qc(a, a.return);
					break;
				case 12:
					wl(i, a, n);
					break;
				case 31:
					wl(i, a, n), n && o & 4 && pl(i, a);
					break;
				case 13:
					wl(i, a, n), n && o & 4 && ml(i, a);
					break;
				case 22:
					a.memoizedState === null && wl(i, a, n), qc(a, a.return);
					break;
				case 30: break;
				default: wl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Tl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && pa(n));
	}
	function El(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && pa(e));
	}
	function Dl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) Ol(e, t, n, r), t = t.sibling;
	}
	function Ol(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Dl(e, t, n, r), i & 2048 && Uc(9, t);
				break;
			case 1:
				Dl(e, t, n, r);
				break;
			case 3:
				Dl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && pa(e)));
				break;
			case 12:
				if (i & 2048) {
					Dl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else Dl(e, t, n, r);
				break;
			case 31:
				Dl(e, t, n, r);
				break;
			case 13:
				Dl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? Dl(e, t, n, r) : (a._visibility |= 2, kl(e, t, n, r, !!(t.subtreeFlags & 10256) || !1)) : a._visibility & 2 ? Dl(e, t, n, r) : Al(e, t), i & 2048 && Tl(o, t);
				break;
			case 24:
				Dl(e, t, n, r), i & 2048 && El(t.alternate, t);
				break;
			default: Dl(e, t, n, r);
		}
	}
	function kl(e, t, n, r, i) {
		for (i &&= !!(t.subtreeFlags & 10256) || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					kl(a, o, s, c, i), Uc(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, kl(a, o, s, c, i)) : u._visibility & 2 ? kl(a, o, s, c, i) : Al(a, o), i && l & 2048 && Tl(o.alternate, o);
					break;
				case 24:
					kl(a, o, s, c, i), i && l & 2048 && El(o.alternate, o);
					break;
				default: kl(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Al(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Al(n, r), i & 2048 && Tl(r.alternate, r);
					break;
				case 24:
					Al(n, r), i & 2048 && El(r.alternate, r);
					break;
				default: Al(n, r);
			}
			t = t.sibling;
		}
	}
	var jl = 8192;
	function Ml(e, t, n) {
		if (e.subtreeFlags & jl) for (e = e.child; e !== null;) Nl(e, t, n), e = e.sibling;
	}
	function Nl(e, t, n) {
		switch (e.tag) {
			case 26:
				Ml(e, t, n), e.flags & jl && e.memoizedState !== null && Kf(n, vl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				Ml(e, t, n);
				break;
			case 3:
			case 4:
				var r = vl;
				vl = _f(e.stateNode.containerInfo), Ml(e, t, n), vl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = jl, jl = 16777216, Ml(e, t, n), jl = r) : Ml(e, t, n));
				break;
			default: Ml(e, t, n);
		}
	}
	function Pl(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Fl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				ol = r, Rl(r, e);
			}
			Pl(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Il(e), e = e.sibling;
	}
	function Il(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Fl(e), e.flags & 2048 && Wc(9, e, e.return);
				break;
			case 3:
				Fl(e);
				break;
			case 12:
				Fl(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ll(e)) : Fl(e);
				break;
			default: Fl(e);
		}
	}
	function Ll(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				ol = r, Rl(r, e);
			}
			Pl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Wc(8, t, t.return), Ll(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ll(t));
					break;
				default: Ll(t);
			}
			e = e.sibling;
		}
	}
	function Rl(e, t) {
		for (; ol !== null;) {
			var n = ol;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Wc(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: pa(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, ol = r;
			else a: for (n = e; ol !== null;) {
				r = ol;
				var i = r.sibling, a = r.return;
				if (ll(r), r === n) {
					ol = null;
					break a;
				}
				if (i !== null) {
					i.return = a, ol = i;
					break a;
				}
				ol = a;
			}
		}
	}
	var zl = {
		getCacheForType: function(e) {
			var t = oa(I), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return oa(I).controller.signal;
		}
	}, Bl = typeof WeakMap == "function" ? WeakMap : Map, G = 0, K = null, q = null, J = 0, Y = 0, Vl = null, Hl = !1, Ul = !1, Wl = !1, Gl = 0, X = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = 0, Zl = null, Ql = null, $l = !1, eu = 0, tu = 0, nu = Infinity, ru = null, iu = null, au = 0, ou = null, su = null, cu = 0, lu = 0, uu = null, du = null, fu = 0, pu = null;
	function mu() {
		return G & 2 && J !== 0 ? J & -J : A.T === null ? lt() : fd();
	}
	function hu() {
		if (Yl === 0) {
			if (!(J & 536870912) || F) {
				var e = Je;
				Je <<= 1, !(Je & 3932160) && (Je = 262144), Yl = e;
			} else Yl = 536870912;
		}
		return e = so.current, e !== null && (e.flags |= 32), Yl;
	}
	function gu(e, t, n) {
		(e === K && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) && (Cu(e, 0), bu(e, J, Yl, !1)), nt(e, n), (!(G & 2) || e !== K) && (e === K && (!(G & 2) && (ql |= n), X === 4 && bu(e, J, Yl, !1)), id(e));
	}
	function _u(e, t, n) {
		if (G & 6) throw Error(c(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || Qe(e, t), i = r ? ju(e, t) : ku(e, t, !0), a = r;
		do {
			if (i === 0) {
				Ul && !r && bu(e, t, 0, !1);
				break;
			}
			if (n = e.current.alternate, a && !yu(n)) {
				i = ku(e, t, !1), a = !1;
				continue;
			}
			if (i === 2) {
				if (a = t, e.errorRecoveryDisabledLanes & a) var o = 0;
				else o = e.pendingLanes & -536870913, o = o === 0 ? o & 536870912 ? 536870912 : 0 : o;
				if (o !== 0) {
					t = o;
					a: {
						var s = e;
						i = Zl;
						var l = s.current.memoizedState.isDehydrated;
						if (l && (Cu(s, o).flags |= 256), o = ku(s, o, !1), o !== 2) {
							if (Wl && !l) {
								s.errorRecoveryDisabledLanes |= a, ql |= a, i = 4;
								break a;
							}
							a = Ql, Ql = i, a !== null && (Ql === null ? Ql = a : Ql.push.apply(Ql, a));
						}
						i = o;
					}
					if (a = !1, i !== 2) continue;
				}
			}
			if (i === 1) {
				Cu(e, 0), bu(e, t, 0, !0);
				break;
			}
			a: {
				switch (r = e, a = i, a) {
					case 0:
					case 1: throw Error(c(345));
					case 4: if ((t & 4194048) !== t) break;
					case 6:
						bu(r, t, Yl, !Hl);
						break a;
					case 2:
						Ql = null;
						break;
					case 3:
					case 5: break;
					default: throw Error(c(329));
				}
				if ((t & 62914560) === t && (i = eu + 300 - je(), 10 < i)) {
					if (bu(r, t, Yl, !Hl), Ze(r, 0, !0) !== 0) break a;
					cu = t, r.timeoutHandle = qd(vu.bind(null, r, n, Ql, ru, $l, t, Yl, ql, Xl, Hl, a, "Throttled", -0, 0), i);
					break a;
				}
				vu(r, n, Ql, ru, $l, t, Yl, ql, Xl, Hl, a, null, -0, 0);
			}
			break;
		} while (1);
		id(e);
	}
	function vu(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		if (e.timeoutHandle = -1, d = t.subtreeFlags, d & 8192 || (d & 16785408) == 16785408) {
			d = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: on
			}, Nl(t, a, d);
			var m = (a & 62914560) === a ? eu - je() : (a & 4194048) === a ? tu - je() : 0;
			if (m = Jf(d, m), m !== null) {
				cu = a, e.cancelPendingCommit = m(Ru.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), bu(e, a, o, !l);
				return;
			}
		}
		Ru(e, t, a, n, r, i, o, s, c);
	}
	function yu(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!Or(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function bu(e, t, n, r) {
		t &= ~Jl, t &= ~ql, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Ue(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && it(e, n, t);
	}
	function xu() {
		return G & 6 ? !0 : (ad(0, !1), !1);
	}
	function Su() {
		if (q !== null) {
			if (Y === 0) var e = q.return;
			else e = q, Qi = Zi = null, jo(e), Ia = null, La = 0, e = q;
			for (; e !== null;) Hc(e.alternate, e), e = e.return;
			q = null;
		}
	}
	function Cu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), cu = 0, Su(), K = e, q = n = gi(e.current, null), J = t, Y = 0, Vl = null, Hl = !1, Ul = Qe(e, t), Wl = !1, Xl = Yl = Jl = ql = Kl = X = 0, Ql = Zl = null, $l = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Ue(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Gl = t, oi(), n;
	}
	function wu(e, t) {
		R = null, A.H = Bs, t === Ea || t === Oa ? (t = Pa(), Y = 3) : t === Da ? (t = Pa(), Y = 4) : Y = t === ic ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Vl = t, q === null && (X = 1, Qs(e, wi(t, e.current)));
	}
	function Tu() {
		var e = so.current;
		return e === null ? !0 : (J & 4194048) === J ? co === null : (J & 62914560) === J || J & 536870912 ? e === co : !1;
	}
	function Eu() {
		var e = A.H;
		return A.H = Bs, e === null ? Bs : e;
	}
	function Du() {
		var e = A.A;
		return A.A = zl, e;
	}
	function Ou() {
		X = 4, Hl || (J & 4194048) !== J && so.current !== null || (Ul = !0), !(Kl & 134217727) && !(ql & 134217727) || K === null || bu(K, J, Yl, !1);
	}
	function ku(e, t, n) {
		var r = G;
		G |= 2;
		var i = Eu(), a = Du();
		(K !== e || J !== t) && (ru = null, Cu(e, t)), t = !1;
		var o = X;
		a: do
			try {
				if (Y !== 0 && q !== null) {
					var s = q, c = Vl;
					switch (Y) {
						case 8:
							Su(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							so.current === null && (t = !0);
							var l = Y;
							if (Y = 0, Vl = null, Fu(e, s, c, l), n && Ul) {
								o = 0;
								break a;
							}
							break;
						default: l = Y, Y = 0, Vl = null, Fu(e, s, c, l);
					}
				}
				Au(), o = X;
				break;
			} catch (t) {
				wu(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Qi = Zi = null, G = r, A.H = i, A.A = a, q === null && (K = null, J = 0, oi()), o;
	}
	function Au() {
		for (; q !== null;) Nu(q);
	}
	function ju(e, t) {
		var n = G;
		G |= 2;
		var r = Eu(), i = Du();
		K !== e || J !== t ? (ru = null, nu = je() + 500, Cu(e, t)) : Ul = Qe(e, t);
		a: do
			try {
				if (Y !== 0 && q !== null) {
					t = q;
					var a = Vl;
					b: switch (Y) {
						case 1:
							Y = 0, Vl = null, Fu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (Aa(a)) {
								Y = 0, Vl = null, Pu(t);
								break;
							}
							t = function() {
								Y !== 2 && Y !== 9 || K !== e || (Y = 7), id(e);
							}, a.then(t, t);
							break a;
						case 3:
							Y = 7;
							break a;
						case 4:
							Y = 5;
							break a;
						case 7:
							Aa(a) ? (Y = 0, Vl = null, Pu(t)) : (Y = 0, Vl = null, Fu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (q.tag) {
								case 26: o = q.memoizedState;
								case 5:
								case 27:
									var s = q;
									if (o ? Gf(o) : s.stateNode.complete) {
										Y = 0, Vl = null;
										var l = s.sibling;
										if (l !== null) q = l;
										else {
											var u = s.return;
											u === null ? q = null : (q = u, Iu(u));
										}
										break b;
									}
							}
							Y = 0, Vl = null, Fu(e, t, a, 5);
							break;
						case 6:
							Y = 0, Vl = null, Fu(e, t, a, 6);
							break;
						case 8:
							Su(), X = 6;
							break a;
						default: throw Error(c(462));
					}
				}
				Mu();
				break;
			} catch (t) {
				wu(e, t);
			}
		while (1);
		return Qi = Zi = null, A.H = r, A.A = i, G = n, q === null ? (K = null, J = 0, oi(), X) : 0;
	}
	function Mu() {
		for (; q !== null && !ke();) Nu(q);
	}
	function Nu(e) {
		var t = Pc(e.alternate, e, Gl);
		e.memoizedProps = e.pendingProps, t === null ? Iu(e) : q = t;
	}
	function Pu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = vc(n, t, t.pendingProps, t.type, void 0, J);
				break;
			case 11:
				t = vc(n, t, t.pendingProps, t.type.render, t.ref, J);
				break;
			case 5: jo(t);
			default: Hc(n, t), t = q = _i(t, Gl), t = Pc(n, t, Gl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Iu(e) : q = t;
	}
	function Fu(e, t, n, r) {
		Qi = Zi = null, jo(t), Ia = null, La = 0;
		var i = t.return;
		try {
			if (rc(e, i, t, n, J)) {
				X = 1, Qs(e, wi(n, e.current)), q = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw q = i, t;
			X = 1, Qs(e, wi(n, e.current)), q = null;
			return;
		}
		t.flags & 32768 ? (F || r === 1 ? e = !0 : Ul || J & 536870912 ? e = !1 : (Hl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = so.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Lu(t, e)) : Iu(t);
	}
	function Iu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Lu(t, Hl);
				return;
			}
			e = t.return;
			var n = Bc(t.alternate, t, Gl);
			if (n !== null) {
				q = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				q = t;
				return;
			}
			q = t = e;
		} while (t !== null);
		X === 0 && (X = 5);
	}
	function Lu(e, t) {
		do {
			var n = Vc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, q = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				q = e;
				return;
			}
			q = e = n;
		} while (e !== null);
		X = 6, q = null;
	}
	function Ru(e, t, n, r, i, a, o, s, l) {
		e.cancelPendingCommit = null;
		do
			Uu();
		while (au !== 0);
		if (G & 6) throw Error(c(327));
		if (t !== null) {
			if (t === e.current) throw Error(c(177));
			if (a = t.lanes | t.childLanes, a |= ai, rt(e, n, a, o, s, l), e === K && (q = K = null, J = 0), su = t, ou = e, cu = n, lu = a, uu = i, du = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Zu(Fe, function() {
				return Wu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
				r = A.T, A.T = null, i = j.p, j.p = 2, o = G, G |= 4;
				try {
					sl(e, t, n);
				} finally {
					G = o, j.p = i, A.T = r;
				}
			}
			au = 1, zu(), Bu(), Vu();
		}
	}
	function zu() {
		if (au === 1) {
			au = 0;
			var e = ou, t = su, n = !!(t.flags & 13878);
			if (t.subtreeFlags & 13878 || n) {
				n = A.T, A.T = null;
				var r = j.p;
				j.p = 2;
				var i = G;
				G |= 4;
				try {
					yl(t, e);
					var a = Bd, o = Nr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && Mr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Pr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = jr(s, h), v = jr(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					cp = !!zd, Bd = zd = null;
				} finally {
					G = i, j.p = r, A.T = n;
				}
			}
			e.current = t, au = 2;
		}
	}
	function Bu() {
		if (au === 2) {
			au = 0;
			var e = ou, t = su, n = !!(t.flags & 8772);
			if (t.subtreeFlags & 8772 || n) {
				n = A.T, A.T = null;
				var r = j.p;
				j.p = 2;
				var i = G;
				G |= 4;
				try {
					cl(e, t.alternate, t);
				} finally {
					G = i, j.p = r, A.T = n;
				}
			}
			au = 3;
		}
	}
	function Vu() {
		if (au === 4 || au === 3) {
			au = 0, Ae();
			var e = ou, t = su, n = cu, r = du;
			t.subtreeFlags & 10256 || t.flags & 10256 ? au = 5 : (au = 0, su = ou = null, Hu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (iu = null), ct(n), t = t.stateNode, Ve && typeof Ve.onCommitFiberRoot == "function") try {
				Ve.onCommitFiberRoot(Be, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = A.T, i = j.p, j.p = 2, A.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					A.T = t, j.p = i;
				}
			}
			cu & 3 && Uu(), id(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === pu ? fu++ : (fu = 0, pu = e) : fu = 0, ad(0, !1);
		}
	}
	function Hu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, pa(t)));
	}
	function Uu() {
		return zu(), Bu(), Vu(), Wu();
	}
	function Wu() {
		if (au !== 5) return !1;
		var e = ou, t = lu;
		lu = 0;
		var n = ct(cu), r = A.T, i = j.p;
		try {
			j.p = 32 > n ? 32 : n, A.T = null, n = uu, uu = null;
			var a = ou, o = cu;
			if (au = 0, su = ou = null, cu = 0, G & 6) throw Error(c(331));
			var s = G;
			if (G |= 4, Il(a.current), Ol(a, a.current, o, n), G = s, ad(0, !1), Ve && typeof Ve.onPostCommitFiberRoot == "function") try {
				Ve.onPostCommitFiberRoot(Be, a);
			} catch {}
			return !0;
		} finally {
			j.p = i, A.T = r, Hu(e, t);
		}
	}
	function Gu(e, t, n) {
		t = wi(n, t), t = ec(e.stateNode, t, 2), e = Ja(e, t, 2), e !== null && (nt(e, 2), id(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) Gu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Gu(t, e, n);
				break;
			}
			if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (iu === null || !iu.has(r))) {
					e = wi(n, e), n = tc(2), r = Ja(t, n, 2), r !== null && (nc(n, r, t, e), nt(r, 2), id(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Bl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Wl = !0, i.add(n), e = qu.bind(null, e, t, n), t.then(e, e));
	}
	function qu(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, K === e && (J & n) === n && (X === 4 || X === 3 && (J & 62914560) === J && 300 > je() - eu ? !(G & 2) && Cu(e, 0) : Jl |= n, Xl === J && (Xl = 0)), id(e);
	}
	function Ju(e, t) {
		t === 0 && (t = et()), e = li(e, t), e !== null && (nt(e, t), id(e));
	}
	function Yu(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), Ju(e, n);
	}
	function Xu(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(c(314));
		}
		r !== null && r.delete(t), Ju(e, n);
	}
	function Zu(e, t) {
		return De(e, t);
	}
	var Qu = null, $u = null, ed = !1, td = !1, nd = !1, rd = 0;
	function id(e) {
		e !== $u && e.next === null && ($u === null ? Qu = $u = e : $u = $u.next = e), td = !0, ed || (ed = !0, dd());
	}
	function ad(e, t) {
		if (!nd && td) {
			nd = !0;
			do
				for (var n = !1, r = Qu; r !== null;) {
					if (!t) {
						if (e !== 0) {
							var i = r.pendingLanes;
							if (i === 0) var a = 0;
							else {
								var o = r.suspendedLanes, s = r.pingedLanes;
								a = (1 << 31 - Ue(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, ud(r, a));
						} else a = J, a = Ze(r, r === K ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Qe(r, a) || (n = !0, ud(r, a));
					}
					r = r.next;
				}
			while (n);
			nd = !1;
		}
	}
	function od() {
		sd();
	}
	function sd() {
		td = ed = !1;
		var e = 0;
		rd !== 0 && Kd() && (e = rd);
		for (var t = je(), n = null, r = Qu; r !== null;) {
			var i = r.next, a = cd(r, t);
			a === 0 ? (r.next = null, n === null ? Qu = i : n.next = i, i === null && ($u = n)) : (n = r, (e !== 0 || a & 3) && (td = !0)), r = i;
		}
		au !== 0 && au !== 5 || ad(e, !1), rd !== 0 && (rd = 0);
	}
	function cd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ue(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = $e(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = K, n = J, n = Ze(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Oe(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Qe(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Oe(r), ct(n)) {
				case 2:
				case 8:
					n = Pe;
					break;
				case 32:
					n = Fe;
					break;
				case 268435456:
					n = Le;
					break;
				default: n = Fe;
			}
			return r = ld.bind(null, e), n = De(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Oe(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function ld(e, t) {
		if (au !== 0 && au !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Uu() && e.callbackNode !== n) return null;
		var r = J;
		return r = Ze(e, e === K ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (_u(e, r, t), cd(e, je()), e.callbackNode != null && e.callbackNode === n ? ld.bind(null, e) : null);
	}
	function ud(e, t) {
		if (Uu()) return null;
		_u(e, t, !0);
	}
	function dd() {
		Xd(function() {
			G & 6 ? De(Ne, od) : sd();
		});
	}
	function fd() {
		if (rd === 0) {
			var e = ga;
			e === 0 && (e = qe, qe <<= 1, !(qe & 261888) && (qe = 256)), rd = e;
		}
		return rd;
	}
	function pd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : an("" + e);
	}
	function md(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function hd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = pd((i[pt] || null).action), o = r.submitter;
			o && (t = (t = o[pt] || null) ? pd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new Dn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (rd !== 0) {
								var e = o ? md(i, o) : new FormData(i);
								Es(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? md(i, o) : new FormData(i), Es(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var gd = 0; gd < ei.length; gd++) {
		var _d = ei[gd];
		ti(_d.toLowerCase(), "on" + (_d[0].toUpperCase() + _d.slice(1)));
	}
	ti(Kr, "onAnimationEnd"), ti(qr, "onAnimationIteration"), ti(Jr, "onAnimationStart"), ti("dblclick", "onDoubleClick"), ti("focusin", "onFocus"), ti("focusout", "onBlur"), ti(Yr, "onTransitionRun"), ti(Xr, "onTransitionStart"), ti(Zr, "onTransitionCancel"), ti(Qr, "onTransitionEnd"), kt("onMouseEnter", ["mouseout", "mouseover"]), kt("onMouseLeave", ["mouseout", "mouseover"]), kt("onPointerEnter", ["pointerout", "pointerover"]), kt("onPointerLeave", ["pointerout", "pointerover"]), Ot("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Ot("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Ot("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Ot("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Ot("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Ot("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var vd = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), yd = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(vd));
	function bd(e, t) {
		t = !!(t & 4);
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						ni(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						ni(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[ht];
		n === void 0 && (n = t[ht] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (wd(t, e, 2, !1), n.add(r));
	}
	function xd(e, t, n) {
		var r = 0;
		t && (r |= 4), wd(n, e, r, t);
	}
	var Sd = "_reactListening" + Math.random().toString(36).slice(2);
	function Cd(e) {
		if (!e[Sd]) {
			e[Sd] = !0, Et.forEach(function(t) {
				t !== "selectionchange" && (yd.has(t) || xd(t, !1, e), xd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Sd] || (t[Sd] = !0, xd("selectionchange", !1, t));
		}
	}
	function wd(e, t, n, r) {
		switch (hp(t)) {
			case 2:
				var i = lp;
				break;
			case 8:
				i = up;
				break;
			default: i = dp;
		}
		n = i.bind(null, t, n, e), i = void 0, !gn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Td(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && o.stateNode.containerInfo === i) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = xt(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		pn(function() {
			var r = a, i = cn(n), o = [];
			a: {
				var s = $r.get(e);
				if (s !== void 0) {
					var c = Dn, l = e;
					switch (e) {
						case "keypress": if (Sn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Gn;
							break;
						case "focusin":
							l = "focus", c = In;
							break;
						case "focusout":
							l = "blur", c = In;
							break;
						case "beforeblur":
						case "afterblur":
							c = In;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = Pn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Fn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = qn;
							break;
						case Kr:
						case qr:
						case Jr:
							c = Ln;
							break;
						case Qr:
							c = Jn;
							break;
						case "scroll":
						case "scrollend":
							c = kn;
							break;
						case "wheel":
							c = Yn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Rn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Kn;
							break;
						case "toggle":
						case "beforetoggle": c = Xn;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = mn(m, p), g != null && d.push(Ed(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (s = new c(s, l, null, n, i), o.push({
						event: s,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== sn && (l = n.relatedTarget || n.fromElement) && (xt(l) || l[mt])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? xt(l) : null, l !== null && (f = u(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (d = Pn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Kn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : Ct(c), h = l == null ? s : Ct(l), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, xt(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && l) b: {
							for (d = Od, p = c, m = l, h = 0, g = p; g; g = d(g)) h++;
							g = 0;
							for (var _ = m; _; _ = d(_)) g++;
							for (; 0 < h - g;) p = d(p), h--;
							for (; 0 < g - h;) m = d(m), g--;
							for (; h--;) {
								if (p === m || m !== null && p === m.alternate) {
									d = p;
									break b;
								}
								p = d(p), m = d(m);
							}
							d = null;
						}
						else d = null;
						c !== null && kd(o, s, c, d, !1), l !== null && f !== null && kd(o, f, l, d, !0);
					}
				}
				a: {
					if (s = r ? Ct(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = gr;
					else if (ur(s)) {
						if (_r) v = Er;
						else {
							v = wr;
							var y = Cr;
						}
					} else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && tn(r.elementType) && (v = gr) : v = Tr;
					if (v &&= v(e, r)) {
						dr(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && qt(s, "number", s.value);
				}
				switch (y = r ? Ct(r) : window, e) {
					case "focusin":
						(ur(y) || y.contentEditable === "true") && (Ir = y, Lr = r, Rr = null);
						break;
					case "focusout":
						Rr = Lr = Ir = null;
						break;
					case "mousedown":
						zr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						zr = !1, Br(o, n, i);
						break;
					case "selectionchange": if (Fr) break;
					case "keydown":
					case "keyup": Br(o, n, i);
				}
				var b;
				if (Qn) b: {
					switch (e) {
						case "compositionstart":
							var x = "onCompositionStart";
							break b;
						case "compositionend":
							x = "onCompositionEnd";
							break b;
						case "compositionupdate":
							x = "onCompositionUpdate";
							break b;
					}
					x = void 0;
				}
				else or ? ir(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (tr && n.locale !== "ko" && (or || x !== "onCompositionStart" ? x === "onCompositionEnd" && or && (b = xn()) : (vn = i, yn = "value" in vn ? vn.value : vn.textContent, or = !0)), y = Dd(r, x), 0 < y.length && (x = new zn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = ar(n), b !== null && (x.data = b)))), (b = er ? sr(e, n) : cr(e, n)) && (x = Dd(r, "onBeforeInput"), 0 < x.length && (y = new zn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: y,
					listeners: x
				}), y.data = b)), hd(o, e, r, n, i);
			}
			bd(o, t);
		});
	}
	function Ed(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Dd(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = mn(e, n), i != null && r.unshift(Ed(e, i, a)), i = mn(e, t), i != null && r.push(Ed(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Od(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function kd(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = mn(n, a), l != null && o.unshift(Ed(n, l, c))) : i || (l = mn(n, a), l != null && o.push(Ed(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Ad = /\r\n?/g, jd = /\u0000|\uFFFD/g;
	function Md(e) {
		return (typeof e == "string" ? e : "" + e).replace(Ad, "\n").replace(jd, "");
	}
	function Nd(e, t) {
		return t = Md(t), Md(e) === t;
	}
	function $(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Zt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Zt(e, "" + r);
				break;
			case "className":
				Ft(e, "class", r);
				break;
			case "tabIndex":
				Ft(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Ft(e, n, r);
				break;
			case "style":
				en(e, r, a);
				break;
			case "data": if (t !== "object") {
				Ft(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href")) {
					e.removeAttribute(n);
					break;
				}
				if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = an("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				}
				if (typeof a == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", i.name, i, null), $(e, t, "formEncType", i.formEncType, i, null), $(e, t, "formMethod", i.formMethod, i, null), $(e, t, "formTarget", i.formTarget, i, null)) : ($(e, t, "encType", i.encType, i, null), $(e, t, "method", i.method, i, null), $(e, t, "target", i.target, i, null))), r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = an("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = on);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(c(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(c(60));
						e.innerHTML = n;
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = an("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "" + r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), Pt(e, "popover", r);
				break;
			case "xlinkActuate":
				It(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				It(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				It(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				It(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				It(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				It(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				It(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				It(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				It(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Pt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = nn.get(n) || n, Pt(e, n, r));
		}
	}
	function Pd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				en(e, r, a);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(c(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(c(60));
						e.innerHTML = n;
					}
				}
				break;
			case "children":
				typeof r == "string" ? Zt(e, r) : (typeof r == "number" || typeof r == "bigint") && Zt(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = on);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!Dt.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[pt] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Pt(e, n, r);
			}
		}
	}
	function Fd(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, i = !1, a;
				for (a in n) if (n.hasOwnProperty(a)) {
					var o = n[a];
					if (o != null) switch (a) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							i = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(c(137, t));
						default: $(e, t, a, o, n, null);
					}
				}
				i && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var s = a = o = i = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							i = d;
							break;
						case "type":
							o = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							a = d;
							break;
						case "defaultValue":
							s = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(c(137, t));
							break;
						default: $(e, t, r, d, n, null);
					}
				}
				Kt(e, a, s, l, u, o, i, !1);
				return;
			case "select":
				for (i in Q("invalid", e), r = o = a = null, n) if (n.hasOwnProperty(i) && (s = n[i], s != null)) switch (i) {
					case "value":
						a = s;
						break;
					case "defaultValue":
						o = s;
						break;
					case "multiple": r = s;
					default: $(e, t, i, s, n, null);
				}
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Jt(e, !!r, n, !0) : Jt(e, !!r, t, !1);
				return;
			case "textarea":
				for (o in Q("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(o) && (s = n[o], s != null)) switch (o) {
					case "value":
						r = s;
						break;
					case "defaultValue":
						i = s;
						break;
					case "children":
						a = s;
						break;
					case "dangerouslySetInnerHTML":
						if (s != null) throw Error(c(91));
						break;
					default: $(e, t, o, s, n, null);
				}
				Xt(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < vd.length; r++) Q(vd[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(c(137, t));
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (tn(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Pd(e, t, d, r, n, void 0));
				return;
			}
		}
		for (s in n) n.hasOwnProperty(s) && (r = n[s], r != null && $(e, t, s, r, n, null));
	}
	function Id(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var i = null, a = null, o = null, s = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							a = m;
							break;
						case "name":
							i = m;
							break;
						case "checked":
							u = m;
							break;
						case "defaultChecked":
							d = m;
							break;
						case "value":
							o = m;
							break;
						case "defaultValue":
							s = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(c(137, t));
							break;
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				Gt(e, o, s, l, u, d, a, i);
				return;
			case "select":
				for (a in m = o = s = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || $(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						s = a;
						break;
					case "multiple": o = a;
					default: a !== l && $(e, t, i, a, r, l);
				}
				t = s, n = o, r = m, p == null ? !!r != !!n && (t == null ? Jt(e, !!n, n ? [] : "", !1) : Jt(e, !!n, t, !0)) : Jt(e, !!n, p, !1);
				return;
			case "textarea":
				for (s in m = p = null, n) if (i = n[s], n.hasOwnProperty(s) && i != null && !r.hasOwnProperty(s)) switch (s) {
					case "value": break;
					case "children": break;
					default: $(e, t, s, null, r, i);
				}
				for (o in r) if (i = r[o], a = n[o], r.hasOwnProperty(o) && (i != null || a != null)) switch (o) {
					case "value":
						p = i;
						break;
					case "defaultValue":
						m = i;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (i != null) throw Error(c(91));
						break;
					default: i !== a && $(e, t, o, i, r, a);
				}
				Yt(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(c(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (tn(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Pd(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Pd(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
	}
	function Ld(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function Rd() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && Ld(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && Ld(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var zd = null, Bd = null;
	function Vd(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function Hd(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function Ud(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function Wd(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Gd = null;
	function Kd() {
		var e = window.event;
		return e && e.type === "popstate" ? e !== Gd && (Gd = e, !0) : (Gd = null, !1);
	}
	var qd = typeof setTimeout == "function" ? setTimeout : void 0, Jd = typeof clearTimeout == "function" ? clearTimeout : void 0, Yd = typeof Promise == "function" ? Promise : void 0, Xd = typeof queueMicrotask == "function" ? queueMicrotask : Yd === void 0 ? qd : function(e) {
		return Yd.resolve(null).then(e).catch(Zd);
	};
	function Zd(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Qd(e) {
		return e === "head";
	}
	function $d(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) {
				if (n = i.data, n === "/$" || n === "/&") {
					if (r === 0) {
						e.removeChild(i), Pp(t);
						return;
					}
					r--;
				} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
				else if (n === "html") mf(e.ownerDocument.documentElement);
				else if (n === "head") {
					n = e.ownerDocument.head, mf(n);
					for (var a = n.firstChild; a;) {
						var o = a.nextSibling, s = a.nodeName;
						a[yt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
					}
				} else n === "body" && mf(e.ownerDocument.body);
			}
			n = i;
		} while (n);
		Pp(t);
	}
	function ef(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) {
				if (n = r.data, n === "/$") {
					if (e === 0) break;
					e--;
				} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			}
			n = r;
		} while (n);
	}
	function tf(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					tf(n), bt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function nf(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) {
				if (t === "input" && e.type === "hidden") {
					var a = i.name == null ? null : "" + i.name;
					if (i.type === "hidden" && e.getAttribute("name") === a) return e;
				} else return e;
			} else if (!e[yt]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lf(e.nextSibling), e === null) break;
		}
		return null;
	}
	function rf(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lf(e.nextSibling), e === null)) return null;
		return e;
	}
	function af(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lf(e.nextSibling), e === null)) return null;
		return e;
	}
	function of(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sf(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cf(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lf(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var uf = null;
	function df(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lf(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function ff(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pf(e, t, n) {
		switch (t = Vd(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(c(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(c(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(c(454));
				return e;
			default: throw Error(c(451));
		}
	}
	function mf(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		bt(e);
	}
	var hf = /* @__PURE__ */ new Map(), gf = /* @__PURE__ */ new Set();
	function _f(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var vf = j.d;
	j.d = {
		f: yf,
		r: bf,
		D: Cf,
		C: wf,
		L: Tf,
		m: Ef,
		X: Of,
		S: Df,
		M: kf
	};
	function yf() {
		var e = vf.f(), t = xu();
		return e || t;
	}
	function bf(e) {
		var t = St(e);
		t !== null && t.tag === 5 && t.type === "form" ? Os(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = Wt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), Tt(t), r.head.appendChild(t)));
		}
	}
	function Cf(e) {
		vf.D(e), Sf("dns-prefetch", e, null);
	}
	function wf(e, t) {
		vf.C(e, t), Sf("preconnect", e, t);
	}
	function Tf(e, t, n) {
		vf.L(e, t, n);
		var r = xf;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + Wt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Wt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Wt(n.imageSizes) + "\"]")) : i += "[href=\"" + Wt(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = jf(e);
					break;
				case "script": a = Ff(e);
			}
			hf.has(a) || (e = g({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), Tt(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Wt(r) + "\"][href=\"" + Wt(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Ff(e);
			}
			if (!hf.has(a) && (e = g({
				rel: "modulepreload",
				href: e
			}, t), hf.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(If(a))) return;
				}
				r = n.createElement("link"), Fd(r, "link", e), Tt(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = wt(r).hoistableStyles, a = jf(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Mf(a))) s.loading = 5;
				else {
					e = g({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = hf.get(a)) && zf(e, n);
					var c = o = r.createElement("link");
					Tt(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Rf(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Of(e, t) {
		vf.X(e, t);
		var n = xf;
		if (n && e) {
			var r = wt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = g({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), Tt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t) {
		vf.M(e, t);
		var n = xf;
		if (n && e) {
			var r = wt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = g({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), Tt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var i = (i = pe.current) ? _f(i) : null;
		if (!i) throw Error(c(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = wt(i).hoistableStyles, r = n.get(t), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = jf(n.href);
					var a = wt(i).hoistableStyles, o = a.get(e);
					if (o || (i = i.ownerDocument || i, o = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, o), (a = i.querySelector(Mf(e))) && !a._p && (o.instance = a, o.state.loading = 5), hf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, hf.set(e, n), a || Pf(i, e, n, o.state))), t && r === null) throw Error(c(528, ""));
					return o;
				}
				if (t && r !== null) throw Error(c(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = wt(i).hoistableScripts, r = n.get(t), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(c(444, e));
		}
	}
	function jf(e) {
		return "href=\"" + Wt(e) + "\"";
	}
	function Mf(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Nf(e) {
		return g({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Pf(e, t, n, r) {
		e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]") ? r.loading = 1 : (t = e.createElement("link"), r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		}), Fd(t, "link", n), Tt(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + Wt(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Wt(n.href) + "\"]");
				if (r) return t.instance = r, Tt(r), r;
				var i = g({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Tt(r), Fd(r, "style", i), Rf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = jf(n.href);
				var a = e.querySelector(Mf(i));
				if (a) return t.state.loading |= 4, t.instance = a, Tt(a), a;
				r = Nf(n), (i = hf.get(i)) && zf(r, i), a = (e.ownerDocument || e).createElement("link"), Tt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, Rf(a, n.precedence, e), t.instance = a;
			case "script": return a = Ff(n.src), (i = e.querySelector(If(a))) ? (t.instance = i, Tt(i), i) : (r = n, (i = hf.get(a)) && (r = g({}, n), Bf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), Tt(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(c(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Rf(r, n.precedence, e));
		return t.instance;
	}
	function Rf(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function zf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Bf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Vf = null;
	function Hf(e, t, n) {
		if (Vf === null) {
			var r = /* @__PURE__ */ new Map(), i = Vf = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Vf, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[yt] || a[ft] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Uf(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Wf(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Gf(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Kf(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = jf(r.href), a = t.querySelector(Mf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Yf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Tt(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && zf(r, i), a = a.createElement("link"), Tt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = Yf.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var qf = 0;
	function Jf(e, t) {
		return e.stylesheets && e.count === 0 && Zf(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && Zf(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && qf === 0 && (qf = 62500 * Rd());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Zf(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > qf ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function Yf() {
		if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
			if (this.stylesheets) Zf(this, this.stylesheets);
			else if (this.unsuspend) {
				var e = this.unsuspend;
				this.unsuspend = null, e();
			}
		}
	}
	var Xf = null;
	function Zf(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, Xf = /* @__PURE__ */ new Map(), t.forEach(Qf, e), Xf = null, Yf.call(e));
	}
	function Qf(e, t) {
		if (!(t.state.loading & 4)) {
			var n = Xf.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), Xf.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = Yf.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var $f = {
		$$typeof: C,
		Provider: null,
		Consumer: null,
		_currentValue: se,
		_currentValue2: se,
		_threadCount: 0
	};
	function ep(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = tt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = tt(0), this.hiddenUpdates = tt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function tp(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ep(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = mi(3, null, null, t), e.current = a, a.stateNode = e, t = fa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Ga(a), e;
	}
	function np(e) {
		return e ? (e = fi, e) : fi;
	}
	function rp(e, t, n, r, i, a) {
		i = np(i), r.context === null ? r.context = i : r.pendingContext = i, r = qa(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ja(e, r, t), n !== null && (gu(n, e, t), Ya(n, e, t));
	}
	function ip(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ap(e, t) {
		ip(e, t), (e = e.alternate) && ip(e, t);
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = li(e, 67108864);
			t !== null && gu(t, e, 67108864), ap(e, 67108864);
		}
	}
	function sp(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = mu();
			t = st(t);
			var n = li(e, t);
			n !== null && gu(n, e, t), ap(e, t);
		}
	}
	var cp = !0;
	function lp(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = j.p;
		try {
			j.p = 2, dp(e, t, n, r);
		} finally {
			j.p = a, A.T = i;
		}
	}
	function up(e, t, n, r) {
		var i = A.T;
		A.T = null;
		var a = j.p;
		try {
			j.p = 8, dp(e, t, n, r);
		} finally {
			j.p = a, A.T = i;
		}
	}
	function dp(e, t, n, r) {
		if (cp) {
			var i = fp(r);
			if (i === null) Td(e, t, r, pp, n), wp(e, r);
			else if (Ep(i, e, t, n, r)) r.stopPropagation();
			else if (wp(e, r), t & 4 && -1 < Cp.indexOf(e)) {
				for (; i !== null;) {
					var a = St(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Xe(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ue(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									id(a), !(G & 6) && (nu = je() + 500, ad(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = li(a, 2), s !== null && gu(s, a, 2), xu(), ap(a, 2);
					}
					if (a = fp(r), a === null && Td(e, t, r, pp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Td(e, t, r, null, n);
		}
	}
	function fp(e) {
		return e = cn(e), mp(e);
	}
	var pp = null;
	function mp(e) {
		if (pp = null, e = xt(e), e !== null) {
			var t = u(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = d(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = f(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return pp = e, null;
	}
	function hp(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (Me()) {
				case Ne: return 2;
				case Pe: return 8;
				case Fe:
				case Ie: return 32;
				case Le: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var gp = !1, _p = null, vp = null, yp = null, bp = /* @__PURE__ */ new Map(), xp = /* @__PURE__ */ new Map(), Sp = [], Cp = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function wp(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				_p = null;
				break;
			case "dragenter":
			case "dragleave":
				vp = null;
				break;
			case "mouseover":
			case "mouseout":
				yp = null;
				break;
			case "pointerover":
			case "pointerout":
				bp.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": xp.delete(t.pointerId);
		}
	}
	function Tp(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = St(t), t !== null && op(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ep(e, t, n, r, i) {
		switch (t) {
			case "focusin": return _p = Tp(_p, e, t, n, r, i), !0;
			case "dragenter": return vp = Tp(vp, e, t, n, r, i), !0;
			case "mouseover": return yp = Tp(yp, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return bp.set(a, Tp(bp.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, xp.set(a, Tp(xp.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Dp(e) {
		var t = xt(e.target);
		if (t !== null) {
			var n = u(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, ut(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = f(n), t !== null) {
						e.blockedOn = t, ut(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Op(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = fp(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				sn = r, n.target.dispatchEvent(r), sn = null;
			} else return t = St(n), t !== null && op(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function kp(e, t, n) {
		Op(e) && n.delete(t);
	}
	function Ap() {
		gp = !1, _p !== null && Op(_p) && (_p = null), vp !== null && Op(vp) && (vp = null), yp !== null && Op(yp) && (yp = null), bp.forEach(kp), xp.forEach(kp);
	}
	function jp(e, t) {
		e.blockedOn === t && (e.blockedOn = null, gp || (gp = !0, n.unstable_scheduleCallback(n.unstable_NormalPriority, Ap)));
	}
	var Mp = null;
	function Np(e) {
		Mp !== e && (Mp = e, n.unstable_scheduleCallback(n.unstable_NormalPriority, function() {
			Mp === e && (Mp = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (mp(r || n) === null) continue;
					break;
				}
				var a = St(n);
				a !== null && (e.splice(t, 3), t -= 3, Es(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Pp(e) {
		function t(t) {
			return jp(t, e);
		}
		_p !== null && jp(_p, e), vp !== null && jp(vp, e), yp !== null && jp(yp, e), bp.forEach(t), xp.forEach(t);
		for (var n = 0; n < Sp.length; n++) {
			var r = Sp[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Sp.length && (n = Sp[0], n.blockedOn === null);) Dp(n), n.blockedOn === null && Sp.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[pt] || null;
			if (typeof a == "function") o || Np(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[pt] || null) s = o.formAction;
					else if (mp(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Np(n);
			}
		}
	}
	function Fp() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Ip(e) {
		this._internalRoot = e;
	}
	Lp.prototype.render = Ip.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(c(409));
		var n = t.current;
		rp(n, mu(), e, t, null, null);
	}, Lp.prototype.unmount = Ip.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			rp(e.current, 2, null, e, null, null), xu(), t[mt] = null;
		}
	};
	function Lp(e) {
		this._internalRoot = e;
	}
	Lp.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = lt();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Sp.length && t !== 0 && t < Sp[n].priority; n++);
			Sp.splice(n, 0, e), n === 0 && Dp(e);
		}
	};
	var Rp = i.version;
	if (Rp !== "19.2.8") throw Error(c(527, Rp, "19.2.8"));
	j.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(c(188)) : (e = Object.keys(e).join(","), Error(c(268, e)));
		return e = m(t), e = e === null ? null : h(e), e = e === null ? null : e.stateNode, e;
	};
	var zp = {
		bundleType: 0,
		version: "19.2.8",
		rendererPackageName: "react-dom",
		currentDispatcherRef: A,
		reconcilerVersion: "19.2.8"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Bp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Bp.isDisabled && Bp.supportsFiber) try {
			Be = Bp.inject(zp), Ve = Bp;
		} catch {}
	}
	t.createRoot = function(e, t) {
		if (!l(e)) throw Error(c(299));
		var n = !1, r = "", i = Ys, a = Xs, o = Zs;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = tp(e, 1, !1, null, null, n, r, null, i, a, o, Fp), e[mt] = t.current, Cd(e), new Ip(t);
	};
})), l = /* @__PURE__ */ t(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = c();
})), u = a(), d = l(), f = {
	studio_not_loaded: {
		en: "Matter Binding Studio is not loaded. Load the integration and review a new plan.",
		"zh-Hant": "Matter Binding Studio 尚未載入。請載入整合後重新檢視計畫。",
		"zh-Hans": "Matter Binding Studio 尚未加载。请加载集成后重新查看计划。"
	},
	acl_reclaim_unproven: {
		en: "Generic ACL removal is disabled: absence of a Binding does not prove a rule is unused. Inspect only; use reviewed Studio-owned group cleanup where applicable.",
		"zh-Hant": "暫停一般 ACL 清理：沒有 Binding 不代表規則未被使用。目前僅供檢視；Studio 自建群組可使用獨立的審核清理流程。",
		"zh-Hans": "暂停一般 ACL 清理：没有 Binding 不代表规则未被使用。目前仅供检视；Studio 自建群组可使用独立的审核清理流程。"
	},
	binding_inventory_incomplete: {
		en: "A complete live Binding inventory is required before group cleanup. Cached or failed reads cannot prove a group is idle.",
		"zh-Hant": "清理群組前必須即時讀取完整 Binding 清單，快取或讀取失敗不能證明群組閒置。",
		"zh-Hans": "清理群组前必须即时读取完整 Binding 清单，缓存或读取失败不能证明群组闲置。"
	},
	wildcard_binding_migration: {
		en: "A selected target has an all-clusters Binding. Automatic group conversion is not supported for this relationship; review it separately first.",
		"zh-Hant": "選取的目標有涵蓋全部能力的 Binding，暫不支援自動轉成群組，請先單獨檢視這條關係。",
		"zh-Hans": "选取的目标有涵盖全部能力的 Binding，暂不支持自动转成群组，请先单独检视这条关系。"
	},
	invalid_target: {
		en: "Choose a valid Matter output target.",
		"zh-Hant": "請選擇有效的 Matter 輸出目標。",
		"zh-Hans": "请选择有效的 Matter 输出目标。"
	},
	choose_acl: {
		en: "Choose at least one ACL entry to reclaim.",
		"zh-Hant": "請至少選擇一筆要回收的 ACL 規則。",
		"zh-Hans": "请至少选择一笔要回收的 ACL 规则。"
	},
	acl_entry_changed: {
		en: "One selected ACL entry changed or no longer exists. Refresh first.",
		"zh-Hant": "選取的 ACL 規則已變更或不存在，請先重新整理。",
		"zh-Hans": "选取的 ACL 规则已变更或不存在，请先重新整理。"
	},
	acl_reclaim_unsafe: {
		en: "Only unused, non-administrator ACL entries with concrete source and target rules can be reclaimed.",
		"zh-Hant": "只能回收未使用、非管理員且明確指定來源與目標的 ACL 規則。",
		"zh-Hans": "只能回收未使用、非管理员且明确指定来源与目标的 ACL 规则。"
	},
	acl_changed: {
		en: "The target ACL changed after review. Refresh and review a new reclaim plan.",
		"zh-Hant": "目標 ACL 在檢視計畫後已變更，請重新整理並產生新的回收計畫。",
		"zh-Hans": "目标 ACL 在检视计划后已变更，请重新整理并产生新的回收计划。"
	},
	acl_reclaimed: {
		en: "{count} unused target ACL rule(s) were reclaimed and read back.",
		"zh-Hant": "已回收 {count} 筆未使用的目標 ACL 規則，並完成回讀確認。",
		"zh-Hans": "已回收 {count} 笔未使用的目标 ACL 规则，并完成回读确认。"
	},
	acl_reclaim_unverified: {
		en: "The ACL reclaim could not be verified. Refresh before retrying or changing this target.",
		"zh-Hant": "無法確認 ACL 回收結果，請先重新整理，再重試或變更目標。",
		"zh-Hans": "无法确认 ACL 回收结果，请先重新整理，再重试或变更目标。"
	},
	group_unmanaged: {
		en: "This native group is not managed by Matter Binding Studio.",
		"zh-Hant": "此原生群組不是由 Matter Binding Studio 管理。",
		"zh-Hans": "此原生群组不是由 Matter Binding Studio 管理。"
	},
	group_source_missing: {
		en: "The managed group's source endpoint is no longer available.",
		"zh-Hant": "受管理群組的來源端點已無法使用。",
		"zh-Hans": "受管理群组的来源端点已无法使用。"
	},
	group_members_missing: {
		en: "One or more managed group members are no longer available. Keep this group marked for repair.",
		"zh-Hant": "部分受管理群組成員已無法使用，請保留群組的待修復標記。",
		"zh-Hans": "部分受管理群组成员已无法使用，请保留群组的待修复标记。"
	},
	group_changed: {
		en: "This managed group changed after review. Refresh and review a new cleanup plan.",
		"zh-Hant": "受管理群組在檢視後已變更，請重新整理並產生新的清理計畫。",
		"zh-Hans": "受管理群组在检视后已变更，请重新整理并产生新的清理计划。"
	},
	group_cleanup_unverified: {
		en: "Native group cleanup stopped before full verification. The recorded group remains available for repair.",
		"zh-Hant": "原生群組清理未完成驗證，已保留群組紀錄以供修復。",
		"zh-Hans": "原生群组清理未完成验证，已保留群组纪录以供修复。"
	},
	group_cleaned: {
		en: "The idle native group, access rules, memberships, and Group Key mapping were cleaned up.",
		"zh-Hant": "已清理閒置原生群組、存取規則、成員資格與 Group Key 對應。",
		"zh-Hans": "已清理闲置原生群组、存取规则、成员资格与 Group Key 对应。"
	},
	group_in_use: {
		en: "Remove every Binding that targets this native group before cleaning it up.",
		"zh-Hant": "請先移除所有指向此原生群組的 Binding，再清理群組。",
		"zh-Hans": "请先移除所有指向此原生群组的 Binding，再清理群组。"
	},
	binding_exists: {
		en: "This control relationship already exists.",
		"zh-Hant": "此控制關係已存在。",
		"zh-Hans": "此控制关系已存在。"
	},
	acl_admin_missing: {
		en: "The target ACL cannot be safely updated because no administrator entry was found.",
		"zh-Hant": "目標 ACL 沒有管理員規則，無法安全更新。",
		"zh-Hans": "目标 ACL 没有管理员规则，无法安全更新。"
	},
	binding_changed: {
		en: "The source Binding list changed after review. Refresh and review a new plan.",
		"zh-Hant": "來源 Binding 表在檢視後已變更，請重新整理並產生新計畫。",
		"zh-Hans": "来源 Binding 表在检视后已变更，请重新整理并产生新计划。"
	},
	acl_became_unsafe: {
		en: "The target ACL changed and is no longer safe to update. Review a new plan.",
		"zh-Hant": "目標 ACL 已變更，無法安全更新，請重新檢視計畫。",
		"zh-Hans": "目标 ACL 已变更，无法安全更新，请重新检视计划。"
	},
	acl_write_unverified: {
		en: "The target ACL write could not be verified; no Binding was written.",
		"zh-Hant": "無法確認目標 ACL 寫入結果，因此未寫入 Binding。",
		"zh-Hans": "无法确认目标 ACL 写入结果，因此未写入 Binding。"
	},
	unicast_written: {
		en: "Native unicast binding was written and read back from the source device.",
		"zh-Hant": "已寫入原生單播 Binding，並從來源裝置回讀確認。",
		"zh-Hans": "已写入原生单播 Binding，并从来源装置回读确认。"
	},
	group_id_claimed: {
		en: "The automatic group id was claimed after review. Refresh and review a new plan.",
		"zh-Hant": "自動群組 ID 在檢視後已被使用，請重新整理並產生新計畫。",
		"zh-Hans": "自动群组 ID 在检视后已被使用，请重新整理并产生新计划。"
	},
	group_key_claimed: {
		en: "The automatic Group Key slot was claimed after review. Refresh and review a new plan.",
		"zh-Hant": "Group Key 容量在檢視後已被使用，請重新整理並產生新計畫。",
		"zh-Hans": "Group Key 容量在检视后已被使用，请重新整理并产生新计划。"
	},
	group_busy: {
		en: "This automatic group is already being maintained. Refresh and review a new plan.",
		"zh-Hant": "此自動群組正在維護中，請重新整理並產生新計畫。",
		"zh-Hans": "此自动群组正在维护中，请重新整理并产生新计划。"
	},
	group_provision_unverified: {
		en: "The automatic group was provisioned but could not be fully verified. No unverified relationship is shown as ready.",
		"zh-Hant": "自動群組已佈建，但尚未完整驗證；未驗證的控制關係不會標示為就緒。",
		"zh-Hans": "自动群组已布建，但尚未完整验证；未验证的控制关系不会标示为就绪。"
	},
	group_transaction_stopped: {
		en: "The automatic group transaction stopped before Binding verification. Review the recorded group before retrying.",
		"zh-Hant": "自動群組交易在 Binding 驗證前中止，重試前請先檢查群組紀錄。",
		"zh-Hans": "自动群组交易在 Binding 验证前中止，重试前请先检查群组纪录。"
	},
	groupcast_written: {
		en: "Native groupcast binding was provisioned and read back from the source device.",
		"zh-Hant": "已佈建原生群組廣播 Binding，並從來源裝置回讀確認。",
		"zh-Hans": "已布建原生群组广播 Binding，并从来源装置回读确认。"
	},
	source_missing: {
		en: "The Binding source is no longer available. Refresh first.",
		"zh-Hant": "Binding 來源已無法使用，請先重新整理。",
		"zh-Hans": "Binding 来源已无法使用，请先重新整理。"
	},
	target_incomplete: {
		en: "The direct Binding target is incomplete. Refresh first.",
		"zh-Hant": "直接 Binding 目標資料不完整，請先重新整理。",
		"zh-Hans": "直接 Binding 目标资料不完整，请先重新整理。"
	},
	group_incomplete: {
		en: "The native group target is incomplete. Refresh first.",
		"zh-Hant": "原生群組目標資料不完整，請先重新整理。",
		"zh-Hans": "原生群组目标资料不完整，请先重新整理。"
	},
	target_type_unsupported: {
		en: "The Binding target type is not supported.",
		"zh-Hant": "不支援此 Binding 目標類型。",
		"zh-Hans": "不支援此 Binding 目标类型。"
	},
	relationship_changed: {
		en: "This Binding relationship changed or no longer exists. Refresh and review again.",
		"zh-Hant": "此 Binding 關係已變更或不存在，請重新整理後再檢視。",
		"zh-Hans": "此 Binding 关系已变更或不存在，请重新整理后再检视。"
	},
	binding_remove_unverified: {
		en: "The Binding removal could not be verified. Refresh before retrying or changing the group.",
		"zh-Hant": "無法確認 Binding 刪除結果，請先重新整理，再重試或變更群組。",
		"zh-Hans": "无法确认 Binding 删除结果，请先重新整理，再重试或变更群组。"
	},
	binding_removed: {
		en: "The Binding was removed and the source Binding Cluster was read back.",
		"zh-Hant": "已移除 Binding，並回讀來源 Binding Cluster 確認。",
		"zh-Hans": "已移除 Binding，并回读来源 Binding Cluster 确认。"
	},
	self_binding: {
		en: "A source endpoint cannot bind to itself.",
		"zh-Hant": "來源端點不能 Binding 到自己。",
		"zh-Hans": "来源端点不能 Binding 到自己。"
	},
	invalid_source: {
		en: "Choose a valid Matter control source.",
		"zh-Hant": "請選擇有效的 Matter 控制來源。",
		"zh-Hans": "请选择有效的 Matter 控制来源。"
	},
	choose_capability: {
		en: "Choose at least one supported capability.",
		"zh-Hant": "請至少選擇一項支援的控制能力。",
		"zh-Hans": "请至少选择一项支援的控制能力。"
	},
	capability_mismatch: {
		en: "One or more selected capabilities are not supported by both endpoints.",
		"zh-Hant": "部分選取能力未同時被來源與目標端點支援。",
		"zh-Hans": "部分选取能力未同时被来源与目标端点支援。"
	},
	invalid_targets: {
		en: "Choose valid Matter output targets.",
		"zh-Hant": "請選擇有效的 Matter 輸出目標。",
		"zh-Hans": "请选择有效的 Matter 输出目标。"
	},
	group_min_targets: {
		en: "Choose at least two output targets for an automatic native group.",
		"zh-Hant": "自動原生群組需要至少兩個輸出目標。",
		"zh-Hans": "自动原生群组需要至少两个输出目标。"
	},
	group_capability_mismatch: {
		en: "One or more selected capabilities are not supported by the source and any selected target.",
		"zh-Hant": "部分選取能力不被來源支援，或沒有任何選取目標支援。",
		"zh-Hans": "部分选取能力不被来源支援，或没有任何选取目标支援。"
	},
	group_capacity_unknown: {
		en: "A participating device did not report Group and Group Key capacity.",
		"zh-Hant": "參與裝置未回報群組與 Group Key 容量。",
		"zh-Hans": "参与装置未回报群组与 Group Key 容量。"
	},
	group_capacity_full: {
		en: "A participating device does not have one free native Group and Group Key slot.",
		"zh-Hant": "參與裝置沒有足夠的原生群組或 Group Key 空間。",
		"zh-Hans": "参与装置没有足够的原生群组或 Group Key 空间。"
	},
	group_id_exhausted: {
		en: "No automatic native Group ID is available on this fabric.",
		"zh-Hant": "此 Fabric 已無可用的自動原生群組 ID。",
		"zh-Hans": "此 Fabric 已无可用的自动原生群组 ID。"
	},
	group_key_id_exhausted: {
		en: "No automatic Group Key set ID is available on this fabric.",
		"zh-Hant": "此 Fabric 已無可用的自動 Group Key Set ID。",
		"zh-Hans": "此 Fabric 已无可用的自动 Group Key Set ID。"
	},
	invalid_group_key: {
		en: "The generated Group Key was invalid.",
		"zh-Hant": "產生的 Group Key 無效。",
		"zh-Hans": "产生的 Group Key 无效。"
	},
	group_key_rejected: {
		en: "A participating device rejected the Group Key write.",
		"zh-Hant": "參與裝置拒絕寫入 Group Key。",
		"zh-Hans": "参与装置拒绝写入 Group Key。"
	},
	group_key_unverified: {
		en: "A participating device did not confirm its Group Key mapping.",
		"zh-Hant": "參與裝置未確認 Group Key 對應。",
		"zh-Hans": "参与装置未确认 Group Key 对应。"
	},
	group_key_changed: {
		en: "The managed Group Key mapping changed and cannot be safely removed.",
		"zh-Hant": "受管理的 Group Key 對應已變更，無法安全移除。",
		"zh-Hans": "受管理的 Group Key 对应已变更，无法安全移除。"
	},
	group_key_remove_unverified: {
		en: "A participant did not confirm its Group Key mapping removal.",
		"zh-Hant": "參與裝置未確認 Group Key 對應已移除。",
		"zh-Hans": "参与装置未确认 Group Key 对应已移除。"
	},
	key_set_remove_rejected: {
		en: "A participant rejected Group Key Set removal.",
		"zh-Hant": "參與裝置拒絕移除 Group Key Set。",
		"zh-Hans": "参与装置拒绝移除 Group Key Set。"
	},
	group_commands_unsupported: {
		en: "This Home Assistant Matter client cannot send native Group commands.",
		"zh-Hant": "此 Home Assistant Matter 用戶端無法傳送原生群組指令。",
		"zh-Hans": "此 Home Assistant Matter 用户端无法传送原生群组指令。"
	},
	membership_rejected: {
		en: "A selected target rejected automatic group membership.",
		"zh-Hant": "選取的目標拒絕加入自動群組。",
		"zh-Hans": "选取的目标拒绝加入自动群组。"
	},
	membership_unverified: {
		en: "A selected target did not confirm automatic group membership.",
		"zh-Hant": "選取的目標未確認已加入自動群組。",
		"zh-Hans": "选取的目标未确认已加入自动群组。"
	},
	group_remove_rejected: {
		en: "A managed group member rejected group removal.",
		"zh-Hant": "受管理群組的成員拒絕退出群組。",
		"zh-Hans": "受管理群组的成员拒绝退出群组。"
	},
	group_remove_unverified: {
		en: "A managed group member did not confirm group removal.",
		"zh-Hant": "受管理群組的成員未確認已退出群組。",
		"zh-Hans": "受管理群组的成员未确认已退出群组。"
	},
	member_admin_missing: {
		en: "A selected target ACL cannot be safely updated because no administrator entry was found.",
		"zh-Hant": "選取目標的 ACL 沒有管理員規則，無法安全更新。",
		"zh-Hans": "选取目标的 ACL 没有管理员规则，无法安全更新。"
	},
	group_acl_unverified: {
		en: "A selected target did not confirm the group access rule.",
		"zh-Hant": "選取的目標未確認群組存取規則。",
		"zh-Hans": "选取的目标未确认群组存取规则。"
	},
	wildcard_acl_unsafe: {
		en: "A managed group has a wildcard ACL rule that cannot be safely removed.",
		"zh-Hant": "受管理群組含有萬用 ACL 規則，無法安全移除。",
		"zh-Hans": "受管理群组含有万用 ACL 规则，无法安全移除。"
	},
	group_acl_remove_unverified: {
		en: "A member did not confirm removal of the group access rule.",
		"zh-Hant": "成員未確認群組存取規則已移除。",
		"zh-Hans": "成员未确认群组存取规则已移除。"
	},
	matter_client_unavailable: {
		en: "Home Assistant's Matter client is not available.",
		"zh-Hant": "Home Assistant 的 Matter 用戶端無法使用。",
		"zh-Hans": "Home Assistant 的 Matter 用户端无法使用。"
	},
	acl_full: {
		en: "The target ACL is full ({used}/{maximum}). Reclaim an unused ACL rule before creating this Binding.",
		"zh-Hant": "目標 ACL 已滿（{used}/{maximum}），請先回收未使用的 ACL 規則，再建立此 Binding。",
		"zh-Hans": "目标 ACL 已满（{used}/{maximum}），请先回收未使用的 ACL 规则，再建立此 Binding。"
	},
	acl_shape_unsupported: {
		en: "The target Access Control list has an unsupported entry shape at entry {index}: {shape} (table: {table}).",
		"zh-Hant": "目標存取控制清單的第 {index} 筆格式不受支援：{shape}（表格：{table}）。",
		"zh-Hans": "目标存取控制清单的第 {index} 笔格式不受支援：{shape}（表格：{table}）。"
	},
	fabric_read_failed: {
		en: "The source fabric index could not be read.",
		"zh-Hant": "無法讀取來源的 Fabric 索引。",
		"zh-Hans": "无法读取来源的 Fabric 索引。"
	},
	fabric_invalid: {
		en: "The source fabric index is invalid.",
		"zh-Hant": "來源的 Fabric 索引無效。",
		"zh-Hans": "来源的 Fabric 索引无效。"
	},
	acl_admin_required: {
		en: "Refusing to write an ACL without an administrator entry.",
		"zh-Hant": "拒絕寫入不含管理員規則的 ACL。",
		"zh-Hans": "拒绝写入不含管理员规则的 ACL。"
	},
	acl_write_unsupported: {
		en: "This Home Assistant Matter client cannot safely update ACLs.",
		"zh-Hant": "此 Home Assistant Matter 用戶端無法安全更新 ACL。",
		"zh-Hans": "此 Home Assistant Matter 用户端无法安全更新 ACL。"
	},
	acl_write_rejected: {
		en: "The target device rejected the Access Control update.",
		"zh-Hant": "目標裝置拒絕更新存取控制規則。",
		"zh-Hans": "目标装置拒绝更新存取控制规则。"
	},
	binding_write_unverified: {
		en: "The Binding write was not verified on the source device.",
		"zh-Hant": "尚未在來源裝置確認 Binding 寫入結果。",
		"zh-Hans": "尚未在来源装置确认 Binding 写入结果。"
	},
	binding_write_acl_added: {
		en: "The Binding write was not verified on the source device. Target access was added; review the target ACL before retrying.",
		"zh-Hant": "尚未在來源裝置確認 Binding 寫入結果。目標存取權限已新增，重試前請先檢查目標 ACL。",
		"zh-Hans": "尚未在来源装置确认 Binding 写入结果。目标存取权限已新增，重试前请先检查目标 ACL。"
	},
	plan_expired: {
		en: "This review expired. Generate a new plan before writing.",
		"zh-Hant": "此檢視計畫已過期，寫入前請產生新計畫。",
		"zh-Hans": "此检视计划已过期，写入前请产生新计划。"
	},
	plan_kind_mismatch: {
		en: "This review does not match the requested native Matter operation.",
		"zh-Hant": "此檢視計畫與要求的原生 Matter 操作不符。",
		"zh-Hans": "此检视计划与要求的原生 Matter 操作不符。"
	},
	bulk_selection_size: {
		en: "Select between 1 and 200 relationships.",
		"zh-Hant": "請選擇 1 到 200 條控制關係。",
		"zh-Hans": "请选择 1 到 200 条控制关系。"
	},
	bulk_selection_changed: {
		en: "A selected relationship changed. Refresh and review again.",
		"zh-Hant": "選取的控制關係已變更，請重新整理後再檢視。",
		"zh-Hans": "选取的控制关系已变更，请重新整理后再检视。"
	},
	bulk_source_unavailable: {
		en: "A selected source is unavailable.",
		"zh-Hant": "選取的來源無法使用。",
		"zh-Hans": "选取的来源无法使用。"
	},
	bulk_target_incomplete: {
		en: "A selected target is incomplete. Refresh first.",
		"zh-Hant": "選取的目標資料不完整，請先重新整理。",
		"zh-Hans": "选取的目标资料不完整，请先重新整理。"
	},
	bulk_group_incomplete: {
		en: "A selected group is incomplete. Refresh first.",
		"zh-Hant": "選取的群組資料不完整，請先重新整理。",
		"zh-Hans": "选取的群组资料不完整，请先重新整理。"
	},
	bulk_target_unsupported: {
		en: "The selected target type is not supported.",
		"zh-Hant": "不支援選取的目標類型。",
		"zh-Hans": "不支援选取的目标类型。"
	},
	bulk_table_changed: {
		en: "The source Binding table changed. Refresh and review again.",
		"zh-Hant": "來源 Binding 表已變更，請重新整理後再檢視。",
		"zh-Hans": "来源 Binding 表已变更，请重新整理后再检视。"
	},
	admin_only: {
		en: "Matter Binding Studio is admin-only.",
		"zh-Hant": "Matter Binding Studio 僅限管理員使用。",
		"zh-Hans": "Matter Binding Studio 仅限管理员使用。"
	},
	operation_failed: {
		en: "The Matter device operation could not be completed. Confirm the device is online, then refresh and retry.",
		"zh-Hant": "無法完成 Matter 裝置操作，請確認裝置在線，重新整理後再試。",
		"zh-Hans": "无法完成 Matter 装置操作，请确认装置在线，重新整理后再试。"
	},
	unexpected_error: {
		en: "The requested Matter operation failed.",
		"zh-Hant": "要求的 Matter 操作失敗。",
		"zh-Hans": "要求的 Matter 操作失败。"
	},
	matter_unavailable: {
		en: "Matter integration is not currently available.",
		"zh-Hant": "Matter 整合目前無法使用。",
		"zh-Hans": "Matter 整合目前无法使用。"
	},
	inventory_unavailable: {
		en: "Matter node inventory is temporarily unavailable.",
		"zh-Hant": "Matter 節點清單暫時無法使用。",
		"zh-Hans": "Matter 节点清单暂时无法使用。"
	},
	bindings_read_failed: {
		en: "Could not read bindings for {name}.",
		"zh-Hant": "無法讀取 {name} 的 Binding。",
		"zh-Hans": "无法读取 {name} 的 Binding。"
	},
	step_read_acl: {
		en: "Read the latest target ACL table.",
		"zh-Hant": "讀取最新的目標 ACL 表。",
		"zh-Hans": "读取最新的目标 ACL 表。"
	},
	step_remove_acl: {
		en: "Remove only the {count} reviewed unused operate rule(s).",
		"zh-Hant": "僅移除已檢視的 {count} 筆未使用操作規則。",
		"zh-Hans": "仅移除已检视的 {count} 笔未使用操作规则。"
	},
	step_keep_acl: {
		en: "Keep every administrator and in-use ACL rule.",
		"zh-Hant": "保留所有管理員與使用中的 ACL 規則。",
		"zh-Hans": "保留所有管理员与使用中的 ACL 规则。"
	},
	step_write_acl: {
		en: "Write the remaining ACL table and read it back.",
		"zh-Hant": "寫入剩餘 ACL 表並回讀確認。",
		"zh-Hans": "写入剩余 ACL 表并回读确认。"
	},
	step_check_idle: {
		en: "Re-read every source Binding table to confirm this group is idle.",
		"zh-Hant": "重新讀取所有來源 Binding 表，確認群組已閒置。",
		"zh-Hans": "重新读取所有来源 Binding 表，确认群组已闲置。"
	},
	step_remove_group_acl: {
		en: "Remove only this group's operate ACL targets from its recorded members.",
		"zh-Hant": "只從已記錄成員移除此群組的操作 ACL 目標。",
		"zh-Hans": "只从已记录成员移除此群组的操作 ACL 目标。"
	},
	step_remove_members: {
		en: "Remove this group from its recorded member endpoints and read membership back.",
		"zh-Hant": "從已記錄成員端點移除群組，並回讀成員資格。",
		"zh-Hans": "从已记录成员端点移除群组，并回读成员资格。"
	},
	step_remove_keys: {
		en: "Remove this group's Group Key mapping and Key Set from every participant.",
		"zh-Hant": "從所有參與裝置移除此群組的 Group Key 對應與 Key Set。",
		"zh-Hans": "从所有参与装置移除此群组的 Group Key 对应与 Key Set。"
	},
	step_remove_metadata: {
		en: "Remove Studio metadata only after the native cleanup has verified.",
		"zh-Hant": "僅在原生清理驗證完成後移除 Studio 中繼資料。",
		"zh-Hans": "仅在原生清理验证完成后移除 Studio 中继资料。"
	},
	step_read_binding_acl: {
		en: "Read the latest Binding list and target ACL capacity.",
		"zh-Hant": "讀取最新 Binding 表與目標 ACL 容量。",
		"zh-Hans": "读取最新 Binding 表与目标 ACL 容量。"
	},
	step_grant_source: {
		en: "Grant the source device operate access on the target.",
		"zh-Hant": "授予來源裝置操作目標的權限。",
		"zh-Hans": "授予来源装置操作目标的权限。"
	},
	step_write_binding: {
		en: "Write the source Binding Cluster list.",
		"zh-Hant": "寫入來源的 Binding Cluster 表。",
		"zh-Hans": "写入来源的 Binding Cluster 表。"
	},
	step_verify_binding: {
		en: "Read the Binding Cluster back from the source device.",
		"zh-Hant": "從來源裝置回讀 Binding Cluster 確認。",
		"zh-Hans": "从来源装置回读 Binding Cluster 确认。"
	},
	step_read_group_capacity: {
		en: "Read the latest Binding, ACL, group capacity, and group key maps.",
		"zh-Hant": "讀取最新 Binding、ACL、群組容量與 Group Key 對應。",
		"zh-Hans": "读取最新 Binding、ACL、群组容量与 Group Key 对应。"
	},
	step_provision_key: {
		en: "Provision one new Group Key on the control source and each target device.",
		"zh-Hant": "在控制來源與各目標裝置佈建新的 Group Key。",
		"zh-Hans": "在控制来源与各目标装置布建新的 Group Key。"
	},
	step_add_members: {
		en: "Add each selected target endpoint to the automatic native group.",
		"zh-Hant": "將選取的目標端點加入自動原生群組。",
		"zh-Hans": "将选取的目标端点加入自动原生群组。"
	},
	step_grant_group: {
		en: "Grant group operate access only to member endpoints that support each selected capability.",
		"zh-Hant": "只授予支援選取能力的成員端點對應的群組操作權限。",
		"zh-Hans": "只授予支援选取能力的成员端点对应的群组操作权限。"
	},
	step_replace_direct: {
		en: "Replace matching direct bindings only after all group provisioning succeeds.",
		"zh-Hant": "所有群組佈建成功後，才替換對應的直接 Binding。",
		"zh-Hans": "所有群组布建成功后，才替换对应的直接 Binding。"
	},
	step_verify_group: {
		en: "Read the source Binding Cluster and target group configuration back from the devices.",
		"zh-Hant": "從裝置回讀來源 Binding Cluster 與目標群組設定。",
		"zh-Hans": "从装置回读来源 Binding Cluster 与目标群组设定。"
	},
	step_read_source: {
		en: "Read the latest source Binding Cluster list.",
		"zh-Hant": "讀取最新來源 Binding Cluster 表。",
		"zh-Hans": "读取最新来源 Binding Cluster 表。"
	},
	step_remove_relationship: {
		en: "Remove only the entries that match this displayed relationship.",
		"zh-Hant": "僅移除對應此控制關係的設定。",
		"zh-Hans": "仅移除对应此控制关系的设定。"
	},
	step_keep_group: {
		en: "Keep the native group, Group Key, membership, and ACLs unchanged.",
		"zh-Hant": "保留原生群組、Group Key、成員資格與 ACL。",
		"zh-Hans": "保留原生群组、Group Key、成员资格与 ACL。"
	},
	step_keep_target_acl: {
		en: "Keep target ACLs unchanged.",
		"zh-Hant": "保留目標 ACL 不變。",
		"zh-Hans": "保留目标 ACL 不变。"
	},
	step_write_remaining: {
		en: "Write the complete remaining Binding Cluster list.",
		"zh-Hant": "寫入完整的剩餘 Binding Cluster 表。",
		"zh-Hans": "写入完整的剩余 Binding Cluster 表。"
	},
	all_subjects: {
		en: "All subjects",
		"zh-Hant": "所有來源",
		"zh-Hans": "所有来源"
	},
	unknown_subject: {
		en: "Unknown subject",
		"zh-Hant": "未知來源",
		"zh-Hans": "未知来源"
	},
	unknown_group: {
		en: "Unknown native group",
		"zh-Hant": "未知原生群組",
		"zh-Hans": "未知原生群组"
	},
	unknown_node: {
		en: "Unknown Matter node",
		"zh-Hant": "未知 Matter 節點",
		"zh-Hans": "未知 Matter 节点"
	},
	all_endpoints: {
		en: "All endpoints",
		"zh-Hant": "所有端點",
		"zh-Hans": "所有端点"
	},
	all_capabilities: {
		en: "All capabilities",
		"zh-Hant": "所有能力",
		"zh-Hans": "所有能力"
	},
	capability_onoff: {
		en: "On / Off",
		"zh-Hant": "開關",
		"zh-Hans": "开关"
	},
	capability_brightness: {
		en: "Brightness",
		"zh-Hant": "亮度",
		"zh-Hans": "亮度"
	},
	capability_color_temperature: {
		en: "Color temperature",
		"zh-Hant": "色溫",
		"zh-Hans": "色温"
	},
	capability_other: {
		en: "Other capability",
		"zh-Hant": "其他能力",
		"zh-Hans": "其他能力"
	}
}, p = {
	"zh-Hant": {
		supportTitle: "診斷與問題回報",
		supportPrivacy: "只整理最近一次讀取與最近 10 次計畫／套用結果，不重新掃描或寫入裝置。不含名稱、裝置識別與金鑰；仍請檢查內容後再分享。重啟會清除操作摘要。",
		inspectDiagnostics: "檢視診斷摘要",
		copyDiagnostics: "複製摘要",
		downloadDiagnostics: "下載 JSON",
		diagnosticsCopied: "已複製診斷摘要。",
		diagnosticsManualCopy: "瀏覽器不允許複製，請選取上方文字手動複製，或下載 JSON。",
		recoveryTitle: "接下來怎麼辦？",
		recoveryPlan: "這次尚未執行套用。請依錯誤檢查裝置連線、能力或容量，再重新檢視計畫；不要刪除不明 ACL。",
		recoveryApply: "部分設定可能已寫入，沒有自動回復。請重新整理並檢查目前關係，再決定是否重新建立計畫；不要直接重複套用。",
		recoveryGroup: "部分群組、ACL 或金鑰設定可能已變更。請重新整理，檢查群組狀態並保留紀錄，不要重複建立新群組。若要清理，必須先確認沒有關係使用它，並重新檢視清理計畫；被阻擋時請先回報。",
		recoveryBatch: "已驗證刪除的來源不會回復；其他來源請依結果檢查，再只選取剩餘關係建立新計畫。ACL、群組與金鑰仍保留。",
		recoveryDiagnostics: "可在「診斷與問題回報」檢視摘要。若狀態不明，先保留結果並回報，不要重設裝置或手動清除儲存紀錄。",
		aclEvidence: "寫入紀錄與共用關係",
		aclRecorded: "有 Studio 寫入紀錄（不代表可刪除）",
		aclUnrecorded: "來源不明或證據不足",
		aclReferences: "已知共用關係：{count}",
		aclReferencesIncomplete: "依目前快取辨識，可能不完整；沒有已知關係不代表未使用。",
		searchRelationships: "搜尋來源或目標",
		filterArea: "區域篩選",
		allAreas: "所有區域",
		selectVisible: "全選篩選結果",
		selectedRelationships: "已選 {count} 條",
		deleteSelected: "刪除 {count} 條控制關係",
		clearSelection: "取消選取",
		selectRelationship: "選取控制關係",
		noMatchingRelationships: "沒有符合條件的控制關係。",
		details: "詳情",
		advanced: "進階管理：ACL、容量",
		help: "使用說明",
		close: "關閉",
		confirmDelete: "確認刪除",
		groupsNeedAttention: "有群組需要檢查",
		batchSummary: "將更新 {sources} 個來源，移除 {entries} 筆 Binding 設定。各來源會分別回讀驗證。",
		removalResults: "刪除結果",
		verified: "已刪除並回讀確認",
		changed: "設定已變動，未寫入；請重新檢視計畫",
		failed: "讀取失敗，未寫入；請確認裝置連線後重試",
		unverified: "可能已寫入，但無法確認；請刷新後再檢查",
		refreshBeforeRetry: "結果尚未確認，請重新整理後再檢查。",
		appName: "Matter Binding Studio",
		subtitle: "以 Home Assistant 名稱檢視原生 Matter Binding",
		directBinding: "原生直接 Binding",
		refresh: "重新整理",
		refreshing: "更新中…",
		scope: "選擇一個目標時建立原生直接 Binding；選擇多個目標時，Studio 會自動建立並驗證原生群組廣播。",
		loading: "正在讀取 Matter Fabric…",
		readFailed: "目前無法讀取 Matter Fabric，請稍後重新整理。",
		notConnected: "此預覽尚未連接到 Home Assistant。",
		controlRelationships: "控制關係",
		relationshipDescription: "以 Home Assistant 裝置名稱呈現的既有原生 Matter Binding。",
		noRelationships: "沒有讀到可呈現的控制關係。",
		reviewRemoval: "檢視刪除計畫",
		removalReviewTitle: "確認刪除原生 Matter Binding",
		removeBinding: "刪除 Binding",
		confirmRemoval: "我已確認這會刪除這條控制關係的 Binding entries。",
		removalKeepsGroup: "這只會移除 Binding；原生群組、Group Key、成員與 ACL 都會保留。",
		removalUnavailable: "這條控制關係的技術識別資訊不完整，請先重新整理。",
		bindingEntries: "筆 Binding entries",
		cancel: "取消",
		direct: "直接連線",
		nativeGroup: "原生群組",
		members: "個目標",
		controlSets: "原生控制組",
		controlSetsDescription: "自動建立的控制組僅用來說明哪些目標會一起被控制；不需要手動管理 Group ID 或 Group Key。",
		noControlSets: "沒有讀到可呈現的原生控制組。",
		activeRelationships: "條使用中的關係",
		controlSetPending: "此控制組尚在建立，尚未視為可用。",
		controlSetRepairNeeded: "此控制組需要修復；請先檢查實體裝置的群組設定。",
		reviewGroupCleanup: "檢視群組清理計畫",
		cleanupGroup: "清理原生群組",
		groupCleanupReviewTitle: "確認清理閒置原生群組",
		confirmGroupCleanup: "我已確認這會刪除這個閒置群組的成員、ACL 與 Group Key。",
		groupCleanupNeedsBindingRemoval: "仍有控制關係使用這個群組；請先移除 Binding。",
		groupCleanupUnavailable: "只有 Studio 自動建立且沒有使用中的控制關係的群組可以清理。",
		capacity: "群組與 Group Key 容量",
		capacityDescription: "裝置回報且已快取的限制。建立群組廣播前會先做容量預檢。",
		acl: "目標裝置 ACL",
		aclDescription: "選擇一個輸出端點後才讀取它的存取控制規則；不會隨 Fabric 重新整理而自動讀取所有裝置。",
		chooseAclTarget: "選擇要檢視 ACL 的輸出目標",
		readAcl: "讀取 ACL",
		readingAcl: "讀取 ACL 中…",
		aclReadFailed: "無法讀取這個目標的 ACL。",
		aclEntries: "ACL 規則",
		aclUsed: "已使用",
		aclAvailable: "可用",
		aclTargetsPerRule: "每條規則目標上限",
		aclAdministrator: "管理者",
		aclOperate: "操作授權",
		aclCase: "裝置授權",
		aclGroup: "群組授權",
		aclOther: "其他授權",
		aclProtected: "受保護的管理者規則",
		aclInUse: "正在被控制關係使用",
		aclUnused: "未對應任何控制關係",
		aclUnknown: "無法安全判定是否仍在使用",
		aclSubjects: "來源",
		aclTargets: "目標與能力",
		aclWillAddEntries: "這次預計新增 {count} 條 ACL 規則。",
		selectAclEntry: "選取 ACL 規則",
		selectAllReclaimableAcl: "選取所有可回收 ACL",
		selectedAclEntries: "已選 {count} 條",
		reviewSelectedAclReclaim: "檢視選取回收計畫",
		noAclEntriesSelected: "請先選取至少一條可回收 ACL 規則。",
		reviewAclReclaim: "檢視回收計畫",
		reclaimAcl: "回收 ACL 規則",
		aclRemovalReviewTitle: "確認回收未使用 ACL 規則",
		confirmAclRemoval: "我已確認這會刪除 {count} 條未使用的操作 ACL 規則。",
		aclRemovalKeepsInUse: "管理者與仍被既有 Binding 使用的 ACL 規則不會被移除。",
		groups: "群組",
		groupKeys: "Group Key",
		unavailable: "尚未取得",
		onOff: "開關",
		brightness: "亮度",
		colorTemperature: "色溫",
		addRelationship: "新增控制關係",
		addRelationshipDescription: "先選來源、目標與能力，再檢視實際會寫入的原生 Matter 交易。",
		source: "控制來源",
		target: "控制目標",
		targets: "控制目標（可多選）",
		chooseSource: "選擇可 Binding 的控制來源",
		chooseTarget: "選擇輸出目標",
		noTargets: "目前沒有符合篩選條件的輸出目標。",
		sameAreaOnly: "僅顯示與來源相同區域的目標",
		capabilities: "要控制的能力",
		noSharedCapabilities: "所選 endpoint 沒有可共同 Binding 的能力。",
		coverageReady: "完整支援",
		coveragePartial: "部分支援",
		notSupportedBy: "不支援的目標",
		reviewPlan: "檢視寫入計畫",
		reviewTitle: "確認原生 Matter 寫入",
		aclWillAdd: "寫入前會在目標裝置補上必要的操作 ACL。",
		aclAlreadyGranted: "目標裝置已經具備必要的操作 ACL。",
		groupAclReview: "Studio 會為每個支援該能力的目標補上必要的群組操作 ACL。",
		replacesDirect: "這會在群組佈建完成後，將選取目標的相同直接 Binding 改為群組廣播。",
		confirmWrite: "我已確認此操作會變更真實 Matter 裝置的 ACL 與 Binding。",
		applyBinding: "寫入並讀回驗證",
		working: "處理中…"
	},
	"zh-Hans": {
		supportTitle: "诊断与问题反馈",
		supportPrivacy: "仅整理最近一次读取与最近 10 次计划／应用结果，不扫描或写入设备。不含名称、设备标识和密钥；请检查后再分享。重启会清除操作摘要。",
		inspectDiagnostics: "查看诊断摘要",
		copyDiagnostics: "复制摘要",
		downloadDiagnostics: "下载 JSON",
		diagnosticsCopied: "已复制诊断摘要。",
		diagnosticsManualCopy: "浏览器不允许复制，请选取上方文字手动复制，或下载 JSON。",
		recoveryTitle: "接下来怎么办？",
		recoveryPlan: "本次尚未应用计划。请检查设备连接、能力或容量，然后重新查看计划；不要删除未知 ACL。",
		recoveryApply: "部分设置可能已写入，没有自动回滚。请刷新并检查当前关系，再决定是否重新创建计划；不要盲目重复应用。",
		recoveryGroup: "部分群组、ACL 或密钥设置可能已变更。请刷新并检查群组状态，保留记录，不要重复创建新群组。清理前须确认没有关系使用它，并重新查看清理计划；被阻止时请先反馈。",
		recoveryBatch: "已验证删除的来源不会回滚；请检查其他来源，再仅为剩余关系创建新计划。ACL、群组和密钥仍保留。",
		recoveryDiagnostics: "可在「诊断与问题反馈」查看摘要。状态不明时请保留结果并反馈，不要重置设备或手动清除存储记录。",
		aclEvidence: "写入记录与共用关系",
		aclRecorded: "有 Studio 写入记录（不代表可删除）",
		aclUnrecorded: "来源未知或证据不足",
		aclReferences: "已知共用关系：{count}",
		aclReferencesIncomplete: "基于当前缓存，可能不完整；没有已知关系不代表未使用。",
		searchRelationships: "搜寻来源或目标",
		filterArea: "区域筛选",
		allAreas: "所有区域",
		selectVisible: "全选筛选结果",
		selectedRelationships: "已选 {count} 条",
		deleteSelected: "删除 {count} 条控制关系",
		clearSelection: "取消选取",
		selectRelationship: "选取控制关系",
		noMatchingRelationships: "没有符合条件的控制关系。",
		details: "详情",
		advanced: "进阶管理：ACL、容量",
		help: "使用说明",
		close: "关闭",
		confirmDelete: "确认删除",
		groupsNeedAttention: "有群组需要检查",
		batchSummary: "将更新 {sources} 个来源，移除 {entries} 笔 Binding 设定。各来源会分别回读验证。",
		removalResults: "删除结果",
		verified: "已删除并回读确认",
		changed: "设定已变动，未写入；请重新检视计划",
		failed: "读取失败，未写入；请确认装置连线后重试",
		unverified: "可能已写入，但无法确认；请刷新后再检查",
		refreshBeforeRetry: "结果尚未确认，请重新整理后再检查。",
		appName: "Matter Binding Studio",
		subtitle: "以 Home Assistant 名称检视原生 Matter Binding",
		directBinding: "原生直接 Binding",
		refresh: "重新整理",
		refreshing: "更新中…",
		scope: "选择一个目标时建立原生直接 Binding；选择多个目标时，Studio 会自动建立并验证原生群组广播。",
		loading: "正在读取 Matter Fabric…",
		readFailed: "目前无法读取 Matter Fabric，请稍后重新整理。",
		notConnected: "此预览尚未连接到 Home Assistant。",
		controlRelationships: "控制关系",
		relationshipDescription: "以 Home Assistant 装置名称呈现的既有原生 Matter Binding。",
		noRelationships: "没有读到可呈现的控制关系。",
		reviewRemoval: "检视删除计划",
		removalReviewTitle: "确认删除原生 Matter Binding",
		removeBinding: "删除 Binding",
		confirmRemoval: "我已确认这会删除这条控制关系的 Binding entries。",
		removalKeepsGroup: "这只会移除 Binding；原生群组、Group Key、成员与 ACL 都会保留。",
		removalUnavailable: "这条控制关系的技术识别资讯不完整，请先重新整理。",
		bindingEntries: "笔 Binding entries",
		cancel: "取消",
		direct: "直接连线",
		nativeGroup: "原生群组",
		members: "个目标",
		controlSets: "原生控制组",
		controlSetsDescription: "自动建立的控制组仅用来说明哪些目标会一起被控制；不需要手动管理 Group ID 或 Group Key。",
		noControlSets: "没有读到可呈现的原生控制组。",
		activeRelationships: "条使用中的关系",
		controlSetPending: "此控制组尚在建立，尚未视为可用。",
		controlSetRepairNeeded: "此控制组需要修复；请先检查实体装置的群组设定。",
		reviewGroupCleanup: "检视群组清理计划",
		cleanupGroup: "清理原生群组",
		groupCleanupReviewTitle: "确认清理闲置原生群组",
		confirmGroupCleanup: "我已确认这会删除这个闲置群组的成员、ACL 与 Group Key。",
		groupCleanupNeedsBindingRemoval: "仍有控制关系使用这个群组；请先移除 Binding。",
		groupCleanupUnavailable: "只有 Studio 自动建立且没有使用中的控制关系的群组可以清理。",
		capacity: "群组与 Group Key 容量",
		capacityDescription: "装置回报且已快取的限制。建立群组广播前会先做容量预检。",
		acl: "目标装置 ACL",
		aclDescription: "选择一个输出端点后才读取它的存取控制规则；不会随 Fabric 重新整理而自动读取所有装置。",
		chooseAclTarget: "选择要检视 ACL 的输出目标",
		readAcl: "读取 ACL",
		readingAcl: "读取 ACL 中…",
		aclReadFailed: "无法读取这个目标的 ACL。",
		aclEntries: "ACL 规则",
		aclUsed: "已使用",
		aclAvailable: "可用",
		aclTargetsPerRule: "每条规则目标上限",
		aclAdministrator: "管理者",
		aclOperate: "操作授权",
		aclCase: "装置授权",
		aclGroup: "群组授权",
		aclOther: "其他授权",
		aclProtected: "受保护的管理者规则",
		aclInUse: "正在被控制关系使用",
		aclUnused: "未对应任何控制关系",
		aclUnknown: "无法安全判定是否仍在使用",
		aclSubjects: "来源",
		aclTargets: "目标与能力",
		aclWillAddEntries: "这次预计新增 {count} 条 ACL 规则。",
		selectAclEntry: "选取 ACL 规则",
		selectAllReclaimableAcl: "选取所有可回收 ACL",
		selectedAclEntries: "已选 {count} 条",
		reviewSelectedAclReclaim: "检视选取回收计划",
		noAclEntriesSelected: "请先选取至少一条可回收 ACL 规则。",
		reviewAclReclaim: "检视回收计划",
		reclaimAcl: "回收 ACL 规则",
		aclRemovalReviewTitle: "确认回收未使用 ACL 规则",
		confirmAclRemoval: "我已确认这会删除 {count} 条未使用的操作 ACL 规则。",
		aclRemovalKeepsInUse: "管理者与仍被既有 Binding 使用的 ACL 规则不会被移除。",
		groups: "群组",
		groupKeys: "Group Key",
		unavailable: "尚未取得",
		onOff: "开关",
		brightness: "亮度",
		colorTemperature: "色温",
		addRelationship: "新增控制关系",
		addRelationshipDescription: "先选来源、目标与能力，再检视实际会写入的原生 Matter 交易。",
		source: "控制来源",
		target: "控制目标",
		targets: "控制目标（可多选）",
		chooseSource: "选择可 Binding 的控制来源",
		chooseTarget: "选择输出目标",
		noTargets: "目前没有符合筛选条件的输出目标。",
		sameAreaOnly: "仅显示与来源相同区域的目标",
		capabilities: "要控制的能力",
		noSharedCapabilities: "所选 endpoint 没有可共同 Binding 的能力。",
		coverageReady: "完整支援",
		coveragePartial: "部分支援",
		notSupportedBy: "不支援的目标",
		reviewPlan: "检视写入计划",
		reviewTitle: "确认原生 Matter 写入",
		aclWillAdd: "写入前会在目标装置补上必要的操作 ACL。",
		aclAlreadyGranted: "目标装置已经具备必要的操作 ACL。",
		groupAclReview: "Studio 会为每个支援该能力的目标补上必要的群组操作 ACL。",
		replacesDirect: "这会在群组布建完成后，将选取目标的相同直接 Binding 改为群组广播。",
		confirmWrite: "我已确认此操作会变更真实 Matter 装置的 ACL 与 Binding。",
		applyBinding: "写入并读回验证",
		working: "处理中…"
	},
	en: {
		supportTitle: "Diagnostics and support",
		supportPrivacy: "Uses the last snapshot and up to 10 recent plan/apply outcomes; no device scan or write. Names, identities and keys are excluded. Review before sharing. Restart clears operation summaries.",
		inspectDiagnostics: "Inspect diagnostics",
		copyDiagnostics: "Copy summary",
		downloadDiagnostics: "Download JSON",
		diagnosticsCopied: "Diagnostics copied.",
		diagnosticsManualCopy: "Clipboard unavailable. Select and copy the text above, or download JSON.",
		recoveryTitle: "What next?",
		recoveryPlan: "This attempt did not apply a plan. Check device availability, capabilities or capacity, then review a new plan. Do not delete unfamiliar ACLs.",
		recoveryApply: "Some settings may have reached devices; there is no automatic rollback. Refresh and inspect current relationships before reviewing a new plan. Do not blindly repeat apply.",
		recoveryGroup: "Group, ACL or key settings may have changed. Refresh and inspect group status; preserve its record and do not repeatedly create new groups. Cleanup requires no remaining relationships and a new reviewed plan. Report blocked cleanup rather than bypassing it.",
		recoveryBatch: "Verified deletions remain applied. Inspect other sources and review a new plan for only remaining relationships. ACLs, groups and keys are retained.",
		recoveryDiagnostics: "Inspect the summary under Diagnostics and support. If state is unclear, preserve results and report the issue; do not reset devices or manually erase stored records.",
		aclEvidence: "Write evidence and shared relationships",
		aclRecorded: "Studio write recorded (not permission to delete)",
		aclUnrecorded: "Unknown origin or insufficient evidence",
		aclReferences: "Known shared relationships: {count}",
		aclReferencesIncomplete: "Based on the current cache and possibly incomplete; no known relationship does not mean unused.",
		searchRelationships: "Search sources or targets",
		filterArea: "Filter by area",
		allAreas: "All areas",
		selectVisible: "Select filtered results",
		selectedRelationships: "{count} selected",
		deleteSelected: "Delete {count} relationships",
		clearSelection: "Clear selection",
		selectRelationship: "Select relationship",
		noMatchingRelationships: "No relationships match these filters.",
		details: "Details",
		advanced: "Advanced: ACL and capacity",
		help: "Help",
		close: "Close",
		confirmDelete: "Confirm deletion",
		groupsNeedAttention: "Groups need attention",
		batchSummary: "Sources to update: {sources}; Binding entries to remove: {entries}. Each source is verified separately.",
		removalResults: "Removal results",
		verified: "Removed and verified",
		changed: "Table changed; no write. Review a new plan",
		failed: "Read failed; no write. Check connectivity before retrying",
		unverified: "Write may have completed; refresh and check before retrying",
		refreshBeforeRetry: "The outcome is unconfirmed. Refresh and check before retrying.",
		appName: "Matter Binding Studio",
		subtitle: "Inspect native Matter bindings with Home Assistant names",
		directBinding: "Native direct binding",
		refresh: "Refresh",
		refreshing: "Refreshing…",
		scope: "One target creates a native direct binding. Multiple targets create and verify an automatically managed native groupcast.",
		loading: "Reading the Matter fabric…",
		readFailed: "Matter Fabric could not be read. Please try refreshing again.",
		notConnected: "This preview is not connected to Home Assistant.",
		controlRelationships: "Control relationships",
		relationshipDescription: "Existing native Matter bindings, shown with Home Assistant device names.",
		noRelationships: "No readable control relationships were found.",
		reviewRemoval: "Review removal",
		removalReviewTitle: "Confirm native Matter Binding removal",
		removeBinding: "Remove Binding",
		confirmRemoval: "I understand this removes the Binding entries for this control relationship.",
		removalKeepsGroup: "This removes only the Binding. The native group, Group Key, membership, and ACLs remain unchanged.",
		removalUnavailable: "This relationship has incomplete technical identity. Refresh and try again.",
		bindingEntries: "Binding entries",
		cancel: "Cancel",
		direct: "Direct",
		nativeGroup: "Native group",
		members: "targets",
		controlSets: "Native control sets",
		controlSetsDescription: "Automatic control sets explain which targets act together. Group IDs and Group Keys are never a manual management task.",
		noControlSets: "No readable native control sets were found.",
		activeRelationships: "active relationships",
		controlSetPending: "This control set is still being created and is not considered ready.",
		controlSetRepairNeeded: "This control set needs repair. Check its physical Matter group configuration first.",
		reviewGroupCleanup: "Review group cleanup",
		cleanupGroup: "Clean up native group",
		groupCleanupReviewTitle: "Confirm idle native group cleanup",
		confirmGroupCleanup: "I understand this removes this idle group's members, ACLs, and Group Key.",
		groupCleanupNeedsBindingRemoval: "This group is still used by a control relationship; remove its Binding first.",
		groupCleanupUnavailable: "Only an idle Studio-created group can be cleaned up.",
		capacity: "Group and Group Key capacity",
		capacityDescription: "Cached device-reported limits. Groupcast creation preflights this capacity before making changes.",
		acl: "Target ACL",
		aclDescription: "Read one selected output endpoint's access-control rules on demand; a Fabric refresh does not query every device.",
		chooseAclTarget: "Choose an output target to inspect its ACL",
		readAcl: "Read ACL",
		readingAcl: "Reading ACL…",
		aclReadFailed: "This target's ACL could not be read.",
		aclEntries: "ACL rules",
		aclUsed: "Used",
		aclAvailable: "Available",
		aclTargetsPerRule: "Targets per rule",
		aclAdministrator: "Administrator",
		aclOperate: "Operate access",
		aclCase: "Device access",
		aclGroup: "Group access",
		aclOther: "Other access",
		aclProtected: "Protected administrator rule",
		aclInUse: "Used by control relationship",
		aclUnused: "Not matched to a control relationship",
		aclUnknown: "Cannot safely determine whether this is still in use",
		aclSubjects: "Source",
		aclTargets: "Targets and capabilities",
		aclWillAddEntries: "This plan will add {count} ACL rule(s).",
		selectAclEntry: "Select ACL rule",
		selectAllReclaimableAcl: "Select all reclaimable ACLs",
		selectedAclEntries: "{count} selected",
		reviewSelectedAclReclaim: "Review selected reclaim",
		noAclEntriesSelected: "Select at least one reclaimable ACL rule first.",
		reviewAclReclaim: "Review reclaim",
		reclaimAcl: "Reclaim ACL rule",
		aclRemovalReviewTitle: "Confirm unused ACL reclaim",
		confirmAclRemoval: "I understand this removes {count} unused operate ACL rule(s).",
		aclRemovalKeepsInUse: "Administrator and ACL rules used by existing Bindings are not removed.",
		groups: "Groups",
		groupKeys: "Group Keys",
		unavailable: "Unavailable",
		onOff: "On / Off",
		brightness: "Brightness",
		colorTemperature: "Color temperature",
		addRelationship: "Add control relationship",
		addRelationshipDescription: "Choose a source, target, and capability, then review the native Matter transaction before any device is changed.",
		source: "Control source",
		target: "Control target",
		targets: "Control targets (multiple allowed)",
		chooseSource: "Choose a bindable control source",
		chooseTarget: "Choose an output target",
		noTargets: "No output targets match the current filter.",
		sameAreaOnly: "Only show targets in the source area",
		capabilities: "Capabilities to control",
		noSharedCapabilities: "The selected endpoints have no compatible binding capability.",
		coverageReady: "ready",
		coveragePartial: "partial",
		notSupportedBy: "Not supported by",
		reviewPlan: "Review write plan",
		reviewTitle: "Confirm native Matter write",
		aclWillAdd: "The required operate ACL will be added to the target before binding.",
		aclAlreadyGranted: "The target already grants the required operate ACL.",
		groupAclReview: "Studio will add the required group operate ACL to every target that supports each selected capability.",
		replacesDirect: "After group provisioning succeeds, matching direct bindings for the selected targets will be converted to groupcast.",
		confirmWrite: "I understand this changes the real Matter device ACL and Binding.",
		applyBinding: "Write and verify",
		working: "Working…"
	}
};
//#endregion
//#region src/messages.ts
function m(e) {
	let t = (e?.locale?.language ?? e?.language ?? "en").toLowerCase().replaceAll("_", "-");
	return /^zh-hans(?:-|$)/.test(t) ? "zh-Hans" : t === "zh" || /^zh-(hant(?:-|$)|tw(?:-|$)|hk(?:-|$)|mo(?:-|$))/.test(t) ? "zh-Hant" : /^zh-(cn|sg|my)(?:-|$)/.test(t) ? "zh-Hans" : "en";
}
function h(e, t) {
	if (typeof e == "string") return e;
	let n = t === p["zh-Hant"] ? "zh-Hant" : t === p["zh-Hans"] ? "zh-Hans" : "en", r = f[e.code];
	return (r?.[n] ?? r?.en ?? e.fallback ?? f.unexpected_error[n]).replace(/\{(\w+)\}/g, (t, n) => {
		let r = e.params?.[n];
		return r === void 0 ? t : String(r);
	});
}
function g(e) {
	if (typeof e == "object" && e) {
		let t = e;
		if (t.studio_message && typeof t.studio_message == "object" && typeof t.studio_message.code == "string") return t.studio_message;
		if (t.error) return g(t.error);
		if (typeof t.message == "string" && t.message) return t.message;
	}
	return { code: "unexpected_error" };
}
function _(e) {
	if (Array.isArray(e)) return e.map(_);
	if (!e || typeof e != "object") return e;
	let t = e, n = Object.fromEntries(Object.entries(t).map(([e, t]) => [e, _(t)]));
	for (let e of [
		"message",
		"steps",
		"warnings",
		"subjects",
		"endpoint",
		"capability"
	]) t[`${e}_i18n`] !== void 0 && (n[e] = t[`${e}_i18n`]);
	return n;
}
async function v(e, t) {
	return _(await e.callWS(t));
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
var y = /* @__PURE__ */ t(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), b = (/* @__PURE__ */ t(((e, t) => {
	t.exports = y();
})))();
function x({ hass: e, t }) {
	let [n, r] = (0, u.useState)(""), [i, a] = (0, u.useState)(!1), [o, s] = (0, u.useState)(null), [c, l] = (0, u.useState)(null), d = async () => {
		if (e) {
			a(!0), l(null), s(null), r("");
			try {
				let t = await v(e, { type: "matter_binding_studio/get_diagnostics" });
				r(JSON.stringify(t, null, 2));
			} catch (e) {
				l(g(e));
			} finally {
				a(!1);
			}
		}
	}, f = async () => {
		try {
			await navigator.clipboard.writeText(n), s("copied");
		} catch {
			s("manual");
		}
	};
	return /* @__PURE__ */ (0, b.jsxs)("details", {
		className: "mbs-fold mbs-support",
		children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: t.supportTitle }), /* @__PURE__ */ (0, b.jsxs)("section", { children: [
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-description",
				children: t.supportPrivacy
			}),
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "mbs-review-actions",
				children: /* @__PURE__ */ (0, b.jsx)("button", {
					disabled: !e || i,
					onClick: () => void d(),
					children: i ? t.working : t.inspectDiagnostics
				})
			}),
			c ? /* @__PURE__ */ (0, b.jsx)("p", {
				role: "alert",
				className: "mbs-warning",
				children: h(c, t)
			}) : null,
			n ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
				/* @__PURE__ */ (0, b.jsx)("textarea", {
					"aria-label": t.supportTitle,
					readOnly: !0,
					rows: 10,
					value: n
				}),
				/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "mbs-review-actions",
					children: [/* @__PURE__ */ (0, b.jsx)("button", {
						onClick: () => void f(),
						children: t.copyDiagnostics
					}), /* @__PURE__ */ (0, b.jsx)("button", {
						onClick: () => {
							let e = URL.createObjectURL(new Blob([n], { type: "application/json" })), t = document.createElement("a");
							t.href = e, t.download = "matter-binding-studio-diagnostics.json", t.click(), setTimeout(() => URL.revokeObjectURL(e), 1e3);
						},
						children: t.downloadDiagnostics
					})]
				}),
				o ? /* @__PURE__ */ (0, b.jsx)("p", {
					role: "status",
					children: o === "copied" ? t.diagnosticsCopied : t.diagnosticsManualCopy
				}) : null
			] }) : null
		] })]
	});
}
function S({ kind: e, t }) {
	return /* @__PURE__ */ (0, b.jsxs)("details", {
		className: "mbs-recovery",
		children: [
			/* @__PURE__ */ (0, b.jsx)("summary", { children: t.recoveryTitle }),
			/* @__PURE__ */ (0, b.jsx)("p", { children: e === "plan" ? t.recoveryPlan : e === "group" ? t.recoveryGroup : e === "batch" ? t.recoveryBatch : t.recoveryApply }),
			/* @__PURE__ */ (0, b.jsx)("p", { children: t.recoveryDiagnostics })
		]
	});
}
//#endregion
//#region src/BindingList.tsx
function ee({ hass: e, relationships: t, refresh: n, t: r }) {
	let [i, a] = (0, u.useState)(""), [o, s] = (0, u.useState)(""), [c, l] = (0, u.useState)([]), [d, f] = (0, u.useState)(null), [p, m] = (0, u.useState)(!1), [_, y] = (0, u.useState)(null), [x, ee] = (0, u.useState)(!1), [C, w] = (0, u.useState)([]), T = (0, u.useRef)(null), E = (0, u.useRef)(null), D = [...new Set(t.flatMap((e) => [e.source, ...e.targets.members].map((e) => e.area_name).filter((e) => !!e)))].sort(), O = t.filter((e) => {
		let t = [e.source, ...e.targets.members];
		return (!o || t.some((e) => e.area_name === o)) && `${k(e.source)} ${pe(e)}`.toLocaleLowerCase().includes(i.trim().toLocaleLowerCase());
	}).sort((e, t) => k(e.source).localeCompare(k(t.source), "zh-Hant", { numeric: !0 }) || e.id.localeCompare(t.id)), te = new Set(c), ne = O.length > 0 && O.every((e) => te.has(e.id));
	(0, u.useEffect)(() => {
		let e = new Set(t.map((e) => e.id));
		l((t) => t.filter((t) => e.has(t)));
	}, [t]), (0, u.useEffect)(() => {
		o && !t.some((e) => [e.source, ...e.targets.members].some((e) => e.area_name === o)) && s("");
	}, [t, o]), (0, u.useEffect)(() => {
		E.current && (E.current.indeterminate = c.length > 0 && !ne);
	}, [c.length, ne]), (0, u.useEffect)(() => {
		d ? T.current?.showModal() : T.current?.close();
	}, [d]);
	let re = async (t) => {
		if (!(!e || !t.length)) {
			m(!0), y(null), ee(!1), w([]);
			try {
				f(await v(e, {
					type: "matter_binding_studio/prepare_bulk_remove_bindings",
					relationship_ids: t
				}));
			} catch (e) {
				y(g(e));
			} finally {
				m(!1);
			}
		}
	}, ie = async () => {
		if (!(!e || !d)) {
			m(!0), y(null), ee(!1);
			try {
				let t = await v(e, {
					type: "matter_binding_studio/apply_bulk_remove_bindings",
					plan_id: d.plan_id,
					confirm: !0
				});
				w(t.results);
				let n = new Set(t.results.filter((e) => e.status === "verified").flatMap((e) => e.relationship_ids));
				l((e) => e.filter((e) => !n.has(e)));
			} catch (e) {
				y(g(e)), ee(!0);
			} finally {
				f(null), await n(), m(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, b.jsxs)("section", {
		className: "mbs-binding-section",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-section-title",
				children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: r.controlRelationships }), /* @__PURE__ */ (0, b.jsx)("span", { children: t.length })]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-list-toolbar",
				children: [/* @__PURE__ */ (0, b.jsx)("input", {
					"aria-label": r.searchRelationships,
					placeholder: r.searchRelationships,
					value: i,
					disabled: p || !!d,
					onChange: (e) => {
						a(e.target.value), l([]);
					}
				}), /* @__PURE__ */ (0, b.jsxs)("select", {
					"aria-label": r.filterArea,
					value: o,
					disabled: p || !!d,
					onChange: (e) => {
						s(e.target.value), l([]);
					},
					children: [/* @__PURE__ */ (0, b.jsx)("option", {
						value: "",
						children: r.allAreas
					}), D.map((e) => /* @__PURE__ */ (0, b.jsx)("option", { children: e }, e))]
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-selection-bar",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("label", { children: [/* @__PURE__ */ (0, b.jsx)("input", {
						ref: E,
						type: "checkbox",
						checked: ne,
						disabled: !O.length || p || !!d,
						onChange: (e) => l(e.target.checked ? O.map((e) => e.id) : [])
					}), r.selectVisible] }),
					/* @__PURE__ */ (0, b.jsx)("span", { children: r.selectedRelationships.replace("{count}", String(c.length)) }),
					c.length > 0 ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [/* @__PURE__ */ (0, b.jsx)("button", {
						disabled: p,
						onClick: () => l([]),
						children: r.clearSelection
					}), /* @__PURE__ */ (0, b.jsx)("button", {
						className: "mbs-danger-button",
						disabled: p,
						onClick: () => void re(c),
						children: r.deleteSelected.replace("{count}", String(c.length))
					})] }) : null
				]
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-compact-list",
				children: [O.map((e) => /* @__PURE__ */ (0, b.jsxs)("article", {
					className: "mbs-binding-row",
					children: [
						/* @__PURE__ */ (0, b.jsx)("input", {
							type: "checkbox",
							"aria-label": `${r.selectRelationship}: ${k(e.source)} → ${pe(e)}`,
							checked: te.has(e.id),
							disabled: p || !!d,
							onChange: (t) => l((n) => t.target.checked ? [...n, e.id] : n.filter((t) => t !== e.id))
						}),
						/* @__PURE__ */ (0, b.jsxs)("div", {
							className: "mbs-binding-path",
							children: [
								/* @__PURE__ */ (0, b.jsx)("strong", { children: k(e.source) }),
								/* @__PURE__ */ (0, b.jsx)("span", {
									"aria-hidden": "true",
									children: "→"
								}),
								/* @__PURE__ */ (0, b.jsx)("strong", { children: pe(e) })
							]
						}),
						/* @__PURE__ */ (0, b.jsx)("span", {
							className: "mbs-inline-capabilities",
							children: e.clusters.map((e) => be(e, r)).join(" · ")
						}),
						/* @__PURE__ */ (0, b.jsxs)("details", {
							className: "mbs-row-details",
							children: [
								/* @__PURE__ */ (0, b.jsx)("summary", { children: r.details }),
								/* @__PURE__ */ (0, b.jsx)("p", { children: e.route === "direct" ? r.direct : r.nativeGroup }),
								/* @__PURE__ */ (0, b.jsxs)("p", { children: [
									"Node ",
									e.source.node_id,
									" / Endpoint ",
									e.source.endpoint_id
								] }),
								e.targets.members.map((e) => /* @__PURE__ */ (0, b.jsxs)("p", { children: [
									k(e),
									" · Node ",
									e.node_id,
									" / Endpoint ",
									e.endpoint_id
								] }, `${e.node_id}:${e.endpoint_id}`)),
								/* @__PURE__ */ (0, b.jsx)("button", {
									disabled: p,
									onClick: () => void re([e.id]),
									children: r.removeBinding
								})
							]
						})
					]
				}, e.id)), O.length ? null : /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-empty",
					children: t.length ? r.noMatchingRelationships : r.noRelationships
				})]
			}),
			_ ? /* @__PURE__ */ (0, b.jsxs)("p", {
				role: "alert",
				className: "mbs-warning",
				children: [h(_, r), x ? ` ${r.refreshBeforeRetry}` : ""]
			}) : null,
			C.length ? /* @__PURE__ */ (0, b.jsxs)("div", {
				"aria-live": "polite",
				className: "mbs-batch-results",
				children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: r.removalResults }), C.map((e) => /* @__PURE__ */ (0, b.jsxs)("p", {
					className: e.status === "verified" ? "mbs-success" : "mbs-warning",
					children: [
						k(e.source),
						" — ",
						r[e.status],
						" (",
						e.relationship_ids.length,
						")"
					]
				}, `${e.source.node_id}:${e.source.endpoint_id}`))]
			}) : null,
			_ || C.some((e) => e.status !== "verified") ? /* @__PURE__ */ (0, b.jsx)(S, {
				kind: x || C.length ? "batch" : "plan",
				t: r
			}) : null,
			/* @__PURE__ */ (0, b.jsx)("dialog", {
				ref: T,
				className: "mbs-dialog",
				"aria-labelledby": "mbs-delete-title",
				onCancel: (e) => {
					p ? e.preventDefault() : f(null);
				},
				children: d ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
					/* @__PURE__ */ (0, b.jsx)("h2", {
						id: "mbs-delete-title",
						children: r.deleteSelected.replace("{count}", String(d.relationships.length))
					}),
					/* @__PURE__ */ (0, b.jsx)("ul", { children: d.relationships.map((e) => /* @__PURE__ */ (0, b.jsxs)("li", { children: [
						k(e.source),
						" → ",
						pe(e)
					] }, e.id)) }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: r.batchSummary.replace("{sources}", String(d.source_count)).replace("{entries}", String(d.removed_entry_count)) }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: r.removalKeepsGroup }),
					/* @__PURE__ */ (0, b.jsxs)("div", {
						className: "mbs-review-actions",
						children: [/* @__PURE__ */ (0, b.jsx)("button", {
							autoFocus: !0,
							disabled: p,
							onClick: () => f(null),
							children: r.cancel
						}), /* @__PURE__ */ (0, b.jsx)("button", {
							disabled: p,
							className: "mbs-danger-button",
							onClick: () => void ie(),
							children: p ? r.working : r.confirmDelete
						})]
					})
				] }) : null
			})
		]
	});
}
//#endregion
//#region src/App.tsx
function C({ hass: e }) {
	let t = p[m(e)], n = (0, u.useRef)(e), r = (0, u.useRef)(!1), [i, a] = (0, u.useState)(null), [o, s] = (0, u.useState)(!1), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(!1), [g, _] = (0, u.useState)(!1);
	n.current = e;
	let y = (0, u.useCallback)(async () => {
		let e = n.current;
		if (e) {
			s(!0), l(!1);
			try {
				a(await v(e, { type: "matter_binding_studio/get_snapshot" }));
			} catch {
				l(!0);
			} finally {
				s(!1);
			}
		}
	}, []);
	(0, u.useEffect)(() => {
		!e || r.current || (r.current = !0, y());
	}, [e]);
	let S = !!e && i === null && o;
	return /* @__PURE__ */ (0, b.jsx)("div", {
		className: "mbs-root",
		children: /* @__PURE__ */ (0, b.jsxs)("main", {
			className: "mbs-panel",
			children: [
				/* @__PURE__ */ (0, b.jsxs)("header", {
					className: "mbs-header",
					children: [/* @__PURE__ */ (0, b.jsx)("div", { children: /* @__PURE__ */ (0, b.jsx)("h1", { children: t.appName }) }), /* @__PURE__ */ (0, b.jsxs)("div", {
						className: "mbs-header-actions",
						children: [/* @__PURE__ */ (0, b.jsx)("button", {
							disabled: !i || !e,
							onClick: () => f(!0),
							children: t.addRelationship
						}), /* @__PURE__ */ (0, b.jsx)("button", {
							type: "button",
							onClick: () => void y(),
							disabled: !e || o,
							"aria-busy": o,
							children: o && i ? t.refreshing : t.refresh
						})]
					})]
				}),
				/* @__PURE__ */ (0, b.jsxs)("details", {
					className: "mbs-help",
					children: [/* @__PURE__ */ (0, b.jsx)("summary", { children: t.help }), /* @__PURE__ */ (0, b.jsx)("p", { children: t.scope })]
				}),
				e ? null : /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-notice",
					children: t.notConnected
				}),
				c ? /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-warning",
					children: t.readFailed
				}) : null,
				i?.warnings.map((e, n) => /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-warning",
					children: h(e, t)
				}, n)),
				S ? /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-loading",
					children: t.loading
				}) : null,
				i ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [d ? /* @__PURE__ */ (0, b.jsx)(w, {
					busy: g,
					close: () => f(!1),
					t,
					children: /* @__PURE__ */ (0, b.jsx)(T, {
						hass: e,
						snapshot: i,
						refresh: y,
						t,
						onBusy: _
					})
				}) : null, /* @__PURE__ */ (0, b.jsx)(ue, {
					hass: e,
					snapshot: i,
					refresh: y,
					t
				})] }) : null,
				/* @__PURE__ */ (0, b.jsx)(x, {
					hass: e,
					t
				})
			]
		})
	});
}
function w({ children: e, close: t, t: n, busy: r }) {
	let i = (0, u.useRef)(null);
	return (0, u.useEffect)(() => {
		i.current?.showModal();
	}, []), /* @__PURE__ */ (0, b.jsxs)("dialog", {
		ref: i,
		className: "mbs-dialog mbs-drawer",
		"aria-label": n.addRelationship,
		onCancel: (e) => {
			r ? e.preventDefault() : t();
		},
		children: [/* @__PURE__ */ (0, b.jsx)("button", {
			className: "mbs-drawer-close",
			disabled: r,
			onClick: t,
			children: n.close
		}), e]
	});
}
function T({ hass: e, snapshot: t, refresh: n, t: r, onBusy: i }) {
	let [a, o] = (0, u.useState)(""), [s, c] = (0, u.useState)([]), [l, d] = (0, u.useState)(!1), [f, p] = (0, u.useState)([]), [m, _] = (0, u.useState)(null), [y, x] = (0, u.useState)(!1);
	(0, u.useEffect)(() => {
		i(y);
	}, [y, i]);
	let [ee, C] = (0, u.useState)(!1), [w, T] = (0, u.useState)(null), [D, te] = (0, u.useState)(!1), [ne, j] = (0, u.useState)("plan"), se = t.devices.filter((e) => e.can_bind), ce = se.find((e) => E(e) === a), le = t.devices.filter((e) => e.can_be_target && E(e) !== a).sort(O), ue = l && ce?.area_name ? le.filter((e) => e.area_name === ce.area_name) : le, M = ue.filter((e) => s.includes(E(e))), N = ie(ce, M), fe = ae(ce, M, N), pe = M.length > 1 ? "native_group" : "direct", _e = (e) => {
		let t = se.find((t) => E(t) === e), n = le.filter((e) => s.includes(E(e))), r = !!t?.area_name;
		o(e), d(r);
		let i = n.filter((n) => E(n) !== e && (!r || re(t, n)));
		c(i.map(E)), p(ie(t, i)), _(null), T(null);
	}, ve = (e) => {
		let t = ue.filter((t) => e.includes(E(t)));
		c(t.map(E)), p(ie(ce, t)), _(null), T(null);
	}, ye = (e) => {
		d(e);
		let t = e ? M.filter((e) => re(ce, e)) : M;
		c(t.map(E)), p(ie(ce, t)), _(null);
	}, xe = (e) => {
		_(null), p((t) => t.includes(e) ? t.filter((t) => t !== e) : [...t, e]);
	}, Se = async () => {
		if (!(!e || !ce || !M.length || !f.length)) {
			x(!0), T(null), j("plan");
			try {
				let t = M.length === 1 ? await v(e, {
					type: "matter_binding_studio/prepare_unicast",
					source_node_id: ce.node_id,
					source_endpoint_id: ce.endpoint_id,
					target_node_id: M[0].node_id,
					target_endpoint_id: M[0].endpoint_id,
					clusters: f
				}) : await v(e, {
					type: "matter_binding_studio/prepare_groupcast",
					source_node_id: ce.node_id,
					source_endpoint_id: ce.endpoint_id,
					targets: M.map((e) => ({
						node_id: e.node_id,
						endpoint_id: e.endpoint_id
					})),
					clusters: f
				});
				C(!1), _(t);
			} catch (e) {
				T(g(e)), te(!0);
			} finally {
				x(!1);
			}
		}
	}, Ce = async () => {
		if (!(!e || !m || !ee)) {
			x(!0), T(null), j(m.route === "native_group" ? "group" : "apply");
			try {
				let t = await v(e, {
					type: m.route === "direct" ? "matter_binding_studio/apply_unicast" : "matter_binding_studio/apply_groupcast",
					plan_id: m.plan_id,
					confirm: !0
				});
				T(t.message), te(!t.success || !t.verified);
			} catch (e) {
				T(g(e)), te(!0);
			} finally {
				_(null), C(!1), await n(), x(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, b.jsxs)("section", {
		className: "mbs-composer",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-section-title",
				children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: r.addRelationship }), /* @__PURE__ */ (0, b.jsx)("span", { children: pe === "native_group" ? r.nativeGroup : r.direct })]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-description",
				children: r.addRelationshipDescription
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-form-grid",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("label", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: r.source }), /* @__PURE__ */ (0, b.jsxs)("select", {
						value: a,
						onChange: (e) => _e(e.target.value),
						children: [/* @__PURE__ */ (0, b.jsx)("option", {
							value: "",
							disabled: !0,
							children: r.chooseSource
						}), se.map((e) => /* @__PURE__ */ (0, b.jsx)("option", {
							value: E(e),
							children: k(e)
						}, E(e)))]
					})] }),
					/* @__PURE__ */ (0, b.jsxs)("fieldset", {
						className: "mbs-target-picker",
						children: [/* @__PURE__ */ (0, b.jsx)("legend", { children: r.targets }), ue.length ? ue.map((e) => {
							let t = E(e);
							return /* @__PURE__ */ (0, b.jsxs)("label", { children: [/* @__PURE__ */ (0, b.jsx)("input", {
								type: "checkbox",
								checked: s.includes(t),
								onChange: (e) => ve(e.target.checked ? [...s, t] : s.filter((e) => e !== t))
							}), /* @__PURE__ */ (0, b.jsx)("span", { children: k(e) })] }, t);
						}) : /* @__PURE__ */ (0, b.jsx)("p", {
							className: "mbs-meta",
							children: r.noTargets
						})]
					}),
					/* @__PURE__ */ (0, b.jsxs)("label", {
						className: "mbs-area-filter",
						children: [/* @__PURE__ */ (0, b.jsx)("input", {
							type: "checkbox",
							checked: l,
							onChange: (e) => ye(e.target.checked)
						}), /* @__PURE__ */ (0, b.jsx)("span", { children: r.sameAreaOnly })]
					})
				]
			}),
			ce && M.length ? /* @__PURE__ */ (0, b.jsxs)("fieldset", {
				className: "mbs-capability-picker",
				children: [/* @__PURE__ */ (0, b.jsx)("legend", { children: r.capabilities }), N.length ? N.map((e) => /* @__PURE__ */ (0, b.jsxs)("label", { children: [
					/* @__PURE__ */ (0, b.jsx)("input", {
						type: "checkbox",
						checked: f.includes(e),
						onChange: () => xe(e)
					}),
					/* @__PURE__ */ (0, b.jsx)("span", { children: be(e, r) }),
					/* @__PURE__ */ (0, b.jsx)("small", {
						className: oe(fe, e)?.supported_members === M.length ? "" : "mbs-partial",
						children: A(oe(fe, e), r)
					})
				] }, e)) : /* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-warning",
					children: r.noSharedCapabilities
				})]
			}) : null,
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "mbs-actions",
				children: /* @__PURE__ */ (0, b.jsx)("button", {
					type: "button",
					onClick: () => void Se(),
					disabled: !ce || !M.length || !f.length || y,
					children: y ? r.working : r.reviewPlan
				})
			}),
			m ? /* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-review",
				children: [
					/* @__PURE__ */ (0, b.jsx)("strong", { children: r.reviewTitle }),
					/* @__PURE__ */ (0, b.jsxs)("p", { children: [
						k(m.source),
						" → ",
						m.route === "direct" ? k(m.target) : `${m.targets.length} ${r.members}`
					] }),
					/* @__PURE__ */ (0, b.jsx)(me, {
						clusters: m.clusters,
						t: r
					}),
					m.route === "native_group" ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
						/* @__PURE__ */ (0, b.jsx)(ge, { members: m.targets }),
						/* @__PURE__ */ (0, b.jsx)(he, {
							coverage: m.coverage,
							t: r
						}),
						m.replaces_direct_binding ? /* @__PURE__ */ (0, b.jsx)("p", {
							className: "mbs-meta",
							children: r.replacesDirect
						}) : null
					] }) : null,
					/* @__PURE__ */ (0, b.jsx)("ul", { children: m.steps.map((e, t) => /* @__PURE__ */ (0, b.jsx)("li", { children: h(e, r) }, t)) }),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "mbs-meta",
						children: m.route === "direct" ? m.acl === "will_add" ? r.aclWillAdd : r.aclAlreadyGranted : r.groupAclReview
					}),
					m.route === "direct" && m.acl_capacity ? /* @__PURE__ */ (0, b.jsx)(de, {
						capacity: m.acl_capacity,
						t: r
					}) : null,
					/* @__PURE__ */ (0, b.jsxs)("label", {
						className: "mbs-confirm",
						children: [/* @__PURE__ */ (0, b.jsx)("input", {
							type: "checkbox",
							checked: ee,
							onChange: (e) => C(e.target.checked)
						}), r.confirmWrite]
					}),
					/* @__PURE__ */ (0, b.jsx)("button", {
						type: "button",
						onClick: () => void Ce(),
						disabled: !ee || y,
						children: y ? r.working : r.applyBinding
					})
				]
			}) : null,
			w ? /* @__PURE__ */ (0, b.jsx)("p", {
				className: D ? "mbs-warning" : "mbs-success",
				children: h(w, r)
			}) : null,
			w && D ? /* @__PURE__ */ (0, b.jsx)(S, {
				kind: ne,
				t: r
			}) : null
		]
	});
}
function E(e) {
	return `${e.node_id}:${e.endpoint_id}`;
}
var D = new Intl.Collator("zh-Hant", {
	numeric: !0,
	sensitivity: "base"
});
function O(e, t) {
	return D.compare(e.area_name ?? "", t.area_name ?? "") || D.compare(e.node_name ?? "", t.node_name ?? "") || D.compare(e.name, t.name) || (e.node_id ?? 2 ** 53 - 1) - (t.node_id ?? 2 ** 53 - 1) || (e.endpoint_id ?? 2 ** 53 - 1) - (t.endpoint_id ?? 2 ** 53 - 1);
}
function k(e) {
	let t = e.area_name?.trim() || "", n = e.name.trim(), r = te(e, n), i = t ? `${t} - ` : "";
	return r ? `${i}${r} · ${n}` : `${i}${n}`;
}
function te(e, t) {
	let n = ne(e.node_name?.trim() || "", e.area_name?.trim() || "");
	return !n || se(n, t) ? null : n;
}
function ne(e, t) {
	let n = e;
	if (t) {
		let e = RegExp(`^${le(t)}\\s*[-–—]\\s*`);
		n = n.replace(e, "").trim();
	}
	return n;
}
function re(e, t) {
	return !!(e?.area_name && t?.area_name && e.area_name === t.area_name);
}
function ie(e, t = []) {
	return !e || !t.length ? [] : e.client_capabilities.filter((e) => t.some((t) => t.server_capabilities.includes(e)));
}
function ae(e, t, n) {
	return e ? n.map((e) => {
		let n = t.filter((t) => t.server_capabilities.includes(e));
		return {
			cluster_id: e,
			supported_members: n.length,
			total_members: t.length,
			unsupported_members: t.filter((e) => !n.includes(e)).map(k)
		};
	}) : [];
}
function oe(e, t) {
	return e.find((e) => e.cluster_id === t);
}
function A(e, t) {
	if (!e) return "";
	let n = e.supported_members === e.total_members ? t.coverageReady : t.coveragePartial;
	return `${e.supported_members} / ${e.total_members} ${n}`;
}
function j(e, t) {
	return e.replace("{count}", String(t));
}
function se(e, t) {
	return ce(e) === ce(t);
}
function ce(e) {
	return e.toLocaleLowerCase().replace(/[\s\-–—]/g, "");
}
function le(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ue({ hass: e, snapshot: t, refresh: n, t: r }) {
	let [i, a] = (0, u.useState)(null), [o, s] = (0, u.useState)(!1), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(null), [p, m] = (0, u.useState)(!1), [_, y] = (0, u.useState)("plan"), x = async (t) => {
		if (y("plan"), !e || !t.managed_by_studio || t.active_relationships > 0) {
			f(t.active_relationships > 0 ? r.groupCleanupNeedsBindingRemoval : r.groupCleanupUnavailable), m(!0);
			return;
		}
		l(!0), f(null);
		try {
			a(await v(e, {
				type: "matter_binding_studio/prepare_cleanup_group",
				group_id: t.group_id
			})), s(!1);
		} catch (e) {
			f(g(e)), m(!0);
		} finally {
			l(!1);
		}
	}, C = async () => {
		if (!(!e || !i || !o)) {
			l(!0), f(null), y("group");
			try {
				let t = await v(e, {
					type: "matter_binding_studio/apply_cleanup_group",
					plan_id: i.plan_id,
					confirm: !0
				});
				f(t.message), m(!t.success || !t.verified);
			} catch (e) {
				f(g(e)), m(!0);
			} finally {
				a(null), s(!1), await n(), l(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "mbs-content",
		children: [
			/* @__PURE__ */ (0, b.jsx)(ee, {
				hass: e,
				relationships: t.relationships,
				refresh: n,
				t: r
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "mbs-fold",
				children: [/* @__PURE__ */ (0, b.jsxs)("summary", { children: [
					r.controlSets,
					" (",
					t.native_control_sets.length,
					")",
					t.native_control_sets.some((e) => e.status === "pending" || e.status === "repair_needed") ? /* @__PURE__ */ (0, b.jsxs)("span", {
						className: "mbs-attention",
						children: [" · ", r.groupsNeedAttention]
					}) : null
				] }), /* @__PURE__ */ (0, b.jsxs)("section", { children: [
					/* @__PURE__ */ (0, b.jsx)(ve, {
						title: r.controlSets,
						count: t.native_control_sets.length
					}),
					/* @__PURE__ */ (0, b.jsx)("p", {
						className: "mbs-description",
						children: r.controlSetsDescription
					}),
					t.native_control_sets.length ? /* @__PURE__ */ (0, b.jsx)("div", {
						className: "mbs-list",
						children: t.native_control_sets.map((e) => /* @__PURE__ */ (0, b.jsx)(fe, {
							controlSet: e,
							t: r,
							onReviewCleanup: x,
							cleanupWorking: c
						}, e.group_id))
					}) : /* @__PURE__ */ (0, b.jsx)(ye, { text: r.noControlSets }),
					i ? /* @__PURE__ */ (0, b.jsxs)("div", {
						className: "mbs-review mbs-removal-review",
						children: [
							/* @__PURE__ */ (0, b.jsx)("strong", { children: r.groupCleanupReviewTitle }),
							/* @__PURE__ */ (0, b.jsx)("p", { children: i.name }),
							/* @__PURE__ */ (0, b.jsx)(ge, { members: i.members }),
							/* @__PURE__ */ (0, b.jsx)(me, {
								clusters: i.clusters,
								t: r
							}),
							/* @__PURE__ */ (0, b.jsx)("ul", { children: i.steps.map((e, t) => /* @__PURE__ */ (0, b.jsx)("li", { children: h(e, r) }, t)) }),
							/* @__PURE__ */ (0, b.jsxs)("label", {
								className: "mbs-confirm",
								children: [/* @__PURE__ */ (0, b.jsx)("input", {
									type: "checkbox",
									checked: o,
									onChange: (e) => s(e.target.checked)
								}), r.confirmGroupCleanup]
							}),
							/* @__PURE__ */ (0, b.jsxs)("div", {
								className: "mbs-review-actions",
								children: [/* @__PURE__ */ (0, b.jsx)("button", {
									type: "button",
									onClick: () => {
										a(null), s(!1);
									},
									disabled: c,
									children: r.cancel
								}), /* @__PURE__ */ (0, b.jsx)("button", {
									type: "button",
									className: "mbs-danger-button",
									onClick: () => void C(),
									disabled: !o || c,
									children: c ? r.working : r.cleanupGroup
								})]
							})
						]
					}) : null,
					d ? /* @__PURE__ */ (0, b.jsx)("p", {
						className: p ? "mbs-warning" : "mbs-success",
						children: h(d, r)
					}) : null,
					d && p ? /* @__PURE__ */ (0, b.jsx)(S, {
						kind: _,
						t: r
					}) : null
				] })]
			}),
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "mbs-fold",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: r.advanced }),
					/* @__PURE__ */ (0, b.jsx)(M, {
						hass: e,
						snapshot: t,
						t: r
					}),
					/* @__PURE__ */ (0, b.jsxs)("section", { children: [
						/* @__PURE__ */ (0, b.jsx)(ve, {
							title: r.capacity,
							count: t.capacities.length
						}),
						/* @__PURE__ */ (0, b.jsx)("p", {
							className: "mbs-description",
							children: r.capacityDescription
						}),
						/* @__PURE__ */ (0, b.jsx)("div", {
							className: "mbs-capacity-grid",
							children: t.capacities.map((e) => /* @__PURE__ */ (0, b.jsxs)("article", {
								className: "mbs-capacity",
								children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: e.name }), e.status === "available" ? /* @__PURE__ */ (0, b.jsxs)("div", {
									className: "mbs-capacity-values",
									children: [/* @__PURE__ */ (0, b.jsx)(_e, {
										label: r.groups,
										used: e.group_table_entries,
										maximum: e.max_groups_per_fabric,
										unavailable: r.unavailable
									}), /* @__PURE__ */ (0, b.jsx)(_e, {
										label: r.groupKeys,
										used: e.group_key_map_entries,
										maximum: e.max_group_keys_per_fabric,
										unavailable: r.unavailable
									})]
								}) : /* @__PURE__ */ (0, b.jsx)("p", {
									className: "mbs-meta",
									children: r.unavailable
								})]
							}, e.node_id))
						})
					] })
				]
			})
		]
	});
}
function M({ hass: e, snapshot: t, t: n }) {
	let r = t.devices.filter((e) => e.can_be_target && e.node_id !== null && e.endpoint_id !== null).sort(O), [i, a] = (0, u.useState)(""), [o, s] = (0, u.useState)(null), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(!1), [p, m] = (0, u.useState)(null), [_, y] = (0, u.useState)(!1), [x, S] = (0, u.useState)(null), [ee, C] = (0, u.useState)(!1), [w, T] = (0, u.useState)([]), D = r.find((e) => E(e) === i), te = o?.entries.filter((e) => e.usage.safe_to_reclaim) ?? [], ne = new Set(w), re = te.length > 0 && te.every((e) => ne.has(e.entry_index)), ie = async () => {
		if (!(!e || !D || D.node_id === null || D.endpoint_id === null)) {
			l(!0), f(!1);
			try {
				s(await v(e, {
					type: "matter_binding_studio/get_acl_overview",
					target_node_id: D.node_id,
					target_endpoint_id: D.endpoint_id
				})), T([]);
			} catch {
				f(!0), s(null), T([]);
			} finally {
				l(!1);
			}
		}
	}, ae = async (t) => {
		if (!e || !D || D.node_id === null || D.endpoint_id === null) return;
		let r = t.filter((e) => e.usage.safe_to_reclaim).map((e) => e.entry_index);
		if (!r.length) {
			S(n.noAclEntriesSelected), C(!0);
			return;
		}
		l(!0), S(null), C(!1);
		try {
			m(await v(e, {
				type: "matter_binding_studio/prepare_remove_acl",
				target_node_id: D.node_id,
				target_endpoint_id: D.endpoint_id,
				entry_indexes: r
			})), y(!1);
		} catch (e) {
			S(g(e)), C(!0);
		} finally {
			l(!1);
		}
	}, oe = async () => {
		if (!(!e || !p || !_)) {
			l(!0), S(null);
			try {
				let t = await v(e, {
					type: "matter_binding_studio/apply_remove_acl",
					plan_id: p.plan_id,
					confirm: !0
				});
				S(t.message), C(!t.success || !t.verified), t.success && t.verified && await ie();
			} catch (e) {
				S(g(e)), C(!0);
			} finally {
				m(null), y(!1), l(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, b.jsxs)("section", { children: [
		/* @__PURE__ */ (0, b.jsx)(ve, {
			title: n.acl,
			count: o?.entries.length ?? 0
		}),
		/* @__PURE__ */ (0, b.jsx)("p", {
			className: "mbs-description",
			children: n.aclDescription
		}),
		/* @__PURE__ */ (0, b.jsxs)("div", {
			className: "mbs-acl-toolbar",
			children: [/* @__PURE__ */ (0, b.jsxs)("label", { children: [/* @__PURE__ */ (0, b.jsx)("span", { children: n.target }), /* @__PURE__ */ (0, b.jsxs)("select", {
				value: i,
				onChange: (e) => {
					a(e.target.value), s(null), f(!1), m(null), S(null), T([]);
				},
				children: [/* @__PURE__ */ (0, b.jsx)("option", {
					value: "",
					disabled: !0,
					children: n.chooseAclTarget
				}), r.map((e) => /* @__PURE__ */ (0, b.jsx)("option", {
					value: E(e),
					children: k(e)
				}, E(e)))]
			})] }), /* @__PURE__ */ (0, b.jsx)("button", {
				type: "button",
				onClick: () => void ie(),
				disabled: !e || !D || c,
				children: c ? n.readingAcl : n.readAcl
			})]
		}),
		d ? /* @__PURE__ */ (0, b.jsx)("p", {
			className: "mbs-warning",
			children: n.aclReadFailed
		}) : null,
		o ? /* @__PURE__ */ (0, b.jsxs)(b.Fragment, { children: [
			/* @__PURE__ */ (0, b.jsx)(de, {
				capacity: o.capacity,
				t: n
			}),
			te.length ? /* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-acl-bulkbar",
				children: [
					/* @__PURE__ */ (0, b.jsxs)("label", { children: [/* @__PURE__ */ (0, b.jsx)("input", {
						type: "checkbox",
						checked: re,
						onChange: (e) => {
							T(e.target.checked ? te.map((e) => e.entry_index) : []);
						}
					}), n.selectAllReclaimableAcl] }),
					/* @__PURE__ */ (0, b.jsx)("span", { children: j(n.selectedAclEntries, w.length) }),
					/* @__PURE__ */ (0, b.jsx)("button", {
						type: "button",
						className: "mbs-quiet-danger-button",
						onClick: () => void ae(te.filter((e) => ne.has(e.entry_index))),
						disabled: c || w.length === 0,
						children: n.reviewSelectedAclReclaim
					})
				]
			}) : null,
			/* @__PURE__ */ (0, b.jsx)("div", {
				className: "mbs-list",
				children: o.entries.map((e) => /* @__PURE__ */ (0, b.jsx)(N, {
					entry: e,
					t: n,
					selected: ne.has(e.entry_index),
					onSelectionChange: (t) => {
						T((n) => t ? Array.from(/* @__PURE__ */ new Set([...n, e.entry_index])).sort((e, t) => e - t) : n.filter((t) => t !== e.entry_index));
					},
					onReviewRemoval: (e) => ae([e]),
					working: c
				}, e.entry_index))
			})
		] }) : null,
		p ? /* @__PURE__ */ (0, b.jsxs)("div", {
			className: "mbs-review mbs-removal-review",
			children: [
				/* @__PURE__ */ (0, b.jsx)("strong", { children: n.aclRemovalReviewTitle }),
				(p.entries ?? [p.entry]).map((e) => /* @__PURE__ */ (0, b.jsx)(N, {
					entry: e,
					t: n
				}, e.entry_index)),
				/* @__PURE__ */ (0, b.jsx)("p", {
					className: "mbs-meta",
					children: n.aclRemovalKeepsInUse
				}),
				/* @__PURE__ */ (0, b.jsx)("ul", { children: p.steps.map((e, t) => /* @__PURE__ */ (0, b.jsx)("li", { children: h(e, n) }, t)) }),
				/* @__PURE__ */ (0, b.jsxs)("label", {
					className: "mbs-confirm",
					children: [/* @__PURE__ */ (0, b.jsx)("input", {
						type: "checkbox",
						checked: _,
						onChange: (e) => y(e.target.checked)
					}), j(n.confirmAclRemoval, (p.entries ?? [p.entry]).length)]
				}),
				/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "mbs-review-actions",
					children: [/* @__PURE__ */ (0, b.jsx)("button", {
						type: "button",
						onClick: () => {
							m(null), y(!1);
						},
						disabled: c,
						children: n.cancel
					}), /* @__PURE__ */ (0, b.jsx)("button", {
						type: "button",
						className: "mbs-danger-button",
						onClick: () => void oe(),
						disabled: !_ || c,
						children: c ? n.working : n.reclaimAcl
					})]
				})
			]
		}) : null,
		x ? /* @__PURE__ */ (0, b.jsx)("p", {
			className: ee ? "mbs-warning" : "mbs-success",
			children: h(x, n)
		}) : null
	] });
}
function N({ entry: e, t, selected: n, onSelectionChange: r, onReviewRemoval: i, working: a = !1 }) {
	let o = e.kind === "administrator" ? t.aclAdministrator : t.aclOperate, s = e.auth_mode === "case" ? t.aclCase : e.auth_mode === "group" ? t.aclGroup : t.aclOther, c = e.usage.state === "protected" ? t.aclProtected : e.usage.state === "used" ? t.aclInUse : e.usage.state === "unused" ? t.aclUnused : t.aclUnknown;
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "mbs-card mbs-acl-entry",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-card-topline",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", {
					className: "mbs-acl-entry-title",
					children: [r && e.usage.safe_to_reclaim ? /* @__PURE__ */ (0, b.jsx)("input", {
						type: "checkbox",
						checked: n ?? !1,
						onChange: (e) => r(e.target.checked),
						disabled: a,
						"aria-label": `${t.selectAclEntry} ${e.entry_index}`
					}) : null, /* @__PURE__ */ (0, b.jsx)("strong", { children: o })]
				}), /* @__PURE__ */ (0, b.jsx)("span", {
					className: `mbs-acl-state mbs-acl-${e.usage.state}`,
					children: c
				})]
			}),
			/* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-meta",
				children: s
			}),
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-acl-details",
				children: [/* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("small", { children: t.aclSubjects }), /* @__PURE__ */ (0, b.jsx)("p", { children: e.subjects.map((e) => h(e, t)).join(", ") })] }), /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("small", { children: t.aclTargets }), /* @__PURE__ */ (0, b.jsx)("p", { children: e.targets.map((e) => `${h(e.endpoint, t)} · ${h(e.capability, t)}`).join("；") })] })]
			}),
			e.usage.relationship_names.length ? /* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-meta",
				children: e.usage.relationship_names.join("；")
			}) : null,
			/* @__PURE__ */ (0, b.jsxs)("details", {
				className: "mbs-recovery",
				children: [
					/* @__PURE__ */ (0, b.jsx)("summary", { children: t.aclEvidence }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: e.provenance?.state === "studio_recorded" ? t.aclRecorded : t.aclUnrecorded }),
					/* @__PURE__ */ (0, b.jsx)("p", { children: j(t.aclReferences, e.references?.length ?? 0) }),
					e.references?.length ? /* @__PURE__ */ (0, b.jsx)("ul", { children: e.references.map((e) => /* @__PURE__ */ (0, b.jsxs)("li", { children: [
						e.name,
						" · ",
						e.clusters.map((e) => be(e, t)).join(" · ")
					] }, e.relationship_id)) }) : null,
					e.references_complete ? null : /* @__PURE__ */ (0, b.jsx)("p", {
						className: "mbs-meta",
						children: t.aclReferencesIncomplete
					})
				]
			}),
			e.usage.safe_to_reclaim && i ? /* @__PURE__ */ (0, b.jsx)("div", {
				className: "mbs-card-actions",
				children: /* @__PURE__ */ (0, b.jsx)("button", {
					type: "button",
					className: "mbs-quiet-danger-button",
					onClick: () => i(e),
					disabled: a,
					children: t.reviewAclReclaim
				})
			}) : null
		]
	});
}
function de({ capacity: e, t }) {
	let n = e.used ?? "–", r = e.maximum ?? t.unavailable, i = e.available ?? "–";
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "mbs-acl-capacity",
		"aria-label": t.acl,
		children: [
			/* @__PURE__ */ (0, b.jsxs)("span", { children: [
				t.aclUsed,
				": ",
				/* @__PURE__ */ (0, b.jsxs)("strong", { children: [
					n,
					" / ",
					r
				] })
			] }),
			/* @__PURE__ */ (0, b.jsxs)("span", { children: [
				t.aclAvailable,
				": ",
				/* @__PURE__ */ (0, b.jsx)("strong", { children: i })
			] }),
			/* @__PURE__ */ (0, b.jsxs)("span", { children: [
				t.aclTargetsPerRule,
				": ",
				/* @__PURE__ */ (0, b.jsx)("strong", { children: e.targets_per_entry ?? t.unavailable })
			] }),
			e.entries_to_add ? /* @__PURE__ */ (0, b.jsx)("span", { children: j(t.aclWillAddEntries, e.entries_to_add) }) : null
		]
	});
}
function fe({ controlSet: e, t, onReviewCleanup: n, cleanupWorking: r }) {
	let i = !!(e.managed_by_studio && e.active_relationships === 0);
	return /* @__PURE__ */ (0, b.jsxs)("article", {
		className: "mbs-card",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-card-topline",
				children: [/* @__PURE__ */ (0, b.jsx)("strong", { children: e.name }), /* @__PURE__ */ (0, b.jsx)(me, {
					clusters: e.clusters,
					t
				})]
			}),
			/* @__PURE__ */ (0, b.jsxs)("p", {
				className: "mbs-meta",
				children: [
					e.members.length,
					" ",
					t.members,
					" · ",
					e.active_relationships,
					" ",
					t.activeRelationships
				]
			}),
			e.status === "pending" ? /* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-warning",
				children: t.controlSetPending
			}) : null,
			e.status === "repair_needed" ? /* @__PURE__ */ (0, b.jsx)("p", {
				className: "mbs-warning",
				children: t.controlSetRepairNeeded
			}) : null,
			/* @__PURE__ */ (0, b.jsx)(ge, { members: e.members }),
			e.managed_by_studio ? /* @__PURE__ */ (0, b.jsxs)("div", {
				className: "mbs-card-actions",
				children: [/* @__PURE__ */ (0, b.jsx)("button", {
					type: "button",
					className: "mbs-quiet-danger-button",
					onClick: () => n(e),
					disabled: !i || r,
					children: t.reviewGroupCleanup
				}), i ? null : /* @__PURE__ */ (0, b.jsx)("span", {
					className: "mbs-meta",
					children: t.groupCleanupNeedsBindingRemoval
				})]
			}) : null
		]
	});
}
function pe(e) {
	return e.route === "native_group" ? e.targets.name : e.targets.members[0] ? k(e.targets.members[0]) : e.targets.name;
}
function me({ clusters: e, t }) {
	return e.length ? /* @__PURE__ */ (0, b.jsx)("div", {
		className: "mbs-chips",
		children: e.map((e) => /* @__PURE__ */ (0, b.jsx)("span", { children: be(e, t) }, e))
	}) : null;
}
function he({ coverage: e, t }) {
	return e.length ? /* @__PURE__ */ (0, b.jsx)("div", {
		className: "mbs-coverage-list",
		children: e.map((e) => /* @__PURE__ */ (0, b.jsxs)("p", {
			className: e.supported_members === e.total_members ? "mbs-meta" : "mbs-partial",
			children: [
				/* @__PURE__ */ (0, b.jsx)("strong", { children: be(e.cluster_id, t) }),
				" · ",
				A(e, t),
				e.unsupported_members.length ? ` · ${t.notSupportedBy}: ${e.unsupported_members.join(", ")}` : ""
			]
		}, e.cluster_id))
	}) : null;
}
function ge({ members: e }) {
	return e.length ? /* @__PURE__ */ (0, b.jsx)("div", {
		className: "mbs-members",
		children: e.map((e) => /* @__PURE__ */ (0, b.jsx)("span", { children: k(e) }, `${e.node_id}-${e.endpoint_id}`))
	}) : null;
}
function _e({ label: e, used: t, maximum: n, unavailable: r }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", { children: [/* @__PURE__ */ (0, b.jsx)("small", { children: e }), /* @__PURE__ */ (0, b.jsx)("strong", { children: t !== null && n !== null ? `${t} / ${n}` : r })] });
}
function ve({ title: e, count: t }) {
	return /* @__PURE__ */ (0, b.jsxs)("div", {
		className: "mbs-section-title",
		children: [/* @__PURE__ */ (0, b.jsx)("h2", { children: e }), /* @__PURE__ */ (0, b.jsx)("span", { children: t })]
	});
}
function ye({ text: e }) {
	return /* @__PURE__ */ (0, b.jsx)("p", {
		className: "mbs-empty",
		children: e
	});
}
function be(e, t) {
	return e === 6 ? t.onOff : e === 8 ? t.brightness : e === 768 ? t.colorTemperature : String(e);
}
//#endregion
//#region src/styles.css?inline
var xe = ".mbs-root{min-height:100%;color:var(--primary-text-color,#1d1b20);font-family:Roboto,Noto Sans TC,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.mbs-root *{box-sizing:border-box}.mbs-root h1,.mbs-root h2,.mbs-root p{margin:0}.mbs-root button{font:inherit}.mbs-panel{max-width:1180px;margin:0 auto;padding:24px}.mbs-header{color:var(--primary-text-color,#1d1b20);background:linear-gradient(135deg, color-mix(in srgb, var(--primary-color,#006a6a) 12%, var(--card-background-color,#fff)), var(--card-background-color,#fff));box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:14px;justify-content:space-between;align-items:flex-start;gap:24px;padding:22px;display:flex}.mbs-eyebrow,.mbs-route-label,.mbs-section-title span,.mbs-chips span,.mbs-members span{border-radius:999px;align-items:center;display:inline-flex}.mbs-eyebrow{color:var(--primary-color,#006a6a);background:color-mix(in srgb, var(--primary-color,#006a6a) 12%, transparent);padding:3px 9px;font-size:12px;font-weight:700}.mbs-header h1{letter-spacing:-.015em;margin-top:8px;font-size:26px}.mbs-header p{color:var(--secondary-text-color,#6b6570);margin-top:5px}.mbs-header button{min-height:38px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;border:0;border-radius:19px;padding:0 16px;font-weight:650}.mbs-header button:disabled{cursor:not-allowed;opacity:.55}.mbs-scope,.mbs-notice,.mbs-warning,.mbs-success,.mbs-loading,.mbs-empty{border-radius:9px;padding:13px 15px;font-size:14px;line-height:1.55;margin-top:18px!important}.mbs-scope{border-left:3px solid var(--primary-color,#006a6a);background:var(--secondary-background-color,#f4f1f9)}.mbs-notice,.mbs-empty{color:var(--secondary-text-color,#6b6570);background:var(--secondary-background-color,#f4f1f9)}.mbs-warning{color:var(--warning-color,#967200);background:color-mix(in srgb, var(--warning-color,#967200) 12%, transparent)}.mbs-success{color:var(--success-color,#147a3d);background:color-mix(in srgb, var(--success-color,#147a3d) 12%, transparent)}.mbs-loading{color:var(--secondary-text-color,#6b6570);text-align:center}.mbs-composer{border:1px solid color-mix(in srgb, var(--primary-color,#006a6a) 30%, var(--divider-color,#dfdae2));background:var(--card-background-color,#fff);box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:12px;margin-top:24px;padding:19px}.mbs-form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px;display:grid}.mbs-form-grid label,.mbs-target-picker>label,.mbs-capability-picker>label,.mbs-confirm{color:var(--primary-text-color,#1d1b20);gap:6px;font-size:13px;font-weight:650;display:grid}.mbs-form-grid .mbs-area-filter{cursor:pointer;grid-column:1/-1;align-items:center;gap:8px;width:fit-content;font-weight:500;display:inline-flex}.mbs-area-filter input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-form-grid select{border:1px solid var(--divider-color,#dfdae2);width:100%;min-height:40px;color:var(--primary-text-color,#1d1b20);background:var(--card-background-color,#fff);font:inherit;border-radius:8px;padding:0 10px}.mbs-target-picker{border:1px solid var(--divider-color,#dfdae2);border-radius:8px;grid-column:1/-1;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:0;padding:11px;display:grid}.mbs-target-picker legend{color:var(--secondary-text-color,#6b6570);padding:0 5px;font-size:12px}.mbs-target-picker>label{align-items:center;gap:8px;font-weight:500;display:inline-flex}.mbs-target-picker input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-capability-picker{border:1px solid var(--divider-color,#dfdae2);border-radius:8px;flex-wrap:wrap;gap:10px 16px;margin:16px 0 0;padding:12px;display:flex}.mbs-capability-picker legend{color:var(--secondary-text-color,#6b6570);padding:0 5px;font-size:12px}.mbs-capability-picker>label,.mbs-confirm{align-items:center;gap:8px;font-weight:500;display:inline-flex}.mbs-capability-picker small{color:var(--secondary-text-color,#6b6570);font-size:11px}.mbs-capability-picker input,.mbs-confirm input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a)}.mbs-actions{justify-content:flex-end;margin-top:16px;display:flex}.mbs-actions button,.mbs-review>button,.mbs-review-actions button,.mbs-card-actions button{min-height:38px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;font:inherit;border:0;border-radius:19px;padding:0 16px;font-weight:650}.mbs-actions button:disabled,.mbs-review>button:disabled,.mbs-review-actions button:disabled,.mbs-card-actions button:disabled{cursor:not-allowed;opacity:.55}.mbs-review{background:color-mix(in srgb, var(--primary-color,#006a6a) 7%, var(--card-background-color,#fff));border-radius:9px;gap:10px;margin-top:16px;padding:15px;display:grid}.mbs-review ul{color:var(--secondary-text-color,#6b6570);gap:5px;margin:0;padding-left:20px;font-size:13px;line-height:1.45;display:grid}.mbs-review>button{justify-self:start}.mbs-review-actions,.mbs-card-actions{flex-wrap:wrap;align-items:center;gap:9px;display:flex}.mbs-removal-review{border:1px solid color-mix(in srgb, var(--error-color,#ba1a1a) 35%, var(--divider-color,#dfdae2))}.mbs-danger-button{background:var(--error-color,#ba1a1a)!important}.mbs-quiet-danger-button{color:var(--error-color,#ba1a1a)!important;background:color-mix(in srgb, var(--error-color,#ba1a1a) 10%, transparent)!important}.mbs-content{gap:20px;margin-top:24px;display:grid}.mbs-content section{background:var(--card-background-color,#fff);box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:12px;padding:19px}.mbs-section-title{justify-content:space-between;align-items:center;gap:12px;display:flex}.mbs-section-title h2{font-size:18px}.mbs-section-title span{min-width:24px;color:var(--secondary-text-color,#6b6570);background:var(--secondary-background-color,#f4f1f9);justify-content:center;padding:3px 8px;font-size:12px}.mbs-description{color:var(--secondary-text-color,#6b6570);font-size:13px;line-height:1.5;margin-top:5px!important}.mbs-list{gap:10px;margin-top:14px;display:grid}.mbs-card,.mbs-capacity{border:1px solid var(--divider-color,#dfdae2);border-radius:10px;padding:14px}.mbs-card-topline{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.mbs-route{align-items:center;gap:11px;min-width:0;display:flex}.mbs-route>span{color:var(--primary-color,#006a6a);font-size:20px}.mbs-route strong,.mbs-card strong,.mbs-capacity>strong{color:var(--primary-text-color,#1d1b20)}.mbs-route-label{color:var(--primary-color,#006a6a);background:color-mix(in srgb, var(--primary-color,#006a6a) 12%, transparent);flex:none;padding:4px 9px;font-size:12px;font-weight:700}.mbs-relationship-actions{flex-direction:column;flex:none;align-items:flex-end}.mbs-meta{color:var(--secondary-text-color,#6b6570);font-size:12px;line-height:1.45;margin-top:3px!important}.mbs-partial{color:var(--warning-color,#967200);margin:3px 0 0;font-size:12px;line-height:1.45}.mbs-coverage-list{gap:5px;margin-top:10px;display:grid}.mbs-coverage-list strong{color:var(--primary-text-color,#1d1b20)}.mbs-chips,.mbs-members{flex-wrap:wrap;gap:6px;margin-top:12px;display:flex}.mbs-chips span,.mbs-members span{color:var(--primary-text-color,#1d1b20);background:var(--secondary-background-color,#f4f1f9);padding:4px 9px;font-size:12px}.mbs-members span{background:color-mix(in srgb, var(--primary-color,#006a6a) 8%, var(--secondary-background-color,#f4f1f9))}.mbs-capacity-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:14px;display:grid}.mbs-capacity-values{grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;display:grid}.mbs-capacity-values>div{background:var(--secondary-background-color,#f4f1f9);border-radius:7px;padding:8px}.mbs-capacity-values small{color:var(--secondary-text-color,#6b6570);font-size:11px;display:block}.mbs-capacity-values strong{margin-top:3px;font-size:15px;display:block}.mbs-acl-toolbar{flex-wrap:wrap;align-items:end;gap:10px;margin-top:14px;display:flex}.mbs-acl-toolbar label{flex:300px;gap:6px;font-size:13px;font-weight:650;display:grid}.mbs-acl-toolbar select{border:1px solid var(--divider-color,#dfdae2);width:100%;min-height:40px;color:var(--primary-text-color,#1d1b20);background:var(--card-background-color,#fff);font:inherit;border-radius:8px;padding:0 10px}.mbs-acl-toolbar button{min-height:40px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;font:inherit;border:0;border-radius:20px;padding:0 16px;font-weight:650}.mbs-acl-toolbar button:disabled{cursor:not-allowed;opacity:.55}.mbs-acl-capacity{flex-wrap:wrap;gap:8px;margin-top:14px;display:flex}.mbs-acl-capacity span,.mbs-acl-state{color:var(--primary-text-color,#1d1b20);background:var(--secondary-background-color,#f4f1f9);border-radius:999px;align-items:center;padding:4px 9px;font-size:12px;display:inline-flex}.mbs-acl-bulkbar{background:color-mix(in srgb, var(--warning-color,#967200) 8%, var(--secondary-background-color,#f4f1f9));border-radius:9px;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px;padding:10px;display:flex}.mbs-acl-bulkbar label,.mbs-acl-entry-title{align-items:center;gap:8px;display:inline-flex}.mbs-acl-bulkbar label{font-size:13px;font-weight:650}.mbs-acl-bulkbar span{color:var(--secondary-text-color,#6b6570);font-size:12px}.mbs-acl-bulkbar button{min-height:34px;margin-left:auto}.mbs-acl-entry{gap:5px;display:grid}.mbs-acl-entry-title input,.mbs-acl-bulkbar input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-acl-details{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:7px;display:grid}.mbs-acl-details>div{background:var(--secondary-background-color,#f4f1f9);border-radius:7px;padding:8px}.mbs-acl-details small{color:var(--secondary-text-color,#6b6570);font-size:11px;display:block}.mbs-acl-details p{font-size:13px;line-height:1.45;margin-top:3px!important}.mbs-acl-protected{color:var(--secondary-text-color,#6b6570)}.mbs-acl-used{color:var(--success-color,#147a3d);background:color-mix(in srgb, var(--success-color,#147a3d) 12%, transparent)}.mbs-acl-unused{color:var(--warning-color,#967200);background:color-mix(in srgb, var(--warning-color,#967200) 12%, transparent)}.mbs-acl-unknown{color:var(--error-color,#ba1a1a);background:color-mix(in srgb, var(--error-color,#ba1a1a) 10%, transparent)}.mbs-header{align-items:center;padding:14px 18px}.mbs-header h1{margin:0;font-size:21px}.mbs-header-actions{gap:8px;display:flex}.mbs-help{color:var(--secondary-text-color,#6b6570);margin:12px 0;font-size:13px}.mbs-help p{padding:10px}.mbs-root summary{cursor:pointer}.mbs-fold{border:1px solid var(--divider-color,#dfdae2);background:var(--card-background-color,#fff);border-radius:10px}.mbs-fold>summary{padding:16px;font-weight:600}.mbs-fold>section{box-shadow:none}.mbs-list-toolbar{gap:10px;margin:14px 0;display:flex}.mbs-list-toolbar input,.mbs-list-toolbar select{font:inherit;border:1px solid var(--divider-color,#dfdae2);min-height:38px;color:inherit;background:var(--card-background-color,#fff);border-radius:8px;min-width:0;padding:8px 10px;font-size:14px}.mbs-list-toolbar input{flex:1}.mbs-selection-bar{flex-wrap:wrap;align-items:center;gap:12px;min-height:44px;padding-bottom:10px;font-size:13px;display:flex}.mbs-selection-bar label{align-items:center;gap:8px;display:inline-flex}.mbs-selection-bar button,.mbs-row-details button,.mbs-drawer-close{font:inherit;cursor:pointer;border:1px solid var(--divider-color,#dfdae2);background:var(--card-background-color,#fff);color:inherit;border-radius:8px;padding:8px 12px}.mbs-selection-bar .mbs-danger-button{color:var(--text-primary-color,#fff)}.mbs-root input[type=checkbox]{width:17px;height:17px;accent-color:var(--primary-color,#006a6a);flex-shrink:0}.mbs-binding-row{border-top:1px solid var(--divider-color,#dfdae2);grid-template-columns:20px minmax(0,1fr) auto auto;align-items:start;gap:12px;padding:14px 0;font-size:14px;display:grid}.mbs-binding-path{overflow-wrap:anywhere;grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr);gap:8px;line-height:1.5;display:grid}.mbs-binding-path>span{color:var(--primary-color,#006a6a)}.mbs-inline-capabilities{color:var(--secondary-text-color,#6b6570);font-size:12px;line-height:1.8}.mbs-row-details{max-width:260px;font-size:12px}.mbs-row-details p{overflow-wrap:anywhere;margin:8px 0}.mbs-dialog{color:var(--primary-text-color,#1d1b20);background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#dfdae2);border-radius:14px;width:min(680px,100vw - 32px);max-height:90dvh;padding:24px;box-shadow:0 12px 50px #0003}.mbs-dialog::backdrop{background:#0006}.mbs-dialog h2{font-size:20px}.mbs-dialog p{margin:14px 0;font-size:14px;line-height:1.6}.mbs-dialog ul{overflow-wrap:anywhere;max-height:40dvh;padding-left:22px;line-height:1.7;overflow:auto}.mbs-dialog .mbs-review-actions{justify-content:flex-end;margin-top:20px}.mbs-drawer{border-radius:14px 0 0 14px;width:min(720px,100vw);height:100dvh;max-height:100dvh;margin:0 0 0 auto}.mbs-drawer .mbs-composer{box-shadow:none;border:0;padding:0}.mbs-drawer-close{margin-left:auto;display:block}.mbs-root button:disabled{cursor:not-allowed;opacity:.55}.mbs-root :focus-visible{outline:2px solid var(--primary-color,#006a6a);outline-offset:3px}@media (width<=600px){.mbs-header-actions{flex-wrap:wrap}.mbs-list-toolbar{flex-direction:column}.mbs-binding-row{grid-template-columns:20px minmax(0,1fr) auto}.mbs-binding-path{grid-template-columns:1fr}.mbs-binding-path>span{display:none}.mbs-binding-path>strong:last-child:before{content:\"→ \"}.mbs-inline-capabilities{grid-area:2/2}.mbs-row-details{grid-area:1/3/span 2;max-width:110px}.mbs-panel{padding:14px}.mbs-header{flex-direction:column;align-items:stretch}.mbs-header button{width:100%}.mbs-form-grid{grid-template-columns:1fr}.mbs-actions button,.mbs-review>button,.mbs-review-actions button,.mbs-acl-toolbar button{width:100%}.mbs-acl-bulkbar button{width:100%;margin-left:0}.mbs-card-topline{flex-direction:column;align-items:stretch}.mbs-route-label{align-self:flex-start}.mbs-relationship-actions{align-self:flex-start;align-items:flex-start}}.mbs-support{margin-top:20px}.mbs-support>section{padding:0 19px 19px}.mbs-support textarea{box-sizing:border-box;width:100%;color:inherit;background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#ddd);resize:vertical;border-radius:8px;margin:12px 0;padding:10px;font:12px/1.5 monospace;display:block}.mbs-recovery{margin:10px 0;font-size:13px}.mbs-recovery summary{cursor:pointer}.mbs-recovery p{line-height:1.6}", Se = class extends HTMLElement {
	root;
	hassValue;
	set hass(e) {
		this.hassValue = e, this.renderPanel();
	}
	connectedCallback() {
		if (!this.root) {
			let e = document.createElement("style");
			e.textContent = xe;
			let t = document.createElement("div");
			this.replaceChildren(e, t), this.root = (0, d.createRoot)(t);
		}
		this.renderPanel();
	}
	disconnectedCallback() {
		this.root?.unmount(), this.root = void 0;
	}
	renderPanel() {
		this.root?.render(/* @__PURE__ */ (0, b.jsx)(C, { hass: this.hassValue }));
	}
};
customElements.define("matter-binding-studio-panel", Se);
//#endregion

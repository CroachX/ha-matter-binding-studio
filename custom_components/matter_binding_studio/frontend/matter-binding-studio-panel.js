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
			if (n(c) !== null) m = !0, S || (S = !0, ne());
			else {
				var t = n(l);
				t !== null && ie(x, t.startTime - e);
			}
		}
	}
	var S = !1, ee = -1, C = 5, w = -1;
	function te() {
		return g ? !0 : !(e.unstable_now() - w < C);
	}
	function T() {
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
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && te());) {
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
								u !== null && ie(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? ne() : S = !1;
			}
		}
	}
	var ne;
	if (typeof y == "function") ne = function() {
		y(T);
	};
	else if (typeof MessageChannel < "u") {
		var E = new MessageChannel(), re = E.port2;
		E.port1.onmessage = T, ne = function() {
			re.postMessage(null);
		};
	} else ne = function() {
		_(T, 0);
	};
	function ie(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(ee), ee = -1) : h = !0, ie(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, ne()))), r;
	}, e.unstable_shouldYield = te, e.unstable_wrapCallback = function(e) {
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
	}, te = Object.prototype.hasOwnProperty;
	function T(e, t, r) {
		var i = r.ref;
		return {
			$$typeof: n,
			type: e,
			key: t,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function ne(e, t) {
		return T(e.type, t, e.props);
	}
	function E(e) {
		return typeof e == "object" && !!e && e.$$typeof === n;
	}
	function re(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var ie = /\/+/g;
	function ae(e, t) {
		return typeof e == "object" && e && e.key != null ? re("" + e.key) : t.toString(36);
	}
	function oe(e) {
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
	function D(e, t, i, a, o) {
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
				case f: return c = e._init, D(c(e._payload), t, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ae(e, 0) : a, ee(o) ? (i = "", c != null && (i = c.replace(ie, "$&/") + "/"), D(o, t, i, "", function(e) {
			return e;
		})) : o != null && (E(o) && (o = ne(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ie, "$&/") + "/") + c)), t.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (ee(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ae(a, u), c += D(a, t, i, s, o);
		else if (u = h(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ae(a, u++), c += D(a, t, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return D(oe(e), t, i, a, o);
			throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function se(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return D(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ce(e) {
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
	var O = typeof reportError == "function" ? reportError : function(t) {
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
	}, k = {
		map: se,
		forEach: function(e, t, n) {
			se(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return se(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return se(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!E(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	t.Activity = p, t.Children = k, t.Component = y, t.Fragment = i, t.Profiler = o, t.PureComponent = x, t.StrictMode = a, t.Suspense = u, t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, t.__COMPILER_RUNTIME = {
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
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !te.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return T(e.type, i, r);
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
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) te.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return T(e, a, i);
	}, t.createRef = function() {
		return { current: null };
	}, t.forwardRef = function(e) {
		return {
			$$typeof: l,
			render: e
		};
	}, t.isValidElement = E, t.lazy = function(e) {
		return {
			$$typeof: f,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: ce
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
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, O);
		} catch (e) {
			O(e);
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
	var g = Object.assign, _ = Symbol.for("react.element"), v = Symbol.for("react.transitional.element"), y = Symbol.for("react.portal"), b = Symbol.for("react.fragment"), x = Symbol.for("react.strict_mode"), S = Symbol.for("react.profiler"), ee = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), te = Symbol.for("react.suspense"), T = Symbol.for("react.suspense_list"), ne = Symbol.for("react.memo"), E = Symbol.for("react.lazy"), re = Symbol.for("react.activity"), ie = Symbol.for("react.memo_cache_sentinel"), ae = Symbol.iterator;
	function oe(e) {
		return typeof e != "object" || !e ? null : (e = ae && e[ae] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var D = Symbol.for("react.client.reference");
	function se(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === D ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case b: return "Fragment";
			case S: return "Profiler";
			case x: return "StrictMode";
			case te: return "Suspense";
			case T: return "SuspenseList";
			case re: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case y: return "Portal";
			case C: return e.displayName || "Context";
			case ee: return (e._context.displayName || "Context") + ".Consumer";
			case w:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case ne: return t = e.displayName || null, t === null ? se(e.type) || "Memo" : t;
			case E:
				t = e._payload, e = e._init;
				try {
					return se(e(t));
				} catch {}
		}
		return null;
	}
	var ce = Array.isArray, O = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, k = o.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, le = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ue = [], de = -1;
	function fe(e) {
		return { current: e };
	}
	function A(e) {
		0 > de || (e.current = ue[de], ue[de] = null, de--);
	}
	function j(e, t) {
		de++, ue[de] = e.current, e.current = t;
	}
	var pe = fe(null), me = fe(null), he = fe(null), ge = fe(null);
	function _e(e, t) {
		switch (j(he, t), j(me, e), j(pe, null), t.nodeType) {
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
		A(pe), j(pe, e);
	}
	function ve() {
		A(pe), A(me), A(he);
	}
	function ye(e) {
		e.memoizedState !== null && j(ge, e);
		var t = pe.current, n = Ud(t, e.type);
		t !== n && (j(me, e), j(pe, n));
	}
	function be(e) {
		me.current === e && (A(pe), A(me)), ge.current === e && (A(ge), $f._currentValue = le);
	}
	var xe, Se;
	function Ce(e) {
		if (xe === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			xe = t && t[1] || "", Se = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + xe + e + Se;
	}
	var we = !1;
	function Te(e, t) {
		if (!e || we) return "";
		we = !0;
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
			we = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? Ce(n) : "";
	}
	function Ee(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return Ce(e.type);
			case 16: return Ce("Lazy");
			case 13: return e.child !== t && t !== null ? Ce("Suspense Fallback") : Ce("Suspense");
			case 19: return Ce("SuspenseList");
			case 0:
			case 15: return Te(e.type, !1);
			case 11: return Te(e.type.render, !1);
			case 1: return Te(e.type, !0);
			case 31: return Ce("Activity");
			default: return "";
		}
	}
	function De(e) {
		try {
			var t = "", n = null;
			do
				t += Ee(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var Oe = Object.prototype.hasOwnProperty, ke = n.unstable_scheduleCallback, Ae = n.unstable_cancelCallback, je = n.unstable_shouldYield, Me = n.unstable_requestPaint, Ne = n.unstable_now, Pe = n.unstable_getCurrentPriorityLevel, Fe = n.unstable_ImmediatePriority, Ie = n.unstable_UserBlockingPriority, Le = n.unstable_NormalPriority, Re = n.unstable_LowPriority, ze = n.unstable_IdlePriority, Be = n.log, Ve = n.unstable_setDisableYieldValue, He = null, Ue = null;
	function We(e) {
		if (typeof Be == "function" && Ve(e), Ue && typeof Ue.setStrictMode == "function") try {
			Ue.setStrictMode(He, e);
		} catch {}
	}
	var Ge = Math.clz32 ? Math.clz32 : Je, Ke = Math.log, qe = Math.LN2;
	function Je(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Ke(e) / qe | 0) | 0;
	}
	var Ye = 256, Xe = 262144, Ze = 4194304;
	function Qe(e) {
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
	function $e(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Qe(n))) : i = Qe(o) : i = Qe(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Qe(n))) : i = Qe(o)) : i = Qe(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function et(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function tt(e, t) {
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
	function nt() {
		var e = Ze;
		return Ze <<= 1, !(Ze & 62914560) && (Ze = 4194304), e;
	}
	function rt(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function it(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function at(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Ge(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && ot(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function ot(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ge(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function st(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ge(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function ct(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : lt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function lt(e) {
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
	function ut(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function dt() {
		var e = k.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : hp(e.type)) : e;
	}
	function ft(e, t) {
		var n = k.p;
		try {
			return k.p = e, t();
		} finally {
			k.p = n;
		}
	}
	var pt = Math.random().toString(36).slice(2), mt = "__reactFiber$" + pt, ht = "__reactProps$" + pt, gt = "__reactContainer$" + pt, _t = "__reactEvents$" + pt, vt = "__reactListeners$" + pt, yt = "__reactHandles$" + pt, bt = "__reactResources$" + pt, xt = "__reactMarker$" + pt;
	function St(e) {
		delete e[mt], delete e[ht], delete e[_t], delete e[vt], delete e[yt];
	}
	function Ct(e) {
		var t = e[mt];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[gt] || n[mt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[mt]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function wt(e) {
		if (e = e[mt] || e[gt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function Tt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(c(33));
	}
	function Et(e) {
		var t = e[bt];
		return t ||= e[bt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function Dt(e) {
		e[xt] = !0;
	}
	var Ot = /* @__PURE__ */ new Set(), kt = {};
	function At(e, t) {
		jt(e, t), jt(e + "Capture", t);
	}
	function jt(e, t) {
		for (kt[e] = t, e = 0; e < t.length; e++) Ot.add(t[e]);
	}
	var Mt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Nt = {}, Pt = {};
	function Ft(e) {
		return Oe.call(Pt, e) ? !0 : Oe.call(Nt, e) ? !1 : Mt.test(e) ? Pt[e] = !0 : (Nt[e] = !0, !1);
	}
	function It(e, t, n) {
		if (Ft(t)) {
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
	function Lt(e, t, n) {
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
	function Rt(e, t, n, r) {
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
	function zt(e) {
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
	function Bt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Vt(e, t, n) {
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
	function Ht(e) {
		if (!e._valueTracker) {
			var t = Bt(e) ? "checked" : "value";
			e._valueTracker = Vt(e, t, "" + e[t]);
		}
	}
	function Ut(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Bt(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n && (t.setValue(e), !0);
	}
	function Wt(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Gt = /[\n"\\]/g;
	function Kt(e) {
		return e.replace(Gt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function qt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + zt(t)) : e.value !== "" + zt(t) && (e.value = "" + zt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Yt(e, o, zt(n)) : Yt(e, o, zt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + zt(s) : e.removeAttribute("name");
	}
	function Jt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Ht(e);
				return;
			}
			n = n == null ? "" : "" + zt(n), t = t == null ? n : "" + zt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Ht(e);
	}
	function Yt(e, t, n) {
		t === "number" && Wt(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Xt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + zt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Zt(e, t, n) {
		if (t != null && (t = "" + zt(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + zt(n);
	}
	function Qt(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(c(92));
				if (ce(r)) {
					if (1 < r.length) throw Error(c(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = zt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Ht(e);
	}
	function $t(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var en = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function tn(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || en.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function nn(e, t, n) {
		if (t != null && typeof t != "object") throw Error(c(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && tn(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && tn(e, a, t[a]);
	}
	function rn(e) {
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
	var an = /* @__PURE__ */ new Map([
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
	]), on = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sn(e) {
		return on.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function cn() {}
	var ln = null;
	function un(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var dn = null, fn = null;
	function pn(e) {
		var t = wt(e);
		if (t && (e = t.stateNode)) {
			var n = e[ht] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (qt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Kt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[ht] || null;
								if (!i) throw Error(c(90));
								qt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Ut(r);
					}
					break a;
				case "textarea":
					Zt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Xt(e, !!n.multiple, t, !1);
			}
		}
	}
	var mn = !1;
	function hn(e, t, n) {
		if (mn) return e(t, n);
		mn = !0;
		try {
			return e(t);
		} finally {
			if (mn = !1, (dn !== null || fn !== null) && (xu(), dn && (t = dn, e = fn, fn = dn = null, pn(t), e))) for (t = 0; t < e.length; t++) pn(e[t]);
		}
	}
	function gn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[ht] || null;
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
	var _n = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), vn = !1;
	if (_n) try {
		var yn = {};
		Object.defineProperty(yn, "passive", { get: function() {
			vn = !0;
		} }), window.addEventListener("test", yn, yn), window.removeEventListener("test", yn, yn);
	} catch {
		vn = !1;
	}
	var bn = null, xn = null, Sn = null;
	function Cn() {
		if (Sn) return Sn;
		var e, t = xn, n = t.length, r, i = "value" in bn ? bn.value : bn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return Sn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function wn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function Tn() {
		return !0;
	}
	function En() {
		return !1;
	}
	function Dn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? Tn : En, this.isPropagationStopped = En, this;
		}
		return g(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = Tn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = Tn);
			},
			persist: function() {},
			isPersistent: Tn
		}), t;
	}
	var On = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, kn = Dn(On), An = g({}, On, {
		view: 0,
		detail: 0
	}), jn = Dn(An), Mn, Nn, Pn, Fn = g({}, An, {
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
		getModifierState: Kn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Pn && (Pn && e.type === "mousemove" ? (Mn = e.screenX - Pn.screenX, Nn = e.screenY - Pn.screenY) : Nn = Mn = 0, Pn = e), Mn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Nn;
		}
	}), In = Dn(Fn), Ln = Dn(g({}, Fn, { dataTransfer: 0 })), Rn = Dn(g({}, An, { relatedTarget: 0 })), zn = Dn(g({}, On, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Bn = Dn(g({}, On, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Vn = Dn(g({}, On, { data: 0 })), Hn = {
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
	}, Un = {
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
	}, Wn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Gn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Wn[e]) ? !!t[e] : !1;
	}
	function Kn() {
		return Gn;
	}
	var qn = Dn(g({}, An, {
		key: function(e) {
			if (e.key) {
				var t = Hn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = wn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Un[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Kn,
		charCode: function(e) {
			return e.type === "keypress" ? wn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? wn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Jn = Dn(g({}, Fn, {
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
	})), Yn = Dn(g({}, An, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Kn
	})), Xn = Dn(g({}, On, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Zn = Dn(g({}, Fn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Qn = Dn(g({}, On, {
		newState: 0,
		oldState: 0
	})), $n = [
		9,
		13,
		27,
		32
	], er = _n && "CompositionEvent" in window, tr = null;
	_n && "documentMode" in document && (tr = document.documentMode);
	var nr = _n && "TextEvent" in window && !tr, rr = _n && (!er || tr && 8 < tr && 11 >= tr), ir = " ", ar = !1;
	function or(e, t) {
		switch (e) {
			case "keyup": return $n.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function sr(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var cr = !1;
	function lr(e, t) {
		switch (e) {
			case "compositionend": return sr(t);
			case "keypress": return t.which === 32 ? (ar = !0, ir) : null;
			case "textInput": return e = t.data, e === ir && ar ? null : e;
			default: return null;
		}
	}
	function ur(e, t) {
		if (cr) return e === "compositionend" || !er && or(e, t) ? (e = Cn(), Sn = xn = bn = null, cr = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return rr && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var dr = {
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
	function fr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!dr[e.type] : t === "textarea";
	}
	function pr(e, t, n, r) {
		dn ? fn ? fn.push(r) : fn = [r] : dn = r, t = Dd(t, "onChange"), 0 < t.length && (n = new kn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var mr = null, hr = null;
	function gr(e) {
		bd(e, 0);
	}
	function _r(e) {
		if (Ut(Tt(e))) return e;
	}
	function vr(e, t) {
		if (e === "change") return t;
	}
	var yr = !1;
	if (_n) {
		var br;
		if (_n) {
			var xr = "oninput" in document;
			if (!xr) {
				var Sr = document.createElement("div");
				Sr.setAttribute("oninput", "return;"), xr = typeof Sr.oninput == "function";
			}
			br = xr;
		} else br = !1;
		yr = br && (!document.documentMode || 9 < document.documentMode);
	}
	function Cr() {
		mr && (mr.detachEvent("onpropertychange", wr), hr = mr = null);
	}
	function wr(e) {
		if (e.propertyName === "value" && _r(hr)) {
			var t = [];
			pr(t, hr, e, un(e)), hn(gr, t);
		}
	}
	function Tr(e, t, n) {
		e === "focusin" ? (Cr(), mr = t, hr = n, mr.attachEvent("onpropertychange", wr)) : e === "focusout" && Cr();
	}
	function Er(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return _r(hr);
	}
	function Dr(e, t) {
		if (e === "click") return _r(t);
	}
	function Or(e, t) {
		if (e === "input" || e === "change") return _r(t);
	}
	function kr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Ar = typeof Object.is == "function" ? Object.is : kr;
	function jr(e, t) {
		if (Ar(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!Oe.call(t, i) || !Ar(e[i], t[i])) return !1;
		}
		return !0;
	}
	function Mr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Nr(e, t) {
		var n = Mr(e);
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
			n = Mr(n);
		}
	}
	function Pr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Pr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Fr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Wt(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Wt(e.document);
		}
		return t;
	}
	function Ir(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Lr = _n && "documentMode" in document && 11 >= document.documentMode, Rr = null, zr = null, Br = null, Vr = !1;
	function Hr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Vr || Rr == null || Rr !== Wt(r) || (r = Rr, "selectionStart" in r && Ir(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Br && jr(Br, r) || (Br = r, r = Dd(zr, "onSelect"), 0 < r.length && (t = new kn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Rr)));
	}
	function Ur(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Wr = {
		animationend: Ur("Animation", "AnimationEnd"),
		animationiteration: Ur("Animation", "AnimationIteration"),
		animationstart: Ur("Animation", "AnimationStart"),
		transitionrun: Ur("Transition", "TransitionRun"),
		transitionstart: Ur("Transition", "TransitionStart"),
		transitioncancel: Ur("Transition", "TransitionCancel"),
		transitionend: Ur("Transition", "TransitionEnd")
	}, Gr = {}, Kr = {};
	_n && (Kr = document.createElement("div").style, "AnimationEvent" in window || (delete Wr.animationend.animation, delete Wr.animationiteration.animation, delete Wr.animationstart.animation), "TransitionEvent" in window || delete Wr.transitionend.transition);
	function qr(e) {
		if (Gr[e]) return Gr[e];
		if (!Wr[e]) return e;
		var t = Wr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Kr) return Gr[e] = t[n];
		return e;
	}
	var Jr = qr("animationend"), Yr = qr("animationiteration"), Xr = qr("animationstart"), Zr = qr("transitionrun"), Qr = qr("transitionstart"), $r = qr("transitioncancel"), ei = qr("transitionend"), ti = /* @__PURE__ */ new Map(), ni = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	ni.push("scrollEnd");
	function ri(e, t) {
		ti.set(e, t), At(t, [e]);
	}
	var ii = typeof reportError == "function" ? reportError : function(t) {
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
	}, ai = [], oi = 0, si = 0;
	function ci() {
		for (var e = oi, t = si = oi = 0; t < e;) {
			var n = ai[t];
			ai[t++] = null;
			var r = ai[t];
			ai[t++] = null;
			var i = ai[t];
			ai[t++] = null;
			var a = ai[t];
			if (ai[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && fi(n, i, a);
		}
	}
	function li(e, t, n, r) {
		ai[oi++] = e, ai[oi++] = t, ai[oi++] = n, ai[oi++] = r, si |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function ui(e, t, n, r) {
		return li(e, t, n, r), pi(e);
	}
	function di(e, t) {
		return li(e, null, null, t), pi(e);
	}
	function fi(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Ge(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function pi(e) {
		if (50 < fu) throw fu = 0, pu = null, Error(c(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var mi = {};
	function hi(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function gi(e, t, n, r) {
		return new hi(e, t, n, r);
	}
	function _i(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function vi(e, t) {
		var n = e.alternate;
		return n === null ? (n = gi(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function yi(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function bi(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") _i(e) && (o = 1);
		else if (typeof e == "string") o = Wf(e, n, pe.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case re: return e = gi(31, n, t, i), e.elementType = re, e.lanes = a, e;
			case b: return xi(n.children, i, a, t);
			case x:
				o = 8, i |= 24;
				break;
			case S: return e = gi(12, n, t, i | 2), e.elementType = S, e.lanes = a, e;
			case te: return e = gi(13, n, t, i), e.elementType = te, e.lanes = a, e;
			case T: return e = gi(19, n, t, i), e.elementType = T, e.lanes = a, e;
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
					case ne:
						o = 14;
						break a;
					case E:
						o = 16, r = null;
						break a;
				}
				o = 29, n = Error(c(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = gi(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function xi(e, t, n, r) {
		return e = gi(7, e, r, t), e.lanes = n, e;
	}
	function Si(e, t, n) {
		return e = gi(6, e, null, t), e.lanes = n, e;
	}
	function Ci(e) {
		var t = gi(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function wi(e, t, n) {
		return t = gi(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var Ti = /* @__PURE__ */ new WeakMap();
	function Ei(e, t) {
		if (typeof e == "object" && e) {
			var n = Ti.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: De(t)
			}, Ti.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: De(t)
		};
	}
	var Di = [], Oi = 0, ki = null, Ai = 0, ji = [], Mi = 0, Ni = null, Pi = 1, Fi = "";
	function Ii(e, t) {
		Di[Oi++] = Ai, Di[Oi++] = ki, ki = e, Ai = t;
	}
	function Li(e, t, n) {
		ji[Mi++] = Pi, ji[Mi++] = Fi, ji[Mi++] = Ni, Ni = e;
		var r = Pi;
		e = Fi;
		var i = 32 - Ge(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ge(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Pi = 1 << 32 - Ge(t) + i | n << i | r, Fi = a + e;
		} else Pi = 1 << a | n << i | r, Fi = e;
	}
	function Ri(e) {
		e.return !== null && (Ii(e, 1), Li(e, 1, 0));
	}
	function zi(e) {
		for (; e === ki;) ki = Di[--Oi], Di[Oi] = null, Ai = Di[--Oi], Di[Oi] = null;
		for (; e === Ni;) Ni = ji[--Mi], ji[Mi] = null, Fi = ji[--Mi], ji[Mi] = null, Pi = ji[--Mi], ji[Mi] = null;
	}
	function Bi(e, t) {
		ji[Mi++] = Pi, ji[Mi++] = Fi, ji[Mi++] = Ni, Pi = t.id, Fi = t.overflow, Ni = e;
	}
	var Vi = null, M = null, N = !1, Hi = null, Ui = !1, Wi = Error(c(519));
	function Gi(e) {
		throw Zi(Ei(Error(c(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Wi;
	}
	function Ki(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[mt] = e, t[ht] = r, n) {
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
				Q("invalid", t), Jt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Qt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Nd(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = cn), t = !0) : t = !1, t || Gi(e, !0);
	}
	function qi(e) {
		for (Vi = e.return; Vi;) switch (Vi.tag) {
			case 5:
			case 31:
			case 13:
				Ui = !1;
				return;
			case 27:
			case 3:
				Ui = !0;
				return;
			default: Vi = Vi.return;
		}
	}
	function Ji(e) {
		if (e !== Vi) return !1;
		if (!N) return qi(e), N = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = n === "form" || n === "button" || Wd(e.type, e.memoizedProps)), n = !n), n && M && Gi(e), qi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(317));
			M = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(317));
			M = df(e);
		} else t === 27 ? (t = M, Qd(e.type) ? (e = uf, uf = null, M = e) : M = t) : M = Vi ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Yi() {
		M = Vi = null, N = !1;
	}
	function Xi() {
		var e = Hi;
		return e !== null && (Ql === null ? Ql = e : Ql.push.apply(Ql, e), Hi = null), e;
	}
	function Zi(e) {
		Hi === null ? Hi = [e] : Hi.push(e);
	}
	var Qi = fe(null), $i = null, ea = null;
	function ta(e, t, n) {
		j(Qi, t._currentValue), t._currentValue = n;
	}
	function na(e) {
		e._currentValue = Qi.current, A(Qi);
	}
	function ra(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function ia(e, t, n, r) {
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
						a.lanes |= n, s = a.alternate, s !== null && (s.lanes |= n), ra(a.return, n, e), r || (o = null);
						break a;
					}
					a = s.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(c(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), ra(o, n, e), o = null;
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
	function aa(e, t, n, r) {
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
					Ar(i.pendingProps.value, o.value) || (e === null ? e = [s] : e.push(s));
				}
			} else if (i === ge.current) {
				if (o = i.alternate, o === null) throw Error(c(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			i = i.return;
		}
		e !== null && ia(t, e, n, r), t.flags |= 262144;
	}
	function oa(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Ar(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function sa(e) {
		$i = e, ea = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ca(e) {
		return ua($i, e);
	}
	function la(e, t) {
		return $i === null && sa(e), ua(e, t);
	}
	function ua(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, ea === null) {
			if (e === null) throw Error(c(308));
			ea = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else ea = ea.next = t;
		return n;
	}
	var da = typeof AbortController < "u" ? AbortController : function() {
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
	}, fa = n.unstable_scheduleCallback, pa = n.unstable_NormalPriority, P = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ma() {
		return {
			controller: new da(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ha(e) {
		e.refCount--, e.refCount === 0 && fa(pa, function() {
			e.controller.abort();
		});
	}
	var ga = null, _a = 0, va = 0, ya = null;
	function ba(e, t) {
		if (ga === null) {
			var n = ga = [];
			_a = 0, va = fd(), ya = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return _a++, t.then(xa, xa), t;
	}
	function xa() {
		if (--_a === 0 && ga !== null) {
			ya !== null && (ya.status = "fulfilled");
			var e = ga;
			ga = null, va = 0, ya = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function Sa(e, t) {
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
	var Ca = O.S;
	O.S = function(e, t) {
		tu = Ne(), typeof t == "object" && t && typeof t.then == "function" && ba(e, t), Ca !== null && Ca(e, t);
	};
	var wa = fe(null);
	function Ta() {
		var e = wa.current;
		return e === null ? K.pooledCache : e;
	}
	function Ea(e, t) {
		t === null ? j(wa, wa.current) : j(wa, t.pool);
	}
	function Da() {
		var e = Ta();
		return e === null ? null : {
			parent: P._currentValue,
			pool: e
		};
	}
	var Oa = Error(c(460)), ka = Error(c(474)), Aa = Error(c(542)), ja = { then: function() {} };
	function Ma(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function Na(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(cn, cn), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, La(e), e;
			default:
				if (typeof t.status == "string") t.then(cn, cn);
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
					case "rejected": throw e = t.reason, La(e), e;
				}
				throw Fa = t, Oa;
		}
	}
	function Pa(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Fa = e, Oa) : e;
		}
	}
	var Fa = null;
	function Ia() {
		if (Fa === null) throw Error(c(459));
		var e = Fa;
		return Fa = null, e;
	}
	function La(e) {
		if (e === Oa || e === Aa) throw Error(c(483));
	}
	var Ra = null, za = 0;
	function Ba(e) {
		var t = za;
		return za += 1, Ra === null && (Ra = []), Na(Ra, e, t);
	}
	function Va(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Ha(e, t) {
		throw t.$$typeof === _ ? Error(c(525)) : (e = Object.prototype.toString.call(t), Error(c(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Ua(e) {
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
			return e = vi(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function s(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = Si(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === b ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === E && Pa(a) === t.type) ? (t = i(t, n.props), Va(t, n), t.return = e, t) : (t = bi(n.type, n.key, n.props, null, e.mode, r), Va(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = wi(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = xi(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = Si("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case v: return n = bi(t.type, t.key, t.props, null, e.mode, n), Va(n, t), n.return = e, n;
					case y: return t = wi(t, e.mode, n), t.return = e, t;
					case E: return t = Pa(t), f(e, t, n);
				}
				if (ce(t) || oe(t)) return t = xi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Ba(t), n);
				if (t.$$typeof === C) return f(e, la(e, t), n);
				Ha(e, t);
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
					case E: return n = Pa(n), p(e, t, n, r);
				}
				if (ce(n) || oe(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Ba(n), r);
				if (n.$$typeof === C) return p(e, t, la(e, n), r);
				Ha(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, s(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case v: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case y: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case E: return r = Pa(r), m(e, t, n, r, i);
				}
				if (ce(r) || oe(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Ba(r), i);
				if (r.$$typeof === C) return m(e, t, n, la(t, r), i);
				Ha(t, r);
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
			if (h === s.length) return n(i, d), N && Ii(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return N && Ii(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), N && Ii(i, h), l;
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
			if (v.done) return n(i, h), N && Ii(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = s.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return N && Ii(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = s.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), N && Ii(i, g), u;
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
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === E && Pa(l) === r.type) {
										n(e, r.sibling), s = i(r, a.props), Va(s, a), s.return = e, e = s;
										break a;
									}
									n(e, r);
									break;
								}
								t(e, r), r = r.sibling;
							}
							a.type === b ? (s = xi(a.props.children, e.mode, s, a.key), s.return = e, e = s) : (s = bi(a.type, a.key, a.props, null, e.mode, s), Va(s, a), s.return = e, e = s);
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
							s = wi(a, e.mode, s), s.return = e, e = s;
						}
						return o(e);
					case E: return a = Pa(a), _(e, r, a, s);
				}
				if (ce(a)) return h(e, r, a, s);
				if (oe(a)) {
					if (l = oe(a), typeof l != "function") throw Error(c(150));
					return a = l.call(a), g(e, r, a, s);
				}
				if (typeof a.then == "function") return _(e, r, Ba(a), s);
				if (a.$$typeof === C) return _(e, r, la(e, a), s);
				Ha(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), s = i(r, a), s.return = e, e = s) : (n(e, r), s = Si(a, e.mode, s), s.return = e, e = s), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				za = 0;
				var i = _(e, t, n, r);
				return Ra = null, i;
			} catch (t) {
				if (t === Oa || t === Aa) throw t;
				var a = gi(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var Wa = Ua(!0), Ga = Ua(!1), Ka = !1;
	function qa(e) {
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
	function Ja(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Ya(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Xa(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, G & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = pi(e), fi(e, null, n), t;
		}
		return li(e, r, t, n), pi(e);
	}
	function Za(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, st(e, n);
		}
	}
	function Qa(e, t) {
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
	var $a = !1;
	function eo() {
		if ($a) {
			var e = ya;
			if (e !== null) throw e;
		}
	}
	function to(e, t, n, r) {
		$a = !1;
		var i = e.updateQueue;
		Ka = !1;
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
					f !== 0 && f === va && ($a = !0), u !== null && (u = u.next = {
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
							case 2: Ka = !0;
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
	function no(e, t) {
		if (typeof e != "function") throw Error(c(191, e));
		e.call(t);
	}
	function ro(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) no(n[e], t);
	}
	var io = fe(null), ao = fe(0);
	function oo(e, t) {
		e = Gl, j(ao, e), j(io, t), Gl = e | t.baseLanes;
	}
	function so() {
		j(ao, Gl), j(io, io.current);
	}
	function co() {
		Gl = ao.current, A(io), A(ao);
	}
	var lo = fe(null), uo = null;
	function fo(e) {
		var t = e.alternate;
		j(F, F.current & 1), j(lo, e), uo === null && (t === null || io.current !== null || t.memoizedState !== null) && (uo = e);
	}
	function po(e) {
		j(F, F.current), j(lo, e), uo === null && (uo = e);
	}
	function mo(e) {
		e.tag === 22 ? (j(F, F.current), j(lo, e), uo === null && (uo = e)) : ho(e);
	}
	function ho() {
		j(F, F.current), j(lo, lo.current);
	}
	function go(e) {
		A(lo), uo === e && (uo = null), A(F);
	}
	var F = fe(0);
	function _o(e) {
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
	var vo = 0, I = null, L = null, R = null, yo = !1, bo = !1, xo = !1, So = 0, Co = 0, wo = null, To = 0;
	function z() {
		throw Error(c(321));
	}
	function Eo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Ar(e[n], t[n])) return !1;
		return !0;
	}
	function Do(e, t, n, r, i, a) {
		return vo = a, I = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, O.H = e === null || e.memoizedState === null ? Us : Ws, xo = !1, a = n(r, i), xo = !1, bo && (a = ko(t, n, r, i)), Oo(e), a;
	}
	function Oo(e) {
		O.H = Hs;
		var t = L !== null && L.next !== null;
		if (vo = 0, R = L = I = null, yo = !1, Co = 0, wo = null, t) throw Error(c(300));
		e === null || V || (e = e.dependencies, e !== null && oa(e) && (V = !0));
	}
	function ko(e, t, n, r) {
		I = e;
		var i = 0;
		do {
			if (bo && (wo = null), Co = 0, bo = !1, 25 <= i) throw Error(c(301));
			if (i += 1, R = L = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			O.H = Gs, a = t(n, r);
		} while (bo);
		return a;
	}
	function Ao() {
		var e = O.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? Io(t) : t, e = e.useState()[0], (L === null ? null : L.memoizedState) !== e && (I.flags |= 1024), t;
	}
	function jo() {
		var e = So !== 0;
		return So = 0, e;
	}
	function Mo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function No(e) {
		if (yo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			yo = !1;
		}
		vo = 0, R = L = I = null, bo = !1, Co = So = 0, wo = null;
	}
	function Po() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return R === null ? I.memoizedState = R = e : R = R.next = e, R;
	}
	function B() {
		if (L === null) {
			var e = I.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = L.next;
		var t = R === null ? I.memoizedState : R.next;
		if (t !== null) R = t, L = e;
		else {
			if (e === null) throw I.alternate === null ? Error(c(467)) : Error(c(310));
			L = e, e = {
				memoizedState: L.memoizedState,
				baseState: L.baseState,
				baseQueue: L.baseQueue,
				queue: L.queue,
				next: null
			}, R === null ? I.memoizedState = R = e : R = R.next = e;
		}
		return R;
	}
	function Fo() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function Io(e) {
		var t = Co;
		return Co += 1, wo === null && (wo = []), e = Na(wo, e, t), t = I, (R === null ? t.memoizedState : R.next) === null && (t = t.alternate, O.H = t === null || t.memoizedState === null ? Us : Ws), e;
	}
	function Lo(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Io(e);
			if (e.$$typeof === C) return ca(e);
		}
		throw Error(c(438, String(e)));
	}
	function Ro(e) {
		var t = null, n = I.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = I.alternate;
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
		}, n === null && (n = Fo(), I.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ie;
		return t.index++, n;
	}
	function zo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Bo(e) {
		return Vo(B(), L, e);
	}
	function Vo(e, t, n) {
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
				if (f === u.lane ? (vo & f) === f : (J & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === va && (d = !0);
					else if ((vo & p) === p) {
						u = u.next, p === va && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (s = l = f, o = a) : l = l.next = f, I.lanes |= p, Kl |= p;
					f = u.action, xo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (s = l = p, o = a) : l = l.next = p, I.lanes |= f, Kl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = s, !Ar(a, e.memoizedState) && (V = !0, d && (n = ya, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Ho(e) {
		var t = B(), n = t.queue;
		if (n === null) throw Error(c(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			Ar(a, t.memoizedState) || (V = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Uo(e, t, n) {
		var r = I, i = B(), a = N;
		if (a) {
			if (n === void 0) throw Error(c(407));
			n = n();
		} else n = t();
		var o = !Ar((L || i).memoizedState, n);
		if (o && (i.memoizedState = n, V = !0), i = i.queue, ms(Ko.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || R !== null && R.memoizedState.tag & 1) {
			if (r.flags |= 2048, ls(9, { destroy: void 0 }, Go.bind(null, r, i, n, t), null), K === null) throw Error(c(349));
			a || vo & 127 || Wo(r, t, n);
		}
		return n;
	}
	function Wo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = I.updateQueue, t === null ? (t = Fo(), I.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Go(e, t, n, r) {
		t.value = n, t.getSnapshot = r, qo(t) && Jo(e);
	}
	function Ko(e, t, n) {
		return n(function() {
			qo(t) && Jo(e);
		});
	}
	function qo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Ar(e, n);
		} catch {
			return !0;
		}
	}
	function Jo(e) {
		var t = di(e, 2);
		t !== null && gu(t, e, 2);
	}
	function Yo(e) {
		var t = Po();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), xo) {
				We(!0);
				try {
					n();
				} finally {
					We(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: zo,
			lastRenderedState: e
		}, t;
	}
	function Xo(e, t, n, r) {
		return e.baseState = n, Vo(e, L, typeof r == "function" ? r : zo);
	}
	function Zo(e, t, n, r, i) {
		if (zs(e)) throw Error(c(485));
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
			O.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Qo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Qo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = O.T, o = {};
			O.T = o;
			try {
				var s = n(i, r), c = O.S;
				c !== null && c(o, s), $o(e, t, s);
			} catch (n) {
				ts(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), O.T = a;
			}
		} else try {
			a = n(i, r), $o(e, t, a);
		} catch (n) {
			ts(e, t, n);
		}
	}
	function $o(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			es(e, t, n);
		}, function(n) {
			return ts(e, t, n);
		}) : es(e, t, n);
	}
	function es(e, t, n) {
		t.status = "fulfilled", t.value = n, ns(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Qo(e, n)));
	}
	function ts(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, ns(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function ns(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function rs(e, t) {
		return t;
	}
	function is(e, t) {
		if (N) {
			var n = K.formState;
			if (n !== null) {
				a: {
					var r = I;
					if (N) {
						if (M) {
							b: {
								for (var i = M, a = Ui; i.nodeType !== 8;) {
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
								M = lf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Gi(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Po(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: rs,
			lastRenderedState: t
		}, n.queue = r, n = Is.bind(null, I, r), r.dispatch = n, r = Yo(!1), a = Rs.bind(null, I, !1, r.queue), r = Po(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Zo.bind(null, I, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function as(e) {
		return os(B(), L, e);
	}
	function os(e, t, n) {
		if (t = Vo(e, t, rs)[0], e = Bo(zo)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = Io(t);
		} catch (e) {
			throw e === Oa ? Aa : e;
		}
		else r = t;
		t = B();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (I.flags |= 2048, ls(9, { destroy: void 0 }, ss.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function ss(e, t) {
		e.action = t;
	}
	function cs(e) {
		var t = B(), n = L;
		if (n !== null) return os(t, n, e);
		B(), t = t.memoizedState, n = B();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function ls(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = I.updateQueue, t === null && (t = Fo(), I.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function us() {
		return B().memoizedState;
	}
	function ds(e, t, n, r) {
		var i = Po();
		I.flags |= e, i.memoizedState = ls(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function fs(e, t, n, r) {
		var i = B();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		L !== null && r !== null && Eo(r, L.memoizedState.deps) ? i.memoizedState = ls(t, a, n, r) : (I.flags |= e, i.memoizedState = ls(1 | t, a, n, r));
	}
	function ps(e, t) {
		ds(8390656, 8, e, t);
	}
	function ms(e, t) {
		fs(2048, 8, e, t);
	}
	function hs(e) {
		I.flags |= 4;
		var t = I.updateQueue;
		if (t === null) t = Fo(), I.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function gs(e) {
		var t = B().memoizedState;
		return hs({
			ref: t,
			nextImpl: e
		}), function() {
			if (G & 2) throw Error(c(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function _s(e, t) {
		return fs(4, 2, e, t);
	}
	function vs(e, t) {
		return fs(4, 4, e, t);
	}
	function ys(e, t) {
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
	function bs(e, t, n) {
		n = n == null ? null : n.concat([e]), fs(4, 4, ys.bind(null, t, e), n);
	}
	function xs() {}
	function Ss(e, t) {
		var n = B();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && Eo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function Cs(e, t) {
		var n = B();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && Eo(t, r[1])) return r[0];
		if (r = e(), xo) {
			We(!0);
			try {
				e();
			} finally {
				We(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function ws(e, t, n) {
		return n === void 0 || vo & 1073741824 && !(J & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = hu(), I.lanes |= e, Kl |= e, n);
	}
	function Ts(e, t, n, r) {
		return Ar(n, t) ? n : io.current === null ? !(vo & 42) || vo & 1073741824 && !(J & 261930) ? (V = !0, e.memoizedState = n) : (e = hu(), I.lanes |= e, Kl |= e, t) : (e = ws(e, n, r), Ar(e, t) || (V = !0), e);
	}
	function Es(e, t, n, r, i) {
		var a = k.p;
		k.p = a !== 0 && 8 > a ? a : 8;
		var o = O.T, s = {};
		O.T = s, Rs(e, !1, t, n);
		try {
			var c = i(), l = O.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ls(e, t, Sa(c, r), mu(e)) : Ls(e, t, r, mu(e));
		} catch (n) {
			Ls(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, mu());
		} finally {
			k.p = a, o !== null && s.types !== null && (o.types = s.types), O.T = o;
		}
	}
	function Ds() {}
	function Os(e, t, n, r) {
		if (e.tag !== 5) throw Error(c(476));
		var i = ks(e).queue;
		Es(e, i, t, le, n === null ? Ds : function() {
			return As(e), n(r);
		});
	}
	function ks(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: le,
			baseState: le,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: zo,
				lastRenderedState: le
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
				lastRenderedReducer: zo,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function As(e) {
		var t = ks(e);
		t.next === null && (t = e.alternate.memoizedState), Ls(e, t.next.queue, {}, mu());
	}
	function js() {
		return ca($f);
	}
	function Ms() {
		return B().memoizedState;
	}
	function Ns() {
		return B().memoizedState;
	}
	function Ps(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = mu();
					e = Ya(n);
					var r = Xa(t, e, n);
					r !== null && (gu(r, t, n), Za(r, t, n)), t = { cache: ma() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Fs(e, t, n) {
		var r = mu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, zs(e) ? Bs(t, n) : (n = ui(e, t, n, r), n !== null && (gu(n, e, r), Vs(n, t, r)));
	}
	function Is(e, t, n) {
		Ls(e, t, n, mu());
	}
	function Ls(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (zs(e)) Bs(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Ar(s, o)) return li(e, t, i, 0), K === null && ci(), !1;
			} catch {}
			if (n = ui(e, t, i, r), n !== null) return gu(n, e, r), Vs(n, t, r), !0;
		}
		return !1;
	}
	function Rs(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: fd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, zs(e)) {
			if (t) throw Error(c(479));
		} else t = ui(e, n, r, 2), t !== null && gu(t, e, 2);
	}
	function zs(e) {
		var t = e.alternate;
		return e === I || t !== null && t === I;
	}
	function Bs(e, t) {
		bo = yo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Vs(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, st(e, n);
		}
	}
	var Hs = {
		readContext: ca,
		use: Lo,
		useCallback: z,
		useContext: z,
		useEffect: z,
		useImperativeHandle: z,
		useLayoutEffect: z,
		useInsertionEffect: z,
		useMemo: z,
		useReducer: z,
		useRef: z,
		useState: z,
		useDebugValue: z,
		useDeferredValue: z,
		useTransition: z,
		useSyncExternalStore: z,
		useId: z,
		useHostTransitionStatus: z,
		useFormState: z,
		useActionState: z,
		useOptimistic: z,
		useMemoCache: z,
		useCacheRefresh: z
	};
	Hs.useEffectEvent = z;
	var Us = {
		readContext: ca,
		use: Lo,
		useCallback: function(e, t) {
			return Po().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ca,
		useEffect: ps,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), ds(4194308, 4, ys.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return ds(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			ds(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Po();
			t = t === void 0 ? null : t;
			var r = e();
			if (xo) {
				We(!0);
				try {
					e();
				} finally {
					We(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Po();
			if (n !== void 0) {
				var i = n(t);
				if (xo) {
					We(!0);
					try {
						n(t);
					} finally {
						We(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Fs.bind(null, I, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Po();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Yo(e);
			var t = e.queue, n = Is.bind(null, I, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: xs,
		useDeferredValue: function(e, t) {
			return ws(Po(), e, t);
		},
		useTransition: function() {
			var e = Yo(!1);
			return e = Es.bind(null, I, e.queue, !0, !1), Po().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = I, i = Po();
			if (N) {
				if (n === void 0) throw Error(c(407));
				n = n();
			} else {
				if (n = t(), K === null) throw Error(c(349));
				J & 127 || Wo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, ps(Ko.bind(null, r, a, e), [e]), r.flags |= 2048, ls(9, { destroy: void 0 }, Go.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Po(), t = K.identifierPrefix;
			if (N) {
				var n = Fi, r = Pi;
				n = (r & ~(1 << 32 - Ge(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = So++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = To++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: js,
		useFormState: is,
		useActionState: is,
		useOptimistic: function(e) {
			var t = Po();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = Rs.bind(null, I, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Ro,
		useCacheRefresh: function() {
			return Po().memoizedState = Ps.bind(null, I);
		},
		useEffectEvent: function(e) {
			var t = Po(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (G & 2) throw Error(c(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Ws = {
		readContext: ca,
		use: Lo,
		useCallback: Ss,
		useContext: ca,
		useEffect: ms,
		useImperativeHandle: bs,
		useInsertionEffect: _s,
		useLayoutEffect: vs,
		useMemo: Cs,
		useReducer: Bo,
		useRef: us,
		useState: function() {
			return Bo(zo);
		},
		useDebugValue: xs,
		useDeferredValue: function(e, t) {
			return Ts(B(), L.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Bo(zo)[0], t = B().memoizedState;
			return [typeof e == "boolean" ? e : Io(e), t];
		},
		useSyncExternalStore: Uo,
		useId: Ms,
		useHostTransitionStatus: js,
		useFormState: as,
		useActionState: as,
		useOptimistic: function(e, t) {
			return Xo(B(), L, e, t);
		},
		useMemoCache: Ro,
		useCacheRefresh: Ns
	};
	Ws.useEffectEvent = gs;
	var Gs = {
		readContext: ca,
		use: Lo,
		useCallback: Ss,
		useContext: ca,
		useEffect: ms,
		useImperativeHandle: bs,
		useInsertionEffect: _s,
		useLayoutEffect: vs,
		useMemo: Cs,
		useReducer: Ho,
		useRef: us,
		useState: function() {
			return Ho(zo);
		},
		useDebugValue: xs,
		useDeferredValue: function(e, t) {
			var n = B();
			return L === null ? ws(n, e, t) : Ts(n, L.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Ho(zo)[0], t = B().memoizedState;
			return [typeof e == "boolean" ? e : Io(e), t];
		},
		useSyncExternalStore: Uo,
		useId: Ms,
		useHostTransitionStatus: js,
		useFormState: cs,
		useActionState: cs,
		useOptimistic: function(e, t) {
			var n = B();
			return L === null ? (n.baseState = e, [e, n.queue.dispatch]) : Xo(n, L, e, t);
		},
		useMemoCache: Ro,
		useCacheRefresh: Ns
	};
	Gs.useEffectEvent = gs;
	function Ks(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : g({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var qs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = mu(), i = Ya(r);
			i.payload = t, n != null && (i.callback = n), t = Xa(e, i, r), t !== null && (gu(t, e, r), Za(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = mu(), i = Ya(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Xa(e, i, r), t !== null && (gu(t, e, r), Za(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = mu(), r = Ya(n);
			r.tag = 2, t != null && (r.callback = t), t = Xa(e, r, n), t !== null && (gu(t, e, n), Za(t, e, n));
		}
	};
	function Js(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !jr(n, r) || !jr(i, a) : !0;
	}
	function Ys(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && qs.enqueueReplaceState(t, t.state, null);
	}
	function Xs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = g({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Zs(e) {
		ii(e);
	}
	function Qs(e) {
		console.error(e);
	}
	function $s(e) {
		ii(e);
	}
	function ec(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function tc(e, t, n) {
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
	function nc(e, t, n) {
		return n = Ya(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			ec(e, t);
		}, n;
	}
	function rc(e) {
		return e = Ya(e), e.tag = 3, e;
	}
	function ic(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				tc(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			tc(t, n, r), typeof i != "function" && (iu === null ? iu = /* @__PURE__ */ new Set([this]) : iu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function ac(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && aa(t, n, i, !0), n = lo.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return uo === null ? Ou() : n.alternate === null && X === 0 && (X = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === ja ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = /* @__PURE__ */ new Set([r]) : t.add(r), Ku(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === ja ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = /* @__PURE__ */ new Set([r]) : n.add(r)), Ku(e, r, i)), !1;
				}
				throw Error(c(435, n.tag));
			}
			return Ku(e, r, i), Ou(), !1;
		}
		if (N) return t = lo.current, t === null ? (r !== Wi && (t = Error(c(423), { cause: r }), Zi(Ei(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = Ei(r, n), i = nc(e.stateNode, r, i), Qa(e, i), X !== 4 && (X = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Wi && (e = Error(c(422), { cause: r }), Zi(Ei(e, n)))), !1;
		var a = Error(c(520), { cause: r });
		if (a = Ei(a, n), Zl === null ? Zl = [a] : Zl.push(a), X !== 4 && (X = 2), t === null) return !0;
		r = Ei(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = nc(n.stateNode, r, e), Qa(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (iu === null || !iu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = rc(i), ic(i, e, n, r), Qa(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var oc = Error(c(461)), V = !1;
	function sc(e, t, n, r) {
		t.child = e === null ? Ga(t, null, n, r) : Wa(t, e.child, n, r);
	}
	function cc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return sa(t), r = Do(e, t, n, o, a, i), s = jo(), e !== null && !V ? (Mo(e, t, i), Mc(e, t, i)) : (N && s && Ri(t), t.flags |= 1, sc(e, t, r, i), t.child);
	}
	function lc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !_i(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, uc(e, t, a, r, i)) : (e = bi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Nc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? jr : n, n(o, r) && e.ref === t.ref) return Mc(e, t, i);
		}
		return t.flags |= 1, e = vi(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function uc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (jr(a, r) && e.ref === t.ref) {
				if (V = !1, t.pendingProps = r = a, Nc(e, i)) e.flags & 131072 && (V = !0);
				else return t.lanes = e.lanes, Mc(e, t, i);
			}
		}
		return vc(e, t, n, r, i);
	}
	function dc(e, t, n, r) {
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
				return pc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && Ea(t, a === null ? null : a.cachePool), a === null ? so() : oo(t, a), mo(t);
			else return r = t.lanes = 536870912, pc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && Ea(t, null), so(), ho(t)) : (Ea(t, a.cachePool), oo(t, a), ho(t), t.memoizedState = null);
		return sc(e, t, i, n), t.child;
	}
	function fc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function pc(e, t, n, r, i) {
		var a = Ta();
		return a = a === null ? null : {
			parent: P._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && Ea(t, null), so(), mo(t), e !== null && aa(e, t, r, !0), t.childLanes = i, null;
	}
	function mc(e, t) {
		return t = Dc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function hc(e, t, n) {
		return Wa(t, e.child, null, n), e = mc(t, t.pendingProps), e.flags |= 2, go(t), t.memoizedState = null, e;
	}
	function gc(e, t, n) {
		var r = t.pendingProps, i = !!(t.flags & 128);
		if (t.flags &= -129, e === null) {
			if (N) {
				if (r.mode === "hidden") return e = mc(t, r), t.lanes = 536870912, fc(null, e);
				if (po(t), (e = M) ? (e = af(e, Ui), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ni === null ? null : {
						id: Pi,
						overflow: Fi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ci(e), n.return = t, t.child = n, Vi = t, M = null)) : e = null, e === null) throw Gi(t);
				return t.lanes = 536870912, null;
			}
			return mc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (po(t), i) {
				if (t.flags & 256) t.flags &= -257, t = hc(e, t, n);
				else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
				else throw Error(c(558));
			} else if (V || aa(e, t, n, !1), i = (n & e.childLanes) !== 0, V || i) {
				if (r = K, r !== null && (o = ct(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, di(e, o), gu(r, e, o), oc;
				Ou(), t = hc(e, t, n);
			} else e = a.treeContext, M = lf(o.nextSibling), Vi = t, N = !0, Hi = null, Ui = !1, e !== null && Bi(t, e), t = mc(t, r), t.flags |= 4096;
			return t;
		}
		return e = vi(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function _c(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(c(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function vc(e, t, n, r, i) {
		return sa(t), n = Do(e, t, n, r, void 0, i), r = jo(), e !== null && !V ? (Mo(e, t, i), Mc(e, t, i)) : (N && r && Ri(t), t.flags |= 1, sc(e, t, n, i), t.child);
	}
	function yc(e, t, n, r, i, a) {
		return sa(t), t.updateQueue = null, n = ko(t, r, n, i), Oo(e), r = jo(), e !== null && !V ? (Mo(e, t, a), Mc(e, t, a)) : (N && r && Ri(t), t.flags |= 1, sc(e, t, n, a), t.child);
	}
	function bc(e, t, n, r, i) {
		if (sa(t), t.stateNode === null) {
			var a = mi, o = n.contextType;
			typeof o == "object" && o && (a = ca(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = qs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, qa(t), o = n.contextType, a.context = typeof o == "object" && o ? ca(o) : mi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ks(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && qs.enqueueReplaceState(a, a.state, null), to(t, r, a, i), eo(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Xs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = mi, typeof u == "object" && u && (o = ca(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Ys(t, a, r, o), Ka = !1;
			var f = t.memoizedState;
			a.state = f, to(t, r, a, i), eo(), l = t.memoizedState, s || f !== l || Ka ? (typeof d == "function" && (Ks(t, n, d, r), l = t.memoizedState), (c = Ka || Js(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Ja(e, t), o = t.memoizedProps, u = Xs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = mi, typeof l == "object" && l && (c = ca(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Ys(t, a, r, c), Ka = !1, f = t.memoizedState, a.state = f, to(t, r, a, i), eo();
			var p = t.memoizedState;
			o !== d || f !== p || Ka || e !== null && e.dependencies !== null && oa(e.dependencies) ? (typeof s == "function" && (Ks(t, n, s, r), p = t.memoizedState), (u = Ka || Js(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && oa(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, _c(e, t), r = !!(t.flags & 128), a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Wa(t, e.child, null, i), t.child = Wa(t, null, n, i)) : sc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Mc(e, t, i), e;
	}
	function xc(e, t, n, r) {
		return Yi(), t.flags |= 256, sc(e, t, n, r), t.child;
	}
	var Sc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function Cc(e) {
		return {
			baseLanes: e,
			cachePool: Da()
		};
	}
	function wc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Yl), e;
	}
	function Tc(e, t, n) {
		var r = t.pendingProps, i = !1, a = !!(t.flags & 128), o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : !!(F.current & 2)), o && (i = !0, t.flags &= -129), o = !!(t.flags & 32), t.flags &= -33, e === null) {
			if (N) {
				if (i ? fo(t) : ho(t), (e = M) ? (e = af(e, Ui), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ni === null ? null : {
						id: Pi,
						overflow: Fi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = Ci(e), n.return = t, t.child = n, Vi = t, M = null)) : e = null, e === null) throw Gi(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var s = r.children;
			return r = r.fallback, i ? (ho(t), i = t.mode, s = Dc({
				mode: "hidden",
				children: s
			}, i), r = xi(r, i, n, null), s.return = t, r.return = t, s.sibling = r, t.child = s, r = t.child, r.memoizedState = Cc(n), r.childLanes = wc(e, o, n), t.memoizedState = Sc, fc(null, r)) : (fo(t), Ec(t, s));
		}
		var l = e.memoizedState;
		if (l !== null && (s = l.dehydrated, s !== null)) {
			if (a) t.flags & 256 ? (fo(t), t.flags &= -257, t = Oc(e, t, n)) : t.memoizedState === null ? (ho(t), s = r.fallback, i = t.mode, r = Dc({
				mode: "visible",
				children: r.children
			}, i), s = xi(s, i, n, null), s.flags |= 2, r.return = t, s.return = t, r.sibling = s, t.child = r, Wa(t, e.child, null, n), r = t.child, r.memoizedState = Cc(n), r.childLanes = wc(e, o, n), t.memoizedState = Sc, t = fc(null, r)) : (ho(t), t.child = e.child, t.flags |= 128, t = null);
			else if (fo(t), sf(s)) {
				if (o = s.nextSibling && s.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(c(419)), r.stack = "", r.digest = o, Zi({
					value: r,
					source: null,
					stack: null
				}), t = Oc(e, t, n);
			} else if (V || aa(e, t, n, !1), o = (n & e.childLanes) !== 0, V || o) {
				if (o = K, o !== null && (r = ct(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, di(e, r), gu(o, e, r), oc;
				of(s) || Ou(), t = Oc(e, t, n);
			} else of(s) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, M = lf(s.nextSibling), Vi = t, N = !0, Hi = null, Ui = !1, e !== null && Bi(t, e), t = Ec(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (ho(t), s = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = vi(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (s = xi(s, i, n, null), s.flags |= 2) : s = vi(u, s), s.return = t, r.return = t, r.sibling = s, t.child = r, fc(null, r), r = t.child, s = e.child.memoizedState, s === null ? s = Cc(n) : (i = s.cachePool, i === null ? i = Da() : (l = P._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), s = {
			baseLanes: s.baseLanes | n,
			cachePool: i
		}), r.memoizedState = s, r.childLanes = wc(e, o, n), t.memoizedState = Sc, fc(e.child, r)) : (fo(t), n = e.child, e = n.sibling, n = vi(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function Ec(e, t) {
		return t = Dc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Dc(e, t) {
		return e = gi(22, e, null, t), e.lanes = 0, e;
	}
	function Oc(e, t, n) {
		return Wa(t, e.child, null, n), e = Ec(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function kc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), ra(e.return, t, n);
	}
	function Ac(e, t, n, r, i, a) {
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
	function jc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = F.current, s = !!(o & 2);
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, j(F, o), sc(e, t, r, n), r = N ? Ai : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && kc(e, n, t);
			else if (e.tag === 19) kc(e, n, t);
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && _o(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Ac(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && _o(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				Ac(t, !0, n, null, a, r);
				break;
			case "together":
				Ac(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Mc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Kl |= t.lanes, (n & t.childLanes) === 0) {
			if (e !== null) {
				if (aa(e, t, n, !1), (n & t.childLanes) === 0) return null;
			} else return null;
		}
		if (e !== null && t.child !== e.child) throw Error(c(153));
		if (t.child !== null) {
			for (e = t.child, n = vi(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = vi(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Nc(e, t) {
		return (e.lanes & t) !== 0 || (e = e.dependencies, !!(e !== null && oa(e)));
	}
	function Pc(e, t, n) {
		switch (t.tag) {
			case 3:
				_e(t, t.stateNode.containerInfo), ta(t, P, e.memoizedState.cache), Yi();
				break;
			case 27:
			case 5:
				ye(t);
				break;
			case 4:
				_e(t, t.stateNode.containerInfo);
				break;
			case 10:
				ta(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, po(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (fo(t), e = Mc(e, t, n), e === null ? null : e.sibling) : Tc(e, t, n) : (fo(t), t.flags |= 128, null);
				fo(t);
				break;
			case 19:
				var i = !!(e.flags & 128);
				if (r = (n & t.childLanes) !== 0, r ||= (aa(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return jc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), j(F, F.current), r) break;
				return null;
			case 22: return t.lanes = 0, dc(e, t, n, t.pendingProps);
			case 24: ta(t, P, e.memoizedState.cache);
		}
		return Mc(e, t, n);
	}
	function Fc(e, t, n) {
		if (e !== null) {
			if (e.memoizedProps !== t.pendingProps) V = !0;
			else {
				if (!Nc(e, n) && !(t.flags & 128)) return V = !1, Pc(e, t, n);
				V = !!(e.flags & 131072);
			}
		} else V = !1, N && t.flags & 1048576 && Li(t, Ai, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Pa(t.elementType), t.type = e, typeof e == "function") _i(e) ? (r = Xs(e, r), t.tag = 1, t = bc(null, t, e, r, n)) : (t.tag = 0, t = vc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = cc(null, t, e, r, n);
								break a;
							}
							if (i === ne) {
								t.tag = 14, t = lc(null, t, e, r, n);
								break a;
							}
						}
						throw t = se(e) || e, Error(c(306, t, ""));
					}
				}
				return t;
			case 0: return vc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Xs(r, t.pendingProps), bc(e, t, r, i, n);
			case 3:
				a: {
					if (_e(t, t.stateNode.containerInfo), e === null) throw Error(c(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Ja(e, t), to(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, ta(t, P, r), r !== a.cache && ia(t, [P], n, !0), eo(), r = o.element, a.isDehydrated) {
						if (a = {
							element: r,
							isDehydrated: !1,
							cache: o.cache
						}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
							t = xc(e, t, r, n);
							break a;
						}
						if (r !== i) {
							i = Ei(Error(c(424)), t), Zi(i), t = xc(e, t, r, n);
							break a;
						}
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (M = lf(e.firstChild), Vi = t, N = !0, Hi = null, Ui = !0, n = Ga(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					} else {
						if (Yi(), r === i) {
							t = Mc(e, t, n);
							break a;
						}
						sc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return _c(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : N || (n = t.type, e = t.pendingProps, r = Vd(he.current).createElement(n), r[mt] = t, r[ht] = e, Fd(r, n, e), Dt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return ye(t), e === null && N && (r = t.stateNode = pf(t.type, t.pendingProps, he.current), Vi = t, Ui = !0, i = M, Qd(t.type) ? (uf = i, M = lf(r.firstChild)) : M = i), sc(e, t, t.pendingProps.children, n), _c(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && N && ((i = r = M) && (r = nf(r, t.type, t.pendingProps, Ui), r === null ? i = !1 : (t.stateNode = r, Vi = t, M = lf(r.firstChild), Ui = !1, i = !0)), i || Gi(t)), ye(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = Do(e, t, Ao, null, null, n), $f._currentValue = i), _c(e, t), sc(e, t, r, n), t.child;
			case 6: return e === null && N && ((e = n = M) && (n = rf(n, t.pendingProps, Ui), n === null ? e = !1 : (t.stateNode = n, Vi = t, M = null, e = !0)), e || Gi(t)), null;
			case 13: return Tc(e, t, n);
			case 4: return _e(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Wa(t, null, r, n) : sc(e, t, r, n), t.child;
			case 11: return cc(e, t, t.type, t.pendingProps, n);
			case 7: return sc(e, t, t.pendingProps, n), t.child;
			case 8: return sc(e, t, t.pendingProps.children, n), t.child;
			case 12: return sc(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, ta(t, t.type, r.value), sc(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, sa(t), i = ca(i), r = r(i), t.flags |= 1, sc(e, t, r, n), t.child;
			case 14: return lc(e, t, t.type, t.pendingProps, n);
			case 15: return uc(e, t, t.type, t.pendingProps, n);
			case 19: return jc(e, t, n);
			case 31: return gc(e, t, n);
			case 22: return dc(e, t, n, t.pendingProps);
			case 24: return sa(t), r = ca(P), e === null ? (i = Ta(), i === null && (i = K, a = ma(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, qa(t), ta(t, P, i)) : ((e.lanes & n) !== 0 && (Ja(e, t), to(t, null, null, n), eo()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, ta(t, P, r), r !== i.cache && ia(t, [P], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), ta(t, P, r))), sc(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(c(156, t.tag));
	}
	function Ic(e) {
		e.flags |= 4;
	}
	function Lc(e, t, n, r, i) {
		if ((t = !!(e.mode & 32)) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) {
				if (e.stateNode.complete) e.flags |= 8192;
				else if (Tu()) e.flags |= 8192;
				else throw Fa = ja, ka;
			}
		} else e.flags &= -16777217;
	}
	function Rc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Gf(t)) {
			if (Tu()) e.flags |= 8192;
			else throw Fa = ja, ka;
		}
	}
	function zc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : nt(), e.lanes |= t, Xl |= t);
	}
	function Bc(e, t) {
		if (!N) switch (e.tailMode) {
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
	function H(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Vc(e, t, n) {
		var r = t.pendingProps;
		switch (zi(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return H(t), null;
			case 1: return H(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), na(P), ve(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ji(t) ? Ic(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Xi())), H(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Ic(t), a === null ? (H(t), Lc(t, i, null, r, n)) : (H(t), Rc(t, a))) : a ? a === e.memoizedState ? (H(t), t.flags &= -16777217) : (Ic(t), H(t), Rc(t, a)) : (e = e.memoizedProps, e !== r && Ic(t), H(t), Lc(t, i, e, r, n)), null;
			case 27:
				if (be(t), n = he.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Ic(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(c(166));
						return H(t), null;
					}
					e = pe.current, Ji(t) ? Ki(t, e) : (e = pf(i, r, n), t.stateNode = e, Ic(t));
				}
				return H(t), null;
			case 5:
				if (be(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Ic(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(c(166));
						return H(t), null;
					}
					if (a = pe.current, Ji(t)) Ki(t, a);
					else {
						var o = Vd(he.current);
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
						a[mt] = t, a[ht] = r;
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
						r && Ic(t);
					}
				}
				return H(t), Lc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Ic(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(c(166));
					if (e = he.current, Ji(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Vi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[mt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Nd(e.nodeValue, n)), e || Gi(t, !0);
					} else e = Vd(e).createTextNode(r), e[mt] = t, t.stateNode = e;
				}
				return H(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ji(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(c(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(c(557));
							e[mt] = t;
						} else Yi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						H(t), e = !1;
					} else n = Xi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (go(t), t) : (go(t), null);
					if (t.flags & 128) throw Error(c(558));
				}
				return H(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Ji(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(c(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(c(317));
							i[mt] = t;
						} else Yi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						H(t), i = !1;
					} else i = Xi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (go(t), t) : (go(t), null);
				}
				return go(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), zc(t, t.updateQueue), H(t), null);
			case 4: return ve(), e === null && Cd(t.stateNode.containerInfo), H(t), null;
			case 10: return na(t.type), H(t), null;
			case 19:
				if (A(F), r = t.memoizedState, r === null) return H(t), null;
				if (i = !!(t.flags & 128), a = r.rendering, a === null) {
					if (i) Bc(r, !1);
					else {
						if (X !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
							if (a = _o(e), a !== null) {
								for (t.flags |= 128, Bc(r, !1), e = a.updateQueue, t.updateQueue = e, zc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) yi(n, e), n = n.sibling;
								return j(F, F.current & 1 | 2), N && Ii(t, r.treeForkCount), t.child;
							}
							e = e.sibling;
						}
						r.tail !== null && Ne() > nu && (t.flags |= 128, i = !0, Bc(r, !1), t.lanes = 4194304);
					}
				} else {
					if (!i) {
						if (e = _o(a), e !== null) {
							if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, zc(t, e), Bc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !N) return H(t), null;
						} else 2 * Ne() - r.renderingStartTime > nu && n !== 536870912 && (t.flags |= 128, i = !0, Bc(r, !1), t.lanes = 4194304);
					}
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (H(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ne(), e.sibling = null, n = F.current, j(F, i ? n & 1 | 2 : n & 1), N && Ii(t, r.treeForkCount), e);
			case 22:
			case 23: return go(t), co(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (H(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : H(t), n = t.updateQueue, n !== null && zc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && A(wa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), na(P), H(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(c(156, t.tag));
	}
	function Hc(e, t) {
		switch (zi(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return na(P), ve(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return be(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (go(t), t.alternate === null) throw Error(c(340));
					Yi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (go(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(c(340));
					Yi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return A(F), null;
			case 4: return ve(), null;
			case 10: return na(t.type), null;
			case 22:
			case 23: return go(t), co(), e !== null && A(wa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return na(P), null;
			case 25: return null;
			default: return null;
		}
	}
	function Uc(e, t) {
		switch (zi(t), t.tag) {
			case 3:
				na(P), ve();
				break;
			case 26:
			case 27:
			case 5:
				be(t);
				break;
			case 4:
				ve();
				break;
			case 31:
				t.memoizedState !== null && go(t);
				break;
			case 13:
				go(t);
				break;
			case 19:
				A(F);
				break;
			case 10:
				na(t.type);
				break;
			case 22:
			case 23:
				go(t), co(), e !== null && A(wa);
				break;
			case 24: na(P);
		}
	}
	function Wc(e, t) {
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
	function Gc(e, t, n) {
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
	function Kc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				ro(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function qc(e, t, n) {
		n.props = Xs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Jc(e, t) {
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
	function Yc(e, t) {
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
	function Xc(e) {
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
	function Zc(e, t, n) {
		try {
			var r = e.stateNode;
			Id(r, e.type, n, t), r[ht] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Qc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Qd(e.type) || e.tag === 4;
	}
	function $c(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Qc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Qd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function el(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = cn));
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (el(e, t, n), e = e.sibling; e !== null;) el(e, t, n), e = e.sibling;
	}
	function tl(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (tl(e, t, n), e = e.sibling; e !== null;) tl(e, t, n), e = e.sibling;
	}
	function nl(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Fd(t, r, n), t[mt] = e, t[ht] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var rl = !1, U = !1, il = !1, al = typeof WeakSet == "function" ? WeakSet : Set, ol = null;
	function sl(e, t) {
		if (e = e.containerInfo, zd = cp, e = Fr(e), Ir(e)) {
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
							var h = Xs(n.type, i);
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
				Sl(e, n), r & 4 && Wc(5, n);
				break;
			case 1:
				if (Sl(e, n), r & 4) {
					if (e = n.stateNode, t === null) try {
						e.componentDidMount();
					} catch (e) {
						Z(n, n.return, e);
					}
					else {
						var i = Xs(n.type, t.memoizedProps);
						t = t.memoizedState;
						try {
							e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
						} catch (e) {
							Z(n, n.return, e);
						}
					}
				}
				r & 64 && Kc(n), r & 512 && Jc(n, n.return);
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
						ro(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && nl(n);
			case 26:
			case 5:
				Sl(e, n), t === null && r & 4 && Xc(n), r & 512 && Jc(n, n.return);
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
				if (r = n.memoizedState !== null || rl, !r) {
					t = t !== null && t.memoizedState !== null || U, i = rl;
					var a = U;
					rl = r, (U = t) && !a ? wl(e, n, !!(n.subtreeFlags & 8772)) : Sl(e, n), rl = i, U = a;
				}
				break;
			case 30: break;
			default: Sl(e, n);
		}
	}
	function ll(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, ll(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && St(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var W = null, ul = !1;
	function dl(e, t, n) {
		for (n = n.child; n !== null;) fl(e, t, n), n = n.sibling;
	}
	function fl(e, t, n) {
		if (Ue && typeof Ue.onCommitFiberUnmount == "function") try {
			Ue.onCommitFiberUnmount(He, n);
		} catch {}
		switch (n.tag) {
			case 26:
				U || Yc(n, t), dl(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				U || Yc(n, t);
				var r = W, i = ul;
				Qd(n.type) && (W = n.stateNode, ul = !1), dl(e, t, n), mf(n.stateNode), W = r, ul = i;
				break;
			case 5: U || Yc(n, t);
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
				Gc(2, n, t), U || Gc(4, n, t), dl(e, t, n);
				break;
			case 1:
				U || (Yc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && qc(n, t, r)), dl(e, t, n);
				break;
			case 21:
				dl(e, t, n);
				break;
			case 22:
				U = (r = U) || n.memoizedState !== null, dl(e, t, n), U = r;
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
				_l(t, e), bl(e), r & 4 && (Gc(3, e, e.return), Wc(3, e), Gc(5, e, e.return));
				break;
			case 1:
				_l(t, e), bl(e), r & 512 && (U || n === null || Yc(n, n.return)), r & 64 && rl && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = vl;
				if (_l(t, e), bl(e), r & 512 && (U || n === null || Yc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) {
						if (r === null) {
							if (e.stateNode === null) {
								a: {
									r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
									b: switch (r) {
										case "title":
											a = i.getElementsByTagName("title")[0], (!a || a[xt] || a[mt] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Fd(a, r, n), a[mt] = e, Dt(a), r = a;
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
									a[mt] = e, Dt(a), r = a;
								}
								e.stateNode = r;
							} else Uf(i, e.type, e.stateNode);
						} else e.stateNode = Lf(i, r, e.memoizedProps);
					} else a === r ? r === null && e.stateNode !== null && Zc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Uf(i, e.type, e.stateNode) : Lf(i, r, e.memoizedProps));
				}
				break;
			case 27:
				_l(t, e), bl(e), r & 512 && (U || n === null || Yc(n, n.return)), n !== null && r & 4 && Zc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (_l(t, e), bl(e), r & 512 && (U || n === null || Yc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						$t(i, "");
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Zc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (il = !0);
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
				_l(t, e), bl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (eu = Ne()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, gl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = rl, d = U;
				if (rl = u || i, U = d || l, _l(t, e), U = d, rl = u, bl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || rl || U || Cl(e)), n = null, t = e;;) {
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
					if (Qc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(c(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						tl(e, $c(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && ($t(a, ""), n.flags &= -33), tl(e, $c(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						el(e, $c(e), o);
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
					Gc(4, t, t.return), Cl(t);
					break;
				case 1:
					Yc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && qc(t, t.return, n), Cl(t);
					break;
				case 27: mf(t.stateNode);
				case 26:
				case 5:
					Yc(t, t.return), Cl(t);
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
					wl(i, a, n), Wc(4, a);
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
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) no(c[i], s);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					n && o & 64 && Kc(a), Jc(a, a.return);
					break;
				case 27: nl(a);
				case 26:
				case 5:
					wl(i, a, n), n && r === null && o & 4 && Xc(a), Jc(a, a.return);
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
					a.memoizedState === null && wl(i, a, n), Jc(a, a.return);
					break;
				case 30: break;
				default: wl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Tl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ha(n));
	}
	function El(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ha(e));
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
				Dl(e, t, n, r), i & 2048 && Wc(9, t);
				break;
			case 1:
				Dl(e, t, n, r);
				break;
			case 3:
				Dl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ha(e)));
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
					kl(a, o, s, c, i), Wc(8, o);
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
				Fl(e), e.flags & 2048 && Gc(9, e, e.return);
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
					Gc(8, t, t.return), Ll(t);
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
					Gc(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: ha(n.memoizedState.cache);
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
			var t = ca(P), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ca(P).controller.signal;
		}
	}, Bl = typeof WeakMap == "function" ? WeakMap : Map, G = 0, K = null, q = null, J = 0, Y = 0, Vl = null, Hl = !1, Ul = !1, Wl = !1, Gl = 0, X = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = 0, Zl = null, Ql = null, $l = !1, eu = 0, tu = 0, nu = Infinity, ru = null, iu = null, au = 0, ou = null, su = null, cu = 0, lu = 0, uu = null, du = null, fu = 0, pu = null;
	function mu() {
		return G & 2 && J !== 0 ? J & -J : O.T === null ? dt() : fd();
	}
	function hu() {
		if (Yl === 0) {
			if (!(J & 536870912) || N) {
				var e = Xe;
				Xe <<= 1, !(Xe & 3932160) && (Xe = 262144), Yl = e;
			} else Yl = 536870912;
		}
		return e = lo.current, e !== null && (e.flags |= 32), Yl;
	}
	function gu(e, t, n) {
		(e === K && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) && (Cu(e, 0), bu(e, J, Yl, !1)), it(e, n), (!(G & 2) || e !== K) && (e === K && (!(G & 2) && (ql |= n), X === 4 && bu(e, J, Yl, !1)), id(e));
	}
	function _u(e, t, n) {
		if (G & 6) throw Error(c(327));
		var r = !n && !(t & 127) && (t & e.expiredLanes) === 0 || et(e, t), i = r ? ju(e, t) : ku(e, t, !0), a = r;
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
				if ((t & 62914560) === t && (i = eu + 300 - Ne(), 10 < i)) {
					if (bu(r, t, Yl, !Hl), $e(r, 0, !0) !== 0) break a;
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
				unsuspend: cn
			}, Nl(t, a, d);
			var m = (a & 62914560) === a ? eu - Ne() : (a & 4194048) === a ? tu - Ne() : 0;
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
					if (!Ar(a(), i)) return !1;
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
			var a = 31 - Ge(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && ot(e, n, t);
	}
	function xu() {
		return G & 6 ? !0 : (ad(0, !1), !1);
	}
	function Su() {
		if (q !== null) {
			if (Y === 0) var e = q.return;
			else e = q, ea = $i = null, No(e), Ra = null, za = 0, e = q;
			for (; e !== null;) Uc(e.alternate, e), e = e.return;
			q = null;
		}
	}
	function Cu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), cu = 0, Su(), K = e, q = n = vi(e.current, null), J = t, Y = 0, Vl = null, Hl = !1, Ul = et(e, t), Wl = !1, Xl = Yl = Jl = ql = Kl = X = 0, Ql = Zl = null, $l = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Ge(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Gl = t, ci(), n;
	}
	function wu(e, t) {
		I = null, O.H = Hs, t === Oa || t === Aa ? (t = Ia(), Y = 3) : t === ka ? (t = Ia(), Y = 4) : Y = t === oc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Vl = t, q === null && (X = 1, ec(e, Ei(t, e.current)));
	}
	function Tu() {
		var e = lo.current;
		return e === null ? !0 : (J & 4194048) === J ? uo === null : (J & 62914560) === J || J & 536870912 ? e === uo : !1;
	}
	function Eu() {
		var e = O.H;
		return O.H = Hs, e === null ? Hs : e;
	}
	function Du() {
		var e = O.A;
		return O.A = zl, e;
	}
	function Ou() {
		X = 4, Hl || (J & 4194048) !== J && lo.current !== null || (Ul = !0), !(Kl & 134217727) && !(ql & 134217727) || K === null || bu(K, J, Yl, !1);
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
							lo.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, ea = $i = null, G = r, O.H = i, O.A = a, q === null && (K = null, J = 0, ci()), o;
	}
	function Au() {
		for (; q !== null;) Nu(q);
	}
	function ju(e, t) {
		var n = G;
		G |= 2;
		var r = Eu(), i = Du();
		K !== e || J !== t ? (ru = null, nu = Ne() + 500, Cu(e, t)) : Ul = et(e, t);
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
							if (Ma(a)) {
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
							Ma(a) ? (Y = 0, Vl = null, Pu(t)) : (Y = 0, Vl = null, Fu(e, t, a, 7));
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
		return ea = $i = null, O.H = r, O.A = i, G = n, q === null ? (K = null, J = 0, ci(), X) : 0;
	}
	function Mu() {
		for (; q !== null && !je();) Nu(q);
	}
	function Nu(e) {
		var t = Fc(e.alternate, e, Gl);
		e.memoizedProps = e.pendingProps, t === null ? Iu(e) : q = t;
	}
	function Pu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = yc(n, t, t.pendingProps, t.type, void 0, J);
				break;
			case 11:
				t = yc(n, t, t.pendingProps, t.type.render, t.ref, J);
				break;
			case 5: No(t);
			default: Uc(n, t), t = q = yi(t, Gl), t = Fc(n, t, Gl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Iu(e) : q = t;
	}
	function Fu(e, t, n, r) {
		ea = $i = null, No(t), Ra = null, za = 0;
		var i = t.return;
		try {
			if (ac(e, i, t, n, J)) {
				X = 1, ec(e, Ei(n, e.current)), q = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw q = i, t;
			X = 1, ec(e, Ei(n, e.current)), q = null;
			return;
		}
		t.flags & 32768 ? (N || r === 1 ? e = !0 : Ul || J & 536870912 ? e = !1 : (Hl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = lo.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Lu(t, e)) : Iu(t);
	}
	function Iu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Lu(t, Hl);
				return;
			}
			e = t.return;
			var n = Vc(t.alternate, t, Gl);
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
			var n = Hc(e.alternate, e);
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
			if (a = t.lanes | t.childLanes, a |= si, at(e, n, a, o, s, l), e === K && (q = K = null, J = 0), su = t, ou = e, cu = n, lu = a, uu = i, du = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Zu(Le, function() {
				return Wu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = !!(t.flags & 13878), t.subtreeFlags & 13878 || r) {
				r = O.T, O.T = null, i = k.p, k.p = 2, o = G, G |= 4;
				try {
					sl(e, t, n);
				} finally {
					G = o, k.p = i, O.T = r;
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
				n = O.T, O.T = null;
				var r = k.p;
				k.p = 2;
				var i = G;
				G |= 4;
				try {
					yl(t, e);
					var a = Bd, o = Fr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && Pr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Ir(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Nr(s, h), v = Nr(s, g);
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
					G = i, k.p = r, O.T = n;
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
				n = O.T, O.T = null;
				var r = k.p;
				k.p = 2;
				var i = G;
				G |= 4;
				try {
					cl(e, t.alternate, t);
				} finally {
					G = i, k.p = r, O.T = n;
				}
			}
			au = 3;
		}
	}
	function Vu() {
		if (au === 4 || au === 3) {
			au = 0, Me();
			var e = ou, t = su, n = cu, r = du;
			t.subtreeFlags & 10256 || t.flags & 10256 ? au = 5 : (au = 0, su = ou = null, Hu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (iu = null), ut(n), t = t.stateNode, Ue && typeof Ue.onCommitFiberRoot == "function") try {
				Ue.onCommitFiberRoot(He, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = O.T, i = k.p, k.p = 2, O.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					O.T = t, k.p = i;
				}
			}
			cu & 3 && Uu(), id(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === pu ? fu++ : (fu = 0, pu = e) : fu = 0, ad(0, !1);
		}
	}
	function Hu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ha(t)));
	}
	function Uu() {
		return zu(), Bu(), Vu(), Wu();
	}
	function Wu() {
		if (au !== 5) return !1;
		var e = ou, t = lu;
		lu = 0;
		var n = ut(cu), r = O.T, i = k.p;
		try {
			k.p = 32 > n ? 32 : n, O.T = null, n = uu, uu = null;
			var a = ou, o = cu;
			if (au = 0, su = ou = null, cu = 0, G & 6) throw Error(c(331));
			var s = G;
			if (G |= 4, Il(a.current), Ol(a, a.current, o, n), G = s, ad(0, !1), Ue && typeof Ue.onPostCommitFiberRoot == "function") try {
				Ue.onPostCommitFiberRoot(He, a);
			} catch {}
			return !0;
		} finally {
			k.p = i, O.T = r, Hu(e, t);
		}
	}
	function Gu(e, t, n) {
		t = Ei(n, t), t = nc(e.stateNode, t, 2), e = Xa(e, t, 2), e !== null && (it(e, 2), id(e));
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
					e = Ei(n, e), n = rc(2), r = Xa(t, n, 2), r !== null && (ic(n, r, t, e), it(r, 2), id(r));
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
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, K === e && (J & n) === n && (X === 4 || X === 3 && (J & 62914560) === J && 300 > Ne() - eu ? !(G & 2) && Cu(e, 0) : Jl |= n, Xl === J && (Xl = 0)), id(e);
	}
	function Ju(e, t) {
		t === 0 && (t = nt()), e = di(e, t), e !== null && (it(e, t), id(e));
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
		return ke(e, t);
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
								a = (1 << 31 - Ge(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
							}
							a !== 0 && (n = !0, ud(r, a));
						} else a = J, a = $e(r, r === K ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || et(r, a) || (n = !0, ud(r, a));
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
		for (var t = Ne(), n = null, r = Qu; r !== null;) {
			var i = r.next, a = cd(r, t);
			a === 0 ? (r.next = null, n === null ? Qu = i : n.next = i, i === null && ($u = n)) : (n = r, (e !== 0 || a & 3) && (td = !0)), r = i;
		}
		au !== 0 && au !== 5 || ad(e, !1), rd !== 0 && (rd = 0);
	}
	function cd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ge(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = tt(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = K, n = J, n = $e(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ae(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || et(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Ae(r), ut(n)) {
				case 2:
				case 8:
					n = Ie;
					break;
				case 32:
					n = Le;
					break;
				case 268435456:
					n = ze;
					break;
				default: n = Le;
			}
			return r = ld.bind(null, e), n = ke(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ae(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function ld(e, t) {
		if (au !== 0 && au !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Uu() && e.callbackNode !== n) return null;
		var r = J;
		return r = $e(e, e === K ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (_u(e, r, t), cd(e, Ne()), e.callbackNode != null && e.callbackNode === n ? ld.bind(null, e) : null);
	}
	function ud(e, t) {
		if (Uu()) return null;
		_u(e, t, !0);
	}
	function dd() {
		Xd(function() {
			G & 6 ? ke(Fe, od) : sd();
		});
	}
	function fd() {
		if (rd === 0) {
			var e = va;
			e === 0 && (e = Ye, Ye <<= 1, !(Ye & 261888) && (Ye = 256)), rd = e;
		}
		return rd;
	}
	function pd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : sn("" + e);
	}
	function md(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function hd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = pd((i[ht] || null).action), o = r.submitter;
			o && (t = (t = o[ht] || null) ? pd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new kn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (rd !== 0) {
								var e = o ? md(i, o) : new FormData(i);
								Os(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? md(i, o) : new FormData(i), Os(n, {
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
	for (var gd = 0; gd < ni.length; gd++) {
		var _d = ni[gd];
		ri(_d.toLowerCase(), "on" + (_d[0].toUpperCase() + _d.slice(1)));
	}
	ri(Jr, "onAnimationEnd"), ri(Yr, "onAnimationIteration"), ri(Xr, "onAnimationStart"), ri("dblclick", "onDoubleClick"), ri("focusin", "onFocus"), ri("focusout", "onBlur"), ri(Zr, "onTransitionRun"), ri(Qr, "onTransitionStart"), ri($r, "onTransitionCancel"), ri(ei, "onTransitionEnd"), jt("onMouseEnter", ["mouseout", "mouseover"]), jt("onMouseLeave", ["mouseout", "mouseover"]), jt("onPointerEnter", ["pointerout", "pointerover"]), jt("onPointerLeave", ["pointerout", "pointerover"]), At("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), At("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), At("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), At("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), At("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), At("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						ii(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						ii(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[_t];
		n === void 0 && (n = t[_t] = /* @__PURE__ */ new Set());
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
			e[Sd] = !0, Ot.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !vn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = Ct(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		hn(function() {
			var r = a, i = un(n), o = [];
			a: {
				var s = ti.get(e);
				if (s !== void 0) {
					var c = kn, l = e;
					switch (e) {
						case "keypress": if (wn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = qn;
							break;
						case "focusin":
							l = "focus", c = Rn;
							break;
						case "focusout":
							l = "blur", c = Rn;
							break;
						case "beforeblur":
						case "afterblur":
							c = Rn;
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
							c = In;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Ln;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Yn;
							break;
						case Jr:
						case Yr:
						case Xr:
							c = zn;
							break;
						case ei:
							c = Xn;
							break;
						case "scroll":
						case "scrollend":
							c = jn;
							break;
						case "wheel":
							c = Zn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Bn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Jn;
							break;
						case "toggle":
						case "beforetoggle": c = Qn;
					}
					var d = !!(t & 4), f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = gn(m, p), g != null && d.push(Ed(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== ln && (l = n.relatedTarget || n.fromElement) && (Ct(l) || l[gt])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (l = n.relatedTarget || n.toElement, c = r, l = l ? Ct(l) : null, l !== null && (f = u(l), d = l.tag, l !== f || d !== 5 && d !== 27 && d !== 6) && (l = null)) : (c = null, l = r), c !== l)) {
						if (d = In, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Jn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : Tt(c), h = l == null ? s : Tt(l), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, Ct(i) === r && (d = new d(p, m + "enter", l, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && l) b: {
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
					if (s = r ? Tt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = vr;
					else if (fr(s)) {
						if (yr) v = Or;
						else {
							v = Er;
							var y = Tr;
						}
					} else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && rn(r.elementType) && (v = vr) : v = Dr;
					if (v &&= v(e, r)) {
						pr(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Yt(s, "number", s.value);
				}
				switch (y = r ? Tt(r) : window, e) {
					case "focusin":
						(fr(y) || y.contentEditable === "true") && (Rr = y, zr = r, Br = null);
						break;
					case "focusout":
						Br = zr = Rr = null;
						break;
					case "mousedown":
						Vr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Vr = !1, Hr(o, n, i);
						break;
					case "selectionchange": if (Lr) break;
					case "keydown":
					case "keyup": Hr(o, n, i);
				}
				var b;
				if (er) b: {
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
				else cr ? or(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (rr && n.locale !== "ko" && (cr || x !== "onCompositionStart" ? x === "onCompositionEnd" && cr && (b = Cn()) : (bn = i, xn = "value" in bn ? bn.value : bn.textContent, cr = !0)), y = Dd(r, x), 0 < y.length && (x = new Vn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = sr(n), b !== null && (x.data = b)))), (b = nr ? lr(e, n) : ur(e, n)) && (x = Dd(r, "onBeforeInput"), 0 < x.length && (y = new Vn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = gn(e, n), i != null && r.unshift(Ed(e, i, a)), i = gn(e, t), i != null && r.push(Ed(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = gn(n, a), l != null && o.unshift(Ed(n, l, c))) : i || (l = gn(n, a), l != null && o.push(Ed(n, l, c)))), n = n.return;
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
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || $t(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && $t(e, "" + r);
				break;
			case "className":
				Lt(e, "class", r);
				break;
			case "tabIndex":
				Lt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Lt(e, n, r);
				break;
			case "style":
				nn(e, r, a);
				break;
			case "data": if (t !== "object") {
				Lt(e, "data", r);
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
				r = sn("" + r), e.setAttribute(n, r);
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
				r = sn("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = cn);
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
				n = sn("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Q("beforetoggle", e), Q("toggle", e), It(e, "popover", r);
				break;
			case "xlinkActuate":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Rt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Rt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Rt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Rt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				It(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = an.get(n) || n, It(e, n, r));
		}
	}
	function Pd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				nn(e, r, a);
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
				typeof r == "string" ? $t(e, r) : (typeof r == "number" || typeof r == "bigint") && $t(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = cn);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!kt.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[ht] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : It(e, n, r);
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
				Jt(e, a, s, l, u, o, i, !1);
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
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Xt(e, !!r, n, !0) : Xt(e, !!r, t, !1);
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
				Qt(e, r, i, a);
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
			default: if (rn(t)) {
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
				qt(e, o, s, l, u, d, a, i);
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
				t = s, n = o, r = m, p == null ? !!r != !!n && (t == null ? Xt(e, !!n, n ? [] : "", !1) : Xt(e, !!n, t, !0)) : Xt(e, !!n, p, !1);
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
				Zt(e, p, m);
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
			default: if (rn(t)) {
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
						a[xt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					tf(n), St(n);
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
			} else if (!e[xt]) switch (t) {
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
		St(e);
	}
	var hf = /* @__PURE__ */ new Map(), gf = /* @__PURE__ */ new Set();
	function _f(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var vf = k.d;
	k.d = {
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
		var t = wt(e);
		t !== null && t.tag === 5 && t.type === "form" ? As(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = Kt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), Dt(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Kt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Kt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Kt(n.imageSizes) + "\"]")) : i += "[href=\"" + Kt(e) + "\"]";
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
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), Dt(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Kt(r) + "\"][href=\"" + Kt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Fd(r, "link", e), Dt(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = Et(r).hoistableStyles, a = jf(e);
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
					Dt(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = Et(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = g({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), Dt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = Et(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = g({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), Dt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var i = (i = he.current) ? _f(i) : null;
		if (!i) throw Error(c(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = Et(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = Et(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = Et(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + Kt(e) + "\"";
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
		}), Fd(t, "link", n), Dt(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + Kt(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Kt(n.href) + "\"]");
				if (r) return t.instance = r, Dt(r), r;
				var i = g({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), Dt(r), Fd(r, "style", i), Rf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = jf(n.href);
				var a = e.querySelector(Mf(i));
				if (a) return t.state.loading |= 4, t.instance = a, Dt(a), a;
				r = Nf(n), (i = hf.get(i)) && zf(r, i), a = (e.ownerDocument || e).createElement("link"), Dt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, Rf(a, n.precedence, e), t.instance = a;
			case "script": return a = Ff(n.src), (i = e.querySelector(If(a))) ? (t.instance = i, Dt(i), i) : (r = n, (i = hf.get(a)) && (r = g({}, n), Bf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), Dt(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[xt] || a[mt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Yf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, Dt(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && zf(r, i), a = a.createElement("link"), Dt(a);
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
		_currentValue: le,
		_currentValue2: le,
		_threadCount: 0
	};
	function ep(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = rt(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = rt(0), this.hiddenUpdates = rt(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function tp(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ep(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = gi(3, null, null, t), e.current = a, a.stateNode = e, t = ma(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, qa(a), e;
	}
	function np(e) {
		return e ? (e = mi, e) : mi;
	}
	function rp(e, t, n, r, i, a) {
		i = np(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ya(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Xa(e, r, t), n !== null && (gu(n, e, t), Za(n, e, t));
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
			var t = di(e, 67108864);
			t !== null && gu(t, e, 67108864), ap(e, 67108864);
		}
	}
	function sp(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = mu();
			t = lt(t);
			var n = di(e, t);
			n !== null && gu(n, e, t), ap(e, t);
		}
	}
	var cp = !0;
	function lp(e, t, n, r) {
		var i = O.T;
		O.T = null;
		var a = k.p;
		try {
			k.p = 2, dp(e, t, n, r);
		} finally {
			k.p = a, O.T = i;
		}
	}
	function up(e, t, n, r) {
		var i = O.T;
		O.T = null;
		var a = k.p;
		try {
			k.p = 8, dp(e, t, n, r);
		} finally {
			k.p = a, O.T = i;
		}
	}
	function dp(e, t, n, r) {
		if (cp) {
			var i = fp(r);
			if (i === null) Td(e, t, r, pp, n), wp(e, r);
			else if (Ep(i, e, t, n, r)) r.stopPropagation();
			else if (wp(e, r), t & 4 && -1 < Cp.indexOf(e)) {
				for (; i !== null;) {
					var a = wt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Qe(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ge(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									id(a), !(G & 6) && (nu = Ne() + 500, ad(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = di(a, 2), s !== null && gu(s, a, 2), xu(), ap(a, 2);
					}
					if (a = fp(r), a === null && Td(e, t, r, pp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Td(e, t, r, null, n);
		}
	}
	function fp(e) {
		return e = un(e), mp(e);
	}
	var pp = null;
	function mp(e) {
		if (pp = null, e = Ct(e), e !== null) {
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
			case "message": switch (Pe()) {
				case Fe: return 2;
				case Ie: return 8;
				case Le:
				case Re: return 32;
				case ze: return 268435456;
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
		}, t !== null && (t = wt(t), t !== null && op(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = Ct(e.target);
		if (t !== null) {
			var n = u(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, ft(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = f(n), t !== null) {
						e.blockedOn = t, ft(e.priority, function() {
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
				ln = r, n.target.dispatchEvent(r), ln = null;
			} else return t = wt(n), t !== null && op(t), e.blockedOn = n, !1;
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
				var a = wt(n);
				a !== null && (e.splice(t, 3), t -= 3, Os(a, {
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
			var i = n[r], a = n[r + 1], o = i[ht] || null;
			if (typeof a == "function") o || Np(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[ht] || null) s = o.formAction;
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
			rp(e.current, 2, null, e, null, null), xu(), t[gt] = null;
		}
	};
	function Lp(e) {
		this._internalRoot = e;
	}
	Lp.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = dt();
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
	k.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(c(188)) : (e = Object.keys(e).join(","), Error(c(268, e)));
		return e = m(t), e = e === null ? null : h(e), e = e === null ? null : e.stateNode, e;
	};
	var zp = {
		bundleType: 0,
		version: "19.2.8",
		rendererPackageName: "react-dom",
		currentDispatcherRef: O,
		reconcilerVersion: "19.2.8"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Bp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Bp.isDisabled && Bp.supportsFiber) try {
			He = Bp.inject(zp), Ue = Bp;
		} catch {}
	}
	t.createRoot = function(e, t) {
		if (!l(e)) throw Error(c(299));
		var n = !1, r = "", i = Zs, a = Qs, o = $s;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = tp(e, 1, !1, null, null, n, r, null, i, a, o, Fp), e[gt] = t.current, Cd(e), new Ip(t);
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
	"zh-Hant": {
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
	en: {
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
}, p = /* @__PURE__ */ t(((e) => {
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
})), m = (/* @__PURE__ */ t(((e, t) => {
	t.exports = p();
})))();
function h({ hass: e }) {
	let t = f[he(e)], n = (0, u.useRef)(e), r = (0, u.useRef)(!1), [i, a] = (0, u.useState)(null), [o, s] = (0, u.useState)(!1), [c, l] = (0, u.useState)(!1);
	n.current = e;
	let d = (0, u.useCallback)(async () => {
		let e = n.current;
		if (e) {
			s(!0), l(!1);
			try {
				a(await e.callWS({ type: "matter_binding_studio/get_snapshot" }));
			} catch {
				l(!0);
			} finally {
				s(!1);
			}
		}
	}, []);
	(0, u.useEffect)(() => {
		!e || r.current || (r.current = !0, d());
	}, [e]);
	let p = !!e && i === null && o;
	return /* @__PURE__ */ (0, m.jsx)("div", {
		className: "mbs-root",
		children: /* @__PURE__ */ (0, m.jsxs)("main", {
			className: "mbs-panel",
			children: [
				/* @__PURE__ */ (0, m.jsxs)("header", {
					className: "mbs-header",
					children: [/* @__PURE__ */ (0, m.jsxs)("div", { children: [
						/* @__PURE__ */ (0, m.jsx)("span", {
							className: "mbs-eyebrow",
							children: t.directBinding
						}),
						/* @__PURE__ */ (0, m.jsx)("h1", { children: t.appName }),
						/* @__PURE__ */ (0, m.jsx)("p", { children: t.subtitle })
					] }), /* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						onClick: () => void d(),
						disabled: !e || o,
						"aria-busy": o,
						children: o && i ? t.refreshing : t.refresh
					})]
				}),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-scope",
					children: t.scope
				}),
				e ? null : /* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-notice",
					children: t.notConnected
				}),
				c ? /* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-warning",
					children: t.readFailed
				}) : null,
				i?.warnings.map((e) => /* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-warning",
					children: e
				}, e)),
				p ? /* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-loading",
					children: t.loading
				}) : null,
				i ? /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [/* @__PURE__ */ (0, m.jsx)(g, {
					hass: e,
					snapshot: i,
					refresh: d,
					t
				}), /* @__PURE__ */ (0, m.jsx)(oe, {
					hass: e,
					snapshot: i,
					refresh: d,
					t
				})] }) : null
			]
		})
	});
}
function g({ hass: e, snapshot: t, refresh: n, t: r }) {
	let [i, a] = (0, u.useState)(""), [o, s] = (0, u.useState)([]), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)([]), [p, h] = (0, u.useState)(null), [g, v] = (0, u.useState)(!1), [x, S] = (0, u.useState)(!1), [ne, E] = (0, u.useState)(null), [re, ie] = (0, u.useState)(!1), oe = t.devices.filter((e) => e.can_bind), D = oe.find((e) => _(e) === i), se = t.devices.filter((e) => e.can_be_target && _(e) !== i).sort(y), O = c && D?.area_name ? se.filter((e) => e.area_name === D.area_name) : se, k = O.filter((e) => o.includes(_(e))), le = C(D, k), ue = w(D, k, le), j = k.length > 1 ? "native_group" : "direct", pe = (e) => {
		let t = oe.find((t) => _(t) === e), n = se.filter((e) => o.includes(_(e))), r = !!t?.area_name;
		a(e), l(r);
		let i = n.filter((n) => _(n) !== e && (!r || ee(t, n)));
		s(i.map(_)), f(C(t, i)), h(null), E(null);
	}, me = (e) => {
		let t = O.filter((t) => e.includes(_(t)));
		s(t.map(_)), f(C(D, t)), h(null), E(null);
	}, he = (e) => {
		l(e);
		let t = e ? k.filter((e) => ee(D, e)) : k;
		s(t.map(_)), f(C(D, t)), h(null);
	}, _e = (e) => {
		h(null), f((t) => t.includes(e) ? t.filter((t) => t !== e) : [...t, e]);
	}, ve = async () => {
		if (!(!e || !D || !k.length || !d.length)) {
			v(!0), E(null);
			try {
				let t = k.length === 1 ? await e.callWS({
					type: "matter_binding_studio/prepare_unicast",
					source_node_id: D.node_id,
					source_endpoint_id: D.endpoint_id,
					target_node_id: k[0].node_id,
					target_endpoint_id: k[0].endpoint_id,
					clusters: d
				}) : await e.callWS({
					type: "matter_binding_studio/prepare_groupcast",
					source_node_id: D.node_id,
					source_endpoint_id: D.endpoint_id,
					targets: k.map((e) => ({
						node_id: e.node_id,
						endpoint_id: e.endpoint_id
					})),
					clusters: d
				});
				S(!1), h(t);
			} catch (e) {
				E(ae(e)), ie(!0);
			} finally {
				v(!1);
			}
		}
	}, ye = async () => {
		if (!(!e || !p || !x)) {
			v(!0), E(null);
			try {
				let t = await e.callWS({
					type: p.route === "direct" ? "matter_binding_studio/apply_unicast" : "matter_binding_studio/apply_groupcast",
					plan_id: p.plan_id,
					confirm: !0
				});
				E(t.message), ie(!t.success || !t.verified), t.success && t.verified && await n();
			} catch (e) {
				E(ae(e)), ie(!0);
			} finally {
				h(null), S(!1), v(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, m.jsxs)("section", {
		className: "mbs-composer",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-section-title",
				children: [/* @__PURE__ */ (0, m.jsx)("h2", { children: r.addRelationship }), /* @__PURE__ */ (0, m.jsx)("span", { children: j === "native_group" ? r.nativeGroup : r.direct })]
			}),
			/* @__PURE__ */ (0, m.jsx)("p", {
				className: "mbs-description",
				children: r.addRelationshipDescription
			}),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-form-grid",
				children: [
					/* @__PURE__ */ (0, m.jsxs)("label", { children: [/* @__PURE__ */ (0, m.jsx)("span", { children: r.source }), /* @__PURE__ */ (0, m.jsxs)("select", {
						value: i,
						onChange: (e) => pe(e.target.value),
						children: [/* @__PURE__ */ (0, m.jsx)("option", {
							value: "",
							disabled: !0,
							children: r.chooseSource
						}), oe.map((e) => /* @__PURE__ */ (0, m.jsx)("option", {
							value: _(e),
							children: b(e)
						}, _(e)))]
					})] }),
					/* @__PURE__ */ (0, m.jsxs)("fieldset", {
						className: "mbs-target-picker",
						children: [/* @__PURE__ */ (0, m.jsx)("legend", { children: r.targets }), O.length ? O.map((e) => {
							let t = _(e);
							return /* @__PURE__ */ (0, m.jsxs)("label", { children: [/* @__PURE__ */ (0, m.jsx)("input", {
								type: "checkbox",
								checked: o.includes(t),
								onChange: (e) => me(e.target.checked ? [...o, t] : o.filter((e) => e !== t))
							}), /* @__PURE__ */ (0, m.jsx)("span", { children: b(e) })] }, t);
						}) : /* @__PURE__ */ (0, m.jsx)("p", {
							className: "mbs-meta",
							children: r.noTargets
						})]
					}),
					/* @__PURE__ */ (0, m.jsxs)("label", {
						className: "mbs-area-filter",
						children: [/* @__PURE__ */ (0, m.jsx)("input", {
							type: "checkbox",
							checked: c,
							onChange: (e) => he(e.target.checked)
						}), /* @__PURE__ */ (0, m.jsx)("span", { children: r.sameAreaOnly })]
					})
				]
			}),
			D && k.length ? /* @__PURE__ */ (0, m.jsxs)("fieldset", {
				className: "mbs-capability-picker",
				children: [/* @__PURE__ */ (0, m.jsx)("legend", { children: r.capabilities }), le.length ? le.map((e) => /* @__PURE__ */ (0, m.jsxs)("label", { children: [
					/* @__PURE__ */ (0, m.jsx)("input", {
						type: "checkbox",
						checked: d.includes(e),
						onChange: () => _e(e)
					}),
					/* @__PURE__ */ (0, m.jsx)("span", { children: ge(e, r) }),
					/* @__PURE__ */ (0, m.jsx)("small", {
						className: te(ue, e)?.supported_members === k.length ? "" : "mbs-partial",
						children: T(te(ue, e), r)
					})
				] }, e)) : /* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-warning",
					children: r.noSharedCapabilities
				})]
			}) : null,
			/* @__PURE__ */ (0, m.jsx)("div", {
				className: "mbs-actions",
				children: /* @__PURE__ */ (0, m.jsx)("button", {
					type: "button",
					onClick: () => void ve(),
					disabled: !D || !k.length || !d.length || g,
					children: g ? r.working : r.reviewPlan
				})
			}),
			p ? /* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-review",
				children: [
					/* @__PURE__ */ (0, m.jsx)("strong", { children: r.reviewTitle }),
					/* @__PURE__ */ (0, m.jsxs)("p", { children: [
						b(p.source),
						" → ",
						p.route === "direct" ? b(p.target) : `${p.targets.length} ${r.members}`
					] }),
					/* @__PURE__ */ (0, m.jsx)(de, {
						clusters: p.clusters,
						t: r
					}),
					p.route === "native_group" ? /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [
						/* @__PURE__ */ (0, m.jsx)(A, { members: p.targets }),
						/* @__PURE__ */ (0, m.jsx)(fe, {
							coverage: p.coverage,
							t: r
						}),
						p.replaces_direct_binding ? /* @__PURE__ */ (0, m.jsx)("p", {
							className: "mbs-meta",
							children: r.replacesDirect
						}) : null
					] }) : null,
					/* @__PURE__ */ (0, m.jsx)("ul", { children: p.steps.map((e) => /* @__PURE__ */ (0, m.jsx)("li", { children: e }, e)) }),
					/* @__PURE__ */ (0, m.jsx)("p", {
						className: "mbs-meta",
						children: p.route === "direct" ? p.acl === "will_add" ? r.aclWillAdd : r.aclAlreadyGranted : r.groupAclReview
					}),
					p.route === "direct" && p.acl_capacity ? /* @__PURE__ */ (0, m.jsx)(ce, {
						capacity: p.acl_capacity,
						t: r
					}) : null,
					/* @__PURE__ */ (0, m.jsxs)("label", {
						className: "mbs-confirm",
						children: [/* @__PURE__ */ (0, m.jsx)("input", {
							type: "checkbox",
							checked: x,
							onChange: (e) => S(e.target.checked)
						}), r.confirmWrite]
					}),
					/* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						onClick: () => void ye(),
						disabled: !x || g,
						children: g ? r.working : r.applyBinding
					})
				]
			}) : null,
			ne ? /* @__PURE__ */ (0, m.jsx)("p", {
				className: re ? "mbs-warning" : "mbs-success",
				children: ne
			}) : null
		]
	});
}
function _(e) {
	return `${e.node_id}:${e.endpoint_id}`;
}
var v = new Intl.Collator("zh-Hant", {
	numeric: !0,
	sensitivity: "base"
});
function y(e, t) {
	return v.compare(e.area_name ?? "", t.area_name ?? "") || v.compare(e.node_name ?? "", t.node_name ?? "") || v.compare(e.name, t.name) || (e.node_id ?? 2 ** 53 - 1) - (t.node_id ?? 2 ** 53 - 1) || (e.endpoint_id ?? 2 ** 53 - 1) - (t.endpoint_id ?? 2 ** 53 - 1);
}
function b(e) {
	let t = e.area_name?.trim() || "", n = e.name.trim(), r = x(e, n), i = t ? `${t} - ` : "";
	return r ? `${i}${r} · ${n}` : `${i}${n}`;
}
function x(e, t) {
	let n = S(e.node_name?.trim() || "", e.area_name?.trim() || "");
	return !n || E(n, t) ? null : n;
}
function S(e, t) {
	let n = e;
	if (t) {
		let e = RegExp(`^${ie(t)}\\s*[-–—]\\s*`);
		n = n.replace(e, "").trim();
	}
	return n;
}
function ee(e, t) {
	return !!(e?.area_name && t?.area_name && e.area_name === t.area_name);
}
function C(e, t = []) {
	return !e || !t.length ? [] : e.client_capabilities.filter((e) => t.some((t) => t.server_capabilities.includes(e)));
}
function w(e, t, n) {
	return e ? n.map((e) => {
		let n = t.filter((t) => t.server_capabilities.includes(e));
		return {
			cluster_id: e,
			supported_members: n.length,
			total_members: t.length,
			unsupported_members: t.filter((e) => !n.includes(e)).map(b)
		};
	}) : [];
}
function te(e, t) {
	return e.find((e) => e.cluster_id === t);
}
function T(e, t) {
	if (!e) return "";
	let n = e.supported_members === e.total_members ? t.coverageReady : t.coveragePartial;
	return `${e.supported_members} / ${e.total_members} ${n}`;
}
function ne(e, t) {
	return e.replace("{count}", String(t));
}
function E(e, t) {
	return re(e) === re(t);
}
function re(e) {
	return e.toLocaleLowerCase().replace(/[\s\-–—]/g, "");
}
function ie(e) {
	return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function ae(e) {
	if (e instanceof Error && e.message) return e.message;
	if (typeof e == "object" && e) {
		let t = e;
		if (typeof t.message == "string" && t.message) return t.message;
		if (typeof t.error?.message == "string" && t.error.message) return t.error.message;
	}
	return "The requested Matter operation failed.";
}
function oe({ hass: e, snapshot: t, refresh: n, t: r }) {
	let [i, a] = (0, u.useState)(null), [o, s] = (0, u.useState)(null), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(!1), [p, h] = (0, u.useState)(null), [g, _] = (0, u.useState)(!1), [v, y] = (0, u.useState)(null), [x, S] = (0, u.useState)(!1), [ee, C] = (0, u.useState)(!1), [w, te] = (0, u.useState)(null), [T, ne] = (0, u.useState)(!1), E = async (t) => {
		if (!e || t.source.node_id === null || t.source.endpoint_id === null) {
			h(r.removalUnavailable), _(!0);
			return;
		}
		let n = {
			type: "matter_binding_studio/prepare_remove_binding",
			source_node_id: t.source.node_id,
			source_endpoint_id: t.source.endpoint_id,
			target_kind: t.targets.kind
		};
		if (t.targets.kind === "group") {
			if (t.targets.group_id === void 0) {
				h(r.removalUnavailable), _(!0);
				return;
			}
			n.target_group_id = t.targets.group_id;
		} else {
			let e = t.targets.members[0];
			if (!e || e.node_id === null || e.endpoint_id === null) {
				h(r.removalUnavailable), _(!0);
				return;
			}
			n.target_node_id = e.node_id, n.target_endpoint_id = e.endpoint_id;
		}
		f(!0), h(null);
		try {
			a(await e.callWS(n)), s(t), l(!1);
		} catch (e) {
			h(ae(e)), _(!0);
		} finally {
			f(!1);
		}
	}, re = async () => {
		if (!(!e || !i || !c)) {
			f(!0), h(null);
			try {
				let t = await e.callWS({
					type: "matter_binding_studio/apply_remove_binding",
					plan_id: i.plan_id,
					confirm: !0
				});
				h(t.message), _(!t.success || !t.verified), t.success && t.verified && await n();
			} catch (e) {
				h(ae(e)), _(!0);
			} finally {
				a(null), s(null), l(!1), f(!1);
			}
		}
	}, ie = async (t) => {
		if (!e || !t.managed_by_studio || t.active_relationships > 0) {
			te(t.active_relationships > 0 ? r.groupCleanupNeedsBindingRemoval : r.groupCleanupUnavailable), ne(!0);
			return;
		}
		C(!0), te(null);
		try {
			y(await e.callWS({
				type: "matter_binding_studio/prepare_cleanup_group",
				group_id: t.group_id
			})), S(!1);
		} catch (e) {
			te(ae(e)), ne(!0);
		} finally {
			C(!1);
		}
	}, oe = async () => {
		if (!(!e || !v || !x)) {
			C(!0), te(null);
			try {
				let t = await e.callWS({
					type: "matter_binding_studio/apply_cleanup_group",
					plan_id: v.plan_id,
					confirm: !0
				});
				te(t.message), ne(!t.success || !t.verified), t.success && t.verified && await n();
			} catch (e) {
				te(ae(e)), ne(!0);
			} finally {
				y(null), S(!1), C(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "mbs-content",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("section", { children: [
				/* @__PURE__ */ (0, m.jsx)(pe, {
					title: r.controlRelationships,
					count: t.relationships.length
				}),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-description",
					children: r.relationshipDescription
				}),
				t.relationships.length ? /* @__PURE__ */ (0, m.jsx)("div", {
					className: "mbs-list",
					children: t.relationships.map((e) => /* @__PURE__ */ (0, m.jsx)(O, {
						relationship: e,
						t: r,
						onReviewRemoval: E,
						removalWorking: d
					}, e.id))
				}) : /* @__PURE__ */ (0, m.jsx)(me, { text: r.noRelationships }),
				i && o ? /* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-review mbs-removal-review",
					children: [
						/* @__PURE__ */ (0, m.jsx)("strong", { children: r.removalReviewTitle }),
						/* @__PURE__ */ (0, m.jsxs)("p", { children: [
							b(o.source),
							" → ",
							le(o)
						] }),
						/* @__PURE__ */ (0, m.jsx)(de, {
							clusters: i.clusters,
							t: r
						}),
						/* @__PURE__ */ (0, m.jsxs)("p", {
							className: "mbs-meta",
							children: [
								i.removed_entry_count,
								" ",
								r.bindingEntries
							]
						}),
						i.keeps_native_group ? /* @__PURE__ */ (0, m.jsx)("p", {
							className: "mbs-warning",
							children: r.removalKeepsGroup
						}) : null,
						/* @__PURE__ */ (0, m.jsx)("ul", { children: i.steps.map((e) => /* @__PURE__ */ (0, m.jsx)("li", { children: e }, e)) }),
						/* @__PURE__ */ (0, m.jsxs)("label", {
							className: "mbs-confirm",
							children: [/* @__PURE__ */ (0, m.jsx)("input", {
								type: "checkbox",
								checked: c,
								onChange: (e) => l(e.target.checked)
							}), r.confirmRemoval]
						}),
						/* @__PURE__ */ (0, m.jsxs)("div", {
							className: "mbs-review-actions",
							children: [/* @__PURE__ */ (0, m.jsx)("button", {
								type: "button",
								onClick: () => {
									a(null), s(null), l(!1);
								},
								disabled: d,
								children: r.cancel
							}), /* @__PURE__ */ (0, m.jsx)("button", {
								type: "button",
								className: "mbs-danger-button",
								onClick: () => void re(),
								disabled: !c || d,
								children: d ? r.working : r.removeBinding
							})]
						})
					]
				}) : null,
				p ? /* @__PURE__ */ (0, m.jsx)("p", {
					className: g ? "mbs-warning" : "mbs-success",
					children: p
				}) : null
			] }),
			/* @__PURE__ */ (0, m.jsx)(D, {
				hass: e,
				snapshot: t,
				t: r
			}),
			/* @__PURE__ */ (0, m.jsxs)("section", { children: [
				/* @__PURE__ */ (0, m.jsx)(pe, {
					title: r.controlSets,
					count: t.native_control_sets.length
				}),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-description",
					children: r.controlSetsDescription
				}),
				t.native_control_sets.length ? /* @__PURE__ */ (0, m.jsx)("div", {
					className: "mbs-list",
					children: t.native_control_sets.map((e) => /* @__PURE__ */ (0, m.jsx)(k, {
						controlSet: e,
						t: r,
						onReviewCleanup: ie,
						cleanupWorking: ee
					}, e.group_id))
				}) : /* @__PURE__ */ (0, m.jsx)(me, { text: r.noControlSets }),
				v ? /* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-review mbs-removal-review",
					children: [
						/* @__PURE__ */ (0, m.jsx)("strong", { children: r.groupCleanupReviewTitle }),
						/* @__PURE__ */ (0, m.jsx)("p", { children: v.name }),
						/* @__PURE__ */ (0, m.jsx)(A, { members: v.members }),
						/* @__PURE__ */ (0, m.jsx)(de, {
							clusters: v.clusters,
							t: r
						}),
						/* @__PURE__ */ (0, m.jsx)("ul", { children: v.steps.map((e) => /* @__PURE__ */ (0, m.jsx)("li", { children: e }, e)) }),
						/* @__PURE__ */ (0, m.jsxs)("label", {
							className: "mbs-confirm",
							children: [/* @__PURE__ */ (0, m.jsx)("input", {
								type: "checkbox",
								checked: x,
								onChange: (e) => S(e.target.checked)
							}), r.confirmGroupCleanup]
						}),
						/* @__PURE__ */ (0, m.jsxs)("div", {
							className: "mbs-review-actions",
							children: [/* @__PURE__ */ (0, m.jsx)("button", {
								type: "button",
								onClick: () => {
									y(null), S(!1);
								},
								disabled: ee,
								children: r.cancel
							}), /* @__PURE__ */ (0, m.jsx)("button", {
								type: "button",
								className: "mbs-danger-button",
								onClick: () => void oe(),
								disabled: !x || ee,
								children: ee ? r.working : r.cleanupGroup
							})]
						})
					]
				}) : null,
				w ? /* @__PURE__ */ (0, m.jsx)("p", {
					className: T ? "mbs-warning" : "mbs-success",
					children: w
				}) : null
			] }),
			/* @__PURE__ */ (0, m.jsxs)("section", { children: [
				/* @__PURE__ */ (0, m.jsx)(pe, {
					title: r.capacity,
					count: t.capacities.length
				}),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-description",
					children: r.capacityDescription
				}),
				/* @__PURE__ */ (0, m.jsx)("div", {
					className: "mbs-capacity-grid",
					children: t.capacities.map((e) => /* @__PURE__ */ (0, m.jsxs)("article", {
						className: "mbs-capacity",
						children: [/* @__PURE__ */ (0, m.jsx)("strong", { children: e.name }), e.status === "available" ? /* @__PURE__ */ (0, m.jsxs)("div", {
							className: "mbs-capacity-values",
							children: [/* @__PURE__ */ (0, m.jsx)(j, {
								label: r.groups,
								used: e.group_table_entries,
								maximum: e.max_groups_per_fabric,
								unavailable: r.unavailable
							}), /* @__PURE__ */ (0, m.jsx)(j, {
								label: r.groupKeys,
								used: e.group_key_map_entries,
								maximum: e.max_group_keys_per_fabric,
								unavailable: r.unavailable
							})]
						}) : /* @__PURE__ */ (0, m.jsx)("p", {
							className: "mbs-meta",
							children: r.unavailable
						})]
					}, e.node_id))
				})
			] })
		]
	});
}
function D({ hass: e, snapshot: t, t: n }) {
	let r = t.devices.filter((e) => e.can_be_target && e.node_id !== null && e.endpoint_id !== null).sort(y), [i, a] = (0, u.useState)(""), [o, s] = (0, u.useState)(null), [c, l] = (0, u.useState)(!1), [d, f] = (0, u.useState)(!1), [p, h] = (0, u.useState)(null), [g, v] = (0, u.useState)(!1), [x, S] = (0, u.useState)(null), [ee, C] = (0, u.useState)(!1), [w, te] = (0, u.useState)([]), T = r.find((e) => _(e) === i), E = o?.entries.filter((e) => e.usage.safe_to_reclaim) ?? [], re = new Set(w), ie = E.length > 0 && E.every((e) => re.has(e.entry_index)), oe = async () => {
		if (!(!e || !T || T.node_id === null || T.endpoint_id === null)) {
			l(!0), f(!1);
			try {
				s(await e.callWS({
					type: "matter_binding_studio/get_acl_overview",
					target_node_id: T.node_id,
					target_endpoint_id: T.endpoint_id
				})), te([]);
			} catch {
				f(!0), s(null), te([]);
			} finally {
				l(!1);
			}
		}
	}, D = async (t) => {
		if (!e || !T || T.node_id === null || T.endpoint_id === null) return;
		let r = t.filter((e) => e.usage.safe_to_reclaim).map((e) => e.entry_index);
		if (!r.length) {
			S(n.noAclEntriesSelected), C(!0);
			return;
		}
		l(!0), S(null), C(!1);
		try {
			h(await e.callWS({
				type: "matter_binding_studio/prepare_remove_acl",
				target_node_id: T.node_id,
				target_endpoint_id: T.endpoint_id,
				entry_indexes: r
			})), v(!1);
		} catch (e) {
			S(ae(e)), C(!0);
		} finally {
			l(!1);
		}
	}, O = async () => {
		if (!(!e || !p || !g)) {
			l(!0), S(null);
			try {
				let t = await e.callWS({
					type: "matter_binding_studio/apply_remove_acl",
					plan_id: p.plan_id,
					confirm: !0
				});
				S(t.message), C(!t.success || !t.verified), t.success && t.verified && await oe();
			} catch (e) {
				S(ae(e)), C(!0);
			} finally {
				h(null), v(!1), l(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, m.jsxs)("section", { children: [
		/* @__PURE__ */ (0, m.jsx)(pe, {
			title: n.acl,
			count: o?.entries.length ?? 0
		}),
		/* @__PURE__ */ (0, m.jsx)("p", {
			className: "mbs-description",
			children: n.aclDescription
		}),
		/* @__PURE__ */ (0, m.jsxs)("div", {
			className: "mbs-acl-toolbar",
			children: [/* @__PURE__ */ (0, m.jsxs)("label", { children: [/* @__PURE__ */ (0, m.jsx)("span", { children: n.target }), /* @__PURE__ */ (0, m.jsxs)("select", {
				value: i,
				onChange: (e) => {
					a(e.target.value), s(null), f(!1), h(null), S(null), te([]);
				},
				children: [/* @__PURE__ */ (0, m.jsx)("option", {
					value: "",
					disabled: !0,
					children: n.chooseAclTarget
				}), r.map((e) => /* @__PURE__ */ (0, m.jsx)("option", {
					value: _(e),
					children: b(e)
				}, _(e)))]
			})] }), /* @__PURE__ */ (0, m.jsx)("button", {
				type: "button",
				onClick: () => void oe(),
				disabled: !e || !T || c,
				children: c ? n.readingAcl : n.readAcl
			})]
		}),
		d ? /* @__PURE__ */ (0, m.jsx)("p", {
			className: "mbs-warning",
			children: n.aclReadFailed
		}) : null,
		o ? /* @__PURE__ */ (0, m.jsxs)(m.Fragment, { children: [
			/* @__PURE__ */ (0, m.jsx)(ce, {
				capacity: o.capacity,
				t: n
			}),
			E.length ? /* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-acl-bulkbar",
				children: [
					/* @__PURE__ */ (0, m.jsxs)("label", { children: [/* @__PURE__ */ (0, m.jsx)("input", {
						type: "checkbox",
						checked: ie,
						onChange: (e) => {
							te(e.target.checked ? E.map((e) => e.entry_index) : []);
						}
					}), n.selectAllReclaimableAcl] }),
					/* @__PURE__ */ (0, m.jsx)("span", { children: ne(n.selectedAclEntries, w.length) }),
					/* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						className: "mbs-quiet-danger-button",
						onClick: () => void D(E.filter((e) => re.has(e.entry_index))),
						disabled: c || w.length === 0,
						children: n.reviewSelectedAclReclaim
					})
				]
			}) : null,
			/* @__PURE__ */ (0, m.jsx)("div", {
				className: "mbs-list",
				children: o.entries.map((e) => /* @__PURE__ */ (0, m.jsx)(se, {
					entry: e,
					t: n,
					selected: re.has(e.entry_index),
					onSelectionChange: (t) => {
						te((n) => t ? Array.from(/* @__PURE__ */ new Set([...n, e.entry_index])).sort((e, t) => e - t) : n.filter((t) => t !== e.entry_index));
					},
					onReviewRemoval: (e) => D([e]),
					working: c
				}, e.entry_index))
			})
		] }) : null,
		p ? /* @__PURE__ */ (0, m.jsxs)("div", {
			className: "mbs-review mbs-removal-review",
			children: [
				/* @__PURE__ */ (0, m.jsx)("strong", { children: n.aclRemovalReviewTitle }),
				(p.entries ?? [p.entry]).map((e) => /* @__PURE__ */ (0, m.jsx)(se, {
					entry: e,
					t: n
				}, e.entry_index)),
				/* @__PURE__ */ (0, m.jsx)("p", {
					className: "mbs-meta",
					children: n.aclRemovalKeepsInUse
				}),
				/* @__PURE__ */ (0, m.jsx)("ul", { children: p.steps.map((e) => /* @__PURE__ */ (0, m.jsx)("li", { children: e }, e)) }),
				/* @__PURE__ */ (0, m.jsxs)("label", {
					className: "mbs-confirm",
					children: [/* @__PURE__ */ (0, m.jsx)("input", {
						type: "checkbox",
						checked: g,
						onChange: (e) => v(e.target.checked)
					}), ne(n.confirmAclRemoval, (p.entries ?? [p.entry]).length)]
				}),
				/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-review-actions",
					children: [/* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						onClick: () => {
							h(null), v(!1);
						},
						disabled: c,
						children: n.cancel
					}), /* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						className: "mbs-danger-button",
						onClick: () => void O(),
						disabled: !g || c,
						children: c ? n.working : n.reclaimAcl
					})]
				})
			]
		}) : null,
		x ? /* @__PURE__ */ (0, m.jsx)("p", {
			className: ee ? "mbs-warning" : "mbs-success",
			children: x
		}) : null
	] });
}
function se({ entry: e, t, selected: n, onSelectionChange: r, onReviewRemoval: i, working: a = !1 }) {
	let o = e.kind === "administrator" ? t.aclAdministrator : t.aclOperate, s = e.auth_mode === "case" ? t.aclCase : e.auth_mode === "group" ? t.aclGroup : t.aclOther, c = e.usage.state === "protected" ? t.aclProtected : e.usage.state === "used" ? t.aclInUse : e.usage.state === "unused" ? t.aclUnused : t.aclUnknown;
	return /* @__PURE__ */ (0, m.jsxs)("article", {
		className: "mbs-card mbs-acl-entry",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-card-topline",
				children: [/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-acl-entry-title",
					children: [r && e.usage.safe_to_reclaim ? /* @__PURE__ */ (0, m.jsx)("input", {
						type: "checkbox",
						checked: n ?? !1,
						onChange: (e) => r(e.target.checked),
						disabled: a,
						"aria-label": `${t.selectAclEntry} ${e.entry_index}`
					}) : null, /* @__PURE__ */ (0, m.jsx)("strong", { children: o })]
				}), /* @__PURE__ */ (0, m.jsx)("span", {
					className: `mbs-acl-state mbs-acl-${e.usage.state}`,
					children: c
				})]
			}),
			/* @__PURE__ */ (0, m.jsx)("p", {
				className: "mbs-meta",
				children: s
			}),
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-acl-details",
				children: [/* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("small", { children: t.aclSubjects }), /* @__PURE__ */ (0, m.jsx)("p", { children: e.subjects.join(", ") })] }), /* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("small", { children: t.aclTargets }), /* @__PURE__ */ (0, m.jsx)("p", { children: e.targets.map((e) => `${e.endpoint} · ${e.capability}`).join("；") })] })]
			}),
			e.usage.relationship_names.length ? /* @__PURE__ */ (0, m.jsx)("p", {
				className: "mbs-meta",
				children: e.usage.relationship_names.join("；")
			}) : null,
			e.usage.safe_to_reclaim && i ? /* @__PURE__ */ (0, m.jsx)("div", {
				className: "mbs-card-actions",
				children: /* @__PURE__ */ (0, m.jsx)("button", {
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
function ce({ capacity: e, t }) {
	let n = e.used ?? "–", r = e.maximum ?? t.unavailable, i = e.available ?? "–";
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "mbs-acl-capacity",
		"aria-label": t.acl,
		children: [
			/* @__PURE__ */ (0, m.jsxs)("span", { children: [
				t.aclUsed,
				": ",
				/* @__PURE__ */ (0, m.jsxs)("strong", { children: [
					n,
					" / ",
					r
				] })
			] }),
			/* @__PURE__ */ (0, m.jsxs)("span", { children: [
				t.aclAvailable,
				": ",
				/* @__PURE__ */ (0, m.jsx)("strong", { children: i })
			] }),
			/* @__PURE__ */ (0, m.jsxs)("span", { children: [
				t.aclTargetsPerRule,
				": ",
				/* @__PURE__ */ (0, m.jsx)("strong", { children: e.targets_per_entry ?? t.unavailable })
			] }),
			e.entries_to_add ? /* @__PURE__ */ (0, m.jsx)("span", { children: ne(t.aclWillAddEntries, e.entries_to_add) }) : null
		]
	});
}
function O({ relationship: e, t, onReviewRemoval: n, removalWorking: r }) {
	let i = e.targets.members, a = le(e);
	return /* @__PURE__ */ (0, m.jsxs)("article", {
		className: "mbs-card",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-card-topline",
				children: [/* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-route",
					children: [
						/* @__PURE__ */ (0, m.jsx)(ue, { endpoint: e.source }),
						/* @__PURE__ */ (0, m.jsx)("span", {
							"aria-hidden": "true",
							children: "→"
						}),
						/* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("strong", { children: a }), e.route === "native_group" ? /* @__PURE__ */ (0, m.jsxs)("p", {
							className: "mbs-meta",
							children: [
								i.length,
								" ",
								t.members
							]
						}) : null] })
					]
				}), /* @__PURE__ */ (0, m.jsxs)("div", {
					className: "mbs-card-actions mbs-relationship-actions",
					children: [/* @__PURE__ */ (0, m.jsx)("span", {
						className: "mbs-route-label",
						children: e.route === "native_group" ? t.nativeGroup : t.direct
					}), /* @__PURE__ */ (0, m.jsx)("button", {
						type: "button",
						className: "mbs-quiet-danger-button",
						onClick: () => n(e),
						disabled: r,
						children: t.reviewRemoval
					})]
				})]
			}),
			/* @__PURE__ */ (0, m.jsx)(de, {
				clusters: e.clusters,
				t
			}),
			e.route === "native_group" ? /* @__PURE__ */ (0, m.jsx)(A, { members: i }) : null
		]
	});
}
function k({ controlSet: e, t, onReviewCleanup: n, cleanupWorking: r }) {
	let i = !!(e.managed_by_studio && e.active_relationships === 0);
	return /* @__PURE__ */ (0, m.jsxs)("article", {
		className: "mbs-card",
		children: [
			/* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-card-topline",
				children: [/* @__PURE__ */ (0, m.jsx)("strong", { children: e.name }), /* @__PURE__ */ (0, m.jsx)(de, {
					clusters: e.clusters,
					t
				})]
			}),
			/* @__PURE__ */ (0, m.jsxs)("p", {
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
			e.status === "pending" ? /* @__PURE__ */ (0, m.jsx)("p", {
				className: "mbs-warning",
				children: t.controlSetPending
			}) : null,
			e.status === "repair_needed" ? /* @__PURE__ */ (0, m.jsx)("p", {
				className: "mbs-warning",
				children: t.controlSetRepairNeeded
			}) : null,
			/* @__PURE__ */ (0, m.jsx)(A, { members: e.members }),
			e.managed_by_studio ? /* @__PURE__ */ (0, m.jsxs)("div", {
				className: "mbs-card-actions",
				children: [/* @__PURE__ */ (0, m.jsx)("button", {
					type: "button",
					className: "mbs-quiet-danger-button",
					onClick: () => n(e),
					disabled: !i || r,
					children: t.reviewGroupCleanup
				}), i ? null : /* @__PURE__ */ (0, m.jsx)("span", {
					className: "mbs-meta",
					children: t.groupCleanupNeedsBindingRemoval
				})]
			}) : null
		]
	});
}
function le(e) {
	return e.route === "native_group" ? e.targets.name : e.targets.members[0] ? b(e.targets.members[0]) : e.targets.name;
}
function ue({ endpoint: e }) {
	return /* @__PURE__ */ (0, m.jsx)("div", { children: /* @__PURE__ */ (0, m.jsx)("strong", { children: b(e) }) });
}
function de({ clusters: e, t }) {
	return e.length ? /* @__PURE__ */ (0, m.jsx)("div", {
		className: "mbs-chips",
		children: e.map((e) => /* @__PURE__ */ (0, m.jsx)("span", { children: ge(e, t) }, e))
	}) : null;
}
function fe({ coverage: e, t }) {
	return e.length ? /* @__PURE__ */ (0, m.jsx)("div", {
		className: "mbs-coverage-list",
		children: e.map((e) => /* @__PURE__ */ (0, m.jsxs)("p", {
			className: e.supported_members === e.total_members ? "mbs-meta" : "mbs-partial",
			children: [
				/* @__PURE__ */ (0, m.jsx)("strong", { children: ge(e.cluster_id, t) }),
				" · ",
				T(e, t),
				e.unsupported_members.length ? ` · ${t.notSupportedBy}: ${e.unsupported_members.join(", ")}` : ""
			]
		}, e.cluster_id))
	}) : null;
}
function A({ members: e }) {
	return e.length ? /* @__PURE__ */ (0, m.jsx)("div", {
		className: "mbs-members",
		children: e.map((e) => /* @__PURE__ */ (0, m.jsx)("span", { children: b(e) }, `${e.node_id}-${e.endpoint_id}`))
	}) : null;
}
function j({ label: e, used: t, maximum: n, unavailable: r }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", { children: [/* @__PURE__ */ (0, m.jsx)("small", { children: e }), /* @__PURE__ */ (0, m.jsx)("strong", { children: t !== null && n !== null ? `${t} / ${n}` : r })] });
}
function pe({ title: e, count: t }) {
	return /* @__PURE__ */ (0, m.jsxs)("div", {
		className: "mbs-section-title",
		children: [/* @__PURE__ */ (0, m.jsx)("h2", { children: e }), /* @__PURE__ */ (0, m.jsx)("span", { children: t })]
	});
}
function me({ text: e }) {
	return /* @__PURE__ */ (0, m.jsx)("p", {
		className: "mbs-empty",
		children: e
	});
}
function he(e) {
	return (e?.locale?.language ?? e?.language ?? "en").toLowerCase().startsWith("zh") ? "zh-Hant" : "en";
}
function ge(e, t) {
	return e === 6 ? t.onOff : e === 8 ? t.brightness : e === 768 ? t.colorTemperature : String(e);
}
//#endregion
//#region src/styles.css?inline
var _e = ".mbs-root{min-height:100%;color:var(--primary-text-color,#1d1b20);font-family:Roboto,Noto Sans TC,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}.mbs-root *{box-sizing:border-box}.mbs-root h1,.mbs-root h2,.mbs-root p{margin:0}.mbs-root button{font:inherit}.mbs-panel{max-width:1180px;margin:0 auto;padding:24px}.mbs-header{color:var(--primary-text-color,#1d1b20);background:linear-gradient(135deg, color-mix(in srgb, var(--primary-color,#006a6a) 12%, var(--card-background-color,#fff)), var(--card-background-color,#fff));box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:14px;justify-content:space-between;align-items:flex-start;gap:24px;padding:22px;display:flex}.mbs-eyebrow,.mbs-route-label,.mbs-section-title span,.mbs-chips span,.mbs-members span{border-radius:999px;align-items:center;display:inline-flex}.mbs-eyebrow{color:var(--primary-color,#006a6a);background:color-mix(in srgb, var(--primary-color,#006a6a) 12%, transparent);padding:3px 9px;font-size:12px;font-weight:700}.mbs-header h1{letter-spacing:-.015em;margin-top:8px;font-size:26px}.mbs-header p{color:var(--secondary-text-color,#6b6570);margin-top:5px}.mbs-header button{min-height:38px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;border:0;border-radius:19px;padding:0 16px;font-weight:650}.mbs-header button:disabled{cursor:not-allowed;opacity:.55}.mbs-scope,.mbs-notice,.mbs-warning,.mbs-success,.mbs-loading,.mbs-empty{border-radius:9px;padding:13px 15px;font-size:14px;line-height:1.55;margin-top:18px!important}.mbs-scope{border-left:3px solid var(--primary-color,#006a6a);background:var(--secondary-background-color,#f4f1f9)}.mbs-notice,.mbs-empty{color:var(--secondary-text-color,#6b6570);background:var(--secondary-background-color,#f4f1f9)}.mbs-warning{color:var(--warning-color,#967200);background:color-mix(in srgb, var(--warning-color,#967200) 12%, transparent)}.mbs-success{color:var(--success-color,#147a3d);background:color-mix(in srgb, var(--success-color,#147a3d) 12%, transparent)}.mbs-loading{color:var(--secondary-text-color,#6b6570);text-align:center}.mbs-composer{border:1px solid color-mix(in srgb, var(--primary-color,#006a6a) 30%, var(--divider-color,#dfdae2));background:var(--card-background-color,#fff);box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:12px;margin-top:24px;padding:19px}.mbs-form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:16px;display:grid}.mbs-form-grid label,.mbs-target-picker>label,.mbs-capability-picker>label,.mbs-confirm{color:var(--primary-text-color,#1d1b20);gap:6px;font-size:13px;font-weight:650;display:grid}.mbs-form-grid .mbs-area-filter{cursor:pointer;grid-column:1/-1;align-items:center;gap:8px;width:fit-content;font-weight:500;display:inline-flex}.mbs-area-filter input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-form-grid select{border:1px solid var(--divider-color,#dfdae2);width:100%;min-height:40px;color:var(--primary-text-color,#1d1b20);background:var(--card-background-color,#fff);font:inherit;border-radius:8px;padding:0 10px}.mbs-target-picker{border:1px solid var(--divider-color,#dfdae2);border-radius:8px;grid-column:1/-1;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin:0;padding:11px;display:grid}.mbs-target-picker legend{color:var(--secondary-text-color,#6b6570);padding:0 5px;font-size:12px}.mbs-target-picker>label{align-items:center;gap:8px;font-weight:500;display:inline-flex}.mbs-target-picker input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-capability-picker{border:1px solid var(--divider-color,#dfdae2);border-radius:8px;flex-wrap:wrap;gap:10px 16px;margin:16px 0 0;padding:12px;display:flex}.mbs-capability-picker legend{color:var(--secondary-text-color,#6b6570);padding:0 5px;font-size:12px}.mbs-capability-picker>label,.mbs-confirm{align-items:center;gap:8px;font-weight:500;display:inline-flex}.mbs-capability-picker small{color:var(--secondary-text-color,#6b6570);font-size:11px}.mbs-capability-picker input,.mbs-confirm input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a)}.mbs-actions{justify-content:flex-end;margin-top:16px;display:flex}.mbs-actions button,.mbs-review>button,.mbs-review-actions button,.mbs-card-actions button{min-height:38px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;font:inherit;border:0;border-radius:19px;padding:0 16px;font-weight:650}.mbs-actions button:disabled,.mbs-review>button:disabled,.mbs-review-actions button:disabled,.mbs-card-actions button:disabled{cursor:not-allowed;opacity:.55}.mbs-review{background:color-mix(in srgb, var(--primary-color,#006a6a) 7%, var(--card-background-color,#fff));border-radius:9px;gap:10px;margin-top:16px;padding:15px;display:grid}.mbs-review ul{color:var(--secondary-text-color,#6b6570);gap:5px;margin:0;padding-left:20px;font-size:13px;line-height:1.45;display:grid}.mbs-review>button{justify-self:start}.mbs-review-actions,.mbs-card-actions{flex-wrap:wrap;align-items:center;gap:9px;display:flex}.mbs-removal-review{border:1px solid color-mix(in srgb, var(--error-color,#ba1a1a) 35%, var(--divider-color,#dfdae2))}.mbs-danger-button{background:var(--error-color,#ba1a1a)!important}.mbs-quiet-danger-button{color:var(--error-color,#ba1a1a)!important;background:color-mix(in srgb, var(--error-color,#ba1a1a) 10%, transparent)!important}.mbs-content{gap:20px;margin-top:24px;display:grid}.mbs-content section{background:var(--card-background-color,#fff);box-shadow:var(--ha-card-box-shadow,0 2px 2px #0000001a);border-radius:12px;padding:19px}.mbs-section-title{justify-content:space-between;align-items:center;gap:12px;display:flex}.mbs-section-title h2{font-size:18px}.mbs-section-title span{min-width:24px;color:var(--secondary-text-color,#6b6570);background:var(--secondary-background-color,#f4f1f9);justify-content:center;padding:3px 8px;font-size:12px}.mbs-description{color:var(--secondary-text-color,#6b6570);font-size:13px;line-height:1.5;margin-top:5px!important}.mbs-list{gap:10px;margin-top:14px;display:grid}.mbs-card,.mbs-capacity{border:1px solid var(--divider-color,#dfdae2);border-radius:10px;padding:14px}.mbs-card-topline{justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.mbs-route{align-items:center;gap:11px;min-width:0;display:flex}.mbs-route>span{color:var(--primary-color,#006a6a);font-size:20px}.mbs-route strong,.mbs-card strong,.mbs-capacity>strong{color:var(--primary-text-color,#1d1b20)}.mbs-route-label{color:var(--primary-color,#006a6a);background:color-mix(in srgb, var(--primary-color,#006a6a) 12%, transparent);flex:none;padding:4px 9px;font-size:12px;font-weight:700}.mbs-relationship-actions{flex-direction:column;flex:none;align-items:flex-end}.mbs-meta{color:var(--secondary-text-color,#6b6570);font-size:12px;line-height:1.45;margin-top:3px!important}.mbs-partial{color:var(--warning-color,#967200);margin:3px 0 0;font-size:12px;line-height:1.45}.mbs-coverage-list{gap:5px;margin-top:10px;display:grid}.mbs-coverage-list strong{color:var(--primary-text-color,#1d1b20)}.mbs-chips,.mbs-members{flex-wrap:wrap;gap:6px;margin-top:12px;display:flex}.mbs-chips span,.mbs-members span{color:var(--primary-text-color,#1d1b20);background:var(--secondary-background-color,#f4f1f9);padding:4px 9px;font-size:12px}.mbs-members span{background:color-mix(in srgb, var(--primary-color,#006a6a) 8%, var(--secondary-background-color,#f4f1f9))}.mbs-capacity-grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:14px;display:grid}.mbs-capacity-values{grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;display:grid}.mbs-capacity-values>div{background:var(--secondary-background-color,#f4f1f9);border-radius:7px;padding:8px}.mbs-capacity-values small{color:var(--secondary-text-color,#6b6570);font-size:11px;display:block}.mbs-capacity-values strong{margin-top:3px;font-size:15px;display:block}.mbs-acl-toolbar{flex-wrap:wrap;align-items:end;gap:10px;margin-top:14px;display:flex}.mbs-acl-toolbar label{flex:300px;gap:6px;font-size:13px;font-weight:650;display:grid}.mbs-acl-toolbar select{border:1px solid var(--divider-color,#dfdae2);width:100%;min-height:40px;color:var(--primary-text-color,#1d1b20);background:var(--card-background-color,#fff);font:inherit;border-radius:8px;padding:0 10px}.mbs-acl-toolbar button{min-height:40px;color:var(--text-primary-color,#fff);background:var(--primary-color,#006a6a);cursor:pointer;font:inherit;border:0;border-radius:20px;padding:0 16px;font-weight:650}.mbs-acl-toolbar button:disabled{cursor:not-allowed;opacity:.55}.mbs-acl-capacity{flex-wrap:wrap;gap:8px;margin-top:14px;display:flex}.mbs-acl-capacity span,.mbs-acl-state{color:var(--primary-text-color,#1d1b20);background:var(--secondary-background-color,#f4f1f9);border-radius:999px;align-items:center;padding:4px 9px;font-size:12px;display:inline-flex}.mbs-acl-bulkbar{background:color-mix(in srgb, var(--warning-color,#967200) 8%, var(--secondary-background-color,#f4f1f9));border-radius:9px;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px;padding:10px;display:flex}.mbs-acl-bulkbar label,.mbs-acl-entry-title{align-items:center;gap:8px;display:inline-flex}.mbs-acl-bulkbar label{font-size:13px;font-weight:650}.mbs-acl-bulkbar span{color:var(--secondary-text-color,#6b6570);font-size:12px}.mbs-acl-bulkbar button{min-height:34px;margin-left:auto}.mbs-acl-entry{gap:5px;display:grid}.mbs-acl-entry-title input,.mbs-acl-bulkbar input{width:16px;height:16px;accent-color:var(--primary-color,#006a6a);margin:0}.mbs-acl-details{grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:7px;display:grid}.mbs-acl-details>div{background:var(--secondary-background-color,#f4f1f9);border-radius:7px;padding:8px}.mbs-acl-details small{color:var(--secondary-text-color,#6b6570);font-size:11px;display:block}.mbs-acl-details p{font-size:13px;line-height:1.45;margin-top:3px!important}.mbs-acl-protected{color:var(--secondary-text-color,#6b6570)}.mbs-acl-used{color:var(--success-color,#147a3d);background:color-mix(in srgb, var(--success-color,#147a3d) 12%, transparent)}.mbs-acl-unused{color:var(--warning-color,#967200);background:color-mix(in srgb, var(--warning-color,#967200) 12%, transparent)}.mbs-acl-unknown{color:var(--error-color,#ba1a1a);background:color-mix(in srgb, var(--error-color,#ba1a1a) 10%, transparent)}@media (width<=600px){.mbs-panel{padding:14px}.mbs-header{flex-direction:column;align-items:stretch}.mbs-header button{width:100%}.mbs-form-grid{grid-template-columns:1fr}.mbs-actions button,.mbs-review>button,.mbs-review-actions button,.mbs-acl-toolbar button{width:100%}.mbs-acl-bulkbar button{width:100%;margin-left:0}.mbs-card-topline{flex-direction:column;align-items:stretch}.mbs-route-label{align-self:flex-start}.mbs-relationship-actions{align-self:flex-start;align-items:flex-start}}", ve = class extends HTMLElement {
	root;
	hassValue;
	set hass(e) {
		this.hassValue = e, this.renderPanel();
	}
	connectedCallback() {
		if (!this.root) {
			let e = document.createElement("style");
			e.textContent = _e;
			let t = document.createElement("div");
			this.replaceChildren(e, t), this.root = (0, d.createRoot)(t);
		}
		this.renderPanel();
	}
	disconnectedCallback() {
		this.root?.unmount(), this.root = void 0;
	}
	renderPanel() {
		this.root?.render(/* @__PURE__ */ (0, m.jsx)(h, { hass: this.hassValue }));
	}
};
customElements.define("matter-binding-studio-panel", ve);
//#endregion


(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Link/index.svelte generated by Svelte v3.24.1 */

    const file = "src/Link/index.svelte";

    function create_fragment(ctx) {
    	let a;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(a, "class", "link svelte-6htnqx");
    			attr_dev(a, "data-text", /*text*/ ctx[0]);
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			add_location(a, file, 41, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "touchend", /*handleTouch*/ ctx[2], { passive: true }, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);

    			if (dirty & /*text*/ 1) {
    				attr_dev(a, "data-text", /*text*/ ctx[0]);
    			}

    			if (dirty & /*href*/ 2) {
    				attr_dev(a, "href", /*href*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { text } = $$props;
    	let { href } = $$props;

    	// TODO WTF
    	function handleTouch() {
    		setTimeout(
    			() => {
    				window.location.href = href;
    			},
    			400
    		);
    	}

    	const writable_props = ["text", "href"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Link", $$slots, []);

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    	};

    	$$self.$capture_state = () => ({ text, href, handleTouch });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("href" in $$props) $$invalidate(1, href = $$props.href);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, href, handleTouch];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 0, href: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Link> was created without expected prop 'text'");
    		}

    		if (/*href*/ ctx[1] === undefined && !("href" in props)) {
    			console.warn("<Link> was created without expected prop 'href'");
    		}
    	}

    	get text() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Header/index.svelte generated by Svelte v3.24.1 */
    const file$1 = "src/Header/index.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				text: "My Blog",
    				href: "http://blog.codyschaaf.com"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(link.$$.fragment);
    			attr_dev(div, "class", "svelte-1ix7oev");
    			add_location(div, file$1, 13, 0, 196);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(link, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /**
     * Just add dependencies for a reactive context so the compiler knows about them
     * https://github.com/sveltejs/svelte/issues/2761
     */
    const reactDependencies = (arr) => { };

    /* src/Arrow/index.svelte generated by Svelte v3.24.1 */
    const file$2 = "src/Arrow/index.svelte";

    function create_fragment$2(ctx) {
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Scroll down after animation.";
    			t2 = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "help svelte-19f2ejw");
    			add_location(div0, file$2, 74, 2, 1528);
    			attr_dev(div1, "class", "arrow svelte-19f2ejw");
    			set_style(div1, "cursor", "pointer");
    			add_location(div1, file$2, 75, 2, 1583);
    			attr_dev(div2, "class", "arrow-down svelte-19f2ejw");
    			toggle_class(div2, "active", /*active*/ ctx[1]);
    			toggle_class(div2, "showHelp", /*showHelp*/ ctx[2]);
    			add_location(div2, file$2, 67, 0, 1409);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			/*div2_binding*/ ctx[6](div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(document.body, "scroll", /*handleScroll*/ ctx[3], false, false, false),
    					listen_dev(div2, "click", /*arrowClickCB1*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 2) {
    				toggle_class(div2, "active", /*active*/ ctx[1]);
    			}

    			if (dirty & /*showHelp*/ 4) {
    				toggle_class(div2, "showHelp", /*showHelp*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div2);
    			/*div2_binding*/ ctx[6](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { height } = $$props;
    	let arrowHeight;
    	let downArrowEl;
    	let active = false;

    	function handleScroll() {
    		$$invalidate(1, active = window.scrollY < height - arrowHeight);
    	}

    	let showHelp = false;

    	const arrowClickCB1 = () => {
    		$$invalidate(2, showHelp = true);
    	};

    	onMount(() => arrowHeight = downArrowEl.offsetHeight);
    	onMount(handleScroll);
    	const writable_props = ["height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", $$slots, []);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			downArrowEl = $$value;
    			$$invalidate(0, downArrowEl);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		reactDependencies,
    		height,
    		arrowHeight,
    		downArrowEl,
    		active,
    		handleScroll,
    		showHelp,
    		arrowClickCB1
    	});

    	$$self.$inject_state = $$props => {
    		if ("height" in $$props) $$invalidate(5, height = $$props.height);
    		if ("arrowHeight" in $$props) arrowHeight = $$props.arrowHeight;
    		if ("downArrowEl" in $$props) $$invalidate(0, downArrowEl = $$props.downArrowEl);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("showHelp" in $$props) $$invalidate(2, showHelp = $$props.showHelp);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*downArrowEl, height*/ 33) {
    			 if (downArrowEl) {
    				handleScroll();
    			}
    		}
    	};

    	return [
    		downArrowEl,
    		active,
    		showHelp,
    		handleScroll,
    		arrowClickCB1,
    		height,
    		div2_binding
    	];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { height: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*height*/ ctx[5] === undefined && !("height" in props)) {
    			console.warn("<Arrow> was created without expected prop 'height'");
    		}
    	}

    	get height() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function styles(node, styles) {
        setCustomProperties(node, styles);
        return {
            update(styles) {
                setCustomProperties(node, styles);
            },
        };
    }
    function setCustomProperties(node, styles) {
        Object.entries(styles).forEach(([key, value]) => {
            node.style.setProperty(`${key}`, String(value));
        });
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const renderWatcher = writable({});

    /* src/Schaaf/index.svelte generated by Svelte v3.24.1 */
    const file$3 = "src/Schaaf/index.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let g1;
    	let g0;
    	let path0;
    	let styles_action;
    	let path1;
    	let styles_action_1;
    	let path2;
    	let styles_action_2;
    	let path3;
    	let styles_action_3;
    	let path4;
    	let styles_action_4;
    	let path5;
    	let styles_action_5;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			attr_dev(path0, "stroke", "#003153");
    			attr_dev(path0, "stroke-width", "2");
    			attr_dev(path0, "id", "path3341");
    			attr_dev(path0, "d", "m 86.797143,97.322198 q 0.36,18.000002 36.359997,24.840002 l 0.36,0 q\n        20.7,3.78 32.04,11.52 13.86,9 13.86,23.94 0,14.76 -14.04,24.84\n        -13.86,10.08 -32.58,10.08 -23.759997,-0.18 -46.439997,-18.18 -2.88,-2.52\n        -0.54,-5.58 1.08,-1.26 2.7,-1.44 1.62,-0.18 2.88,0.9 20.339997,16.38\n        41.399997,16.2 16.56,0 27.72,-8.28 10.8,-7.74 10.8,-18.72 0,-20.16\n        -39.42,-27.54 l -0.36,0 q -42.659997,-7.92 -42.659997,-32.580002\n        0,-14.04 12.78,-23.4 12.959997,-9.36 30.779997,-9.36 7.74,0 15.48,2.7\n        7.92,2.52 12.24,5.04 4.32,2.34 11.16,6.84 3.24,2.16 1.08,5.58 -1.98,3.24\n        -5.4,1.08 -6.48,-4.14 -10.62,-6.48 -3.96,-2.34 -10.8,-4.5 -6.66,-2.34\n        -13.14,-2.34 -15.12,0 -25.739997,7.56 -9.9,7.38 -9.9,17.28 z");
    			attr_dev(path0, "class", "svelte-1euzvma");
    			toggle_class(path0, "active", /*activeCharacters*/ ctx[2][0]);
    			add_location(path0, file$3, 79, 6, 2426);
    			attr_dev(path1, "stroke", "#003153");
    			attr_dev(path1, "stroke-width", "2");
    			attr_dev(path1, "id", "path3343");
    			attr_dev(path1, "d", "m 238.89152,192.3622 q -18.9,0 -32.22,-12.78 -13.14,-12.96\n        -13.14,-31.32 0,-18.54 13.14,-31.32 13.32,-12.78 30.6,-12.78 17.46,0\n        29.7,9.72 1.44,0.9 1.62,2.7 0.18,1.8 -1.08,3.24 -2.7,3.06 -5.94,0.72\n        -9.9,-7.92 -23.94,-7.92 -14.04,0 -24.84,10.44 -10.62,10.44 -10.62,25.2\n        0,14.76 10.62,25.2 10.8,10.26 24.66,10.26 14.04,0 24.12,-7.74 3.24,-2.34\n        5.94,0.9 2.88,3.24 -0.9,6.12 -12.06,9.36 -27.72,9.36 z");
    			attr_dev(path1, "class", "svelte-1euzvma");
    			toggle_class(path1, "active", /*activeCharacters*/ ctx[2][1]);
    			add_location(path1, file$3, 97, 6, 3419);
    			attr_dev(path2, "stroke", "#003153");
    			attr_dev(path2, "stroke-width", "2");
    			attr_dev(path2, "id", "path3345");
    			attr_dev(path2, "d", "m 308.05933,192.3622 -0.9,0 q -4.32,0 -4.32,-4.32 l 0,-117.360002 q\n        0,-1.8 1.26,-3.06 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26 1.44,1.26\n        1.44,3.06 l 0,46.440002 q 10.98,-12.96 27.18,-12.96 16.2,0 26.82,9.9\n        10.8,9.72 10.8,24.84 l 0,49.14 q 0,1.8 -1.44,3.06 -1.26,1.26 -3.06,1.26\n        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-49.14 q 0,-11.34\n        -8.1,-18.54 -8.1,-7.38 -19.98,-7.38 -11.7,0 -19.8,7.38 -8.1,7.2\n        -8.1,18.54 l 0,49.68 q 0,0.36 -0.72,1.8 -0.72,1.26 -2.52,1.8 -0.18,0.18\n        -0.36,0.18 z");
    			attr_dev(path2, "class", "svelte-1euzvma");
    			toggle_class(path2, "active", /*activeCharacters*/ ctx[2][2]);
    			add_location(path2, file$3, 111, 6, 4095);
    			attr_dev(path3, "stroke", "#003153");
    			attr_dev(path3, "stroke-width", "2");
    			attr_dev(path3, "id", "path3347");
    			attr_dev(path3, "d", "m 479.82996,105.4222 q 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26\n        1.26,1.26 1.26,3.06 l 0,79.56 q 0,1.8 -1.26,3.06 -1.26,1.26 -3.06,1.26\n        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-13.14 q -5.76,8.1\n        -14.58,12.78 -8.64,4.68 -18.54,4.68 -17.28,0 -29.52,-12.96 -12.24,-12.96\n        -12.24,-31.14 0,-18.18 12.24,-31.14 12.24,-12.96 29.52,-12.96 9.9,0\n        18.54,4.68 8.82,4.68 14.58,12.6 l 0,-12.96 q 0,-1.8 1.26,-3.06 z m\n        -67.5,42.84 q 0,14.76 9.72,25.2 9.9,10.26 23.4,10.26 13.68,0 23.4,-10.26\n        9.72,-10.44 9.72,-25.2 0,-14.76 -9.72,-25.2 -9.72,-10.44 -23.4,-10.44\n        -13.5,0 -23.4,10.44 -9.72,10.44 -9.72,25.2 z");
    			attr_dev(path3, "class", "svelte-1euzvma");
    			toggle_class(path3, "active", /*activeCharacters*/ ctx[2][3]);
    			add_location(path3, file$3, 127, 6, 4880);
    			attr_dev(path4, "stroke", "#003153");
    			attr_dev(path4, "stroke-width", "2");
    			attr_dev(path4, "id", "path3349");
    			attr_dev(path4, "d", "m 590.92371,105.4222 q 1.26,-1.26 3.06,-1.26 1.8,0 3.06,1.26\n        1.26,1.26 1.26,3.06 l 0,79.56 q 0,1.8 -1.26,3.06 -1.26,1.26 -3.06,1.26\n        -1.8,0 -3.06,-1.26 -1.26,-1.26 -1.26,-3.06 l 0,-13.14 q -5.76,8.1\n        -14.58,12.78 -8.64,4.68 -18.54,4.68 -17.28,0 -29.52,-12.96 -12.24,-12.96\n        -12.24,-31.14 0,-18.18 12.24,-31.14 12.24,-12.96 29.52,-12.96 9.9,0\n        18.54,4.68 8.82,4.68 14.58,12.6 l 0,-12.96 q 0,-1.8 1.26,-3.06 z m\n        -67.5,42.84 q 0,14.76 9.72,25.2 9.9,10.26 23.4,10.26 13.68,0 23.4,-10.26\n        9.72,-10.44 9.72,-25.2 0,-14.76 -9.72,-25.2 -9.72,-10.44 -23.4,-10.44\n        -13.5,0 -23.4,10.44 -9.72,10.44 -9.72,25.2 z");
    			attr_dev(path4, "class", "svelte-1euzvma");
    			toggle_class(path4, "active", /*activeCharacters*/ ctx[2][4]);
    			add_location(path4, file$3, 144, 6, 5778);
    			attr_dev(path5, "stroke", "#003153");
    			attr_dev(path5, "stroke-width", "2");
    			attr_dev(path5, "id", "path3351");
    			attr_dev(path5, "d", "m 669.97746,66.542198 q 1.8,0 3.06,1.44 1.26,1.26 1.26,3.06 0,1.8\n        -1.26,3.06 -1.26,1.26 -3.06,1.26 -8.28,0 -11.52,3.78 -3.24,3.6\n        -3.24,14.22 l 0,9.360002 12.42,0 q 1.8,0 3.06,1.26 1.44,1.26 1.44,3.06\n        0,1.8 -1.44,3.24 -1.26,1.26 -3.06,1.26 l -12.42,0 0,76.68 q 0,1.8\n        -1.26,3.06 -1.26,1.26 -3.06,1.26 -1.8,0 -3.24,-1.26 -1.26,-1.26\n        -1.26,-3.06 l 0,-76.68 -11.7,0 q -1.8,0 -3.06,-1.26 -1.26,-1.44\n        -1.26,-3.24 0,-1.8 1.26,-3.06 1.26,-1.26 3.06,-1.26 l 11.7,0 0,-9.360002\n        q 0.36,-14.04 5.76,-20.52 5.76,-6.3 17.82,-6.3 z");
    			attr_dev(path5, "class", "svelte-1euzvma");
    			toggle_class(path5, "active", /*activeCharacters*/ ctx[2][5]);
    			add_location(path5, file$3, 161, 6, 6676);
    			attr_dev(g0, "id", "text3336");
    			set_style(g0, "font-style", "normal");
    			set_style(g0, "font-variant", "normal");
    			set_style(g0, "font-weight", "normal");
    			set_style(g0, "font-stretch", "normal");
    			set_style(g0, "font-size", "180px");
    			set_style(g0, "line-height", "125%");
    			set_style(g0, "font-family", "Quicksand");
    			set_style(g0, "-inkscape-font-specification", "'Quicksand,\n      Normal'");
    			set_style(g0, "text-align", "start");
    			set_style(g0, "letter-spacing", "0px");
    			set_style(g0, "word-spacing", "0px");
    			set_style(g0, "writing-mode", "lr-tb");
    			set_style(g0, "text-anchor", "start");
    			set_style(g0, "fill", "#003153");
    			set_style(g0, "stroke", "none");
    			set_style(g0, "stroke-width", "1px");
    			set_style(g0, "stroke-linecap", "butt");
    			set_style(g0, "stroke-linejoin", "miter");
    			set_style(g0, "stroke-opacity", "1");
    			attr_dev(g0, "class", "svg-group svelte-1euzvma");
    			toggle_class(g0, "fillSvg", /*fillSvg*/ ctx[4]);
    			add_location(g0, file$3, 72, 4, 1955);
    			attr_dev(g1, "id", "layer1");
    			add_location(g1, file$3, 71, 2, 1935);
    			attr_dev(svg, "id", "svg2");
    			attr_dev(svg, "width", "300");
    			attr_dev(svg, "height", "200");
    			attr_dev(svg, "viewBox", "0 0 1 500");
    			attr_dev(svg, "preserveAspectRatio", "xMinYMin meet");
    			attr_dev(svg, "class", "svelte-1euzvma");
    			toggle_class(svg, "hidden", /*hidden*/ ctx[3]);
    			add_location(svg, file$3, 63, 0, 1810);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			/*path0_binding*/ ctx[5](path0);
    			append_dev(g0, path1);
    			/*path1_binding*/ ctx[6](path1);
    			append_dev(g0, path2);
    			/*path2_binding*/ ctx[7](path2);
    			append_dev(g0, path3);
    			/*path3_binding*/ ctx[8](path3);
    			append_dev(g0, path4);
    			/*path4_binding*/ ctx[9](path4);
    			append_dev(g0, path5);
    			/*path5_binding*/ ctx[10](path5);

    			if (!mounted) {
    				dispose = [
    					action_destroyer(styles_action = styles.call(null, path0, /*characterStyles*/ ctx[1][0] ?? {})),
    					action_destroyer(styles_action_1 = styles.call(null, path1, /*characterStyles*/ ctx[1][1] ?? {})),
    					action_destroyer(styles_action_2 = styles.call(null, path2, /*characterStyles*/ ctx[1][2] ?? {})),
    					action_destroyer(styles_action_3 = styles.call(null, path3, /*characterStyles*/ ctx[1][3] ?? {})),
    					action_destroyer(styles_action_4 = styles.call(null, path4, /*characterStyles*/ ctx[1][4] ?? {})),
    					action_destroyer(styles_action_5 = styles.call(null, path5, /*characterStyles*/ ctx[1][5] ?? {}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (styles_action && is_function(styles_action.update) && dirty & /*characterStyles*/ 2) styles_action.update.call(null, /*characterStyles*/ ctx[1][0] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path0, "active", /*activeCharacters*/ ctx[2][0]);
    			}

    			if (styles_action_1 && is_function(styles_action_1.update) && dirty & /*characterStyles*/ 2) styles_action_1.update.call(null, /*characterStyles*/ ctx[1][1] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path1, "active", /*activeCharacters*/ ctx[2][1]);
    			}

    			if (styles_action_2 && is_function(styles_action_2.update) && dirty & /*characterStyles*/ 2) styles_action_2.update.call(null, /*characterStyles*/ ctx[1][2] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path2, "active", /*activeCharacters*/ ctx[2][2]);
    			}

    			if (styles_action_3 && is_function(styles_action_3.update) && dirty & /*characterStyles*/ 2) styles_action_3.update.call(null, /*characterStyles*/ ctx[1][3] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path3, "active", /*activeCharacters*/ ctx[2][3]);
    			}

    			if (styles_action_4 && is_function(styles_action_4.update) && dirty & /*characterStyles*/ 2) styles_action_4.update.call(null, /*characterStyles*/ ctx[1][4] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path4, "active", /*activeCharacters*/ ctx[2][4]);
    			}

    			if (styles_action_5 && is_function(styles_action_5.update) && dirty & /*characterStyles*/ 2) styles_action_5.update.call(null, /*characterStyles*/ ctx[1][5] ?? {});

    			if (dirty & /*activeCharacters*/ 4) {
    				toggle_class(path5, "active", /*activeCharacters*/ ctx[2][5]);
    			}

    			if (dirty & /*fillSvg*/ 16) {
    				toggle_class(g0, "fillSvg", /*fillSvg*/ ctx[4]);
    			}

    			if (dirty & /*hidden*/ 8) {
    				toggle_class(svg, "hidden", /*hidden*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			/*path0_binding*/ ctx[5](null);
    			/*path1_binding*/ ctx[6](null);
    			/*path2_binding*/ ctx[7](null);
    			/*path3_binding*/ ctx[8](null);
    			/*path4_binding*/ ctx[9](null);
    			/*path5_binding*/ ctx[10](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const characters = [];
    	let characterStyles = [];
    	let activeCharacters = [];
    	let hidden = true;
    	let fillSvg = false;

    	onMount(() => {
    		$$invalidate(1, characterStyles = characters.map(character => ({
    			"stroke-dasharray": character.getTotalLength(),
    			"stroke-dashoffset": character.getTotalLength()
    		})));

    		$$invalidate(3, hidden = false);
    		const delay = 0.6 * 1000;

    		characters.forEach((_, index) => {
    			setTimeout(
    				() => {
    					$$invalidate(2, activeCharacters[index] = true, activeCharacters);
    				},
    				delay * index
    			);
    		});

    		setTimeout(
    			() => {
    				$$invalidate(1, characterStyles = characters.map(() => ({ "stroke-dashoffset": 0 })));
    				$$invalidate(2, activeCharacters = Array(activeCharacters.length).fill(false));
    				$$invalidate(4, fillSvg = true);
    			},
    			delay * 6
    		);
    	});

    	renderWatcher.subscribe(({ doneDrawing, scrollIndex, maxScrollIndex }) => {
    		if (doneDrawing && scrollIndex && scrollIndex >= 0) {
    			$$invalidate(1, characterStyles = characters.map(character => ({
    				"stroke-dasharray": character.getTotalLength(),
    				"stroke-dashoffset": character.getTotalLength() / (maxScrollIndex !== null && maxScrollIndex !== void 0
    				? maxScrollIndex
    				: 1) * ((maxScrollIndex !== null && maxScrollIndex !== void 0
    				? maxScrollIndex
    				: 1) - scrollIndex)
    			})));

    			$$invalidate(4, fillSvg = maxScrollIndex === scrollIndex);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Schaaf> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Schaaf", $$slots, []);

    	function path0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[0] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	function path1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[1] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	function path2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[2] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	function path3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[3] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	function path4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[4] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	function path5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			characters[5] = $$value;
    			$$invalidate(0, characters);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		styles,
    		renderWatcher,
    		characters,
    		characterStyles,
    		activeCharacters,
    		hidden,
    		fillSvg
    	});

    	$$self.$inject_state = $$props => {
    		if ("characterStyles" in $$props) $$invalidate(1, characterStyles = $$props.characterStyles);
    		if ("activeCharacters" in $$props) $$invalidate(2, activeCharacters = $$props.activeCharacters);
    		if ("hidden" in $$props) $$invalidate(3, hidden = $$props.hidden);
    		if ("fillSvg" in $$props) $$invalidate(4, fillSvg = $$props.fillSvg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		characters,
    		characterStyles,
    		activeCharacters,
    		hidden,
    		fillSvg,
    		path0_binding,
    		path1_binding,
    		path2_binding,
    		path3_binding,
    		path4_binding,
    		path5_binding
    	];
    }

    class Schaaf extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Schaaf",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    const normal = function (big, canvasWidth, small) {
        if (small === undefined) {
            small = 0;
        }
        return big + small * (canvasWidth / 3000);
    };
    const pointsStartFn = function ({ canvasWidth, letterXSize, letterYSize, baseYOffset, cXOffset, oXOffset, dXOffset, yXOffset, }) {
        return {
            c1: [
                cXOffset - normal(letterXSize, canvasWidth),
                baseYOffset - normal(letterYSize, canvasWidth, 50),
            ],
            c2: [
                cXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset - normal(letterYSize, canvasWidth),
            ],
            c3: [
                cXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            o1: [
                oXOffset - normal(letterXSize, canvasWidth),
                baseYOffset - normal(0, canvasWidth, 50),
            ],
            o2: [
                oXOffset + normal(letterXSize, canvasWidth),
                baseYOffset - normal(0, canvasWidth, 50),
            ],
            o3: [
                oXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(0, canvasWidth),
            ],
            o4: [
                oXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            d1: [
                dXOffset - normal(letterXSize, canvasWidth),
                baseYOffset - normal(0, canvasWidth, 50),
            ],
            d2: [
                dXOffset + normal(letterXSize, canvasWidth),
                baseYOffset - normal(letterYSize, canvasWidth, 50),
            ],
            d3: [
                dXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(0, canvasWidth),
            ],
            d4: [
                dXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            y1: [
                yXOffset - normal(letterXSize, canvasWidth),
                baseYOffset - normal(0, canvasWidth, 50),
            ],
            y2: [
                yXOffset + normal(letterXSize, canvasWidth),
                baseYOffset - normal(0, canvasWidth, 50),
            ],
            y3: [
                yXOffset - normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            y4: [
                yXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize * 2, canvasWidth),
            ],
        };
    };
    const pointsEndFn = function ({ canvasWidth, letterXSize, letterYSize, baseYOffset, cXOffset, oXOffset, dXOffset, yXOffset, }) {
        return {
            c1: [
                cXOffset - normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            c2: [
                cXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset - normal(letterYSize, canvasWidth),
            ],
            c3: [
                cXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            o1: [
                oXOffset - normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            o2: [
                oXOffset + normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            o3: [
                oXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(0, canvasWidth),
            ],
            o4: [
                oXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            d1: [
                dXOffset - normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            d2: [
                dXOffset + normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            d3: [
                dXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(0, canvasWidth),
            ],
            d4: [
                dXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            y1: [
                yXOffset - normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize, canvasWidth, 50),
            ],
            y2: [
                yXOffset + normal(letterXSize, canvasWidth),
                baseYOffset + normal(letterYSize * 2, canvasWidth, 50),
            ],
            y3: [
                yXOffset + normal(letterXSize, canvasWidth, 50),
                baseYOffset + normal(letterYSize, canvasWidth),
            ],
            y4: [
                yXOffset - normal(letterXSize * 20, canvasWidth, 50),
                baseYOffset + normal(letterYSize * 2, canvasWidth),
            ],
        };
    };

    const heightStore = writable(0);

    /* src/Cody/index.svelte generated by Svelte v3.24.1 */

    const { Object: Object_1, window: window_1 } = globals;
    const file$4 = "src/Cody/index.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let canvas;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			canvas = element("canvas");
    			attr_dev(canvas, "id", "myCanvas");
    			attr_dev(canvas, "width", "100%");
    			attr_dev(canvas, "height", "100%");
    			add_location(canvas, file$4, 167, 2, 6092);
    			attr_dev(div, "class", "canvas-container svelte-iymgls");
    			add_location(div, file$4, 166, 0, 6038);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, canvas);
    			/*canvas_binding*/ ctx[3](canvas);
    			/*div_binding*/ ctx[4](div);

    			if (!mounted) {
    				dispose = listen_dev(
    					window_1,
    					"scroll",
    					function () {
    						if (is_function(/*scrollCB*/ ctx[2])) /*scrollCB*/ ctx[2].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*canvas_binding*/ ctx[3](null);
    			/*div_binding*/ ctx[4](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $heightStore;
    	validate_store(heightStore, "heightStore");
    	component_subscribe($$self, heightStore, $$value => $$invalidate(9, $heightStore = $$value));
    	const cachedCanvases = {};
    	let parent;
    	let canvasElement;
    	let doneDrawing = false;
    	let scrollIndex = 0;
    	let maxScrollIndex = 0;
    	let scrollCB;

    	onMount(() => {
    		$$invalidate(1, canvasElement = document.getElementById("myCanvas"));
    		const context = canvasElement.getContext("2d");
    		context.canvas.width = parent.offsetWidth;
    		context.canvas.height = 300;
    		const canvasWidth = canvasElement.width;
    		const canvasHeight = canvasElement.height;
    		const baseYOffset = canvasHeight / 2;
    		const baseXOffset = canvasWidth / 5;
    		const cXOffset = baseXOffset;
    		const oXOffset = baseXOffset * 2;
    		const dXOffset = baseXOffset * 3;
    		const yXOffset = baseXOffset * 4;
    		const letterSize = (baseXOffset < baseYOffset ? baseXOffset : baseYOffset) / 3;
    		const letterYSize = letterSize;
    		const letterXSize = letterSize / 2;
    		const max = 2000;
    		let cachedKeys = ["0"];

    		const currentStart = function (letter) {
    			return pointsStartFn({
    				canvasWidth,
    				letterXSize,
    				letterYSize,
    				baseYOffset,
    				cXOffset,
    				oXOffset,
    				dXOffset,
    				yXOffset
    			})[letter];
    		};

    		const currentEnd = function (letter) {
    			return pointsEndFn({
    				canvasWidth,
    				letterXSize,
    				letterYSize,
    				baseYOffset,
    				cXOffset,
    				oXOffset,
    				dXOffset,
    				yXOffset
    			})[letter];
    		};

    		const moveTo = function (points, cachedContext) {
    			context.moveTo(points[0], points[1]);
    			cachedContext.moveTo(points[0], points[1]);
    		};

    		const lineTo = function (letter, step, cachedContext) {
    			const start = currentStart(letter);
    			const end = currentEnd(letter);
    			const diffX = end[0] - start[0];
    			const stepSizeX = diffX / max;
    			const diffY = end[1] - start[1];
    			const stepSizeY = diffY / max;
    			context.lineTo(start[0] + stepSizeX * step, start[1] + stepSizeY * step);
    			cachedContext.lineTo(start[0] + stepSizeX * step, start[1] + stepSizeY * step);
    		};

    		const cachedCanvas = document.createElement("canvas");
    		cachedCanvas.width = context.canvas.width;
    		cachedCanvas.height = context.canvas.height;
    		cachedCanvases[0] = cachedCanvas;

    		const draw = function () {
    			let stepEr = 0;

    			const strokePoints = function (step) {
    				const oldCachedCanvas = cachedCanvases[cachedKeys[scrollIndex]];
    				const cachedCanvas = document.createElement("canvas");
    				const cachedContext = cachedCanvas.getContext("2d");

    				//set dimensions
    				cachedCanvas.width = oldCachedCanvas.width;

    				cachedCanvas.height = oldCachedCanvas.height;

    				//apply the old canvas to the new one
    				cachedContext.drawImage(oldCachedCanvas, 0, 0);

    				if (step < max) {
    					Object.entries(pointsStartFn({
    						canvasWidth,
    						letterXSize,
    						letterYSize,
    						baseYOffset,
    						cXOffset,
    						oXOffset,
    						dXOffset,
    						yXOffset
    					})).map(([letter, points]) => {
    						moveTo(points, cachedContext);
    						lineTo(letter, step, cachedContext);
    						context.lineWidth = 2;
    						cachedContext.lineWidth = 2;
    					});

    					if (step / max >= 1 / 8) {
    						context.strokeStyle = "rgba(0, 49, 83, " + 1 / 8 / (step / max) + ")";
    						cachedContext.strokeStyle = "rgba(0, 49, 83, " + 1 / 8 / (step / max) + ")";
    					} else {
    						context.strokeStyle = "rgba(0, 49, 83, 1)";
    						cachedContext.strokeStyle = "rgba(0, 49, 83, 1)";
    					}

    					context.stroke();
    					cachedContext.stroke();
    					cachedCanvases[step] = cachedCanvas;

    					// animationFrameRequestId = window.requestAnimationFrame(
    					window.requestAnimationFrame(strokePoints.bind(null, stepEr + step));

    					stepEr += 1;
    					cachedKeys = Object.keys(cachedCanvases);
    					scrollIndex = cachedKeys.length - 1;
    					maxScrollIndex = cachedKeys.length - 1;
    				} else {
    					doneDrawing = true;
    					renderWatcher.set({ doneDrawing });
    				}
    			};

    			strokePoints(0);
    		};

    		window.setTimeout(draw, 2000);

    		//start of something else
    		let previousScrollIndex = maxScrollIndex;

    		const normalize = currentScroll => {
    			const animationLength = $heightStore - window.innerHeight;
    			const num = Math.round((animationLength - currentScroll) / animationLength * maxScrollIndex);

    			if (num < 0) {
    				return 0;
    			} else if (num > maxScrollIndex) {
    				return maxScrollIndex;
    			} else {
    				return num;
    			}
    		};

    		$$invalidate(2, scrollCB = () => {
    			scrollIndex = normalize(window.scrollY);

    			if (doneDrawing && scrollIndex !== previousScrollIndex) {
    				previousScrollIndex = scrollIndex;

    				window.requestAnimationFrame(() => {
    					context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    					context.drawImage(cachedCanvases[cachedKeys[scrollIndex]], 0, 0);
    					renderWatcher.set({ doneDrawing, maxScrollIndex, scrollIndex });
    				});
    			}
    		});
    	});

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cody> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Cody", $$slots, []);

    	function canvas_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvasElement = $$value;
    			$$invalidate(1, canvasElement);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			parent = $$value;
    			$$invalidate(0, parent);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		pointsEndFn,
    		pointsStartFn,
    		heightStore,
    		renderWatcher,
    		cachedCanvases,
    		parent,
    		canvasElement,
    		doneDrawing,
    		scrollIndex,
    		maxScrollIndex,
    		scrollCB,
    		$heightStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("parent" in $$props) $$invalidate(0, parent = $$props.parent);
    		if ("canvasElement" in $$props) $$invalidate(1, canvasElement = $$props.canvasElement);
    		if ("doneDrawing" in $$props) doneDrawing = $$props.doneDrawing;
    		if ("scrollIndex" in $$props) scrollIndex = $$props.scrollIndex;
    		if ("maxScrollIndex" in $$props) maxScrollIndex = $$props.maxScrollIndex;
    		if ("scrollCB" in $$props) $$invalidate(2, scrollCB = $$props.scrollCB);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [parent, canvasElement, scrollCB, canvas_binding, div_binding];
    }

    class Cody extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cody",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Main/index.svelte generated by Svelte v3.24.1 */

    const { window: window_1$1 } = globals;
    const file$5 = "src/Main/index.svelte";

    function create_fragment$5(ctx) {
    	let main;
    	let div6;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let cody;
    	let t1;
    	let schaaf;
    	let t2;
    	let arrow;
    	let t3;
    	let div5;
    	let div4;
    	let div3;
    	let h1;
    	let t5;
    	let hr;
    	let t6;
    	let h4;
    	let t8;
    	let p;
    	let current;
    	let mounted;
    	let dispose;
    	cody = new Cody({ $$inline: true });
    	schaaf = new Schaaf({ $$inline: true });

    	arrow = new Arrow({
    			props: { height: /*$heightStore*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			div6 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(cody.$$.fragment);
    			t1 = space();
    			create_component(schaaf.$$.fragment);
    			t2 = space();
    			create_component(arrow.$$.fragment);
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome!";
    			t5 = space();
    			hr = element("hr");
    			t6 = space();
    			h4 = element("h4");
    			h4.textContent = "About Me";
    			t8 = space();
    			p = element("p");
    			p.textContent = "You've probably already figured this out, but my name is Cody\n            Schaaf. I'm a full stack engineer at Sigfig. My expertise is in\n            Angular and Scala, and am experienced in Ruby on Rails, React,\n            JQuery and many more, but my true skills reside in my ability to\n            pick up any language or framework quickly and efficiently. My\n            passion is obtaining deep understanding of all the technologies I\n            work with. Which allows me to take full advantage of them, as well\n            as become the person people turn to for help allowing my team to be\n            as affective as possible.";
    			attr_dev(div0, "class", "container home svelte-1f7fisa");
    			add_location(div0, file$5, 67, 4, 1653);
    			attr_dev(div1, "class", "intro svelte-1f7fisa");
    			set_style(div1, "height", window.innerHeight + "px");
    			toggle_class(div1, "introFixed", /*introFixed*/ ctx[3]);
    			add_location(div1, file$5, 69, 6, 1762);
    			attr_dev(div2, "class", "intro-container svelte-1f7fisa");
    			set_style(div2, "height", /*$heightStore*/ ctx[4] + "px");
    			add_location(div2, file$5, 68, 4, 1692);
    			attr_dev(h1, "class", "text-center svelte-1f7fisa");
    			add_location(h1, file$5, 87, 10, 2231);
    			attr_dev(hr, "class", "svelte-1f7fisa");
    			add_location(hr, file$5, 88, 10, 2279);
    			attr_dev(h4, "class", "svelte-1f7fisa");
    			add_location(h4, file$5, 89, 10, 2296);
    			attr_dev(p, "class", "svelte-1f7fisa");
    			add_location(p, file$5, 91, 10, 2325);
    			attr_dev(div3, "class", "about-me container svelte-1f7fisa");
    			add_location(div3, file$5, 86, 8, 2188);
    			attr_dev(div4, "class", "about-me-container svelte-1f7fisa");
    			add_location(div4, file$5, 85, 6, 2147);
    			attr_dev(div5, "class", "sections-container svelte-1f7fisa");
    			set_style(div5, "height", /*sectionsContainerHeight*/ ctx[0] + "px");
    			add_location(div5, file$5, 80, 4, 2006);
    			attr_dev(div6, "class", "svelte-1f7fisa");
    			add_location(div6, file$5, 66, 2, 1643);
    			attr_dev(main, "class", "svelte-1f7fisa");
    			toggle_class(main, "stopScroll", /*stopScroll*/ ctx[5]);
    			add_location(main, file$5, 65, 0, 1617);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t0);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			mount_component(cody, div1, null);
    			append_dev(div1, t1);
    			mount_component(schaaf, div1, null);
    			append_dev(div1, t2);
    			mount_component(arrow, div1, null);
    			/*div1_binding*/ ctx[8](div1);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t5);
    			append_dev(div3, hr);
    			append_dev(div3, t6);
    			append_dev(div3, h4);
    			append_dev(div3, t8);
    			append_dev(div3, p);
    			/*div5_binding*/ ctx[9](div5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1$1, "resize", /*handleResize*/ ctx[7], false, false, false),
    					listen_dev(window_1$1, "scroll", /*handleScroll*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const arrow_changes = {};
    			if (dirty & /*$heightStore*/ 16) arrow_changes.height = /*$heightStore*/ ctx[4];
    			arrow.$set(arrow_changes);

    			if (dirty & /*introFixed*/ 8) {
    				toggle_class(div1, "introFixed", /*introFixed*/ ctx[3]);
    			}

    			if (!current || dirty & /*$heightStore*/ 16) {
    				set_style(div2, "height", /*$heightStore*/ ctx[4] + "px");
    			}

    			if (!current || dirty & /*sectionsContainerHeight*/ 1) {
    				set_style(div5, "height", /*sectionsContainerHeight*/ ctx[0] + "px");
    			}

    			if (dirty & /*stopScroll*/ 32) {
    				toggle_class(main, "stopScroll", /*stopScroll*/ ctx[5]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cody.$$.fragment, local);
    			transition_in(schaaf.$$.fragment, local);
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cody.$$.fragment, local);
    			transition_out(schaaf.$$.fragment, local);
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(cody);
    			destroy_component(schaaf);
    			destroy_component(arrow);
    			/*div1_binding*/ ctx[8](null);
    			/*div5_binding*/ ctx[9](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $heightStore;
    	validate_store(heightStore, "heightStore");
    	component_subscribe($$self, heightStore, $$value => $$invalidate(4, $heightStore = $$value));
    	let sectionsContainerHeight;
    	let introEl;
    	let sectionsContainerEl;
    	let introFixed;
    	let stopScroll = true;

    	const handleScroll = () => {
    		$$invalidate(3, introFixed = window.scrollY + window.innerHeight < $heightStore);
    	};

    	const handleResize = () => {
    		heightStore.set(window.innerHeight * 5);
    		const footerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--footer-height"));

    		$$invalidate(0, sectionsContainerHeight = window.innerHeight - footerHeight > sectionsContainerEl.offsetHeight
    		? window.innerHeight - footerHeight
    		: sectionsContainerEl.offsetHeight);
    	};

    	onMount(handleResize);
    	onMount(handleScroll);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Main> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Main", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			introEl = $$value;
    			$$invalidate(1, introEl);
    		});
    	}

    	function div5_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			sectionsContainerEl = $$value;
    			$$invalidate(2, sectionsContainerEl);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Arrow,
    		Schaaf,
    		Cody,
    		onMount,
    		heightStore,
    		sectionsContainerHeight,
    		introEl,
    		sectionsContainerEl,
    		introFixed,
    		stopScroll,
    		handleScroll,
    		handleResize,
    		$heightStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("sectionsContainerHeight" in $$props) $$invalidate(0, sectionsContainerHeight = $$props.sectionsContainerHeight);
    		if ("introEl" in $$props) $$invalidate(1, introEl = $$props.introEl);
    		if ("sectionsContainerEl" in $$props) $$invalidate(2, sectionsContainerEl = $$props.sectionsContainerEl);
    		if ("introFixed" in $$props) $$invalidate(3, introFixed = $$props.introFixed);
    		if ("stopScroll" in $$props) $$invalidate(5, stopScroll = $$props.stopScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		sectionsContainerHeight,
    		introEl,
    		sectionsContainerEl,
    		introFixed,
    		$heightStore,
    		stopScroll,
    		handleScroll,
    		handleResize,
    		div1_binding,
    		div5_binding
    	];
    }

    class Main extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Main",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Footer/index.svelte generated by Svelte v3.24.1 */
    const file$6 = "src/Footer/index.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let link0;
    	let t0;
    	let small;
    	let t1;
    	let t2_value = new Date().getFullYear() + "";
    	let t2;
    	let t3;
    	let link1;
    	let current;

    	link0 = new Link({
    			props: {
    				href: "http://blog.codyschaaf.com",
    				text: "My Blog"
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				href: "https://svelte.dev/",
    				text: "Svelte"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(link0.$$.fragment);
    			t0 = space();
    			small = element("small");
    			t1 = text("© ");
    			t2 = text(t2_value);
    			t3 = text(", Built with\n    ");
    			create_component(link1.$$.fragment);
    			attr_dev(div0, "class", "svelte-tzx33z");
    			add_location(div0, file$6, 17, 2, 287);
    			attr_dev(small, "class", "svelte-tzx33z");
    			add_location(small, file$6, 20, 2, 366);
    			attr_dev(div1, "class", "footer svelte-tzx33z");
    			add_location(div1, file$6, 16, 0, 264);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(link0, div0, null);
    			append_dev(div1, t0);
    			append_dev(div1, small);
    			append_dev(small, t1);
    			append_dev(small, t2);
    			append_dev(small, t3);
    			mount_component(link1, small, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(link0);
    			destroy_component(link1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ Link });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var particles_min = createCommonjsModule(function (module) {
    /*!
     * A lightweight, dependency-free and responsive javascript plugin for particle backgrounds.
     *
     * @author Marc Bruederlin <hello@marcbruederlin.com>
     * @version 2.2.3
     * @license MIT
     * @see https://github.com/marcbruederlin/particles.js
     */
    var Particles=function(e,t){var n,i={};function o(e,t){return e.x<t.x?-1:e.x>t.x?1:e.y<t.y?-1:e.y>t.y?1:0}return (n=function(){return function(){var e=this;e.defaults={responsive:null,selector:null,maxParticles:100,sizeVariations:3,showParticles:!0,speed:.5,color:"#000000",minDistance:120,connectParticles:!1},e.element=null,e.context=null,e.ratio=null,e.breakpoints=[],e.activeBreakpoint=null,e.breakpointSettings=[],e.originalSettings=null,e.storage=[],e.usingPolyfill=!1;}}()).prototype.init=function(e){var t=this;return t.options=t._extend(t.defaults,e),t.originalSettings=JSON.parse(JSON.stringify(t.options)),t._animate=t._animate.bind(t),t._initializeCanvas(),t._initializeEvents(),t._registerBreakpoints(),t._checkResponsive(),t._initializeStorage(),t._animate(),t},n.prototype.destroy=function(){var t=this;t.storage=[],t.element.remove(),e.removeEventListener("resize",t.listener,!1),e.clearTimeout(t._animation),cancelAnimationFrame(t._animation);},n.prototype._initializeCanvas=function(){var n,i,o=this;if(!o.options.selector)return console.warn("particles.js: No selector specified! Check https://github.com/marcbruederlin/particles.js#options"),!1;o.element=t.querySelector(o.options.selector),o.context=o.element.getContext("2d"),n=e.devicePixelRatio||1,i=o.context.webkitBackingStorePixelRatio||o.context.mozBackingStorePixelRatio||o.context.msBackingStorePixelRatio||o.context.oBackingStorePixelRatio||o.context.backingStorePixelRatio||1,o.ratio=n/i,o.element.width=o.element.offsetParent?o.element.offsetParent.clientWidth*o.ratio:o.element.clientWidth*o.ratio,o.element.offsetParent&&"BODY"===o.element.offsetParent.nodeName?o.element.height=e.innerHeight*o.ratio:o.element.height=o.element.offsetParent?o.element.offsetParent.clientHeight*o.ratio:o.element.clientHeight*o.ratio,o.element.style.width="100%",o.element.style.height="100%",o.context.scale(o.ratio,o.ratio);},n.prototype._initializeEvents=function(){var t=this;t.listener=function(){t._resize();}.bind(this),e.addEventListener("resize",t.listener,!1);},n.prototype._initializeStorage=function(){var e=this;e.storage=[];for(var t=e.options.maxParticles;t--;)e.storage.push(new i(e.context,e.options));},n.prototype._registerBreakpoints=function(){var e,t,n,i=this,o=i.options.responsive||null;if("object"==typeof o&&null!==o&&o.length){for(e in o)if(n=i.breakpoints.length-1,t=o[e].breakpoint,o.hasOwnProperty(e)){for(;n>=0;)i.breakpoints[n]&&i.breakpoints[n]===t&&i.breakpoints.splice(n,1),n--;i.breakpoints.push(t),i.breakpointSettings[t]=o[e].options;}i.breakpoints.sort(function(e,t){return t-e});}},n.prototype._checkResponsive=function(){var t,n=this,i=!1,o=e.innerWidth;if(n.options.responsive&&n.options.responsive.length&&null!==n.options.responsive){for(t in i=null,n.breakpoints)n.breakpoints.hasOwnProperty(t)&&o<=n.breakpoints[t]&&(i=n.breakpoints[t]);null!==i?(n.activeBreakpoint=i,n.options=n._extend(n.options,n.breakpointSettings[i])):null!==n.activeBreakpoint&&(n.activeBreakpoint=null,i=null,n.options=n._extend(n.options,n.originalSettings));}},n.prototype._refresh=function(){this._initializeStorage(),this._draw();},n.prototype._resize=function(){var t=this;t.element.width=t.element.offsetParent?t.element.offsetParent.clientWidth*t.ratio:t.element.clientWidth*t.ratio,t.element.offsetParent&&"BODY"===t.element.offsetParent.nodeName?t.element.height=e.innerHeight*t.ratio:t.element.height=t.element.offsetParent?t.element.offsetParent.clientHeight*t.ratio:t.element.clientHeight*t.ratio,t.context.scale(t.ratio,t.ratio),clearTimeout(t.windowDelay),t.windowDelay=e.setTimeout(function(){t._checkResponsive(),t._refresh();},50);},n.prototype._animate=function(){var t=this;t._draw(),t._animation=e.requestAnimFrame(t._animate);},n.prototype.resumeAnimation=function(){this._animation||this._animate();},n.prototype.pauseAnimation=function(){var t=this;if(t._animation){if(t.usingPolyfill)e.clearTimeout(t._animation);else (e.cancelAnimationFrame||e.webkitCancelAnimationFrame||e.mozCancelAnimationFrame)(t._animation);t._animation=null;}},n.prototype._draw=function(){var t=this,n=t.element,i=n.offsetParent?n.offsetParent.clientWidth:n.clientWidth,r=n.offsetParent?n.offsetParent.clientHeight:n.clientHeight,a=t.options.showParticles,s=t.storage;n.offsetParent&&"BODY"===n.offsetParent.nodeName&&(r=e.innerHeight),t.context.clearRect(0,0,n.width,n.height),t.context.beginPath();for(var l=s.length;l--;){var c=s[l];a&&c._draw(),c._updateCoordinates(i,r);}t.options.connectParticles&&(s.sort(o),t._updateEdges());},n.prototype._updateEdges=function(){for(var e=this,t=e.options.minDistance,n=Math.sqrt,i=Math.abs,o=e.storage,r=o.length,a=0;a<r;a++)for(var s=o[a],l=a+1;l<r;l++){var c,f=o[l],p=s.x-f.x,h=s.y-f.y;if(c=n(p*p+h*h),i(p)>t)break;c<=t&&e._drawEdge(s,f,1.2-c/t);}},n.prototype._drawEdge=function(e,t,n){var i=this,o=i.context.createLinearGradient(e.x,e.y,t.x,t.y),r=this._hex2rgb(e.color),a=this._hex2rgb(t.color);o.addColorStop(0,"rgba("+r.r+","+r.g+","+r.b+","+n+")"),o.addColorStop(1,"rgba("+a.r+","+a.g+","+a.b+","+n+")"),i.context.beginPath(),i.context.strokeStyle=o,i.context.moveTo(e.x,e.y),i.context.lineTo(t.x,t.y),i.context.stroke(),i.context.fill(),i.context.closePath();},n.prototype._extend=function(e,t){return Object.keys(t).forEach(function(n){e[n]=t[n];}),e},n.prototype._hex2rgb=function(e){var t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t?{r:parseInt(t[1],16),g:parseInt(t[2],16),b:parseInt(t[3],16)}:null},(i=function(n,i){var o=this,r=Math.random,a=i.speed,s=i.color instanceof Array?i.color[Math.floor(Math.random()*i.color.length)]:i.color;o.context=n,o.options=i;var l=t.querySelector(i.selector);o.x=l.offsetParent?r()*l.offsetParent.clientWidth:r()*l.clientWidth,l.offsetParent&&"BODY"===l.offsetParent.nodeName?o.y=r()*e.innerHeight:o.y=l.offsetParent?r()*l.offsetParent.clientHeight:r()*l.clientHeight,o.vx=r()*a*2-a,o.vy=r()*a*2-a,o.radius=r()*r()*i.sizeVariations,o.color=s,o._draw();}).prototype._draw=function(){var e=this;e.context.save(),e.context.translate(e.x,e.y),e.context.moveTo(0,0),e.context.beginPath(),e.context.arc(0,0,e.radius,0,2*Math.PI,!1),e.context.fillStyle=e.color,e.context.fill(),e.context.restore();},i.prototype._updateCoordinates=function(e,t){var n=this,i=n.x+this.vx,o=n.y+this.vy,r=n.radius;i+r>e?i=r:i-r<0&&(i=e-r),o+r>t?o=r:o-r<0&&(o=t-r),n.x=i,n.y=o;},e.requestAnimFrame=function(){var t=e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame;return t||(this._usingPolyfill=!0,function(t){return e.setTimeout(t,1e3/60)})}(),new n}(window,document);!function(){module.exports?module.exports=Particles:window.Particles=Particles;}();
    });

    /* src/Background/index.svelte generated by Svelte v3.24.1 */
    const file$7 = "src/Background/index.svelte";

    function create_fragment$7(ctx) {
    	let canvas;

    	const block = {
    		c: function create() {
    			canvas = element("canvas");
    			attr_dev(canvas, "class", "background svelte-1hraxk0");
    			set_style(canvas, "opacity", ".3");
    			add_location(canvas, file$7, 20, 0, 422);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	onMount(() => {
    		particles_min.init({
    			selector: ".background",
    			connectParticles: true,
    			color: getComputedStyle(document.documentElement).getPropertyValue("--accent"),
    			maxParticles: 40
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Background> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Background", $$slots, []);
    	$$self.$capture_state = () => ({ onMount, Particles: particles_min });
    	return [];
    }

    class Background extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Background",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.1 */
    const file$8 = "src/App.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let background;
    	let t0;
    	let header;
    	let t1;
    	let main;
    	let t2;
    	let footer;
    	let current;
    	background = new Background({ $$inline: true });
    	header = new Header({ $$inline: true });
    	main = new Main({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(background.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(main.$$.fragment);
    			t2 = space();
    			create_component(footer.$$.fragment);
    			set_style(div, "height", "100%");
    			attr_dev(div, "class", "svelte-bhxcwd");
    			toggle_class(div, "stopScroll", /*stopScroll*/ ctx[0]);
    			add_location(div, file$8, 41, 0, 855);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(background, div, null);
    			append_dev(div, t0);
    			mount_component(header, div, null);
    			append_dev(div, t1);
    			mount_component(main, div, null);
    			append_dev(div, t2);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*stopScroll*/ 1) {
    				toggle_class(div, "stopScroll", /*stopScroll*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(main.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(main.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(background);
    			destroy_component(header);
    			destroy_component(main);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let stopScroll = true;

    	const unsubscribe = renderWatcher.subscribe(({ doneDrawing }) => {
    		if (doneDrawing) {
    			$$invalidate(0, stopScroll = false);
    			unsubscribe();
    		}
    	});

    	onMount(() => {
    		window.scrollTo(0, 0);

    		setTimeout(function () {
    			window.scrollTo(0, 0);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Header,
    		Main,
    		Footer,
    		Background,
    		renderWatcher,
    		onMount,
    		stopScroll,
    		unsubscribe
    	});

    	$$self.$inject_state = $$props => {
    		if ("stopScroll" in $$props) $$invalidate(0, stopScroll = $$props.stopScroll);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stopScroll];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {},
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

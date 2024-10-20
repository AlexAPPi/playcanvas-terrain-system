;(() => {

	const defs     = {};
	const resolved = {};

	// save original define and require
	window.___amd___OriginalDefine  = window.define;
	window.___amd___OriginalRequire = window.require;

	if (!window.define && !window.require) {

		const define = (id, deps, factory) => {

			if (defs[id]) {
				throw new Error('Duplicate definition for ' + id);
			}

			defs[id] = [deps, factory];
		}

		define.amd = {
			bundle: true,   // this implementation works only with bundled amd modules
			dynamic: false, // does not support dynamic or async loading
		};

		const require = (id) => {

			if (id === 'require') return require;
			if (id === 'exports') return {};
			if (resolved[id])     return resolved[id];

			if (!defs[id]) {
				console.log(defs, id);
				throw new Error('No definition for ' + id);
			}

			const moduleExports = {};
			const deps    = defs[id][0];
			const factory = defs[id][1];
			const args = deps.map(dep => {

				if (dep === 'exports') {
					return moduleExports;
				}

				return require(dep);
			});

			factory.apply(null, args);

			return resolved[id] = moduleExports;
		}
		
		window.define  = define;
		window.require = require;
	}

	window.___amd___requireResolver = () => {

		for (const id in defs) {

			if (defs.hasOwnProperty(id)) {

				const deps = defs[id][0];
				
				if (deps) {
					deps.map(dep => {
	
						if (dep !== 'require' &&
							dep !== 'exports') {

							if (!resolved.hasOwnProperty(dep)) {
								require(dep);
							}

							if (!defs.hasOwnProperty(dep) &&
								!resolved.hasOwnProperty(dep)) {
								
								throw new Error(`Failed define '${id}' dep not found '${dep}'`);
							}
						}
					});
				}

				require(id);

				delete defs[id];
			}
		}
		
		// return original define and require
		window.define  = window.___amd___OriginalDefine;
		window.require = window.___amd___OriginalRequire;

		// clear
		delete window.___amd___requireResolver;
		delete window.___amd___OriginalDefine;
		delete window.___amd___OriginalRequire;
	};
})();
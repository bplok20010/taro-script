const pkg = require("./package.json");
module.exports = function (options, state) {
	return {
		babel: {
			plugins: [
				[
					"search-and-replace",
					{
						rules: [
							{
								search: "%VERSION%",
								replace: pkg.version,
							},
						],
					},
				],
			],
		},
	};
};

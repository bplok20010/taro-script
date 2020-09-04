module.exports = api => {
	const isTest = api.env("test");
	if (!isTest) return {};

	return {
		presets: [
			[
				"babel-preset-packez",
				{
					modules: "cjs",
				},
			],
		],
	};
};

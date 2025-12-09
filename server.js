const app = require("./app");
const config = require("./config");

const port = config.port || 3000;

app.listen(port, () => {
	console.log(`Server listening at http://localhost:${port}`);
});

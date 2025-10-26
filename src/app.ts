import app from "./config/app";
import logger from "./config/logger";

if (require.main === module) {
	app.listen(3000, () => {
		logger.info(`Server is running on http://localhost:3000`);
	});
}

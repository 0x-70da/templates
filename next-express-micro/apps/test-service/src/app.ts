import { createApp } from "@workspace/service-kit";
import router from "./routes/index.js";

export default createApp({ name: "test-service", routes: router });

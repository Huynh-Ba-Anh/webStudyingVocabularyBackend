import axios from "axios";

const URL = "https://webstudying-vocabulary-be.onrender.com";

const keepAlive = async () => {
    try {
        await axios.get(URL);
        console.log("✅ Keep-alive: Server pinged successfully!");
    } catch (err) {
        console.error("⚠️ Keep-alive failed:", err.message);
    }
};

setInterval(keepAlive, 5 * 60 * 1000);

keepAlive();

import { log } from "../utils/logging.js";
import { initSensesiotCreditProducts } from "./sensesiot/shop.js";
import { initCoinProducts } from "./shop.js";
import { initDevUsers } from "./user.js";

export async function init() {
  log("Init Start", { name: "Init" });

  await initDevUsers();
  await initCoinProducts();
  await initSensesiotCreditProducts();

  log("Init Complete", { name: "Init" });
}

export default Object.freeze({
  init,
});

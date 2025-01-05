"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const start = async () => {
    await (0, server_1.startWebServer)();
};
start()
    .then(() => {
    console.log('Done');
})
    .catch((error) => {
    console.error(error);
});
//# sourceMappingURL=start.js.map
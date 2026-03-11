"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRetry = withRetry;
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.logRequest = logRequest;
async function withRetry(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 第${attempt}次尝试`);
            return await operation();
        }
        catch (error) {
            lastError = error;
            console.error(`❌ 第${attempt}次尝试失败:`, lastError.message);
            if (attempt < maxRetries) {
                const delay = baseDelay * attempt;
                console.log(`⏳ ${delay}ms后重试...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error(`❌ 所有${maxRetries}次重试都失败了`);
    throw lastError;
}
function getCurrentTimestamp() {
    return new Date().toISOString();
}
function logRequest(method, path) {
    console.log(`${getCurrentTimestamp()} - ${method} ${path}`);
}
//# sourceMappingURL=retry.js.map
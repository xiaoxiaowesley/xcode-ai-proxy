"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalIPAddresses = getLocalIPAddresses;
exports.getPrimaryLocalIP = getPrimaryLocalIP;
exports.getServerUrls = getServerUrls;
const os_1 = require("os");
function getLocalIPAddresses() {
    const interfaces = (0, os_1.networkInterfaces)();
    const addresses = [];
    for (const interfaceName in interfaces) {
        const interfaceData = interfaces[interfaceName];
        if (!interfaceData)
            continue;
        for (const alias of interfaceData) {
            if (alias.family === 'IPv4' && !alias.internal) {
                addresses.push(alias.address);
            }
        }
    }
    return addresses;
}
function getPrimaryLocalIP() {
    const addresses = getLocalIPAddresses();
    const privateIP = addresses.find(ip => ip.startsWith('192.168.') ||
        ip.startsWith('10.') ||
        ip.startsWith('172.'));
    return privateIP || addresses[0] || 'localhost';
}
function getServerUrls(host, port) {
    const urls = [];
    if (host === '0.0.0.0' || host === '::') {
        urls.push(`http://localhost:${port}`);
        const localIPs = getLocalIPAddresses();
        localIPs.forEach(ip => {
            urls.push(`http://${ip}:${port}`);
        });
    }
    else {
        urls.push(`http://${host}:${port}`);
    }
    return urls;
}
//# sourceMappingURL=network.js.map
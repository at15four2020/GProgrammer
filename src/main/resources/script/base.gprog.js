load("nashorn:mozilla_compat.js");
importPackage("G_Earth.GProgrammer");

print('Welocme to ECMAScript 6 world!\n');

function loadScript(name) {
    if (name == undefined) return

    load('classpath:script/' + name + '.gprog.js');
}

function clear() {
    ExecuteScript.sw.clear()
}

/**
 * @typedef GEarthHPacket
 * @type {object}
 * 
 * @property {function():number} headerId
 * @property {function():number} length
 * @property {function():number} getBytesLength
 * @property {function():number} getReadIndex
 * @property {function(number):void} setReadIndex
 * @property {function():void} resetReadIndex
 * 
 * @property {function(string=):string} toExpression If [direction] is passed, use HarbleAPI to convert with it's structure
 * @property {function():string} stringify Converts the bytes directly to UTF8 string
 * @property {function():string} toString Create a string version of this packet
 * @property {function():number[]} toBytes
 * 
 * @property {function():number} isEOF
 * @property {function():boolean} isCorrupted
 * @property {function():boolean} isReplaced
 * @property {function():void} fixLength
 * 
 * @property {function(boolean):void} overrideEditedField
 * 
 * @property {function(number=):string} readBoolean Read boolean at [position]
 * @property {function(number=):number} readByte Read byte at [position]
 * @property {function(number, number=):number} readBytes Read [length] bytes at [position]
 * @property {function(number=):number} readShort Read shot at [position]
 * @property {function(number=):number} readUshort Read unsigned shot at [position]
 * @property {function(number=):number} readInteger Read integer at [position]
 * @property {function(number=):number} readDouble Read double at [position]
 * @property {function(number=):number} readLong Read long at [position]
 * @property {function(number=, number=):string} readString Read string at [position] with [length]
 * @property {function(number=):string} readLongString Read long string at [position]
 * 
 * @property {function():boolean} canReadString Check if the next string don't overflow the bytes
 * 
 * @property {function(number, boolean):GEarthHPacket} replaceBoolean Replace boolean at [position] with [boolean]
 * @property {function(number, number):GEarthHPacket} replaceByte Replace byte at [position] with [byte]
 * @property {function(number, number[]):GEarthHPacket} replaceBytes Replace bytes at [position] with [bytes[]]
 * @property {function(number, number):GEarthHPacket} replaceShort Replace shot at [position] with [shot]
 * @property {function(number, number):GEarthHPacket} replaceUShort Replace unsigned shot at [position] with [unsigned shot]
 * @property {function(number, number):GEarthHPacket} replaceInt Replace integer at [position] with [integer]
 * @property {function(number, number):GEarthHPacket} replaceDouble Replace double at [position] with [double]
 * @property {function(number, string):GEarthHPacket} replaceString Replace string at [position] with [string]
 * 
 * @property {function(string, string, number):GEarthHPacket} replaceXSubstrings
 * @property {function(string, string):GEarthHPacket} replaceAllSubstrings Alias to `replaceXSubstrings(string, string, -1)`
 * @property {function(string, string):GEarthHPacket} replaceFirstSubstring Alias to `replaceXSubstrings(string, string, 1)`
 * @property {function(string, string, number):GEarthHPacket} replaceXStrings
 * @property {function(string, string):GEarthHPacket} replaceAllStrings Alias to `replaceXStrings(string, string, -1)`
 * @property {function(string, string):GEarthHPacket} replaceFirstString Alias to `replaceXStrings(string, string, 1)`
 * @property {function(number, number):GEarthHPacket} replaceAllIntegers
 * 
 * @property {function(boolean):GEarthHPacket} appendBoolean
 * @property {function(number):GEarthHPacket} appendByte
 * @property {function(number[]):GEarthHPacket} appendBytes
 * @property {function(number):GEarthHPacket} appendUShort
 * @property {function(number):GEarthHPacket} appendShort
 * @property {function(number):GEarthHPacket} appendInt
 * @property {function(number):GEarthHPacket} appendDouble
 * @property {function(string):GEarthHPacket} appendString
 * @property {function(string):GEarthHPacket} appendLongString
 * 
 * @property {function(number, number):GEarthHPacket} removeRange Remove certain range of bytes
 * @property {function(number):GEarthHPacket} removeFrom Alias to `removeRange(index, packetInBytes.length - index)`
 * 
 * @property {function(string):void} constructFromString
 * @property {function(string):boolean} structureEquals
 * @property {function(GEarthHPacket):boolean} equals
 */

/**
 * @typedef TOSERVER
 * @type {object}
 * @constant
 */
var TOSERVER = Java.type("gearth.protocol.HMessage.Direction").TOSERVER
/**
 * @typedef TOCLIENT
 * @type {object}
 * @constant
 */
var TOCLIENT = Java.type("gearth.protocol.HMessage.Direction").TOCLIENT
/**
 * @typedef GEarthHMessageDirection
 * @type {TOSERVER|TOCLIENT}
 */

/**
 * @typedef GEarthHMessage
 * @type {object}
 * 
 * @property {function():number} getIndex
 * @property {function(boolean):void} setBlocked
 * @property {function():boolean} isBlocked
 * @property {function():GEarthHPacket} getPacket
 * @property {function():GEarthHMessageDirection} getDestination
 * @property {function():boolean} isCorrupted
 * @property {function():string} stringify
 * @property {function(string):void} constructFromString
 * @property {function(GEarthHMessage):void} constructFromHMessage
 * @property {function(GEarthHMessage):boolean} equals
 */

/**
 * @typedef PacketListener
 * @type {function(GEarthHMessage)}
 */

/**
 * @type {PacketListener[][]}
 * @constant
 */
var _toClientListeners = {};

/**
 * @type {PacketListener[][]}
 * @constant
 */
var _toServerListeners = {};

/**
 *
 *
 * @param {GEarthHMessage} message
 */
function _intercepted(message) {
    var side = message.getDestination()
    var packet = message.getPacket()
    var sideListeners = side == TOCLIENT ? _toClientListeners : _toServerListeners
    var handlers = sideListeners[packet.headerId()]

    if (!handlers) return

    handlers.forEach(function (handler) {
        try {
            handler.call(null, message)
        } catch (e) {
            print("Script fail -->\n\n")
            print(e)
            if (getBytes) {
                print("\nHere is the packet in bytes:\n")
                print(getBytes(message.getPacket()))
            }
            print("\n\n<-- Script fail\n")
        }
    })
}

/**
 * Starts intercepting packet coming from server and going to client
 *
 * @param {GEarthHMessageDirection} direction
 * @param {string|number} headerIdOrName
 * @param {function(GEarthHMessage)} handler
 */
function intercept(direction, headerIdOrName, handler) {
    if (headerIdOrName == undefined || handler == undefined) return

    var realHeaderId = headerIdOrName
    if (typeof headerIdOrName == "string") {
        realHeaderId = ExecuteScript.headerIdFromName(direction, headerIdOrName)

        if (realHeaderId == -1) {
            throw new Error("Header id not found for " + headerIdOrName)
        }
    }

    var listeners = direction == TOSERVER ? _toServerListeners : _toClientListeners

    if (!listeners[realHeaderId]) {
        listeners[realHeaderId] = []

        ExecuteScript.intercept(direction, realHeaderId);
    }

    listeners[realHeaderId].push(handler);
}

/**
 * Alias to `intercept(TOCLIENT, headerIdOrName, handler)`
 *
 * @param {string|number} headerIdOrName
 * @param {function(GEarthHMessage)} handler
 */
function interceptToClient(headerIdOrName, handler) {
    return intercept(TOCLIENT, headerIdOrName, handler)
}


/**
 * Alias to `intercept(TOSERVER, headerIdOrName, handler)`
 *
 * @param {string|number} headerIdOrName
 * @param {function(GEarthHMessage)} handler
 */
function interceptToServer(headerIdOrName, handler) {
    return intercept(TOSERVER, headerIdOrName, handler)
}

/**
 * 
 *
 * @param {GEarthHMessageDirection} direction
 * @param {GEarthHPacket} packet
 */
function send(direction, packet) {
    if (packet == undefined) return

    ExecuteScript.send(direction, packet);
}

/**
 * Alias to `send(TOSERVER, packet)`
 * 
 * @param {GEarthHPacket} packet
 */
function sendToServer(packet) {
    send(TOSERVER, packet);
}

/**
 * Alias to `send(TOCLIENT, packet)`
 * 
 * @param {GEarthHPacket} packet
 */
function sendToClient(packet) {
    send(TOCLIENT, packet);
}

/**
 * Create a packet with the given data
 *
 * @param {string|number} headerIdOrName
 * @param {number[]|object[]=} bytesOrObjects
 * @param {GEarthHMessageDirection=} direction
 * @returns {GEarthHPacket}
 */
function HPacket(headerIdOrName, bytesOrObjects, direction) {
    var headerId = headerIdOrName

    if (typeof headerIdOrName == "string") {
        if (typeof direction != "undefined") {
            headerId = ExecuteScript.headerIdFromName(direction, headerIdOrName)
            if (headerId == -1) {
                throw new Error("Unknown header id for " + headerIdOrName)
            }
        } else {
            throw new Error("Cannot define the header id without the current direction.")
        }
    } else if (["undefined", "number"].indexOf(typeof headerIdOrName) == -1) {
        throw new Error("Packet header must be a name or number id.")
    }

    if (bytesOrObjects != null) {
        return PacketConverter.create(headerId, bytesOrObjects);
    } else if (headerId != null) {
        return PacketConverter.create(headerId);
    }
}

/**
 * Alias to `HPacket(headerName, bytesOrObjects, TOSERVER)`
 * 
 * @param {string|number} headerName
 * @param {number[]|object[]} bytesOrObjects
 * @returns {GEarthHPacket}
 */
function HPacketToServer(headerName, bytesOrObjects) {
    return HPacket(headerName, bytesOrObjects, TOSERVER)
}

/**
 * Alias to `HPacket(headerName, bytesOrObjects, TOCLIENT)`
 * 
 * @param {string|number} headerName
 * @param {number[]|object[]} bytesOrObjects
 * @returns {GEarthHPacket}
 */
function HPacketToClient(headerName, bytesOrObjects) {
    return HPacket(headerName, bytesOrObjects, TOCLIENT)
}

function getBytes(packet) {
    return ExecuteScript.getBytes(packet)
}

const HOST = ExecuteScript.host
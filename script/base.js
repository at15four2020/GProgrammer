load("nashorn:mozilla_compat.js");
importPackage("G_Earth.GProgrammer");

print('Welocme to JavaScript world\\n');

function interceptFromServer(headerId) {
	ExecuteScript.intercept("TOCLIENT", headerId);
}

function interceptFromClient(headerId) {
	ExecuteScript.intercept("TOSERVER", headerId);
}

function sendToServer() {
	ExecuteScript.send("TOSERVER");
}

function sendToClient() {
	ExecuteScript.send("TOCLIENT");
}

class HPacket {
	packet = null;
	inBytes = new Uint8Array();
	readIndex = 6;
	constructor(...props) {
		const packet = PacketConverter.create(...props);
		this.packet = packet
		this.inBytes = packet.toBytes();
		this.readIndex = packet.getReadIndex();
	}
}
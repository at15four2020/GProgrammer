print("=========>> HELP GUIDE <<=========\n")

print(" Hi, I'm here to let you know all the functions that you can use to create your own Extension.\n")

print(" - print(any)")
print("    --> Print (almost) anything here.\n")

print(" - loadScript(name)")
print("   --> Loads an pre-build script. Available: 'help' (this) | 'parse_NewNavigatorSearchResults'\n")

print(" - interceptFromServer(headerIdOrName, handler)")
print("   --> Start intercepting packets from server with the headerId")
print(" - interceptFromClient(headerIdOrName, handler)")
print("   --> Start intercepting packets from client with the headerId\n")

print(" - sendToServer(packet)")
print("   --> Send the packet to the server")
print(" - sendToClient(packet)")
print("   --> Send the packet to the client\n")

print(" - HPacket(headerIdOrName, bytesOrObjects, direction)")
print("   --> Create a packet to be send, is the same as GEarth use, so all it's methods are available.\n")

print(" Here is some examples:\n")

print("function handle() {")
print("   print('latency test found')")
print("}")
print("interceptToServer(2056, handle) // LatencyTest\n")

print(" And another example:\n")

print("var wlk = HPacket(652, [3, 5]) // RoomUserWalk");
print("print(wlk.toExpression())")
print("sendToServer(wlk)\n")

print("==================================")
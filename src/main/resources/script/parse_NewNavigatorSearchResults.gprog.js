// parse_NewNavigatorSearchResults.js

var Parse = Parse || {}

Parse.NewNavigatorSearchResults = function parse_NewNavigatorSearchResults(packet) {
	var initialReadIndex = packet.getReadIndex()
	packet.resetReadIndex()

	var ROOM_FLAGS = {
		hasCustomThumbnail: 1 << 0,
		hasGroup: 1 << 1,
		hasAdvertisement: 1 << 2,
		showOwner: 1 << 3,
		allowPets: 1 << 4,
		showRoomAd: 1 << 5
	}
	var ROOM_DOOR_MODE = { // Specifies the types of door modes possible.
		0: "open", // Represents a room that is open to everyone.
		1: "door_bell", // Represents a room that requires ringing the doorbell to request access.
		2: "password", // Represents a room that requires a password to enter.
		3: "invisible" // Represents a room that is invisible in the navigator.
	}
	var ROOM_TRADE_MODE = { // Specifies the types of trade modes possible.
		0: "not_allowed", // Represents a room in which trading is not allowed.
		1: "controller", // Represents a room in which only the owner and users with room rights are allowed to trade.
		2: "allowed" // Represents a room in which everyone is allowed to trade.
	}
	var ROOM_CATEGORY = { // Specificies a list of all existing room categories.
		1: "public_rooms",
		2: "party",
		3: "habbo_games",
		4: "trade", // External flash texts variable for this category is missing.
		5: "fansite_square",
		6: "help_centers",
		7: "habbo_reviews",
		8: "builders_club",
		10: "personal_space",
		11: "building_and_decoration",
		12: "char_and_discussion",
		13: "trading",
		14: "trading",
		15: "habbo_life",
		16: "agencies",
		17: "role_playing"
	}
	var result = {}

	result.searchCode = packet.readString()
	result.searchText = packet.readString()
	result.qntGroups = packet.readInteger()

	if (result.qntGroups) result.groups = []
	for (var i = 0; i < result.qntGroups; i++) {
		var group = {}

		group.groupType = packet.readString()
		group.text = packet.readString()
		group.actionAllowed = packet.readInteger()
		group.forceClosed = packet.readBoolean()
		group.viewMode = packet.readInteger()
		group.qntRooms = packet.readInteger()

		if (group.qntRooms) group.rooms = []
		for (var j = 0; j < group.qntRooms; j++) {
			var room = {}

			room.roomId = packet.readInteger()
			room.roomName = packet.readString()
			room.ownerId = packet.readInteger()
			room.ownerName = packet.readString()
			room.doorMode = ROOM_DOOR_MODE[packet.readInteger()]
			room.roomUsersCount = packet.readInteger()
			room.roomUsersLimit = packet.readInteger()
			room.roomDesc = packet.readString()
			room.tradeMode = ROOM_TRADE_MODE[packet.readInteger()]
			room.roomRate = packet.readInteger()
			room.stars = packet.readInteger()
			room.roomCategory = ROOM_CATEGORY[packet.readInteger()]

			var qntTags = packet.readInteger()
			if (qntTags) room.tags = []
			for (var k = 0; k < qntTags; k++) {
				room.tags[k] = packet.readString()
			}

			var roomFlags = packet.readInteger()

			if (roomFlags & ROOM_FLAGS.hasCustomThumbnail) {
				room.thumbnailUrl = packet.readString()
			}

			if (roomFlags & ROOM_FLAGS.hasGroup) {
				room.groupId = packet.readInteger()
				room.groupName = packet.readString()
				room.badgeHashCode = packet.readString()
			}

			if (roomFlags & ROOM_FLAGS.hasAdvertisement) {
				room.eventName = packet.readString()
				room.eventDesc = packet.readString()
				room.eventValidity = packet.readInteger()
			}

			room.showOwner = !!(roomFlags & ROOM_FLAGS.showOwner)
			room.allowPets = !!(roomFlags & ROOM_FLAGS.allowPets)
			room.showEntryAd = !!(roomFlags & ROOM_FLAGS.showRoomAd)

			group.rooms[j] = room
		}

		result.groups[i] = group
	}

	packet.setReadIndex(initialReadIndex)

	return result
}
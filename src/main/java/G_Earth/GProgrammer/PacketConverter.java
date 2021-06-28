package G_Earth.GProgrammer;

import gearth.protocol.HPacket;

public class PacketConverter {

    public static HPacket create(byte[] packet) {
        return new HPacket(packet);
    }

    public static HPacket create(HPacket packet) {
        return new HPacket(packet);
    }

    public static HPacket create(String packet) {
        return new HPacket(packet);
    }

    public static HPacket create(int header) {
        return new HPacket(header);
    }

    public static HPacket create(int header, Object... objects) {
        for (int i = 0; i < objects.length; i++) {
            Object o = objects[i];
            if (o instanceof Double) {
                objects[i] = ((Double) o).intValue();
            }
        }
        return new HPacket(header, objects);
    }

}

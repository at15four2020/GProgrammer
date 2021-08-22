package G_Earth.GProgrammer;

import java.io.InputStreamReader;
import javax.script.*;

import gearth.protocol.HMessage;
import gearth.protocol.HPacket;
import gearth.protocol.HMessage.Direction;
import gearth.services.packet_info.PacketInfo;
import gearth.services.packet_info.PacketInfoManager;
import jdk.nashorn.api.scripting.NashornScriptEngineFactory;

public class ExecuteScript {

    public interface HandleIntercept {

        void act(Direction side, Integer headerId);
    }

    public interface HandleSend {

        void act(Direction side, HPacket packet);
    }

    // create a script engine manager
    private NashornScriptEngineFactory factory = new NashornScriptEngineFactory();
    // create a JavaScript engine
    private ScriptEngine engine = factory.getScriptEngine("--language=es6");

    public ExecuteScript(HandleIntercept inter, HandleSend send, ScriptOutput sw) {
        ExecuteScript.inter = inter;
        ExecuteScript.send = send;

        ScriptContext ctx = engine.getContext();
        ExecuteScript.sw = sw;
        ctx.setWriter(sw);
        ctx.setErrorWriter(sw);

    }

    private static HandleIntercept inter;
    private static HandleSend send;

    public static ScriptOutput sw;
    private static PacketInfoManager packetInfoManager;
    public static String host;

    public static Integer headerIdFromName(Direction side, String name) {
        PacketInfo message = packetInfoManager.getPacketInfoFromName(side, name);
        if (message != null) {
            return message.getHeaderId();
        }
        return -1;

    }

    public static void intercept(Direction side, Integer headerId) {
        ExecuteScript.inter.act(side, headerId);
    }

    public static void send(Direction side, HPacket packet) {
        ExecuteScript.send.act(side, packet);
    }

    public void runScript(String script) throws ScriptException {
        engine.setBindings(engine.createBindings(), ScriptContext.ENGINE_SCOPE);
        engine.eval(new InputStreamReader(getClass().getResourceAsStream("/script/base.gprog.js")));
        engine.eval(script);
    }

    public void handleIntercepted(HMessage message) {
        try {
            ((Invocable) engine).invokeFunction("_intercepted", message);
        } catch (NoSuchMethodException | ScriptException e) {
            sw.append("Script fail -->\n\n")
                    .append(e.toString())
                    .append("\n\n<-- Script fail\n");
        }
    }

    public void setPacketInfoManager(PacketInfoManager packetInfoManager) {
        ExecuteScript.packetInfoManager = packetInfoManager;
    }

    public static String getBytes(HPacket packet) {
        byte[] bytes = packet.toBytes();
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X ", b));
        }
        return sb.toString();
    }

    public void setHost(String host) {
        ExecuteScript.host = host;
    }

}

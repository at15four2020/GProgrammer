package G_Earth.GProgrammer;

import java.io.IOException;
import java.io.StringWriter;

public class ScriptOutput extends StringWriter {

    public interface handleLog {

        void act(String s, Boolean a);
    }

    private handleLog hl;

    ScriptOutput(handleLog hl) {
        this.hl = hl;
    }

    public void myAppend(Object o) {
        hl.act(o.toString(), true);
    }

    @Override
    public StringWriter append(char c) {
        myAppend(c);
        return this;
    }

    @Override
    public StringWriter append(CharSequence csq) {
        myAppend(csq);
        return this;
    }

    @Override
    public StringWriter append(CharSequence csq, int start, int end) {
        myAppend(csq.subSequence(start, end));
        return this;
    }

    @Override
    public void write(char[] cbuf) throws IOException {
        myAppend(cbuf);
    }

    @Override
    public void write(char[] cbuf, int off, int len) {
        String str = cbuf.toString();
        myAppend(str.substring(off, off + len));
    }

    @Override
    public void write(int c) {
        myAppend(c);
    }

    @Override
    public void write(String str) {
        myAppend(str);
    }

    @Override
    public void write(String str, int off, int len) {
        myAppend(str.substring(off, off + len));
    }

    public void clear() {
        hl.act("", false);
    }
}

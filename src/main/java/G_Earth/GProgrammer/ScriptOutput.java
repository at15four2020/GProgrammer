package G_Earth.GProgrammer;

import java.io.IOException;
import java.io.StringWriter;

public class ScriptOutput extends StringWriter {
	public interface handleLog {
    	void act(String s);
	}
	
	private handleLog hl;
	
	ScriptOutput(handleLog hl) {
		this.hl = hl;
	}
	
	public void update() {
		hl.act(this.toString());
	}
	
	@Override
	public StringWriter append(char c) {
		super.append(c);
		update();
		return this;
	}
	@Override
	public StringWriter append(CharSequence csq) {
		super.append(csq);
		update();
		return this;
	}
	@Override
	public StringWriter append(CharSequence csq, int start, int end) {
		super.append(csq, start, end);
		update();
		return this;
	}
	@Override
	public void write(char[] cbuf) throws IOException {
		super.write(cbuf);
		update();
	}
	@Override
	public void write(char[] cbuf, int off, int len) {
		super.write(cbuf, off, len);
		update();
	}
	@Override
	public void write(int c) {
		super.write(c);
		update();
	}
	@Override
	public void write(String str) {
		super.write(str);
		update();
	}
	@Override
	public void write(String str, int off, int len) {
		super.write(str, off, len);
		update();
	}
	
	public void clear() {
		super.getBuffer().setLength(0);
		update();
	}
}

package G_Earth.GProgrammer;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.script.ScriptException;

import javafx.event.ActionEvent;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.CheckMenuItem;
import javafx.scene.control.MenuItem;
import javafx.scene.control.TextArea;
import javafx.scene.image.Image;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import gearth.extensions.ExtensionForm;
import gearth.extensions.ExtensionInfo;
import gearth.misc.harble_api.HarbleAPI;
import gearth.protocol.HPacket;
import gearth.protocol.HMessage.Direction;

@ExtensionInfo(
        Title = "GProgrammer",
        Description = "Simple extension to let you create scripts",
        Version = "1.2",
        Author = "at15four2020"
)
public class GProgrammer extends ExtensionForm {

    public TextArea codeText;
    public TextArea outputText;
    private Boolean preserveLog = true;

    private Stage myStage;

    private ScriptOutput looger = new ScriptOutput(this::updateLog);
    private ExecuteScript runningScript = new ExecuteScript(this::startIntercept, this::handleSend, looger);
    private List<String> intercepting = new ArrayList<String>();

    public static void main(String[] args) {
        runExtensionForm(args, GProgrammer.class);
    }

    @Override
    public ExtensionForm launchForm(Stage primaryStage) throws Exception {
        FXMLLoader loader = new FXMLLoader(GProgrammer.class.getResource("/ui/gprogrammer.fxml"));
        Parent root = loader.load();

        primaryStage.getIcons().add(new Image(getClass().getResourceAsStream("/images/gprogrammer.png")));

        primaryStage.setTitle("GProgrammer");
        primaryStage.setScene(new Scene(root));

        myStage = primaryStage;

        return loader.getController();
    }

    @Override
    protected void initExtension() {
        onConnect((host, port, hotelversion, cachePath) -> {
            HarbleAPI harbleAPI = new HarbleAPI(hotelversion, cachePath);
            runningScript.setHarbleAPI(harbleAPI);
        });
    }

    private void startIntercept(Direction side, Integer headerId) {
        String sideString = side.toString();
        if (runningScript == null || intercepting.contains(sideString + headerId)) {
            return;
        }

        intercept(side, headerId, runningScript::handleIntercepted);

        String key = sideString.concat(headerId.toString());
        intercepting.add(key);
    }

    private void handleSend(Direction side, HPacket packet) {
        looger.append("\nENVIADO!\n\n");
        switch (side) {
            case TOCLIENT:
                sendToClient(packet);
                break;
            case TOSERVER:
                sendToServer(packet);
                break;
        }
    }

    public void handleSaveFile() {

        FileChooser fileChooser = new FileChooser();

        FileChooser.ExtensionFilter extFilter
                = new FileChooser.ExtensionFilter("GProg files (*.gprog.js)", "*.gprog.js");
        fileChooser.getExtensionFilters().add(extFilter);
        fileChooser.setTitle("Save GProgram File");

        File file = fileChooser.showSaveDialog(myStage);

        if (file != null) {

            try {
                FileWriter fileWriter = new FileWriter(file);
                BufferedWriter out = new BufferedWriter(fileWriter);
                out.write(codeText.getText());
                out.flush();
                out.close();
                fileWriter.close();
            } catch (IOException ex) {
                ex.printStackTrace();
            }

        }
    }

    public void handleLoadFile() {

        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Load GProgram File");
        fileChooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("GProg files", "*.gprog.js"));
        File selectedFile = fileChooser.showOpenDialog(myStage);
        if (selectedFile != null) {

            FileReader fr = null;
            try {
                fr = new FileReader(selectedFile);
                BufferedReader br = new BufferedReader(fr);

                StringBuilder sb = new StringBuilder();
                String line = null;

                while ((line = br.readLine()) != null) {
                    sb.append(line);
                    sb.append("\n");
                }
                codeText.setText(sb.toString());

                fr.close();
                br.close();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }

    }

    public void handleRun() throws IOException {
        if (!preserveLog) {
            looger.clear();
        }

        try {
            runningScript.runScript(codeText.getText());
        } catch (ScriptException e) {

            looger.append("Script fail -->\n\n")
                    .append(e.toString())
                    .append("\n\n<-- Script fail\n");
        }
    }

    public void handleClear() {
        looger.clear();
    }

    public void handleImport(ActionEvent e) {
        MenuItem item = (MenuItem) e.getSource();
        String text = item.getText();
        String urlToImport = "";

        switch (text) {
            case "setTimeout and setInterval":
                urlToImport = "https://gist.githubusercontent.com/kayhadrin/4bf141103420b79126e434dfcf6d4826/raw/a9174bacb2e4d0d8a619d2575b8de55a291c8786/js-timeout-polyfill.js"; //https://gist.githubusercontent.com/salomvary/5a295d32e0868ffde42a/raw/ea33f4daad419f419188b1c7f89d76bf8e385b4d/settimeout-nashorn.js";
                break;
            case "Promise":
                urlToImport = "https://cdn.jsdelivr.net/npm/es6-promise/dist/es6-promise.auto.min.js";
                looger.append("ALERT: Promise require setTimeout to be loaded first.\n\n");
                break;
            case "Underscore":
                urlToImport = "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.9.1/underscore-min.js";
                break;
            default:
                return;
        }

        String currentCode = codeText.getText();
        Integer caret = codeText.getCaretPosition();
        String textToInsert = "load(\"" + urlToImport + "\")\n";
        if (currentCode.contains(textToInsert)) {
            return;
        }

        StringBuffer sb = new StringBuffer(currentCode);
        sb.insert(0, textToInsert);
        codeText.setText(sb.toString());
        codeText.positionCaret(caret + textToInsert.length());
    }

    public void handleSnippet(ActionEvent e) {
        MenuItem item = (MenuItem) e.getSource();
        String text = item.getText();
        String snippetToImport = "";

        switch (text) {
            case "wait":
                snippetToImport = "var wait = function(ms) new Promise(function(resolve) setTimeout(resolve, ms));\n";
                looger.append("ALERT: wait snippet require setTimeout and Promise utils. Both must be loaded first.\n\n");
                break;
            default:
                return;
        }

        String currentCode = codeText.getText();
        if (currentCode.contains(snippetToImport)) {
            return;
        }

        Integer caret = codeText.getCaretPosition();
        StringBuffer sb = new StringBuffer(currentCode);
        sb.insert(0, snippetToImport);
        codeText.setText(sb.toString());
        codeText.positionCaret(caret + snippetToImport.length());
    }

    public void handlePreserveLog(ActionEvent e) {
        CheckMenuItem item = (CheckMenuItem) e.getSource();
        preserveLog = item.isSelected();
    }

    public void updateLog(String s, Boolean append) {
        if (append) {
            outputText.appendText(s);
        } else {
            outputText.setText(s);
            outputText.appendText("");
        }
    }

}

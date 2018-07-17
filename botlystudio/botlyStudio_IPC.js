'use strict';


/** Create a name space for the application. */
var BotlyStudioIPC = {};
const electron = require('electron');


const ipc = electron.ipcRenderer;


BotlyStudioIPC.initIPC = function(){
    ipc.on('compiler-request-response', function(event, arg) {
        BotlyStudio.setCompilerLocationHtml(arg);
    });
    ipc.on('serial-port-request-response', function(event, arg) {
      //BotlyStudio.setCompilerLocationHtml(arg);
    });
    ipc.on('port-request-response', function(event, arg) {
        var serialList = JSON.parse(arg);
            // Drop down list of unknown length with a selected item
        var element = document.createElement('select');
        element.name = serialList.response_type;
        for (var i = 0; i < serialList.options.length; i++) {
            var option = document.createElement('option');
            option.value = serialList.options[i].value;
            option.text = serialList.options[i].display_text;
            // Check selected option and mark it
            if (serialList.options[i].value == serialList.selected) {
                option.selected = true;
            }
            element.appendChild(option);
        }
    });
}

BotlyStudioIPC.createElementFromJson = function(json_data) {
    var parsed_json = JSON.parse(json_data);
    var element = null;
  
    if (parsed_json.element == 'text_input') {
      // Simple text input
      element = document.createElement('input');
      element.setAttribute('type', 'text');
      element.setAttribute('value', parsed_json.display_text);
    } else if (parsed_json.element == 'dropdown') {
      // Drop down list of unknown length with a selected item
      element = document.createElement('select');
      element.name = parsed_json.response_type;
      for (var i = 0; i < parsed_json.options.length; i++) {
        var option = document.createElement('option');
        option.value = parsed_json.options[i].value;
        option.text = parsed_json.options[i].display_text;
        // Check selected option and mark it
        if (parsed_json.options[i].value == parsed_json.selected) {
          option.selected = true;
        }
        element.appendChild(option);
      }
    } else if (parsed_json.element == 'div_ide_output') {
      // Formatted text for the Arduino IDE CLI output
      var el_title = document.createElement('h4');
      el_title.innerHTML = BotlyStudio.getLocalStr(parsed_json.conclusion);
      if (parsed_json.success == true) {
        el_title.className = 'arduino_dialog_success';
      } else {
        el_title.className = 'arduino_dialog_failure';
      }
  
      var el_out = document.createElement('span');
      el_out.className = 'arduino_dialog_out';
      // If larger than 50 characters then don't bother looking for language key
      if (parsed_json.output.length < 50) {
        el_out.innerHTML = BotlyStudio.getLocalStr(parsed_json.output) ||
                           parsed_json.output.split('\n').join('<br />');
      } else {
        el_out.innerHTML = parsed_json.output.split('\n').join('<br />');
      }
  
      element = document.createElement('div');
      element.appendChild(el_title);
      element.appendChild(el_out);
  
      // Only ouput error message if it was not successful
      if (parsed_json.success == false) {
        var el_err = document.createElement('span');
        el_err.className = 'arduino_dialog_out_error';
        // If larger than 50 characters then don't bother looking for language key
        if (parsed_json.output.length < 50) {
          el_err.innerHTML = BotlyStudio.getLocalStr(parsed_json.error_output) ||
                             parsed_json.error_output.split('\n').join('<br />');
        } else {
          el_err.innerHTML = parsed_json.error_output.split('\n').join('<br />');
        }
        element.appendChild(el_err);
      }
    } else {
      //TODO: Not recognised, alert the user/developer somehow
    }
  
    return element;
  };



/**
 * Gets the current Compiler location from the BotlyStudioIPC settings.
 */
BotlyStudioIPC.requestCompilerLocation = function() {
    ipc.send('compiler-request');
};


/**
 * Request to the BotlyStudio Server to prompt the user for a new compiler 
 * location. Done by the Python server because a 'file browse' triggered by
 * the browser with JS will obscure the user information for security reasons.
 */
BotlyStudioIPC.setCompilerLocation = function() {
    ipc.send('set-compiler');
};


/**
 * Request to the BotlyStudio Server to return JSON data containing all
 * available serial ports in the computer, and the selected one in the
 * settings. The data is then processed into an HTML element and sent to the
 * callback function as an argument.
 */
BotlyStudioIPC.requestSerialPorts = function() {
    ipc.send('serial-port-request');
};

/**
 * Sends the inputted Serial Port to the BotlyStudio Server Settings. The new
 * settings menu for the Serial Port is then processed into an HTML element
 * and sent to the callback function as an argument.
 * @param {!string} new_port Indicates which port has been selected.
 */
BotlyStudioIPC.setSerialPort = function(new_port) {
    ipc.send('set-port', new_port);
};


/**
 * Sends the Arduino code to the BotlyStudioIPC to be processed as defined
 * by the settings.
 * @param {!string} code Arduino code in a single string format.
 */
BotlyStudioIPC.sendSketchToServer = function(code) {
    ipc.send('code', code);
};

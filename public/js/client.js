var socket = io();
var serverup = false;
var mystackindex = -1;
var colors = palette('rainbow', 10);
var myColor = 0; // Fill this with whatever User ID
var sounding = true; //set this to false to disable local computing/sound

function colorify(message, color) {
    var m = "[[;#" + colors[color] + ";#000]" + message + "]";
    console.log(m);
    return m;
}

function runIncomingCommand(command) {
	if (!serverup) return;
    console.log(command);
    // Command: string with command to run
    // Color: string with the user color code
    for (var i=0;i<command.length;i++) {
        if (command[i].index > mystackindex) {
            if (command[i].color == myColor) continue;
            var com = command[i].text;
            mystackindex = command[i].index;
            try {
                if (sounding)
                    eval.apply(window,[com]);
            } catch(e) {
                var out = colorify(
                    "Error in incoming command: " + com + "\n" +
                    "    " + e.message,
                command[i].color);
                $("#terminal").terminal().echo(out);
            }
            $("#terminal").terminal().echo(colorify(com, command[i].color));
        }
    }
}

jQuery(document).ready(function($) {
	setInterval(serverReady, 1000);

    $('#terminal').terminal(function(command) {
        if(!serverup) {
            return $("#terminal").terminal().error("Server offline.");
        }
        socket.emit('sendLine', command);
        try {
            if (sounding)
                eval.apply(window, [command]);
        } catch (e) {
            $("#terminal").terminal().set_command(command);
            return colorify(e.message, myColor);
        }
        return colorify(command, myColor);
    }, {
        completion: ["add","addsamples","adsr","adsr32","beat","beat32","bounce","bp","chorus","clamp","clshift","delay","destroy","dfb","dlevel","dtime","eval","famt","fenv","ffreq","fres","group","hp","loop","lp","merge","nl","nl32","notch","notes","pan","play","remove","render","render32","reverse","rf","ri","root","sample","saw","select","shift","sine","speed","square","sseq","step","stretch","sync","track","trans","tremolo","tri","type","vol"],
        greetings: "",
        prompt: "> "
    });

    socket.on('handshake', function(color) {
        console.log('you are player ' + color);
        myColor = color;
    });
    socket.on('updateLine', runIncomingCommand);
});

function serverReady() {
	if (! socket.connected) console.error('U lost connection with the server');
	serverup = socket.connected;
}

var usersObj = [
    {
        username: "HarryPotter",
        nickname: "Harry",
        password: "Wizard1",
        pfp: "images/Harry_Potter.jpg",
    },
    {
        username: "LukeSkywalker",
        nickname: "Luke",
        password: "Jedi2",
        pfp: "images/Luke_Skywalker.png"
    },
    {
        username: "MartyMcFly",
        nickname: "Marty",
        password: "TimeTraveler3",
        pfp: "images/Marty_McFly.jpg"
    }
]

const MAX_LATEST_MESSAGE_LENGTH = 60;

var messagesMap = new Map();
var sendTo = null;
var loggedUser = null;
var areSendMessageTabContentsEnabled = false;

var addedContacts = new Set();

messagesMap.set("HarryPotter:LukeSkywalker", [["HarryPotter", "I'm a wizard"], ["LukeSkywalker", "I'm a jedi"]]);
messagesMap.set("HarryPotter:MartyMcFly", [["MartyMcFly", "I'm a time traveler"], ["HarryPotter", "I also time traveled in my third book"]]);
messagesMap.set("LukeSkywalker:MartyMcFly", [["MartyMcFly", "Did you ever hear the tragedy of Darth Plagueis The Wise?"],
["LukeSkywalker", "Yup..."]]);


var loginBox = document.getElementById("login");
var signupBox = document.getElementById("signUp");
var chatBox = document.getElementById("chat");

var inputUsername_login = document.getElementById("inputUsername-login");
var inputPassword_login = document.getElementById("inputPassword-login");
var inputUsername_signup = document.getElementById("inputUsername-signup");
var inputNickname = document.getElementById("inputNickname");
var inputPassword_signup = document.getElementById("inputPassword-signup");
var passwordVerfication = document.getElementById("verifyPassword");
var inputPfp = document.getElementById("inputPfp");

var userInfo = document.getElementById("user-info");
var inputContact = document.getElementById("inputContact");
var chatList = document.getElementById("chatList");
var close_add_contact = document.getElementById("close-add-contact");
var sentChat = document.getElementById("sentChat");

var paperclipButton = document.getElementById("paperclipButton");
var microphoneButton = document.getElementById("microphoneButton");
var message_to_send = document.getElementById("message-to-send");
var button_addon2 = document.getElementById("button-addon2");

paperclipButton.disabled = true;
microphoneButton.disabled = true;
message_to_send.disabled = true;
button_addon2.disabled = true;



function logIn() {
    let inputUsername_login_val = inputUsername_login.value;
    let inputPassword_login_val = inputPassword_login.value;
    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputUsername_login_val == usersObj[i].username && inputPassword_login_val == usersObj[i].password) {
            showChat();
            getChat(usersObj[i].nickname, usersObj[i].pfp, inputUsername_login_val);
            return;
        }
    }
    alert("Wrong username or password");
}


function signUp() {
    var inputUsername_signup_val = inputUsername_signup.value;
    var inputNickname_val = inputNickname.value;
    var inputPassword_signup_val = inputPassword_signup.value;
    var passwordVerfication_val = passwordVerfication.value;
    var inputPfp_val = inputPfp.value;

    if (inputUsername_signup_val == "" || inputNickname_val == "" || inputPassword_signup_val == "" || passwordVerfication_val == "" || inputPfp_val == "") {
        alert("You must fill all fields");
        return;
    }

    if (inputUsername_signup_val.includes(":")) {
        alert("The username cannot include a ':' character");
        return;
    }

    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputUsername_signup_val == usersObj[i].username) {
            alert("There already exists a user with this username");
            return;
        }
    }

    let passwordLen = inputPassword_signup_val.length;
    let isThereADigit = false;
    let isThereAnUppercaseLetter = false;
    let isThereALowercaseLetter = false;

    for (i = 0; i < passwordLen; i++) {
        if ('0' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= '9') {
            isThereADigit = true;
        }
        if ('A' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= 'Z') {
            isThereAnUppercaseLetter = true;
        }
        if ('a' <= inputPassword_signup_val[i] && inputPassword_signup_val[i] <= 'z') {
            isThereALowercaseLetter = true;
        }
    }

    if (!isThereADigit || !isThereAnUppercaseLetter || !isThereALowercaseLetter) {
        alert("A password must contain at least 1 digit, 1 uppercase letter and 1 lowercase letter");
        return;
    }

    if (inputPassword_signup_val != passwordVerfication_val) {
        alert("The password verification does not match");
        return;
    }

    inputPfp_val = "images/" + inputPfp_val.replace("C:\\fakepath\\", "");

    usersObj.push({
        username: inputUsername_signup_val,
        nickname: inputNickname_val,
        password: inputPassword_signup_val,
        pfp: inputPfp_val
    });

    hideSignup();
}



function sendmessage() {
    let message = message_to_send.value;
    if (message != '') {
        addMessageToMessagesMap(message);
        writeMessageInDocument(message, true);
        updateLatestMessage(message, sendTo);
    }
}

function addMessageToMessagesMap(message) {
    let key = getKeyOfTwoUsernames(loggedUser, sendTo);

    if (messagesMap.has(key)) {
        messagesList = messagesMap.get(key);
        messagesList.push([loggedUser, message]);
    } else {
        messagesMap.set(key, [[loggedUser, message]]);
    }
}

function writeMessageInDocument(message, wasSentByLoggedUser) {
    let rowDiv = document.createElement("div");
    let colDiv = document.createElement("div");
    let spanD = document.createElement("span");

    let messageText = document.createTextNode(message);

    rowDiv.className = "row";
    colDiv.className = "col";
    if (wasSentByLoggedUser) {
        spanD.className = "usersSpeechBubble";
    } else {
        spanD.className = "othersSpeechBubble";
    }

    spanD.appendChild(messageText);
    colDiv.appendChild(spanD);
    rowDiv.appendChild(colDiv);
    sentChat.appendChild(rowDiv);

    message_to_send.value = "";
    sentChat.scrollTop = sentChat.scrollHeight;
}

function loadContactMessages(contactUsername) {
    if (!areSendMessageTabContentsEnabled) {
        enableSendMessageTabContents();
        areSendMessageTabContentsEnabled = true;
    }

    sendTo = contactUsername;
    let key = getKeyOfTwoUsernames(loggedUser, sendTo);

    sentChat.innerHTML = "";

    if (messagesMap.has(key)) {
        messagesList = messagesMap.get(key);
        let amountOfMessages = messagesList.length;

        for (i = 0; i < amountOfMessages; i++) {
            if (loggedUser == messagesList[i][0]) {
                writeMessageInDocument(messagesList[i][1], true);
            } else {
                writeMessageInDocument(messagesList[i][1], false);
            }
        }
    }
}

function getKeyOfTwoUsernames(user1, user2) {
    let cmp = user1.localeCompare(user2);
    let key = null;
    if (cmp == -1) {
        key = user1 + ":" + user2;
    } else {
        key = user2 + ":" + user1;
    }
    return key;
}

function enableSendMessageTabContents() {
    paperclipButton.disabled = false;
    microphoneButton.disabled = false;
    message_to_send.disabled = false;
    button_addon2.disabled = false;
}

function updateLatestMessage(newMessage, contactUsername) {
    document.getElementById(contactUsername + "-latestMessage").textContent = cutLongString(newMessage, MAX_LATEST_MESSAGE_LENGTH);
}

function loadContactInChat(nickname, profile) {
    let colDiv = document.createElement("div");
    let userImg = document.createElement("img");
    let userNickname = document.createTextNode(nickname);
    userImg.src = profile;
    colDiv.setAttribute("class","col", "user"); ;
    userImg.className = "contact-profile";

    contactInChat.innerHTML = "";

    colDiv.appendChild(userImg);
    colDiv.appendChild(userNickname);
    contactInChat.appendChild(colDiv);
}

function addContact() {
    let inputContact_val = inputContact.value;
    if (inputContact_val == "") {
        alert("You must fill the contact's username field");
        return;
    }

    let contact = null;
    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputContact_val == usersObj[i].username) {
            contact = usersObj[i];
            break;
        }
    }
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    if (contact.username == loggedUser) {
        alert("You cannot add yourself as a contact");
        return;
    }

    if (addedContacts.has(contact.username)) {
        alert("This contact has already been added")
        return;
    }
    addedContacts.add(contact.username);

    chatList.innerHTML += "<li class=\"list-group-item d-flex justify-content-between align-items-start\"\
                                onclick=\"loadContactMessages(\'" + contact.username + "\');loadContactInChat(\'" + contact.nickname + "\',\'" + contact.pfp + "\');\">\
                            <img src=\"" + contact.pfp + "\" alt=\"Avatar\" class=\"contact-profile\">\
                            <div class=\"ms-2 me-auto\">\
                                <div class=\"fw-bold\">" + contact.nickname + "</div>\
                                <div id=\"" + contact.username + "-latestMessage\">" + getLatestMessage(loggedUser, contact.username) + "</div>\
                            </div>\
                        </li>";
    close_add_contact.click();
}

function getLatestMessage(user1, user2) {
    let key = getKeyOfTwoUsernames(user1, user2);
    if (messagesMap.has(key)) {
        messagesList = messagesMap.get(key);
        let amountOfMessages = messagesList.length;
        return cutLongString(messagesList[amountOfMessages - 1][1], MAX_LATEST_MESSAGE_LENGTH);
    } else {
        return "";
    }
}

function cutLongString(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + "...";
    } else {
        return text;
    }
}



function hideLogin() {
    event.preventDefault();
    signupBox.style.visibility = "visible";
    loginBox.style.visibility = "hidden";
}

function hideSignup() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "visible";
}

function showChat() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "hidden";
    chatBox.style.visibility = "visible";
}

function getChat(nickname, picture, username) {
    loggedUser = username;

    userInfo.innerHTML = ""
    console.log(picture);

    var userImg = document.createElement("img");
    userImg.src = picture;
    userImg.style.width = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.paddingRight = "5px";
    var nickname = document.createTextNode(nickname);

    userInfo.appendChild(userImg);
    userInfo.appendChild(nickname);
}
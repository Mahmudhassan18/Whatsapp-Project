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
    },
    {
        username: "user1",
        nickname: "Default user",
        password: "User1",
        pfp: "images/defaultProfile.jpeg"
    }
]

var messagesMap = new Map();
var sendTo = null;
var user = null;



function logIn() {
    let username = document.getElementById("inputUsername").value;
    let password = document.getElementById("inputPassword").value;
    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (username == usersObj[i].username && password == usersObj[i].password) {
            showChat();
            getChat(usersObj[i].nickname, usersObj[i].pfp)
            return;
        }
    }
    alert("Wrong username or password");
}


function signUp() {
    let inputUsername = document.getElementById("inputUsername").value;
    let inputNickname = document.getElementById("inputNickname").value;
    let inputPassword = document.getElementById("inputPassword").value;
    let passwordVerfication = document.getElementById("verifyPassword").value;
    let inputPfp = document.getElementById("inputPfp").value;

    if (inputUsername == "" || inputNickname == "" || inputPassword == "" || passwordVerfication == "" || inputPfp == "") {
        alert("You must fill all fields");
        return;
    }
    inputPfp = "images/" + inputPfp.replace("C:\\fakepath\\", "");

    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputUsername == usersObj[i].username) {
            alert("There already exists a user with this username");
            return;
        }
    }

    let passwordLen = inputPassword.length;
    let isThereADigit = false;
    let isThereAnUppercaseLetter = false;
    let isThereALowercaseLetter = false;

    for (i = 0; i < passwordLen; i++) {
        if ('0' <= inputPassword[i] && inputPassword[i] <= '9') {
            isThereADigit = true;
        }
        if ('A' <= inputPassword[i] && inputPassword[i] <= 'Z') {
            isThereAnUppercaseLetter = true;
        }
        if ('a' <= inputPassword[i] && inputPassword[i] <= 'z') {
            isThereALowercaseLetter = true;
        }
    }

    if (!isThereADigit || !isThereAnUppercaseLetter || !isThereALowercaseLetter) {
        alert("A password must contain at least 1 digit, 1 uppercase letter and 1 lowercase letter");
        return;
    }

    if (inputPassword != passwordVerfication) {
        alert("The password verification does not match");
        return;
    }

    usersObj.push({
        username: inputUsername,
        nickname: inputNickname,
        password: inputPassword,
        pfp: inputPfp
    });

    hideSignup();
}



function sendmessage() {
    let message = document.getElementById("message-to-send").value;
    if (message != '') {
        addMessageToMessagesMap(message);
        writeMessageInDocument(message);
    }
}

function addMessageToMessagesMap(message) {
    let cmp = user.localeCompare(sendTo);
    let key = null;
    if (cmp == -1) {
        key = user + ":" + sendTo;
    } else {
        key = sendTo + ":" + user;
    }

    if (messagesMap.has(key)) {
        messagesList = messagesMap.get(key);
        messagesList.push([user, message]);
    } else {
        messagesMap.set(key, [[user, message]]);
    }
}

function writeMessageInDocument(message) {
    let element = document.getElementById("sentChat");

    let rowDiv = document.createElement("div");
    let colDiv = document.createElement("div");
    let spanD = document.createElement("span");

    let messageText = document.createTextNode(message);

    rowDiv.className = "row";
    colDiv.className = "col";
    spanD.className = "usersSpeechBubble";

    spanD.appendChild(messageText);
    colDiv.appendChild(spanD);
    rowDiv.appendChild(colDiv);
    sentChat.appendChild(rowDiv);

    document.getElementById("message-to-send").value = "";
    element.scrollTop = element.scrollHeight;
}



function addContact() {
    let inputContact = document.getElementById("inputContact").value;
    if (inputContact == "") {
        alert("You must fill the contact's username field");
        return;
    }

    let contact = null;
    let amountOfUsers = usersObj.length;
    for(i=0; i < amountOfUsers; i++){
        if(inputContact == usersObj[i].username){
            contact = usersObj[i];
            break;
        }
    }
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    let chatList = document.getElementById("chatList");
    chatList.innerHTML += "<li class=\"list-group-item d-flex justify-content-between align-items-start\">\
                            <img src=\"" + contact.pfp + "\" alt=\"Avatar\" class=\"contact-profile\">\
                            <div class=\"ms-2 me-auto\">\
                                <div class=\"fw-bold\">" + contact.nickname + "</div>\
                                Latest Message\
                            </div>\
                            <span class=\"badge bg-primary rounded-pill\">14</span>\
                        </li>";
    document.getElementById("close-add-contact").click();
    
}

var loginBox = document.getElementById("login");
var signupBox = document.getElementById("signUp");
var chatBox = document.getElementById("chat");

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

function getChat(nickname, picture) {
    var userInfo = document.getElementById("user-info");
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
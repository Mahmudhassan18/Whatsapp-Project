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


function logIn() {
    var username = document.getElementById("inputUsername-login").value;
    var password = document.getElementById("inputPassword-login").value;
    var amountOfUsers = usersObj.length;
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
    var inputUsername = document.getElementById("inputUsername-signup").value;
    var inputNickname = document.getElementById("inputNickname").value;
    var inputPassword = document.getElementById("inputPassword-signup").value;
    var passwordVerfication = document.getElementById("verifyPassword").value;
    var inputPfp = document.getElementById("inputPfp").value;

    if (inputUsername == "" || inputNickname == "" || inputPassword == "" || passwordVerfication == "" || inputPfp == "") {
        alert("You must fill all fields");
        return;
    }
    inputPfp = "images/" + inputPfp.replace("C:\\fakepath\\", "");

    var amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputUsername == usersObj[i].username) {
            alert("There already exists a user with this username");
            return;
        }
    }

    var passwordLen = inputPassword.length;
    var isThereADigit = false;
    var isThereAnUppercaseLetter = false;
    var isThereALowercaseLetter = false;

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
    var message = document.getElementById("message-to-send").value;
    if (message != '') {
        var element = document.getElementById("sentChat");

        var rowDiv = document.createElement("div");
        var colDiv = document.createElement("div");
        var spanD = document.createElement("span");

        var message = document.createTextNode(message);

        rowDiv.className = "row";
        colDiv.className = "col";
        spanD.className = "usersSpeechBubble";

        spanD.appendChild(message);
        colDiv.appendChild(spanD);
        rowDiv.appendChild(colDiv);
        sentChat.appendChild(rowDiv);

        document.getElementById("message-to-send").value = "";
        element.scrollTop = element.scrollHeight;
    }
}

function addContact() {
    var inputContact = document.getElementById("inputContact").value;
    if (inputContact == "") {
        alert("You must fill the contact's username field");
        return;
    }

    var contact = null;
    var amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputContact == usersObj[i].username) {
            contact = usersObj[i];
            break;
        }
    }
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    var chatList = document.getElementById("chatList");
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
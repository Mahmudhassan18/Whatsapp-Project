var usersObj = [
    {
        username: "Harry Potter",
        nickname: "Harry",
        password: "Wizard1",
        pfp: "images/Harry_Potter.jpg"
    },
    {
        username: "Luke Skywalker",
        nickname: "Luke",
        password: "Jedi2",
        pfp: "images/Luke_Skywalker.png"
    },
    {
        username: "Marty McFly",
        nickname: "Marty",
        password: "TimeTraveler3",
        pfp: "images/Marty_McFly.jpg"
    }
]


function logIn() {
    var username = document.getElementById("inputUsername").value;
    var password = document.getElementById("inputPassword").value;
    var amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (username == usersObj[i].username && password == usersObj[i].password) {
            window.location.href = "chat.html";
            return;
        }
    }
    alert("Wrong username or password");
}


function signUp() {
    var inputUsername = document.getElementById("inputUsername").value;
    var inputNickname = document.getElementById("inputNickname").value;
    var inputPassword = document.getElementById("inputPassword").value;
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

    window.location.href = "login.html";
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



var usersObj = [
    {
        userId: 0,
        username: "HarryPotter",
        nickname: "Harry",
        password: "Wizard1",
        pfp: "images/Harry_Potter.jpg",
    },
    {
        userId: 1,
        username: "LukeSkywalker",
        nickname: "Luke",
        password: "Jedi2",
        pfp: "images/Luke_Skywalker.png"
    },
    {
        userId: 2,
        username: "MartyMcFly",
        nickname: "Marty",
        password: "TimeTraveler3",
        pfp: "images/Marty_McFly.jpg"
    }
];

const messageTypes = {
    text : {
        getCurrentInputValueOfThisMessageType: function() {return text_message_to_send.value;},
        writeMessageInDocument: writeTextMessageInDocument,
        generateLatestMessageText: function(message) {return cutLongString(message, MAX_LATEST_MESSAGE_LENGTH);}
    },
    image: {
        getCurrentInputValueOfThisMessageType: function() {return URL.createObjectURL(messageInputImage.files[0]);},
        writeMessageInDocument: writeImageMessageInDocument,
        generateLatestMessageText: function(_message) {return "Image";}
    },
    video: {
        getCurrentInputValueOfThisMessageType: function() {return URL.createObjectURL(messageInputVideo.files[0]);},
        writeMessageInDocument: writeVideoMessageInDocument,
        generateLatestMessageText: function(_message) {return "Video";}
    },
    audio: {
        getCurrentInputValueOfThisMessageType: function() {return URL.createObjectURL(messageInputAudio.files[0]);},
        writeMessageInDocument: writeAudioMessageInDocument,
        generateLatestMessageText: function(_message) {return "Audio";}
    }
};

const MAX_LATEST_MESSAGE_LENGTH = 60;

var messagesMap = new Map();
var loggedUser = null;
var sendTo = null;
var messageKey = null;

var areSendMessageTabContentsEnabled = false;

var sentVideos = [];
var amountOfImagesInChat = 0;
var amountOfVideosInChat = 0;

var addedContacts = new Set();
var hasAContactBeenAdded = false;

var amountOfUsers = 0;
////
amountOfUsers += 3;
////

messagesMap.set("0:1", [{senderId: 0, content: "I'm a wizard", typeOfMessage: messageTypes.text},
    {senderId: 1, content: "I'm a jedi", typeOfMessage: messageTypes.text}]);
messagesMap.set("0:2", [{senderId: 2, content: "I'm a time traveler", typeOfMessage: messageTypes.text},
    {senderId: 0, content: "I also time traveled in my third book", typeOfMessage: messageTypes.text}]);
messagesMap.set("1:2", [{senderId: 2, content: "Did you ever hear the tragedy of Darth Plagueis The Wise?", typeOfMessage: messageTypes.text},
    {senderId: 1, content: "Yup...", typeOfMessage: messageTypes.text}]);


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
var closeImageAttach = document.getElementById("close-image-attach");
var closeVideoAttach = document.getElementById("close-video-attach");
var closeAudioAttach = document.getElementById("close-audio-attach");
var sentChat = document.getElementById("sentChat");
var contactInChat = document.getElementById("contactInChat");

var messageInputImage = document.getElementById("messageInputImage");
var messageInputVideo = document.getElementById("messageInputVideo");
var messageInputAudio = document.getElementById("messageInputAudio");

var imageButton = document.getElementById("imageButton");
var videoButton = document.getElementById("videoButton");
var microphoneButton = document.getElementById("microphoneButton");
var text_message_to_send = document.getElementById("message-to-send");
var button_addon2 = document.getElementById("button-addon2");

imageButton.disabled = true;
videoButton.disabled = true;
microphoneButton.disabled = true;
text_message_to_send.disabled = true;
button_addon2.disabled = true;


function logIn() {
    let inputUsername_login_val = inputUsername_login.value;
    let inputPassword_login_val = inputPassword_login.value;
    let amountOfUsers = usersObj.length;
    for (i = 0; i < amountOfUsers; i++) {
        if (inputUsername_login_val == usersObj[i].username && inputPassword_login_val == usersObj[i].password) {
            loggedUser = usersObj[i].userId;
            showChat();
            getChat(usersObj[i].nickname, usersObj[i].pfp);
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

    if (inputUsername_signup_val == "" || inputNickname_val == "" || inputPassword_signup_val == "" || passwordVerfication_val == "") {
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

    amountOfUsers++;

    if (inputPfp.value == ""){
        var inputPfp_val = "defaultProfile.jpeg"
    } else {
        var inputPfp_val = URL.createObjectURL(inputPfp.files[0]);
    }

    usersObj.push({
        userId: amountOfUsers - 1,
        username: inputUsername_signup_val,
        nickname: inputNickname_val,
        password: inputPassword_signup_val,
        pfp: inputPfp_val
    });

    hideSignup();
}

function sendMessage(typeOfMessage) {
    var message = typeOfMessage.getCurrentInputValueOfThisMessageType();
    if (message != '') {
        addMessageToMessagesMap(message, typeOfMessage);
        typeOfMessage.writeMessageInDocument(message, true);
        updateLatestMessage(typeOfMessage.generateLatestMessageText(message), sendTo);
    }
}

function addMessageToMessagesMap(message, typeOfMessage) {
    var messageObj = {
        senderId: loggedUser,
        content: message,
        typeOfMessage: typeOfMessage
    }
    if (messagesMap.has(messageKey)) {
        messagesList = messagesMap.get(messageKey);
        messagesList.push(messageObj);
    } else {
        messagesMap.set(messageKey, [messageObj]);
    }
}

function writeTextMessageInDocument(message, wasSentByLoggedUser) {
    let rowDiv = document.createElement("div");
    let colDiv = document.createElement("div");
    let spanD = document.createElement("span");

    let messageText = document.createTextNode(message);

    rowDiv.className = "row";
    colDiv.className = "col";
    spanD.className = wasSentByLoggedUser ? "usersSpeechBubble" : "othersSpeechBubble";

    spanD.appendChild(messageText);
    colDiv.appendChild(spanD);
    rowDiv.appendChild(colDiv);
    sentChat.appendChild(rowDiv);

    text_message_to_send.value = "";
    scrollChat();
}

function loadContactMessages(contactId) {
    if (contactId == sendTo) {
        return;
    }
    
    if (!areSendMessageTabContentsEnabled) {
        enableSendMessageTabContents();
        areSendMessageTabContentsEnabled = true;
    }

    sendTo = contactId;
    messageKey = getKeyOfTwoUsers(loggedUser, sendTo);

    sentChat.innerHTML = "";
    sentVideos.splice(0, amountOfVideosInChat);
    amountOfImagesInChat = 0;
    amountOfVideosInChat = 0;

    if (messagesMap.has(messageKey)) {
        messagesList = messagesMap.get(messageKey);
        let amountOfMessages = messagesList.length;

        for (i = 0; i < amountOfMessages; i++) {
            const messageObj = messagesList[i];
            messageObj.typeOfMessage.writeMessageInDocument(messageObj.content, loggedUser == messageObj.senderId);
        }
    }
}

function getKeyOfTwoUsers(userId1, userId2) {
    if (userId1 < userId2) {
        var key = userId1 + ":" + userId2;
    } else {
        var key = userId2 + ":" + userId1;
    }
    return key;
}

function enableSendMessageTabContents() {
    imageButton.disabled = false;
    videoButton.disabled = false;
    microphoneButton.disabled = false;
    text_message_to_send.disabled = false;
    button_addon2.disabled = false;
}

function updateLatestMessage(latestMessageText, contactId) {
    document.getElementById(contactId + "-latestMessage").textContent = latestMessageText;
}

function loadContactInChat(nickname, profile) {
    let colDiv = document.createElement("div");
    let userImg = document.createElement("img");
    let userNickname = document.createTextNode(nickname);
    userImg.src = profile;
    userImg.alt = "Avatar";
    userImg.style.width = "60px";
    colDiv.setAttribute("class", "col", "user");;
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
    for (i = 0; i < amountOfUsers; i++) {
        if (inputContact_val.toLowerCase() == usersObj[i].username.toLowerCase()) {
            contact = usersObj[i];
            break;
        }
    }
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    if (contact.userId == loggedUser) {
        alert("You cannot add yourself as a contact");
        return;
    }

    if (addedContacts.has(contact.userId)) {
        alert("This contact has already been added")
        return;
    }
    addedContacts.add(contact.userId);

    if (!hasAContactBeenAdded) {
        chatList.innerHTML = "";
        hasAContactBeenAdded = true;
    }

    chatList.innerHTML += "<li class=\"list-group-item d-flex justify-content-between align-items-start\"\
                                onclick=\"loadContactMessages(\'" + contact.userId + "\');loadContactInChat(\'" + contact.nickname + "\',\'" + contact.pfp + "\');\">\
                            <img src=\"" + contact.pfp + "\" alt=\"Avatar\" class=\"contact-profile\">\
                            <div class=\"ms-2 me-auto\">\
                                <div class=\"fw-bold\">" + contact.nickname + "</div>\
                                <div id=\"" + contact.userId + "-latestMessage\">" + getLatestMessage(loggedUser, contact.userId) + "</div>\
                            </div>\
                        </li>";
    close_add_contact.click();
    inputContact.value = "";

}

function getLatestMessage(userId1, userId2) {
    const messageKeyOfThe2Users = getKeyOfTwoUsers(userId1, userId2);
    if (messagesMap.has(messageKeyOfThe2Users)) {
        messagesList = messagesMap.get(messageKeyOfThe2Users);
        const amountOfMessages = messagesList.length;
        const latestMessageObj = messagesList[amountOfMessages - 1];
        return latestMessageObj.typeOfMessage.generateLatestMessageText(latestMessageObj.content);
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

function getChat(nickname, picture) {
    userInfo.innerHTML = ""

    var userImg = document.createElement("img");
    userImg.src = picture;
    userImg.style.width = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.paddingRight = "5px";
    var nickname = document.createTextNode(nickname);

    userInfo.appendChild(userImg);
    userInfo.appendChild(nickname);
}


function writeImageMessageInDocument(imageMessageUrlObject, wasSentByLoggedUser) {
    const modalId = "messageImage" + amountOfImagesInChat;
    amountOfImagesInChat++;



    var input = document.createElement("div");
    input.className = "row";
    var col = document.createElement("div");
    col.className = "col";


    var speechBubbleSpan = document.createElement("span");
    speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";

    var imageModalButton = document.createElement("button");
    imageModalButton.type = "button";
    imageModalButton.className = "btn";
    imageModalButton.setAttribute("data-bs-toggle", "modal");
    imageModalButton.setAttribute("data-bs-target", "#" + modalId);

    var imageInSpeechBubble = document.createElement("img");
    imageInSpeechBubble.src = imageMessageUrlObject;
    imageInSpeechBubble.style.width = "200px";

    imageModalButton.appendChild(imageInSpeechBubble);
    speechBubbleSpan.appendChild(imageModalButton);
    col.appendChild(speechBubbleSpan);


    var modalDiv = document.createElement("div");
    modalDiv.className = "modal fade";
    modalDiv.id = modalId;
    modalDiv.tabIndex = -1;
    modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
    modalDiv.setAttribute("aria-hidden", "true");

    var modalDialogDiv = document.createElement("div");
    modalDialogDiv.className = "modal-dialog";
    var modalContentDiv = document.createElement("div");
    modalContentDiv.className = "modal-content";


    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    var closeModalButton = document.createElement("button");
    closeModalButton.type = "button";
    closeModalButton.className = "btn-close";
    closeModalButton.setAttribute("data-bs-dismiss", "modal");
    closeModalButton.setAttribute("aria-label", "Close");
        
    modalHeader.appendChild(closeModalButton);
    modalContentDiv.appendChild(modalHeader);


    var modalBodyDiv = document.createElement("div");
    modalBodyDiv.className = "modal-body";

    var imageInModal = document.createElement("img");
    imageInModal.src = imageMessageUrlObject;
    imageInModal.style.width = "100%";

    modalBodyDiv.appendChild(imageInModal);
    modalContentDiv.appendChild(modalBodyDiv);


    modalDialogDiv.appendChild(modalContentDiv);
    modalDiv.appendChild(modalDialogDiv);
    col.appendChild(modalDiv);
    input.appendChild(col);



    sentChat.appendChild(input);
    messageInputImage.value = "";
    closeImageAttach.click();
    scrollChat();
}

function writeVideoMessageInDocument(videoMessageUrlObject, wasSentByLoggedUser) {
    const modalId = "messageVideo" + amountOfVideosInChat;
    amountOfVideosInChat++;



    var input = document.createElement("div");
    input.className = "row";
    var col = document.createElement("div");
    col.className = "col";


    var speechBubbleSpan = document.createElement("span");
    speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";

    var videoModalButton = document.createElement("button");
    videoModalButton.type = "button";
    videoModalButton.className = "btn";
    videoModalButton.setAttribute("data-bs-toggle", "modal");
    videoModalButton.setAttribute("data-bs-target", "#" + modalId);

    var videoInSpeechBubble = document.createElement("video");
    videoInSpeechBubble.width = 320;
    videoInSpeechBubble.height = 240;

    var videoInSpeechBubbleSource = document.createElement("source");
    videoInSpeechBubbleSource.src = videoMessageUrlObject;
    videoInSpeechBubbleSource.type = "video/mp4";

    videoInSpeechBubble.appendChild(videoInSpeechBubbleSource);
    videoModalButton.appendChild(videoInSpeechBubble);
    speechBubbleSpan.appendChild(videoModalButton);
    col.appendChild(speechBubbleSpan);


    var modalDiv = document.createElement("div");
    modalDiv.className = "modal fade";
    modalDiv.id = modalId;
    modalDiv.tabIndex = -1;
    modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
    modalDiv.setAttribute("aria-hidden", "true");
    modalDiv.setAttribute("data-bs-backdrop", "static");
    modalDiv.setAttribute("data-bs-keyboard", "false");

    var modalDialogDiv = document.createElement("div");
    modalDialogDiv.className = "modal-dialog";
    var modalContentDiv = document.createElement("div");
    modalContentDiv.className = "modal-content";


    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";

    var closeModalButton = document.createElement("button");
    closeModalButton.type = "button";
    closeModalButton.className = "btn-close";
    closeModalButton.setAttribute("data-bs-dismiss", "modal");
    closeModalButton.setAttribute("aria-label", "Close");
    const currentVideoIndex = amountOfVideosInChat - 1;
    closeModalButton.addEventListener("click", function(){closeVideo(currentVideoIndex);});

    modalHeader.appendChild(closeModalButton);
    modalContentDiv.appendChild(modalHeader);


    var modalBodyDiv = document.createElement("div");
    modalBodyDiv.className = "modal-body";

    var videoInModal = document.createElement("video");
    videoInModal.style.width = "100%";
    videoInModal.controls = true;

    var videoInModalSource = document.createElement("source");
    videoInModalSource.src = videoMessageUrlObject;
    videoInModalSource.type = "video/mp4";

    videoInModal.appendChild(videoInModalSource);
    modalBodyDiv.appendChild(videoInModal);
    modalContentDiv.appendChild(modalBodyDiv);


    modalDialogDiv.appendChild(modalContentDiv);
    modalDiv.appendChild(modalDialogDiv);
    col.appendChild(modalDiv);
    input.appendChild(col);


        
    sentVideos.push(videoInModal);
    sentChat.appendChild(input);
    messageInputVideo.value = "";
    closeVideoAttach.click();
    scrollChat();
}

function writeAudioMessageInDocument(audioMessageUrlObject ,wasSentByLoggedUser) {
    var rowDiv = document.createElement("div");
    rowDiv.className = "row";
    var colDiv = document.createElement("div");
    colDiv.className = "col";
    var speechBubbleSpan = document.createElement("span");
    speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble" : "othersSpeechBubble";
    var audioElement = document.createElement("audio");
    audioElement.controls = true;
    var audioSource = document.createElement("source");
    audioSource.src = audioMessageUrlObject;
    audioSource.type = "audio/mpeg";

    audioElement.appendChild(audioSource);
    speechBubbleSpan.appendChild(audioElement);
    colDiv.appendChild(speechBubbleSpan);
    rowDiv.appendChild(colDiv);
    sentChat.appendChild(rowDiv);

    closeAudioAttach.click();
    messageInputAudio.value = ""
    scrollChat();
}

function scrollChat(){
    sentChat.scrollTop = sentChat.scrollHeight;
}

function closeVideo(videoIndex) {
    sentVideos[videoIndex].pause();
    sentVideos[videoIndex].currentTime = 0;
}
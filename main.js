//The code is wrapped in a self invoked function in order to avoid polluting the global namespace.
(function(){

/**
 * A user. Can log into the site and chat with other users.
 * Users have their own userIds, username, nicknames, passwords and profile pictures.
 * 
 * @class User
 */
class User {
    constructor(userId, username, nickname, password, pfp) {
        this.userId = userId;
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        this.pfp = pfp;
    }
}

/**
 * The array of all the different users which the website recognizes.
 */
const usersArr = [
    new User(0, "HarryPotter", "Harry", "Wizard1", "images/Harry_Potter.jpg"),
    new User(1, "LukeSkywalker", "Luke", "Jedi2", "images/Luke_Skywalker.png"),
    new User(2, "MartyMcFly", "Marty", "TimeTraveler3", "images/Marty_McFly.jpg"),
    new User(3, "KobeBryant", "Kobe", "Mamba24", "images/kobe.jpeg"),
    new User(4, "LebronJames", "Lebron", "King23", "images/lebron.jpeg")
];

/**
 * The largest amount of characters the text in the added contacts list
 * of the latest message from a contact can have. If the latest message
 * is longer than this length, then its end is replaced with an ellipsis.
 */
const MAX_LATEST_MESSAGE_LENGTH = 50;

/**
 * A map which stores all the messages sent between users.
 * The keys are made up of the userIds of 2 users (the smaller one
 * being the first so 2 users will always generate the same key).
 * The values are arrays of messages.
 */
const messagesMap = new Map();

/**
 * The userId of the user which has logged into the website.
 */
let loggedUser = null;

/**
 * The userId of the selected contact which we can send messages to.
 */
let sendTo = null;

/**
 * The key for the messagesMap of the logged user and the sendTo user.
 */
let messageKey = null;

/**
 * A boolean variable which is true when all of the buttons and message input
 * in the send message tab are enabled.
 */
let areSendMessageTabContentsEnabled = false;

/**
 * An array of the video elements in the modals of video messages, for all of
 * the video messages that are currently in the chat.
 */
const sentVideos = [];

/**
 * The amount of image messages that are currently in the chat.
 */
let amountOfImagesInChat = 0;

/**
 * The amount of video messages that are currently in the chat.
 */
let amountOfVideosInChat = 0;

/**
 * The URL object of the last recording for the audio message.
 */
let messageInputAudioObjectURL = null;

/**
 * A set of all the contacts which have been added so far.
 */
const addedContacts = new Set();

/**
 * A boolean variable which is true when at least one contact has been added.
 */
let hasAContactBeenAdded = false;

/**
 * A map which maps userIds of added contacts, to the div elements
 * of their latest message text in the added contacts list.
 */
const latestMessageDivs = new Map();

/**
 * A map which maps userIds of added contacts, to the div elements
 * of the date of their latest message in the added contacts list.
 */
const latestMessageDateDivs = new Map();

/**
 * The amount of users the website recognizes (the length of usersArr).
 * Note that the website always launches with 5 recognized users, so the amount
 * of users is initialized as 5 and not 0.
 */
let amountOfUsers = 5;

//Every element in the HTML which needs to be accessed and stored into a constant variable is accessed here. 
const loginBox = document.getElementById("login");
const signupBox = document.getElementById("signUp");
const chatBox = document.getElementById("chat");

const inputUsername_login = document.getElementById("inputUsername-login");
const inputPassword_login = document.getElementById("inputPassword-login");
const inputUsername_signup = document.getElementById("inputUsername-signup");
const inputNickname = document.getElementById("inputNickname");
const inputPassword_signup = document.getElementById("inputPassword-signup");
const passwordVerfication = document.getElementById("verifyPassword");
const inputPfp = document.getElementById("inputPfp");

const userInfo = document.getElementById("user-info");
const inputContact = document.getElementById("inputContact");
const chatList = document.getElementById("chatList");
const closeAddContact = document.getElementById("closeAddContact");
const closeImageModalButton = document.getElementById("closeImageModalButton");
const closeVideoModalButton = document.getElementById("closeVideoModalButton");
const closeMicrophoneModalButton = document.getElementById("closeMicrophoneModalButton");
const sentChat = document.getElementById("sentChat");
const contactInChat = document.getElementById("contactInChat");

const messageInputImage = document.getElementById("messageInputImage");
const messageInputVideo = document.getElementById("messageInputVideo");

const imageButton = document.getElementById("imageButton");
const videoButton = document.getElementById("videoButton");
const microphoneButton = document.getElementById("microphoneButton");
const text_message_to_send = document.getElementById("message-to-send");
const sendTextMessageButton = document.getElementById("sendTextMessageButton");

//All of the buttons and the message input in the send message tab are disabled by default.
//They will be enabled once a contact is selected.
imageButton.disabled = true;
videoButton.disabled = true;
microphoneButton.disabled = true;
text_message_to_send.disabled = true;
sendTextMessageButton.disabled = true;


//loginButton calls login() when clicked
document.getElementById("loginButton").addEventListener("click", logIn);

//registerButton calls hideLogin() when clicked (hides the login forms and shows the signup form instead)
document.getElementById("registerButton").addEventListener("click", hideLogin);

//signUpButton calls signUp() when clicked
document.getElementById("signUpButton").addEventListener("click", signUp);

//alreadyRegisteredButton calls hideSignup() when clicked (hides the signup forms and shows the login form instead)
document.getElementById("alreadyRegisteredButton").addEventListener("click", hideSignup);

//addContactButton calls addContact() when clicked
document.getElementById("addContactButton").addEventListener("click", addContact);


//sendImageMessageButton sends a new image message when clicked. It passes the id of the logged user.
document.getElementById("sendImageMessageButton").addEventListener("click", () => {
    if (messageInputImage.value != "") {
        sendMessage(new ImageMessage(loggedUser, URL.createObjectURL(messageInputImage.files[0])));
    } else {
        alert("You haven't chosen an image yet")
    }
});

//sendVideoMessageButton sends a new video message when clicked. It passes the id of the logged user.
document.getElementById("sendVideoMessageButton").addEventListener("click", () => {
    if (messageInputVideo.value != "") {
        sendMessage(new VideoMessage(loggedUser, URL.createObjectURL(messageInputVideo.files[0])));
    } else {
        alert("You haven't chosen a video yet");
    }
});

//sendAudioMessageButton sends a new audio message when clicked. It passes the id of the logged user.
document.getElementById("sendAudioMessageButton").addEventListener("click", () => {
    if (messageInputAudioObjectURL != null) {
        sendMessage(new AudioMessage(loggedUser));
    } else {
        alert("You haven't recorded a message yet");
    }
});
sendTextMessageButton.addEventListener("click", () => {
    if (text_message_to_send.value != "") {
        sendMessage(new TextMessage(loggedUser, text_message_to_send.value));
    }
});
document.getElementById("closeMicrophoneModalButton").addEventListener("click", () => { messageInputAudioObjectURL = null; });



class TextMessage {
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = this.addNewlines(content);
        /////
        if (content != null) {
            content = this.addNewlines(content);
        }
        /////
    }
/**
 * Adds a new line after every 100 chars
 * if a space found in first 100 chars it adds a new line to the last space
 * if not it adds a new line at index 100
 * @param {message that's being sent} str 
 * @returns new message with new line every 100 chars
 */
    addNewlines(str) {
        let result = '';
        while (str.length > 0) {
          let lastHundred = str.lastIndexOf(' ', 100);
          if(lastHundred == -1){
              result += str.substring(0, 100) + '\n';
              str = str.substring(100);
          }
          else{
              //console.log(lastHundred);
              result += str.substring(0, lastHundred+1) + '\n';
              str = str.substring(lastHundred+1);
          }
        }
        return result;
      }

    writeMessageInDocument(wasSentByLoggedUser) {
        const rowDiv = document.createElement("div");
        const colDiv = document.createElement("div");
        const spanD = document.createElement("span");
    
        const messageText = document.createTextNode(this.content);
    
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

    generateLatestMessageText() {
        return cutLongString(this.content, MAX_LATEST_MESSAGE_LENGTH);
    }
}


class ImageMessage {
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = content;
    }

    writeMessageInDocument(wasSentByLoggedUser) {
        const modalId = "messageImage" + amountOfImagesInChat;
        amountOfImagesInChat++;
    
    
    
        const input = document.createElement("div");
        input.className = "row";
        const col = document.createElement("div");
        col.className = "col";
    
    
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";
    
        const imageModalButton = document.createElement("button");
        imageModalButton.type = "button";
        imageModalButton.className = "btn";
        imageModalButton.setAttribute("data-bs-toggle", "modal");
        imageModalButton.setAttribute("data-bs-target", "#" + modalId);
    
        const imageInSpeechBubble = document.createElement("img");
        imageInSpeechBubble.src = this.content;
        imageInSpeechBubble.style.width = "200px";
    
        imageModalButton.appendChild(imageInSpeechBubble);
        speechBubbleSpan.appendChild(imageModalButton);
        col.appendChild(speechBubbleSpan);
    
    
        const modalDiv = document.createElement("div");
        modalDiv.className = "modal fade";
        modalDiv.id = modalId;
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
        modalDiv.setAttribute("aria-hidden", "true");
    
        const modalDialogDiv = document.createElement("div");
        modalDialogDiv.className = "modal-dialog";
        const modalContentDiv = document.createElement("div");
        modalContentDiv.className = "modal-content";
    
    
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";
    
        const closeModalButton = document.createElement("button");
        closeModalButton.type = "button";
        closeModalButton.className = "btn-close";
        closeModalButton.setAttribute("data-bs-dismiss", "modal");
        closeModalButton.setAttribute("aria-label", "Close");
            
        modalHeader.appendChild(closeModalButton);
        modalContentDiv.appendChild(modalHeader);
    
    
        const modalBodyDiv = document.createElement("div");
        modalBodyDiv.className = "modal-body";
    
        const imageInModal = document.createElement("img");
        imageInModal.src = this.content;
        imageInModal.style.width = "100%";
    
        modalBodyDiv.appendChild(imageInModal);
        modalContentDiv.appendChild(modalBodyDiv);
    
    
        modalDialogDiv.appendChild(modalContentDiv);
        modalDiv.appendChild(modalDialogDiv);
        col.appendChild(modalDiv);
        input.appendChild(col);
    
    
    
        sentChat.appendChild(input);
        messageInputImage.value = "";
        closeImageModalButton.click();
        scrollChat();
    }

    generateLatestMessageText() {
        return "Image";
    }
}


class VideoMessage {
    constructor(senderId, content) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = content;
    }

    writeMessageInDocument(wasSentByLoggedUser) {
        const modalId = "messageVideo" + amountOfVideosInChat;
        amountOfVideosInChat++;
    
    
    
        const input = document.createElement("div");
        input.className = "row";
        const col = document.createElement("div");
        col.className = "col";
    
    
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble img-message" : "othersSpeechBubble img-message";
    
        const videoModalButton = document.createElement("button");
        videoModalButton.type = "button";
        videoModalButton.className = "btn";
        videoModalButton.setAttribute("data-bs-toggle", "modal");
        videoModalButton.setAttribute("data-bs-target", "#" + modalId);
    
        const videoInSpeechBubble = document.createElement("video");
        videoInSpeechBubble.width = 320;
        videoInSpeechBubble.height = 240;
    
        const videoInSpeechBubbleSource = document.createElement("source");
        videoInSpeechBubbleSource.src = this.content;
        videoInSpeechBubbleSource.type = "video/mp4";
    
        videoInSpeechBubble.appendChild(videoInSpeechBubbleSource);
        videoModalButton.appendChild(videoInSpeechBubble);
        speechBubbleSpan.appendChild(videoModalButton);
        col.appendChild(speechBubbleSpan);
    
    
        const modalDiv = document.createElement("div");
        modalDiv.className = "modal fade";
        modalDiv.id = modalId;
        modalDiv.tabIndex = -1;
        modalDiv.setAttribute("aria-labelledby", "messagePicLabel");
        modalDiv.setAttribute("aria-hidden", "true");
        modalDiv.setAttribute("data-bs-backdrop", "static");
        modalDiv.setAttribute("data-bs-keyboard", "false");
    
        const modalDialogDiv = document.createElement("div");
        modalDialogDiv.className = "modal-dialog";
        const modalContentDiv = document.createElement("div");
        modalContentDiv.className = "modal-content";
    
    
        const modalHeader = document.createElement("div");
        modalHeader.className = "modal-header";
    
        const closeModalButton = document.createElement("button");
        closeModalButton.type = "button";
        closeModalButton.className = "btn-close";
        closeModalButton.setAttribute("data-bs-dismiss", "modal");
        closeModalButton.setAttribute("aria-label", "Close");
        const currentVideoIndex = amountOfVideosInChat - 1;
        closeModalButton.addEventListener("click", () => {
            sentVideos[currentVideoIndex].pause();
            sentVideos[currentVideoIndex].currentTime = 0;        
        });
    
        modalHeader.appendChild(closeModalButton);
        modalContentDiv.appendChild(modalHeader);
    
    
        const modalBodyDiv = document.createElement("div");
        modalBodyDiv.className = "modal-body";
    
        const videoInModal = document.createElement("video");
        videoInModal.style.width = "100%";
        videoInModal.controls = true;
    
        const videoInModalSource = document.createElement("source");
        videoInModalSource.src = this.content;
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
        closeVideoModalButton.click();
        scrollChat();
    }

    generateLatestMessageText() {
        return "Video";
    }
}


class AudioMessage {
    constructor(senderId) {
        this.senderId = senderId;
        this.date = new Date();
        this.content = messageInputAudioObjectURL;
    }

    writeMessageInDocument(wasSentByLoggedUser) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "row";
        const colDiv = document.createElement("div");
        colDiv.className = "col";
        const speechBubbleSpan = document.createElement("span");
        speechBubbleSpan.className = wasSentByLoggedUser ? "usersSpeechBubble" : "othersSpeechBubble";
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        const audioSource = document.createElement("source");
        audioSource.src = this.content;
        audioSource.type = "audio/mpeg";
    
        audioElement.appendChild(audioSource);
        speechBubbleSpan.appendChild(audioElement);
        colDiv.appendChild(speechBubbleSpan);
        rowDiv.appendChild(colDiv);
        sentChat.appendChild(rowDiv);
    
        closeMicrophoneModalButton.click();
        scrollChat();

        //After the message is send, the URL object of the latest recording is cleared.
        //That way the message can't be send again.
        messageInputAudioObjectURL = null;    

    }

    generateLatestMessageText() {
        return "Audio";
    }
}

messagesMap.set("0:1", [new TextMessage(0, "I'm a wizard"), new TextMessage(1, "I'm a jedi")]);
messagesMap.set("0:2", [new TextMessage(2, "I'm a time traveler"), new TextMessage(0, "I also time traveled in my third book")]);
messagesMap.set("1:2", [new TextMessage(2, "Did you ever hear the tragedy of Darth Plagueis The Wise?"), new TextMessage(1, "Yup...")]);
messagesMap.set("3:4", [new TextMessage(3, "GOOD GAME TODAY"), new ImageMessage(3, "images/lebronstats.jpeg"), new TextMessage(4, "Appreciate That!!")]);

/**
 * Login functions checks wheter the username and password
 * that got entered is found in users map, and triggers
 * show chat function that shoes chat file
 * and getchat that get the chat of a the specific user
 * @returns 
 */
function logIn() {
    const inputUsername_login_val = inputUsername_login.value;
    const inputPassword_login_val = inputPassword_login.value;
    const amountOfUsers = usersArr.length;
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputUsername_login_val.toLowerCase() == usersArr[i].username.toLowerCase() && inputPassword_login_val == usersArr[i].password) {
            loggedUser = usersArr[i].userId;
            showChat();
            getChat(usersArr[i].nickname, usersArr[i].pfp);
            return;
        }
    }
    alert("Wrong username or password");
}

/**
 * signup function that allow new users to sign in and adds them to users map
 * and does regular check oover password and username entered
 * @returns 
 */
function signUp() {
    //gets values entered
    const inputUsername_signup_val = inputUsername_signup.value;
    const inputNickname_val = inputNickname.value;
    const inputPassword_signup_val = inputPassword_signup.value;
    const passwordVerfication_val = passwordVerfication.value;
    //check if every filed is not empty
    if (inputUsername_signup_val == "" || inputNickname_val == "" || inputPassword_signup_val == "" || passwordVerfication_val == "") {
        alert("You must fill all fields");
        return;
    }

    if (inputUsername_signup_val.includes(":")) {
        alert("The username cannot include a ':' character");
        return;
    }

    //Checks if user alreadu exists
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputUsername_signup_val == usersArr[i].username) {
            alert("There already exists a user with this username");
            return;
        }
    }

    //does normal check over password entered (length, uppercase, etc...)
    const passwordLen = inputPassword_signup_val.length;
    let isThereADigit = false;
    let isThereAnUppercaseLetter = false;
    let isThereALowercaseLetter = false;

    for (let i = 0; i < passwordLen; i++) {
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

    //cehck if user didn't enter an images it put the default image
    if (inputPfp.value == ""){
        var inputPfp_val = "defaultProfile.jpeg"
    } else {
        var inputPfp_val = URL.createObjectURL(inputPfp.files[0]);
    }

    //adds user to userarr
    usersArr.push(new User(amountOfUsers - 1, inputUsername_signup_val, inputNickname_val, inputPassword_signup_val, inputPfp_val));

    hideSignup();
}

/**
 * Add sent message to messages box
 * @param {string} message message need to be added
 */
function sendMessage(message) {
    if (message.content != '') {
        //adds to message map
        addMessageToMessagesMap(message);
        //writes message in document
        message.writeMessageInDocument(message, true);
        //updates latest message
        updateLatestMessage(message, sendTo);
        scrollChat();
    }
}

/**
 * Adds message to the message map
 * @param {string} message message to need to be added to message map 
 */
function addMessageToMessagesMap(message) {
    if (messagesMap.has(messageKey)) {
        messagesList = messagesMap.get(messageKey);
        messagesList.push(message);
    } else {
        messagesMap.set(messageKey, [message]);
    }
}

/**
 * loads contact message to message chat box
 * by using their id 
 * @param {int} contactId contact's add that messages need to be added
 * @returns 
 */
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
        const amountOfMessages = messagesList.length;

        for (let i = 0; i < amountOfMessages; i++) {
            const message = messagesList[i];
            message.writeMessageInDocument(loggedUser == message.senderId);
        }
    }
}

/**
 * return the key of two users which returns first 
 * the smaller id bu valus
 * @param {int} userId1 first user id
 * @param {int} userId2 second user id
 * @returns key of two users
 */
function getKeyOfTwoUsers(userId1, userId2) {
    if (userId1 < userId2) {
        var key = userId1 + ":" + userId2;
    } else {
        var key = userId2 + ":" + userId1;
    }
    return key;
}

/**
 * Enables all button when pressed on a contact
 */
function enableSendMessageTabContents() {
    imageButton.disabled = false;
    videoButton.disabled = false;
    microphoneButton.disabled = false;
    text_message_to_send.disabled = false;
    sendTextMessageButton.disabled = false;
}

/**
 * Updates latest message when a new message in sent
 * @param {string} latestMessage mesasage to be updated with
 * @param {int} contactId the user that message belongs to
 */
function updateLatestMessage(latestMessage, contactId) {
    latestMessageDivs.get(contactId).innerHTML = latestMessage.generateLatestMessageText();
    latestMessageDateDivs.get(contactId).innerHTML = latestMessage.date.toUTCString();
}

/**
 * When pressed on specifec contact it load their
 * info (name and image) to the upper top box 
 * @param {string} nickname nickname of contact
 * @param {img} profile profile picture
 */
function loadContactInChat(nickname, profile) {
    const colDiv = document.createElement("div");
    const userImg = document.createElement("img");
    const userNickname = document.createTextNode(nickname);
    userImg.src = profile;
    userImg.alt = "Avatar";
    userImg.style.width = "60px";
    userImg.style.height = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.marginRight = "5px";
    colDiv.setAttribute("class", "col", "user");;
    userImg.className = "contact-profile";

    contactInChat.innerHTML = "";

    colDiv.appendChild(userImg);
    colDiv.appendChild(userNickname);
    contactInChat.appendChild(colDiv);
}

/**
 * When pressed on add contact button, to add an already existing cxontact
 * it add then to the left side of the screen in contact area,
 * and also check if contact exists in contacts array
 */
function addContact() {
    const inputContact_val = inputContact.value;
    if (inputContact_val == "") {
        alert("You must fill the contact's username field");
        return;
    }

    let contact = null;
    for (let i = 0; i < amountOfUsers; i++) {
        if (inputContact_val.toLowerCase() == usersArr[i].username.toLowerCase()) {
            contact = usersArr[i];
            break;
        }
    }
    //if enterd contact doed not exist
    if (contact == null) {
        alert("There is no user with this username");
        return;
    }

    //check if added contact is same as logged one
    if (contact.userId == loggedUser) {
        alert("You cannot add yourself as a contact");
        return;
    }

    //check if contact already added
    if (addedContacts.has(contact.userId)) {
        alert("This contact has already been added")
        return;
    }
    addedContacts.add(contact.userId);

    if (!hasAContactBeenAdded) {
        chatList.innerHTML = "";
        hasAContactBeenAdded = true;
    }

    //get's added contact latest message
    const latestMessage = getLatestMessage(loggedUser, contact.userId);
    if (latestMessage == null) {
        var latestMessageGeneratedText = "";
        var latestMessageDate = "";
    } else {
        var latestMessageGeneratedText = latestMessage.generateLatestMessageText();
        var latestMessageDate = latestMessage.date.toUTCString();
    }

    //creats html file to add to the document
    const listItemOfContact = document.createElement("li");
    listItemOfContact.className = "list-group-item d-flex justify-content-between align-items-start";
    listItemOfContact.addEventListener("click", () => {loadContactMessages(contact.userId); loadContactInChat(contact.nickname, contact.pfp);});

    const contactPfpElement = document.createElement("img");
    contactPfpElement.src = contact.pfp;
    contactPfpElement.alt = "Avatar";
    contactPfpElement.className = "contact-profile";

    listItemOfContact.appendChild(contactPfpElement);

    const contactDataDiv = document.createElement("div");
    contactDataDiv.className = "ms-2 me-auto";

    const nicknameDiv = document.createElement("div");
    nicknameDiv.className = "fw-bold";
    nicknameDiv.appendChild(document.createTextNode(contact.nickname));

    contactDataDiv.appendChild(nicknameDiv);

    const latestMessageDiv = document.createElement("div");
    latestMessageDiv.appendChild(document.createTextNode(latestMessageGeneratedText));

    latestMessageDivs.set(contact.userId, latestMessageDiv);
    contactDataDiv.appendChild(latestMessageDiv);

    const latestMessageDateDiv = document.createElement("div");
    latestMessageDateDiv.className = "latest-message-date";
    latestMessageDateDiv.appendChild(document.createTextNode(latestMessageDate));

    latestMessageDateDivs.set(contact.userId, latestMessageDateDiv);
    contactDataDiv.appendChild(latestMessageDateDiv);

    listItemOfContact.appendChild(contactDataDiv);
    chatList.appendChild(listItemOfContact);

    closeAddContact.click();
    inputContact.value = "";
}

/**
 * Get's latest message between two users
 * and return it
 * @param {int} userId1 
 * @param {int} userId2 
 * @returns 
 */
function getLatestMessage(userId1, userId2) {
    const messageKeyOfThe2Users = getKeyOfTwoUsers(userId1, userId2);
    if (messagesMap.has(messageKeyOfThe2Users)) {
        messagesList = messagesMap.get(messageKeyOfThe2Users);
        const amountOfMessages = messagesList.length;
        const latestMessage = messagesList[amountOfMessages - 1];
        return latestMessage;
    } else {
        return null;
    }
}

/**
 * When a message goes over 50 char
 * it cuts it to first 50 and adds ... to the end of it
 * @param {string} text text that needs to be cutted
 * @param {int} maxLength max text length
 * @returns return the new text
 */
function cutLongString(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength - 3) + "...";
    } else {
        return text;
    }
}

/**
 * when login succeeds or signup is pressed
 * it hides the login screen
 */
function hideLogin() {
    event.preventDefault();
    signupBox.style.visibility = "visible";
    loginBox.style.visibility = "hidden";
}

/**
 * when signup succeeds or login is pressed
 * it hides the signup screen
 */
function hideSignup() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "visible";
}

/**
 * when login succeeds it shows chat box screen
 */
function showChat() {
    event.preventDefault();
    signupBox.style.visibility = "hidden";
    loginBox.style.visibility = "hidden";
    chatBox.style.visibility = "visible";
}

/**
 * When a user signin it get the chat that 
 * is releated to him and adds it to chat box
 * with ther name and image
 * @param {string} nickname user nickname that get displayed
 * @param {img} picture user image to get displayed
 */
function getChat(nickname, picture) {
    userInfo.innerHTML = ""
    //creats html document to add to the main document
    const userImg = document.createElement("img");
    userImg.src = picture;
    userImg.style.width = "60px";
    userImg.style.borderRadius = "50%";
    userImg.style.marginRight = "5px";
    const nicknameTextNode = document.createTextNode(nickname);

    userInfo.appendChild(userImg);
    userInfo.appendChild(nicknameTextNode);
}

/**
 * Whenever a chat is sent it scroll to the bottom
 * to show the new chat
 */
function scrollChat(){
    sentChat.scrollTop = sentChat.scrollHeight;
}



let audioRecorder;

document.getElementById("startRecordingButton").addEventListener("click", startRecording);
document.getElementById("stopRecordingButton").addEventListener("click", stopRecording);

async function generateAudioRecorder() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(mediaStream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
        audioChunks.push(event.data);
    });

    const start = () => {
        mediaRecorder.start();
    };

    const stop = () => {
        return new Promise(resolve => {
            mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks);
                const audioUrl = URL.createObjectURL(audioBlob);
                resolve(audioUrl);
            });

            mediaRecorder.stop();
        });
    };
        
    return {start, stop};
};

async function startRecording() {
    audioRecorder = await generateAudioRecorder();
    audioRecorder.start();
}

async function stopRecording() {
    if (audioRecorder == null) {
        return;
    }
    messageInputAudioObjectURL = await audioRecorder.stop();
    audioRecorder = null;
}

})();
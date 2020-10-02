Menu.menuItemEvent.connect(onMenuItemEvent);
Menu.addMenu("Drop Net");
Menu.addMenuItem("Drop Net", "Clear all browsers");
Menu.addMenu("Drop Net > Clear one browser");
Menu.addMenuItem({
    menuName: "Drop Net",
    menuItemName: "Accept Requests",
    isCheckable: true
});
var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
var button = tablet.addButton({
    text: "Drop Net"
});
var approvedList = [];
var approvedListNumber = 0;
function onMenuItemEvent(menuItem) {
    print(menuItem);
    if (menuItem == "Clear all browsers") {
        ClearAllBrowsers();
    } else {
        for (var i = 0; i < oldUuids.length; i++) {
            if (menuItem == oldUuids[i].displayName) {
                Entities.deleteEntity(oldUuids[i].entityID);
                Menu.removeMenuItem("Drop Net > Clear one browser", oldUuids[i].displayName);
            }
        }
    }
}

var oldUuids = [
];
var numberToAssignUuidInArray = 0;
var entityPosition;
var entityMessage;

function onClicked() {
    var loc = Window.prompt("Enter url", "");
    if (loc) {
        var sessionUUID = MyAvatar.sessionUUID;
        Messages.sendMessage("webMe", JSON.stringify({
            sourceUrl: loc,
            displayName: MyAvatar.displayName,
            rotation: MyAvatar.orientation,
            sessionUUID: sessionUUID,
            position: Vec3.sum(MyAvatar.position, Quat.getFront(MyAvatar.orientation))
        }));
    }
}

function onMessageReceived(channel, message, sender, localOnly) {
    if (channel != "webMe") {
        return;
    }
    entityMessage = JSON.parse(message);
    if (entityMessage.displayName == MyAvatar.displayName && MyAvatar.sessionUUID == entityMessage.sessionUUID) {
        addWeb(entityMessage.displayName);
    } else if (approvedList.indexOf(entityMessage.sessionUUID) !== -1) {
        if (Menu.isOptionChecked("Accept Requests")) {
            addWeb(entityMessage.displayName);
        }
    } else {
        if (Menu.isOptionChecked("Accept Requests")) {
            var confirm = Window.confirm("Would you like to view web entity from " + entityMessage.displayName + "?");
            if (confirm == true) {
                approvedList[approvedListNumber] = entityMessage.sessionUUID;
                approvedListNumber++;
                addWeb(entityMessage.displayName);
            }

            function addWeb(displayName) {
                entityID = Entities.addEntity({
                    type: "Web",
                    sourceUrl: entityMessage.sourceUrl,
                    rotation: entityMessage.rotation,
                    dimensions: {
                        "x": 2.8344976902008057,
                        "y": 1.594405174255371,
                        "z": 0.009999999776482582
                    },
                    position: entityMessage.position
                }, "local");

                var NumberOfWebEntity = oldUuids.length + 1
                var oldUuidsEntity = {
                    displayName: displayName + " " + entityMessage.sourceUrl + " " + NumberOfWebEntity,
                    entityID: entityID
                };
                oldUuids[numberToAssignUuidInArray] = oldUuidsEntity;
                Menu.addMenuItem("Drop Net > Clear one browser", displayName + " " + entityMessage.sourceUrl + " " + oldUuids.length);
                numberToAssignUuidInArray++;
            }
        }
    }
}

MyAvatar.sessionUUIDChanged.connect(function () {
    ClearAllBrowsers();
});

Messages.subscribe("webMe");
Messages.messageReceived.connect(onMessageReceived);

button.clicked.connect(onClicked);

function ClearAllBrowsers() {
    for (var i = 0; i < oldUuids.length; i++) {
        print("Removing", i, oldUuids[i].entityID + '', oldUuids[i].displayName + '');
        Entities.deleteEntity(oldUuids[i].entityID);
        Menu.removeMenuItem("Drop Net > Clear one browser", oldUuids[i].displayName);
    }
    oldUuids = [
    ];
    numberToAssignUuidInArray = 0;
}

Script.scriptEnding.connect(function () {
    tablet.removeButton(button);
    ClearAllBrowsers();
    Messages.messageReceived.disconnect(onMessageReceived);
    Messages.unsubscribe("webMe");
    Menu.removeMenuItem("Drop Net", "Clear all browsers");
    Menu.removeMenu("Drop Net");
});

var UUID = MyAvatar.sessionUUID;
console.log(UUID);

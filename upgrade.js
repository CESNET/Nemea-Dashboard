var users = db.users_old.find();

print("### Updating USERS collection's scheme")

while(users.hasNext()) {
    var user = users.next();

    if (user.settings[0].settings != undefined) {
        print("USERS are up to date");
        quit();
    }

    db.users.update({"_id" : user._id}, { 
        "$set" : {
            "settings" : [{ 
                "items" : user.settings, 
                "settings" : {
                    "interval" : "60", 
                    "timeshift" : "0", 
                    "title" : "Default" 
                }
            }]
        }
    })
}

print("### DONE updating USERS collection")

print("### RESETTING sessions")

db.sessions.drop()

print("### DONE\nRestart the API")

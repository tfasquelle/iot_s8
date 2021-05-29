const schemaLogin = {
    "id": "/schemaLogin",  
    "properties": {
        "username": {
            "type": "string"
        }, 
        "password": {
            "type": "string"
        } 
    }, 
    "required": ["username", "password"]
};

const schemaData = {
    "id": "/schemaData",  
    "properties": {
        "jwt": {
            "type": "string"
        }, 
        "data": {
            "type": "string"
        }, 
        "dest": {
            "type": "number"
        }
    }, 
    "required": ["jwt", "data"]
};

exports.schemaLogin = schemaLogin
exports.schemaData = schemaData

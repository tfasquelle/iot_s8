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

const schemaFromBackend = {
    "id": "/schemaFromBackend",  
    "properties": {
        "msg": {
            "type": "string"
        }, 
        "dest": {
            "type": "number"
        }
    }, 
    "required": ["dest", "msg"]
};

exports.schemaLogin = schemaLogin;
exports.schemaData = schemaData;
exports.schemaFromBackend = schemaFromBackend;
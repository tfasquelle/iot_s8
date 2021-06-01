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
        }, 
        "dest": {
            "type": "number"
        }
    }, 
    "required": ["jwt", "data", "dest"]
};

const schemaFromBackend = {
    "id": "/schemaFromBackend",  
    "properties": {
        "data": {
        }, 
        "dest": {
            "type": "number"
        }, 
        "from": {
            "type": "string"
        }
    }, 
    "required": ["dest", "data", "from"]
};

exports.schemaLogin = schemaLogin;
exports.schemaData = schemaData;
exports.schemaFromBackend = schemaFromBackend;
const schemaLogin = {
    "id": "/schmaLogin",  
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
    "id": "/schmaLogin/schemaData",  
    "properties": {
        "jwt": {
            "type": "string"
        }, 
        "data": {
            "type": "string"
        } 
    }, 
    "required": ["jwt ", "data"]
};

exports.schemaLogin = schemaLogin
exports.schemaData = schemaData

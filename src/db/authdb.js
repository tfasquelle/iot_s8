const auth = [
    {id:"client1", pass:"pass1", jwd:"", authorized_dest:[0, 2]},
    {id:"client2", pass:"pass2", jwd:"", authorized_dest:[1]},
    {id:"client3", pass:"pass3", jwd:"", authorized_dest:[1, 2, 3]},
    {id:"client4", pass:"pass4", jwd:"", authorized_dest:[1, 2]},
    {id:"client5", pass:"pass5", jwd:"", authorized_dest:[0, 1]},
    {id:"client6", pass:"pass6", jwd:"", authorized_dest:[2, 3]},
    {id:"client7", pass:"pass7", jwd:"", authorized_dest:[2]},
    {id:"client8", pass:"pass8", jwd:"", authorized_dest:[3]},
    {id:"client9", pass:"pass9", jwd:"", authorized_dest:[0, 3]},
    {id:"client10", pass:"pass10", jwd:"", authorized_dest:[0, 1, 2, 3]}
];

exports.auth = auth;
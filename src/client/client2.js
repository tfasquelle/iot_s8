// Implementation with axios
const axios = require('axios');

var iter_data = 0;
/*
  action performed each 30 seconds
*/
function action(jwt) {
    iter_data++;
    axios.post("http://localhost:8000/pushdata",{jwt:jwt,
                                                 data:{complexdata:'ok',withnumber:iter_data},
                                                 destination:destination})
        .catch(function (error) {
            console.log("PUSHDATA ERROR",error);
        });

}

/* Doing POST ... Imbricate them*/
axios.post("http://localhost:8000/login",{username: login,
                                          password: password}
          ).then(function(d) {
              var jwt = d.data.message;
              setInterval(() => {
                  action(jwt);
              },
                          300);
          }).catch(function (error) {
              // handle error
              console.log("LOGIN ERROR",error);
          });
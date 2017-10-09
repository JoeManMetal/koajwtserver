const Koa = require('koa');
const Router = require('koa-router');
const cors = require('kcors');

const app = new Koa();
const router = new Router();

const serviceAccount = require("./lohasexpo2018-firebase-adminsdk-olif5-b8f2504c39.json");
var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://lohasexpo2018.firebaseio.com"
});

const db = admin.database();
var firebaseGetAllUsers = async () => {
    try {
        return await db.ref("allusers")
        .once("value")
        .then(function(snapshot) {
            return snapshot;
        })
    } catch (err) {        
        //throw err;
        return false;
    }
}

var firebaseGetCompanyByUserId = async (uid) => {
    try {
        return await db.ref("users/" + uid)
        .once("value")
        .then(function(snapshot) {
            return snapshot.val();
        })
    } catch (err) {        
        //throw err;
        return false;
    }
}

var firebaseGetUserById = async (uid) => {
    return await admin.auth().getUser(uid)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      return userRecord.toJSON()
    })
    .catch(function(error) {
      return false;
    });
}

var firebaseUpdateUserById = async (uid, userData) => {
    return await admin.auth().updateUser(uid, userData)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      return userRecord.toJSON()
    })
    .catch(function(error) {
      return false;
    });
}

var firebaseCreateUser = async (userData) => {
    return await admin.auth().createUser(userData)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      return userRecord.toJSON()
    })
    .catch(function(error) {
      return false;
    });
}

var firebaseGetUserByEmail = async (email) => {
    return await admin.auth().getUserByEmail(email)
    .then(function(userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      return userRecord.toJSON();
    })
    .catch(function(error) {
      return false
    });

}

var checkToken = async (idToken) => {
    
    return await admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
        return decodedToken.uid;        

    }).catch(function(error) {
        return false;
    });
}

var getFormData = async (ctx) => {
    
    return new Promise(function executor (resolve, reject) {

        let body = [];
        ctx.req.on('error', (err) => {
            if (err) return reject(err)

        }).on('data', function (chunk) {
            body.push(chunk);

        }).on('end', function (chunk) {        
            body = Buffer.concat(body).toString(); 
            
            if(body){
                resolve(JSON.parse(body));
            } else {
                resolve();
            }

        })

    })
    
}


app.use(cors());



app.use( async (ctx, next) => {
    if (ctx.url.match(/^\/firebase\/getAllUsers/)) {    
        
        const data = await getFormData(ctx); 
        
        if(data){
            var uid = await checkToken(data.idToken);            
            if(uid){            
                ctx.type = 'application/json';                
                const users = await firebaseGetAllUsers(); 
                //users.forEach(function(data) {
                    //console.log( data.key, data.val());
                    

                //});
                ctx.body = JSON.stringify(users);
            }
        }
          
    } else {
        await next()
    }
});

app.use( async (ctx, next) => {
    if (ctx.url.match(/^\/firebase\/getUserById/)) {    
        
        const data = await getFormData(ctx); 
        
        if(data){
            var uid = await checkToken(data.idToken);            
            if(uid){           
                //console.log(data, data.data.uid)
                ctx.type = 'application/json';                
                const user = await firebaseGetUserById(data.uid); 
                //console.log(user)
                ctx.body = JSON.stringify(user);
            }
        }
          
    } else {
        await next()
    }
});

app.use( async (ctx, next) => {
    if (ctx.url.match(/^\/firebase\/updateUserById/)) {    
        
        const data = await getFormData(ctx); 
        
        if(data){
            var uid = await checkToken(data.idToken);            
            if(uid){           
                
                ctx.type = 'application/json';                
                const user = await firebaseUpdateUserById(data.uid, data.data); 

                if(user){
                    ctx.body = JSON.stringify(user);
                } else {
                    ctx.status = 400;
                    ctx.body = JSON.stringify('Error to update user');
                    
                }
            }
        }
          
    } else {
        await next()
    }
});

app.use( async (ctx, next) => {
    if (ctx.url.match(/^\/firebase\/createUser/)) {    
        
        const data = await getFormData(ctx); 
        
        if(data){
            var uid = await checkToken(data.idToken);            
            if(uid){           
                
                ctx.type = 'application/json';                
                const user = await firebaseCreateUser(data.data); 
                if(user){
                    ctx.body = JSON.stringify(user);
                } else {
                    ctx.status = 400;
                    ctx.body = JSON.stringify('Error to create user');
                    
                }
            }
        }
          
    } else {
        await next()
    }
});

app.use( async (ctx) => {
    if (ctx.url.match(/^\/firebase\/public/)) { 
        
        ctx.body = "public"
    }
})

app.listen(3001);

const User = require('../../models/User');
const UserSession = require('../../models/UserSession')
module.exports = (app) => {
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        next();
      });
      
    // Sign up
    app.post('/api/account/signup',(req, res, next) => {
        const { body } = req ;
        const {
            firstName,
            lastName,
            password,
        } = body;
        let { email } =  body ;
        if (!firstName) {
            return res.send({
                success: false,
                message: 'Error: first name cannot be blank'
            })
        }
        if (!lastName) {
            return res.send({
                success: false,
                message: 'Error: last name cannot be blank'
            })
        }
        if (!email) {
            return res.send({
                success: false,
                message: 'Error: email cannot be blank'
            })
        }
        if (!password) {
            return res.send({
                success: false,
                message: 'Error: password cannot be blank'
            })
        }

        email = email.toLowerCase();

        // Steps:
        // 1. Verify email doesn't exist
        // 2. Save
        User.find({
            email: email
            }, (err,previousUsers) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error'
                    });
                } else if (previousUsers.length > 0) {
                    return res.send({
                        success: false,
                        message: 'Error: Account already exist.'
                    });
                }

                //save the new user
                const newUser = new User()
                newUser.email = email;
                newUser.firstName = firstName;
                newUser.lastName = lastName;
                newUser.password = newUser.generateHash(password);
                newUser.save((err,user) => {
                    if (err) {
                        return res.send({
                            success: false,
                            message: 'Error: Server error'
                        });
                    }
                    return res.send({
                        success: true,
                        message: 'Signed up'
                    })
                })
            })

    })
    app.put('/api/account/update/score', (req,res,next) => {
        const { body } = req;
        const { token , score } = body;

        UserSession.findOne({
            _id: token,
            isDeleted: false
        },(err,session) => { // todo , check why when does not find, it returns error
            if(err) {
                return res.send({
                    success: false,
                    message: 'server error'
                })
            }
           // console.log(session);
            if (!session){
                return res.send({
                    success: false,
                    message: 'no session'
                })
            }

            const { userId } = session;

            User.findByIdAndUpdate(userId, {$inc : {'score' : score}} , {new: true}, (err,user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'server error'
                    })
                } else {
                    return res.send({
                        success: true,
                        message: 'all fine',
                        score: user.score
                    })
                }
            })

        })
        


    })

    app.get('/api/account/score', (req,res,next) => {
        const { query } = req;
        const { token } = query;
        //console.log("here");
        UserSession.findOne({
            _id: token,
            isDeleted: false
        },(err,session) => { // todo , check why when does not find, it returns error
            if(err) {
                return res.send({
                    success: false,
                    message: 'server error'
                })
            }
           // console.log(session);
            if (!session){
                return res.send({
                    success: false,
                    message: 'no session'
                })
            }

            const { userId } = session;

            User.findById(userId, (err,user) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'server error'
                    })
                } else {
                    return res.send({
                        success: true,
                        message: 'all fine',
                        score: user.score
                    })
                }
            })

        })

    })
    app.post('/api/account/login',(req, res, next) => {
        const { body } = req ;
        const {
            password,
        } = body;
        let { email } =  body ;

        if (!password) {
            return res.send({
                success: false,
                message: 'Error: password cannot be blank'
            })
        }
        if (!email) {
            return res.send({
                success: false,
                message: 'Error: email cannot be blank'
            })
        }

        email = email.toLowerCase();

        User.find({
            email: email
        } , (err,users) => {
            if(err) {
                return res.send({
                    success: false,
                    message: "Server error"
                });
            }
            if (users.length != 1) {
                return res.send({
                    success: false,
                    message: "Invalid username or password"
                });
            }
            const user = users[0];

            if (!user.validPassword(password)) {
                return res.send({
                    success: false,
                    message: "Invalid username or password"
                }); 
            }

            //if code went so far, password is correct . 
            // therfore create user session

            const userSession = new UserSession();
            userSession.userId = user._id;
            userSession.save((err,session) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: 'Error: Server error'
                    });
                }
                return res.send({
                    success: true,
                    message: 'Logged in',
                    token: session._id
                })
            })
        }) 

    })

    //todo , change to post request
    app.get('/api/account/verify', (req,res,next) => {
        const {query} = req;
        const {token} = query;

        UserSession.findOne({
            _id: token,
            isDeleted: false
        },(err,session) => { // todo , check why when does not find, it returns error
            if(err) {
                return res.send({
                    success: false,
                    message: 'server error'
                })
            }
        //    console.log(session);
            if (!session){
                return res.send({
                    success: false,
                    message: 'no session'
                })
            }
            return res.send({
                success: true,
                message: 'verified'
            })
            

        })

    })
    
    app.get('/api/account/logout',(req,res,next)=> {
        const {query} = req;
        const {token} = query;

        UserSession.findOneAndUpdate({
            _id: token,
            isDeleted: false
        },
        {
            $set:{isDeleted:true}
        },
        (err,session) => { // todo , check why when does not find, it returns error
            if(err) {
                return res.send({
                    success: false,
                    message: 'server error'
                })
            }
          //  console.log(session);
            return res.send({
                success: true,
                message: 'logged out'
            })
        })  

    })

};

// const Counter = require('../../models/Counter');

// module.exports = (app) => {
//   app.get('/api/counters', (req, res, next) => {
//     Counter.find()
//       .exec()
//       .then((counter) => res.json(counter))
//       .catch((err) => next(err));
//   });

//   app.post('/api/counters', function (req, res, next) {
//     const counter = new Counter();

//     counter.save()
//       .then(() => res.json(counter))
//       .catch((err) => next(err));
//   });

//   app.delete('/api/counters/:id', function (req, res, next) {
//     Counter.findOneAndRemove({ _id: req.params.id })
//       .exec()
//       .then((counter) => res.json())
//       .catch((err) => next(err));
//   });

//   app.put('/api/counters/:id/increment', (req, res, next) => {
//     Counter.findById(req.params.id)
//       .exec()
//       .then((counter) => {
//         counter.count++;

//         counter.save()
//           .then(() => res.json(counter))
//           .catch((err) => next(err));
//       })
//       .catch((err) => next(err));
//   });

//   app.put('/api/counters/:id/decrement', (req, res, next) => {
//     Counter.findById(req.params.id)
//       .exec()
//       .then((counter) => {
//         counter.count--;

//         counter.save()
//           .then(() => res.json(counter))
//           .catch((err) => next(err));
//       })
//       .catch((err) => next(err));
//   });
// };
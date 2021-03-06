require('./config/config');



//library imports
const express= require('express');
const bodyParser= require('body-parser');
const _ = require('lodash');
//make an object id
var {ObjectID}= require('mongodb');

//local imports
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app= express();
const port= process.env.PORT || 3000;


app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  var todo= new Todo({
    text: req.body.text
  });

todo.save().then((doc) => {
  res.send(doc);
}, (e) => {
  res.status(400).send(e);
});
});

app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});


app.delete('/todos/:id',(req, res) => {
  //get the id
  var id= req.params.id;
  //validate the id - if not valid, return a 404
  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  //remove todo by id
  Todo.findByIdAndRemove(id).then((todo) => {
    //success case
    //if there was a doc by that id
    if(!todo) {
      return res.status(404).send();
    }
    //if there was no doc by that id
    res.send({todo});
  }).catch((e) => {
    return res.status(400).send();
  });
});


//accessing the id from the user
//GET/todos/id#
app.get('/todos/:id', (req, res) => {
  var id= req.params.id;

  //validate the id using isValid
  if (!ObjectID.isValid(id)) {
    //404- send back empty send
    return res.status(404).send();
  }
  //find by id
  Todo.findById(id).then((todo) => {
    //woah there is an id!!! Does it have a todo with it?
    if (!todo){
      //send back a 404 with empty body
      return res.status(404).send();
    }
    //if the todo exists, send it back
    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

//patches are used to alter the todo information after it's already been set
app.patch('/todos/:id', (req, res) => {
  var id = req.params.id;
  //body will store the updates made by the user
  //body will contain a subset of the things given by the user
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
//check if the body is completed
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if(!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

//POST/users
app.post('/users', (req,res) => {
  //gather the email and password information from the user
  var body = _.pick(req.body, ['email', 'password']);
  //create a new instance of the model
  var user= new User(body);
  //if things go well, save the doc, if not send back an error
    user.save().then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      //x- means custom header
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
  })
});


app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

//Let's make a login thing for people who already have accounts
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email,body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  })
});

app.listen(port, () => {
  console.log('Started on port ' + port);
});


module.exports = {app};

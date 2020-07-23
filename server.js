import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import mongo from 'mongodb'
import { connect } from 'http2'

var MongoClient = mongo.MongoClient
var url = "mongodb://localhost:27017/"

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)

app.use(express.static('public'))

sockets.on('connection', socket =>{
    console.log('Conectado com ID: ' + socket.id)  
    
    socket.on('new-contact', data =>{
        addContact({ name: data.name, tel: data.tel, email: data.email})
    })

    var contacts = null
    var MongoClient = mongo.MongoClient
    var url = "mongodb://localhost:27017/"

    MongoClient.connect(url,{useUnifiedTopology:true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        //Find all documents in the customers collection:
        dbo.collection("contacts").find({}).toArray(function(err, result) {
          if (err) throw err;
          socket.emit("get-contacts",result)          
          db.close();
        });
      });

    socket.on('remove', data=>{
      const name = data.name
      removeContact(name)
    })    

    socket.on('atualiza', (oldData, newData)=>{
      const oldContact = {
        name: oldData.name,
        tel: oldData.tel,
        email: oldData.email
      } 
      const newContact = {
        name: newData.name,
        tel: newData.tel,
        email: newData.email
      } 
      updateContact(oldContact, newContact)
    })
})
function removeContact(name){

  var MongoClient = mongo.MongoClient
  var url = "mongodb://localhost:27017/";
        
        MongoClient.connect(url,{useUnifiedTopology:true}, function(err, db) {
          if (err) throw err;
          var dbo = db.db("mydb");
          var myquery = {name: name};          
          dbo.collection("contacts").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Contact deleted. Name: " + name);
            db.close();
          });
        });
}

function addContact(contact){
    MongoClient.connect(url,{useUnifiedTopology:true}, function(err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("contacts").insertOne(contact, function(err, res) {
          if (err) throw err;
          console.log("Contact inserted. Name: " + contact.name);
          db.close();
        });
      });
}   

function updateContact(oldContact, newContact){
  
  var url = "mongodb://127.0.0.1:27017/";

  MongoClient.connect(url,{useUnifiedTopology:true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mydb");    
    var newvalues = { $set: newContact};

    dbo.collection("contacts").updateOne(oldContact, newvalues, function(err, res) {
      if (err) throw err;
      console.log("Contact updated. Name: " + newContact.name);
      db.close();
    });
  });
}
server.listen(3000, () => {
    console.log(`> Server listening on port: 3000`)
})
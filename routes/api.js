/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;



module.exports = function (app) {

  const CONNECTION_STRING = process.env.DB; 
  
  const client = new MongoClient(CONNECTION_STRING, {useNewUrlParser: true});


  

  app.route('/api/issues/:project')
  
      .get(function (req, res){
        const dbName = req.params.project;
        
        client.connect(function(err) {
          if (err) throw err;
          const db = client.db(dbName)

          if (req.query) {
            db.collection('issues').find(req.query).toArray(function(err, docs) {
              if (err) throw err;
              res.json(docs);
              return
            })
          } else {
            db.collection('issues').find({}).toArray(function(err, docs) {
              if (err) throw err;
              res.json(docs);
            })
          }
          
          
      
          console.log('successful database connection')
        })

        
      })
      
      .post(function (req, res){
        
        const dbName = req.params.project;

        client.connect(function(err) {
          if(err) {
            console.log('Database error: ' + err);
          } else {
            console.log('Successful database connection');
            const db = client.db(dbName)

            if (req.body.issue_title === '' || req.body.issue_text === '' || req.body.created_by === '') {
              res.send('Missing required fields')
              return;
            }

            const issues = db.collection('issues');
            let assigned;
            let status;
            if (req.body.assigned_to) {
              assigned = req.body.assigned_to;
            } else assigned = '';
            if (req.body.status_text) {
              status = req.body.status_text;
            } else status = ''
            
            let issue = {
              issue_title: req.body.issue_title, 
              issue_text: req.body.issue_text, 
              created_by: req.body.created_by, 
              assigned_to: assigned, 
              status_text: status,
              created_on: new Date(),
              updated_on: new Date(),
              open: true
            }

            issues.insertOne(issue, function(err, result) {
              if (err) throw err;
              issue._id = result.insertedId.valueOf()
              res.json(issue)
            });
            
          }
      
        });
        
      })
      
      .put(function (req, res){
        const dbName = req.params.project;
        
        client.connect(function(err) {
          if(err) {
            console.log('Database error: ' + err);
          } else {
            console.log('Successful database connection');
            const db = client.db(dbName)
            if (req.body.issue_title === '' && req.body.issue_text === '' && 
              req.body.created_by === '' && req.body.assigned_to === '' && req.body.status_text === '' && req.body.open !== false) {
                res.send('no updated fields sent')
                return;
              }
            let issue = {updated_on: new Date()};
            if (req.body.issue_title) issue.issue_title = req.body.issue_title;
            if (req.body.issue_text) issue.issue_text = req.body.issue_text;
            if (req.body.created_by) issue.created_by = req.body.created_by;
            if (req.body.assigned_to) issue.assigned_to = req.body.assigned_to;
            if (req.body.status_text) issue.status_text = req.body.status_text;
            if (req.body.open === false) issue.open = false;
            
            if (req.body._id.length !== 24) {
              res.send('could not update ' + req.body._id)
              return
            }

            const issues = db.collection('issues');
            issues.updateOne({_id: ObjectId(req.body._id)}, {$set: issue}, function(err, result) {
              if (result.result.nModified !== 1) res.send('could not update ' + req.body._id)
            })
            
            res.send('successfully updated')
            
          }
        })
      })
      
      .delete(function (req, res){
        var project = req.params.project;
        
        client.connect(function(err) {
          if(err) {
            console.log('Database error: ' + err);
          } else {
            console.log('Successful database connection');
            const db = client.db(dbName)
            const issues = db.collection('issues');

            if (!req.body._id) {
              res.send('_id error')
              return
            }

            if (req.body._id.length !== 24) {
              res.send('could not delete ' + req.body._id)
              return
            }

            issues.remove({_id: ObjectId(req.body._id)}, function(err, result) {
              if (err) throw err;
              if (result.result.n === 1) {
                res.send('deleted ' + req.body._id)
              } else {
                res.send('could not delete ' + req.body._id)
              }
            })
            res.send('deleted ' + req.body._id)


          }
        })


      });


    
};




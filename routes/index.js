var express = require('express');
var router = express.Router();
var OSWrap = require('openstack-wrapper');

var keyStoneUrlPortAndPath = 'http://localhost:5000/v3';
var glanceUrlPortAndPath = 'http://localhost:9292/v2';
var neutronUrlPortAndPath = 'http://localhost:9696/v2.0';

var keystoneTokenObject = null;
var keystoneTokenString = null;
var projectObject = null;
var projectToken = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST to add new user to db */
router.post('/loginUser', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var host = req.body.hostValue;

  var keyStoneURL = keyStoneUrlPortAndPath;//"http://"+host+keyStoneUrlPortAndPath;
  console.log(" Username ="+username+" Password ="+password+" Host ="+host);
  var keystone = new OSWrap.Keystone(keyStoneURL);
  console.log(" keyStoneURL ="+keyStoneURL);
  keystone.getToken(username, password, function(keyStoneError, authToken){
    if(keyStoneError) {
      console.error('an error occured', keyStoneError);
      res.render('error', { 'errorObject': keyStoneError });
    } else {
      console.log('A general token object has been retrived', authToken);
      keystoneTokenObject = authToken;
      keystoneTokenString = authToken.token;
      projectObject = authToken.project;
      console.error('Project ='+ projectObject.name);
      // res.render('Home', { 'token' : keystoneTokenString, 'project' : projectObject });
      keystone.getProjectToken(keystoneTokenString, projectObject.id, function(error, project_token){
        if(error) {
          console.error('an error occured', error);
        } else {
          console.log('A project specific token has been retrived', project_token);
          projectToken = project_token;
          res.render('Home', { 'token' : keystoneTokenString, 'project' : projectObject, 'projectToken' : projectToken.token });
          //the project token contains all kinds of project information
          //including endpoint urls for each of the various systems (Nova, Neutron, Glance)
          //and the token value (project_token.token) required for instantiating all non Keystone Objects
          //see the openstack docs for more specifics on the return format of this object (or print it out I suppose)
        }
    });

    }
  });
});


/* GET user page. */
router.get('/viewServers', function(req, res) {
  // res.render('viewServers',{'servers': [] });

  var novaURL = 'http://localhost:8774/v2.1/e163803e6e154f88b188e641fe346529';//"http://"+host+keyStoneUrlPortAndPath;
  console.log(" novaURL ="+novaURL);

  var nova = new OSWrap.Nova(novaURL, keystoneTokenString);
  console.log(" novaURL1 ="+novaURL);

  nova.listServers(function(error, servers_array){
    if(error)
    {
      console.error('an error occured', error);
      res.render('error', { 'errorObject': error });
    }
    else
    {
      console.log('A list of servers have been retrived', servers_array);
      console.log('------ YES Retrieved '+servers_array);
      res.render('viewServers',{'servers':servers_array});
    }
  });
});


/* GET user page. */
router.get('/viewFlavors', function(req, res) {
  // res.render('viewServers',{'servers': [] });

  var novaURL = 'http://localhost:8774/v2.1/e163803e6e154f88b188e641fe346529';//"http://"+host+keyStoneUrlPortAndPath;
  console.log(" novaURL ="+novaURL);

  var nova = new OSWrap.Nova(novaURL, keystoneTokenString);
  console.log(" novaURL1 ="+novaURL);

  nova.listFlavors(function(error, flavors_array){
    if(error)
    {
      console.error('an error occured', error);
      res.render('error', { 'errorObject': error });
    }
    else
    {
      console.log('A list of flavors have been retrived', flavors_array);
      console.log('------ YES Retrieved '+flavors_array);
      res.render('viewFlavors',{'flavors':flavors_array});
    }
  });
});


/* GET user page. */
router.get('/viewNetworks', function(req, res) {
  console.log(" neutronURL ="+neutronUrlPortAndPath);

  var neutron = new OSWrap.Neutron(neutronUrlPortAndPath, keystoneTokenString);
  console.log(" neutronURL ="+neutronUrlPortAndPath);

  neutron.listNetworks(function(error, networks_array){
    if(error)
    {
      console.error('an error occured', error);
      res.render('error', { 'errorObject': error });
    }
    else
    {
      console.log('A list of servers have been retrived', networks_array);
      console.log('------ YES Retrieved '+networks_array);
      res.render('viewNetworks',{'networks':networks_array});
    }
  });
});

/* GET user page. */
router.get('/viewSecurityGroups', function(req, res) {
  console.log(" neutronURL ="+neutronUrlPortAndPath);

  var neutron = new OSWrap.Neutron(neutronUrlPortAndPath, keystoneTokenString);
  console.log(" neutronURL ="+neutronUrlPortAndPath);

  neutron.listSecurityGroups(projectObject.id,function(error, securityGroups_array){
    if(error)
    {
      console.error('an error occured', error);
      res.render('error', { 'errorObject': error });
    }
    else
    {
      console.log('A list of securityGroups have been retrived', securityGroups_array);
      res.render('viewSecurityGroups',{'securityGroups':securityGroups_array});
    }
  });
});


/* GET user page. */
router.get('/viewImages', function(req, res) {
  console.log(" glanceURl ="+glanceUrlPortAndPath);

  var glance = new OSWrap.Glance(glanceUrlPortAndPath, keystoneTokenString);
  console.log(" glanceURl ="+glanceUrlPortAndPath);

  glance.listImages(function(error, images_array){
    if(error)
    {
      console.error('an error occured', error);
      res.render('error', { 'errorObject': error });
    }
    else
    {
      console.log('A list of servers have been retrived', images_array);
      console.log('------ YES Retrieved '+images_array);
      res.render('viewImages',{'images':images_array});
    }
  });
});


/* GET user page. */
router.get('/viewTokens', function(req, res) {
  res.render('viewTokens', { 'token' : keystoneTokenString, 'project' : projectObject, 'projectToken' : projectToken.token });

});

/* GET user page. */
router.get('/Home', function(req, res) {
  res.render('Home', { 'token' : keystoneTokenString, 'project' : projectObject, 'projectToken' : projectToken.token });

});







module.exports = router;

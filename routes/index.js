var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://golden-bed:Aa26951546@cluster0.iverxbm.mongodb.net/?retryWrites=true&w=majority";
var database = "mydb";
var dbo;
MongoClient.connect(url,function(err,db){
  if(err) throw err;
  dbo = db;
  console.log('MongoClient is connected');
})

function add(collection, myobj) {
    dbo.db(database).collection(collection).insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
    });
}

const auth =(req,res,next)=>{
  if(!req.session.card){
    return res.redirect("/")
  }else{
    next();
  }
}

router.get('/', async function (req, res, next) {
  if(!req.session.card){
    req.session.numberOfOrders = 0;
    req.session.card = [];
  }
  let card = req.session.card;
  let selector = await dbo.db(database).collection("select").find({}).toArray();
  let products = await dbo.db(database).collection("products").find({}).limit(20).toArray();
  res.render('index', { title: 'HomePage', products: products, selector: selector, cardSize: card.length});
});

router.get('/contact',auth,function (req, res, next) {
  let card = req.session.card;
  res.render('contact', { title: 'Contact Page',cardSize: card.length})
});

router.post('/contact',auth, function (req, res, next) {
  let card = req.session.card;
  let today = new Date();
  let obj = {
    "Date":today,"Name": req.body.name, "PhoneNumber": req.body.phoneNumber, "email": req.body.email, "message": req.body.message
  }
  add("contacts", obj);
  add("oldContacts", obj);
  res.render('recieveMessage',{cardSize: card.length});
});

router.post('/checkout',auth,function(req,res,next){
  let obj = req.body;
  let card = req.session.card;
  obj.clientCard = card;
  let price = 0;
  for(let i=0;i<card.length;i++){
    price+= Number(card[i].price);
  }
  obj.totalPrice = price;
  obj.Date = new Date();
  add("newOrders",obj);
  add("oldOrders",obj);
  card = []
  console.log(price);
  req.session.card = card;
  res.render('recieveCheckout',{cardSize: card.length});
});

router.get('/checkout/:id',auth,function(req,res,next){
  card = req.session.card;
  console.log(card);
  card = card.filter(item=>item.cardId!=req.params.id);
  req.session.card = card;
  console.log(card);
  res.status(204).send();
});

router.get('/checkout',auth, function (req, res, next) {
  let card = req.session.card;
  res.render('checkout', { title: 'Checkout Page',products:card});
});


router.get('/about', auth,function (req, res, next) {
  let card = req.session.card;
  res.render('about', { title: "About" ,cardSize: card.length})
});

router.get('/:id',auth,async function (req, res, next) {
  let selector = await dbo.db(database).collection("select").find({}).toArray();
  let products = await dbo.db(database).collection("products").find({type:req.params.id}).toArray();
  let card = req.session.card;
  res.render('index', { title: 'HomePage', products: products, selector: selector, cardSize: card.length, select: req.params.id });
});

router.post('/:id',auth,async function (req, res, next) {
  let product = await dbo.db(database).collection("products").findOne({"id":req.params.id});
  product.productSize = req.body.optionsRadios;
  product.cardId =req.session.numberOfOrders; 
  //console.log(product);
  let card = req.session.card;
  card.push(product);
  req.session.numberOfOrders = req.session.numberOfOrders+1;
  req.session.card = card;
  res.status(204).send();
});


module.exports = router;

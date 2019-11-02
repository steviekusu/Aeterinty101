const contractSource = `
contract Landify =
    
  record landDetails = 
    { id : int,
      name : string,
      creatorAddress : address,
      image1 : string,
      image2 : string,
      description : string,
      price : int,
      timestamp : int }
    
  record state = {
    lands : map(int, landDetails),
    landLength : int}
    
  entrypoint init() = { 
    lands = {},
    landLength = 0 }

  entrypoint getLandLength() : int = 
    state.landLength
    
  payable stateful entrypoint createLand( image1' : string, image2' : string, name' : string, description' : string, price' : int) = 
    let timestamp' = Chain.timestamp
    let landReg = { id = getLandLength()+1, name = name', creatorAddress  = Call.caller, image1 = image1', image2 = image2', description = description', price= price', timestamp = timestamp'}
    let index = getLandLength() + 1
    put(state{lands[index] = landReg, landLength = index})
    
  entrypoint getLand(index : int) = 
    switch(Map.lookup(index, state.lands))
      None => abort("Land does not exist with this index")
      Some(x) => x  
    
  entrypoint getPrice(index : int) = 
    state.lands[index].price
    
  entrypoint getId(index : int) = 
    state.lands[index].id
`;

const contractAddress = 'ct_CnHYLN6EBR2JjZE1Jcq7v1NkTsyAyBAnkSYXjJNYH8MApSF73';
var LandArray = [];
var client = null;
var LandLength = 0;

function renderLands() {
  LandArray = LandArray.sort(function (a, b) {return b.Price - a.Price})
  var template = $('#template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, {LandArray});
  $('#body').html(rendered);
  console.log("Land Rendered")
}
async function callStatic(func, args) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  console.log("Contract : ", contract)
  const calledGet = await contract.call(func, args, {callStatic: true}).catch(e => console.error(e));
  console.log("Called get found: ", calledGet)
  const decodedGet = await calledGet.decode().catch(e => console.error(e));
  console.log("catching errors : ", decodedGet)
  return decodedGet;
}

async function contractCall(func, args, value) {
  const contract = await client.getContractInstance(contractSource, {contractAddress});
  const calledSet = await contract.call(func, args, {amount: value}).catch(e => console.error(e));

  return calledSet;
}

window.addEventListener('load', async () => {
    
  $("#loading-bar-spinner").show();

  client = await Ae.Aepp()

  LandLength = await callStatic('getLandLength', []);


  for (let i = 1; i <= LandLength; i++) {
    const property = await callStatic('getLand', [i]);

    console.log("for loop reached", "pushing to array")
    console.log(property.name)
    console.log(property.description)
    console.log(property.image1)

    LandArray.push({
      id: property.id,
      creatorAddress: property.creatorAddress,
      image1: property.image1,
      image2: property.image2,
      name: property.name,
      description: property.description,
      price: property.price
    })

    // vote
    //   $(function () {
    //     $("i").click(function () {
    //       $("i,span").toggleClass("press", 1000);
    //     });
    //   });
    // }
    renderLands();
    $("#loading-bar-spinner").hide();
  }
});


$('.regBtns').click(async function(){
  $("#loading-bar-spinner").show();
  console.log("Button Clicked")
  const land_name = ($('#Regname').val());
  const land_image1 = ($("#Regimg1").val());
  const land_image2 = ($("#Regimg2").val());
  const land_price = ($("#RegPrice").val());
  const land_description = ($("#Regdescription").val());
  console.log("-------------------------------------")
  console.log("Name:",land_name)
  console.log("image1:",land_image1)
  console.log("Image2:",land_image2)
  

  const new_land = await contractCall('createLand', [land_image1, land_image2, land_name,land_description, land_price],40000);
  console.log("SAVED TO THE DB", new_land)

  LandArray.push({
    id: LandArray.length + 1,
    image1: new_land.image1,
    image2: new_land.image2,
    name: new_land.name,
    description: new_land.description,
    price: new_land.price
  })


  renderLands();
  
  //   //This will clear the value in all scenarious
  //   var name_input = document.getElementById("name")
  //       name_input.value =""
  //   var image_input = document.getElementById("image1")
  //       url_input.value =""
  //   var image_input = document.getElementById("image2")
  //      image_input.value = ""
  //   var image_input = document.getElementById("image3")
  //      image_input.value = ""
  //   var image_input = document.getElementById("message")
  //      image_input.value = ""
  // // e.preventDefault();

  $("#loading-bar-spinner").hide();
  location.reload(true);
});


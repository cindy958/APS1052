pragma solidity ^0.5.0;


contract Adoption {
uint public constant PET_COUNT = 16;
address public owner;


// Adopting a Pet Events

 event PetshopDonation(address indexed donor, uint amount);
 event PetLiked(uint petId, address likedBy);
 event PetDonation(uint petId, address donor, uint amount);
 event PetBuy(uint petId, address buyer, uint amount);
 event PetshopRated(address ratedBy, uint stars, uint newAverage);            
 event PetVaccination(uint petId, string vaccineName, uint date, string vetName); 
  

struct Pet {
    uint id;
    uint likes;
    uint donation;
    bool isSold; 
}

struct Vaccination {
    string vaccineName;
    uint date; 
    string vetName;
}

mapping(uint => Pet) public pets;

// DONATION to PETSHOP
mapping(address => bool) public hasDonatedToPetshop;
uint public totalDonatedToPetshop;
uint public totalDonors;


// LIKE (VOTING) 
   
mapping(address => mapping(uint => bool)) public hasLiked; 


   
// RATING (1-5 STAR) 
    
mapping(address => bool) public hasRatedPetshop;
uint public petshopRatingSum;
uint public petshopRatingCount;

// BUY
mapping(uint => address) public buyers;
uint public totalBuy;
mapping(address => bool) public hasBuy;
uint public uniqueCustomers;
   
// VACCINATION 
    
mapping(uint => Vaccination[]) public vaccinationRecords;

  

constructor() 
    public {
    owner = msg.sender;
}


//  FEATURE 1: DONATION to PETSHOP
function donate() 
    public 
    payable {
    require(msg.value > 0, "Invalid number");
    
    if (!hasDonatedToPetshop[msg.sender]) {
        hasDonatedToPetshop[msg.sender] = true;
        totalDonors += 1;
    }

    totalDonatedToPetshop += msg.value;

    emit PetshopDonation(msg.sender, msg.value);
}

function getTotalDonation()
    public
    view
    returns (uint)
{
    return totalDonatedToPetshop;
}

function getTotalDonors()
    public
    view
    returns (uint)
{
    return totalDonors;
}

//  FEATURE 2: LIKE (VOTING - Each user can ONLY like each pet once)

function likePet(uint petId) 
    public 
{
    require(petId < PET_COUNT, "Invalid pet ID");
    require(!pets[petId].isSold, "Pet sold");
    require(!hasLiked[msg.sender][petId], "Already liked");

    hasLiked[msg.sender][petId] = true;
    pets[petId].likes += 1;

    emit PetLiked(petId, msg.sender);
}


function MostLikedPet() 
    public 
    view 
    returns (uint MostLikedPetId, uint likes) 
{
    uint maxLikes = 0;
    uint bestPetId = 0;

    for (uint i = 0; i < PET_COUNT; i++) {
        if (pets[i].likes > maxLikes) {
            maxLikes = pets[i].likes;
            bestPetId = i;
        }
    }

    return (bestPetId, maxLikes);
}

// FEATURE 3 — DONATE TO PET (Preset options + Custom)

uint public constant DONATE_10 = 0.01 ether;
uint public constant DONATE_20 = 0.02 ether;
uint public constant DONATE_30 = 0.03 ether;

function donateToPetPreset(uint petId, uint option) 
   public 
   payable 
{
    require(petId < PET_COUNT, "Invalid pet ID");
    require(!pets[petId].isSold, "Pet sold");
    
    
    if (option == 10) {
        require(msg.value == DONATE_10, "Must send 0.01 ETH");
    } else if (option == 20) {
        require(msg.value == DONATE_20, "Must send 0.02 ETH");
    } else if (option == 30) {
        require(msg.value == DONATE_30, "Must send 0.03 ETH");
    } else {
        revert("Option must be 10 / 20 / 30");
    }

    pets[petId].donation += msg.value;
    emit PetDonation(petId, msg.sender, msg.value);
}

function donateCustom(uint petId)
    public 
    payable 
{
    require(petId < PET_COUNT, "Invalid pet ID");
    require(!pets[petId].isSold, "Pet sold");
    require(msg.value > 0, "Invalid Donation");
    
    pets[petId].donation += msg.value;
    emit PetDonation(petId, msg.sender, msg.value);
}


// FEATURE 4 — BUY A PET (More expensive, cannot buy if already adopted )

uint public constant BUY_PRICE = 0.3 ether;

function buyPet(uint petId)
    public 
    payable 
{
    require(petId < PET_COUNT, "Invalid pet ID");
    require(!pets[petId].isSold, "Not available");
    require(msg.value == BUY_PRICE, "Wrong price");

    pets[petId].isSold = true;
    buyers[petId] = msg.sender;  

    totalBuy++;
    if (!hasBuy[msg.sender]) {
        hasBuy[msg.sender] = true;
        uniqueCustomers++;
    }

    emit PetBuy(petId, msg.sender, msg.value); 
}


// FEATURE 5 — RATED PETSHOP 1–5 STAR (Each user can only rate once)

function ratePetshop(uint stars) 
    public {
    require(stars >= 1 && stars <= 5, "Stars must be between 1 and 5");
    require(!hasRatedPetshop[msg.sender], "You already rated the petshop");

    hasRatedPetshop[msg.sender] = true;
    petshopRatingSum += stars;
    petshopRatingCount += 1;

    uint avgRating = (petshopRatingSum) / petshopRatingCount;
    emit PetshopRated(msg.sender, stars, avgRating);
}



// FEATURE 6 — VACCINATION RECORDS

function addVaccination (uint petId, string memory vaccineName, string memory vetName, uint date) 
    public 
{
    require(petId < PET_COUNT, "Invalid pet ID");
    require(!pets[petId].isSold, "Pet sold");
    require(msg.sender == owner, "Not authorized, only owner can add records");
    vaccinationRecords[petId].push(Vaccination(vaccineName, date, vetName));
    emit PetVaccination(petId, vaccineName, date, vetName); 
}

function getVaccination(uint petId, uint index) 
    public 
    view 
    returns (string memory vaccineName,  uint date, string memory vetName) 
{
    
    require(petId < PET_COUNT, "Invalid pet ID");
    require(index < vaccinationRecords[petId].length, "Invalid index");

    Vaccination memory v = vaccinationRecords[petId][index];
    return (v.vaccineName, v.date, v.vetName);
}

}


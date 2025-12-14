pragma solidity ^0.5.0;

contract Adoption {

    // =====================
    // ===== Feature: Adopt =====
    // =====================
    address[16] public adopters;

    function adopt(uint petId) public returns (uint) {
        require(petId <= 15, "Invalid petId");
        adopters[petId] = msg.sender;
        return petId;
    }

    function getAdopters() public view returns (address[16] memory) {
        return adopters;
    }

    // ======================================
    // ===== Feature 2: Pet Like ===
    // ======================================
    struct Pet {
        uint likes;
        uint priceWei;
        bool sold;
        address buyer;
    }

    Pet[16] public pets;

    // Like: prevent repeat likes
    mapping(uint => mapping(address => bool)) public hasLiked;
    event PetLiked(uint indexed petId, address indexed liker, uint newLikes);

    function likePet(uint petId) public returns (uint) {
        require(petId <= 15, "Invalid petId");
        require(!hasLiked[petId][msg.sender], "You already liked this pet");

        hasLiked[petId][msg.sender] = true;
        pets[petId].likes += 1;

        emit PetLiked(petId, msg.sender, pets[petId].likes);
        return pets[petId].likes;
    }

    function getLikes(uint petId) public view returns (uint) {
        require(petId <= 15, "Invalid petId");
        return pets[petId].likes;
    }

    function MostLikedPet() public view returns (uint mostLikedId, uint maxLikes) {
        uint bestId = 0;
        uint bestLikes = pets[0].likes;

        for (uint i = 1; i < 16; i++) {
            if (pets[i].likes > bestLikes) {
                bestLikes = pets[i].likes;
                bestId = i;
            }
        }
        return (bestId, bestLikes);
    }

    // ============================
    // ===== Feature 4: Buy a Pet =====
    // ============================
    uint public totalPurchases;
    uint public uniqueCustomers;
    mapping(address => bool) public hasPurchased;

    event PetBuy(uint indexed petId, address indexed buyer, uint priceWei);

    constructor() public {
        for (uint i = 0; i < 16; i++) {
            pets[i].priceWei = 0.01 ether;
            pets[i].sold = false;
            pets[i].buyer = address(0);
            pets[i].likes = 0;
        }
    }

    function buyPet(uint petId) public payable returns (uint) {
        require(petId <= 15, "Invalid petId");
        require(adopters[petId] == address(0), "Pet already adopted");
        require(!pets[petId].sold, "Pet already sold");
        require(msg.value == pets[petId].priceWei, "Incorrect price sent");

        pets[petId].sold = true;
        pets[petId].buyer = msg.sender;

        totalPurchases += 1;
        if (!hasPurchased[msg.sender]) {
            hasPurchased[msg.sender] = true;
            uniqueCustomers += 1;
        }

        emit PetBuy(petId, msg.sender, msg.value);
        return petId;
    }

    function getPrice(uint petId) public view returns (uint) {
        require(petId <= 15, "Invalid petId");
        return pets[petId].priceWei;
    }

    function isSold(uint petId) public view returns (bool) {
        require(petId <= 15, "Invalid petId");
        return pets[petId].sold;
    }

    function getBuyer(uint petId) public view returns (address) {
        require(petId <= 15, "Invalid petId");
        return pets[petId].buyer;
    }

    function getTotalPurchases() public view returns (uint) {
        return totalPurchases;
    }

    function getUniqueCustomers() public view returns (uint) {
        return uniqueCustomers;
    }

    // ==========================================
    // ===== Feature 5: Petshop Rating System =====
    // ==========================================

    mapping(address => bool) public hasRated;

    uint public totalRatingValue;

    uint public ratingCount;

    event PetshopRated(address indexed rater, uint8 stars, uint newAverageX100);

    function ratePetshop(uint8 stars) public {
        require(stars >= 1 && stars <= 5, "Rating must be 1-5");
        require(!hasRated[msg.sender], "You already rated");

        hasRated[msg.sender] = true;

        totalRatingValue += stars;
        ratingCount += 1;

        emit PetshopRated(msg.sender, stars, getAverageRatingX100());
    }

    function getAverageRatingX100() public view returns (uint) {
        if (ratingCount == 0) {
            return 0;
        }
        return (totalRatingValue * 100) / ratingCount;
    }

    function getRatingCount() public view returns (uint) {
        return ratingCount;
    }
}

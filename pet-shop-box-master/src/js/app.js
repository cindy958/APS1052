App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (var i = 0; i < data.length; i++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);

        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);
        petTemplate.find('.btn-like').attr('data-id', data[i].id);
        petTemplate.find('.pet-likes').text('0');

        petTemplate.find('.btn-buy').attr('data-id', data[i].id);

        petTemplate.find('.pet-status').text('Available')
          .removeClass().addClass('pet-status label label-success');

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  connectWallet: async function() {
    if (!window.ethereum) {
      alert('MetaMask is not available in this browser.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      var btn = document.getElementById('connectButton');
      if (btn && accounts && accounts[0]) {
        btn.textContent = 'Connected: ' + accounts[0].slice(0, 6) + '...' + accounts[0].slice(-4);
      }

      App.refreshRatingUI();
      App.markLikes();
      App.markAdopted();
      App.markSold();
    } catch (error) {
      console.error('Error requesting accounts:', error);
    }
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      App.contracts.Adoption = TruffleContract(data);
      App.contracts.Adoption.setProvider(App.web3Provider);

      App.refreshRatingUI();
      App.markAdopted();
      App.markLikes();
      App.markSold();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('click', '.btn-like', App.handleLike);
    $(document).on('click', '.btn-buy', App.handleBuy);

    // ===== ADDED: Rating button =====
    $(document).on('click', '#rateButton', App.handleRatePetshop);
    // ===============================

    $(document).on('click', '#connectButton', App.connectWallet);
  },

  // ---------- Adopt UI ----------
  markAdopted: function() {
    App.contracts.Adoption.deployed()
      .then(function(instance) {
        return instance.getAdopters.call();
      })
      .then(function(adopters) {
        for (var i = 0; i < adopters.length; i++) {
          if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
            var card = $('.panel-pet').eq(i);

            card.find('.btn-adopt').text('Adopted').attr('disabled', true);

            card.find('.btn-buy').text('Buy').attr('disabled', true);

            card.find('.pet-status').text('Adopted')
              .removeClass().addClass('pet-status label label-primary');
          }
        }
      })
      .catch(function(err) {
        console.log(err.message);
      });
  },

  // ---------- Like UI ----------
  markLikes: async function() {
    try {
      const instance = await App.contracts.Adoption.deployed();
      for (let i = 0; i < 16; i++) {
        const likes = await instance.getLikes.call(i);
        $('.panel-pet').eq(i).find('.pet-likes').text(likes.toString());
      }
    } catch (err) {
      console.log('markLikes error:', err.message);
    }
  },

  // ---------- Sold UI ----------
  markSold: async function() {
    try {
      const instance = await App.contracts.Adoption.deployed();

      for (let i = 0; i < 16; i++) {
        const sold = await instance.isSold.call(i);

        if (sold) {
          var card = $('.panel-pet').eq(i);

          card.find('.btn-buy').text('Sold').attr('disabled', true);

          card.find('.btn-adopt').text('Adopt').attr('disabled', true);

          card.find('.pet-status').text('Sold')
            .removeClass().addClass('pet-status label label-danger');
        }
      }
    } catch (err) {
      console.log('markSold error:', err.message);
    }
  },

  // ==================================
  // ===== Feature 5: Rating UI ========
  // ==================================

  refreshRatingUI: async function() {
    try {
      const instance = await App.contracts.Adoption.deployed();
      const avgX100 = await instance.getAverageRatingX100.call();
      const count = await instance.getRatingCount.call();

      const avg = (parseInt(avgX100.toString(), 10) / 100).toFixed(2);

      $('#avgRatingText').text(avg);
      $('#ratingCountText').text(count.toString());
    } catch (err) {
      console.log('refreshRatingUI error:', err.message);
    }
  },

  handleRatePetshop: function(event) {
    event.preventDefault();

    var stars = parseInt($('#ratingSelect').val()); // 1~5

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.ratePetshop(stars, { from: accounts[0] });
        })
        .then(function() {
          return App.refreshRatingUI();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  // ---------- Handlers ----------
  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.adopt(petId, { from: accounts[0] });
        })
        .then(function() {
          App.markAdopted();
          App.markSold();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  handleLike: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.likePet(petId, { from: accounts[0] });
        })
        .then(function() {
          return App.markLikes();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  handleBuy: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(async function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      try {
        const instance = await App.contracts.Adoption.deployed();

        const priceWei = await instance.getPrice.call(petId);

        await instance.buyPet(petId, { from: accounts[0], value: priceWei.toString() });

        await App.markSold();
        await App.markAdopted();
        alert('Purchase successful!');
      } catch (err) {
        console.log(err.message);
        alert(err.message);
      }
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

App = {
  web3Provider: null,
  contracts: {},

  // ----- helpers (support web3 0.x and 1.x) -----
  toWei: function(ethStr) {
    try {
      if (web3 && web3.utils && web3.utils.toWei) return web3.utils.toWei(String(ethStr), 'ether');
      if (web3 && typeof web3.toWei === 'function') return web3.toWei(String(ethStr), 'ether');
    } catch (e) {}
    return ethStr;
  },

  fromWei: function(weiVal) {
    try {
      if (web3 && web3.utils && web3.utils.fromWei) return web3.utils.fromWei(String(weiVal), 'ether');
      if (web3 && typeof web3.fromWei === 'function') return web3.fromWei(weiVal, 'ether').toString();
    } catch (e) {}
    return String(weiVal);
  },

  parseDateToUnixSeconds: function(dateStr) {
    if (!dateStr) return 0;
    // Accept YYYY-MM-DD or numeric seconds
    if (/^\d+$/.test(String(dateStr))) {
      return parseInt(dateStr, 10);
    }
    var ms = Date.parse(dateStr);
    if (isNaN(ms)) return 0;
    return Math.floor(ms / 1000);
  },

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

        // Feature 3: Donate to Pet
        petTemplate.find('.btn-donate-preset').attr('data-id', data[i].id);
        petTemplate.find('.btn-donate-custom').attr('data-id', data[i].id);
        petTemplate.find('.pet-donation').text('0');

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
      App.refreshPetshopDonationUI();
      App.markLikes();
      App.markAdopted();
      App.markSold();
      App.markPetDonations();
    } catch (error) {
      console.error('Error requesting accounts:', error);
    }
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      App.contracts.Adoption = TruffleContract(data);
      App.contracts.Adoption.setProvider(App.web3Provider);

      App.refreshRatingUI();
      App.refreshPetshopDonationUI();
      App.markAdopted();
      App.markLikes();
      App.markSold();
      App.markPetDonations();
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

    // ===== Feature 1: Petshop donate =====
    $(document).on('click', '#petshopDonateButton', App.handleDonatePetshop);

    // ===== Feature 3: Donate to Pet =====
    $(document).on('click', '.btn-donate-preset', App.handleDonateToPetPreset);
    $(document).on('click', '.btn-donate-custom', App.handleDonateToPetCustom);

    // ===== Feature 6: Vaccination =====
    $(document).on('click', '#addVaccinationButton', App.handleAddVaccination);
    $(document).on('click', '#loadVaccinationsButton', App.handleLoadVaccinations);

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

  // ============================================
  // ===== Feature 1: Petshop Donation UI ========
  // ============================================

  refreshPetshopDonationUI: async function() {
    try {
      const instance = await App.contracts.Adoption.deployed();
      const totalWei = await instance.getTotalDonation.call();
      const donors = await instance.getTotalDonors.call();

      $('#petshopTotalDonationText').text(App.fromWei(totalWei));
      $('#petshopTotalDonorsText').text(donors.toString());
    } catch (err) {
      console.log('refreshPetshopDonationUI error:', err.message);
    }
  },

  handleDonatePetshop: function(event) {
    event.preventDefault();

    var amountEth = ($('#petshopDonateAmountEth').val() || '').trim();
    if (!amountEth) return alert('Please enter an ETH amount.');

    var valueWei = App.toWei(amountEth);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.donate({ from: accounts[0], value: valueWei });
        })
        .then(function() {
          $('#petshopDonateAmountEth').val('');
          return App.refreshPetshopDonationUI();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  // =============================================
  // ===== Feature 3: Donate to specific Pet UI ===
  // =============================================

  markPetDonations: async function() {
    try {
      const instance = await App.contracts.Adoption.deployed();
      for (let i = 0; i < 16; i++) {
        const donationWei = await instance.getPetDonation.call(i);
        $('.panel-pet').eq(i).find('.pet-donation').text(App.fromWei(donationWei));
      }
    } catch (err) {
      console.log('markPetDonations error:', err.message);
    }
  },

  handleDonateToPetPreset: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var card = $(event.target).closest('.panel-pet');
    var optionVal = parseInt(card.find('.donate-option').val());

    // option 10/20/30 maps to 0.01/0.02/0.03 ETH
    var ethAmount = optionVal === 10 ? '0.01' : optionVal === 20 ? '0.02' : '0.03';
    var valueWei = App.toWei(ethAmount);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.donateToPetPreset(petId, optionVal, { from: accounts[0], value: valueWei });
        })
        .then(function() {
          return App.markPetDonations();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  handleDonateToPetCustom: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var card = $(event.target).closest('.panel-pet');
    var amountEth = (card.find('.donate-custom-amount').val() || '').trim();
    if (!amountEth) return alert('Please enter a custom ETH amount.');

    var valueWei = App.toWei(amountEth);

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.donateCustom(petId, { from: accounts[0], value: valueWei });
        })
        .then(function() {
          card.find('.donate-custom-amount').val('');
          return App.markPetDonations();
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
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
  ,
  // =====================================
  // ===== Feature 6: Vaccination UI ======
  // =====================================

  handleAddVaccination: function(event) {
    event.preventDefault();

    var petId = parseInt($('#vaccPetId').val());
    var vaccineName = ($('#vaccName').val() || '').trim();
    var vetName = ($('#vaccVet').val() || '').trim();
    var dateStr = ($('#vaccDate').val() || '').trim();
    var dateUnix = App.parseDateToUnixSeconds(dateStr);

    if (!vaccineName) return alert('Please enter vaccine name.');
    if (!vetName) return alert('Please enter vet name.');
    if (!dateUnix) return alert('Please choose a date.');

    web3.eth.getAccounts(function(error, accounts) {
      if (error) return console.log(error);
      if (!accounts || accounts.length === 0) return alert('Please connect MetaMask first.');

      App.contracts.Adoption.deployed()
        .then(function(instance) {
          return instance.addVaccination(petId, vaccineName, vetName, dateUnix, { from: accounts[0] });
        })
        .then(function() {
          alert('Vaccination record added.');
          $('#vaccName').val('');
          $('#vaccVet').val('');
          $('#vaccDate').val('');
        })
        .catch(function(err) {
          console.log(err.message);
          alert(err.message);
        });
    });
  },

  handleLoadVaccinations: async function(event) {
    event.preventDefault();

    try {
      const petId = parseInt($('#vaccViewPetId').val());
      const instance = await App.contracts.Adoption.deployed();
      const count = await instance.getVaccinationCount.call(petId);

      const list = $('#vaccinationList');
      list.empty();

      const n = parseInt(count.toString(), 10);
      if (!n) {
        list.append('<li>No records.</li>');
        return;
      }

      for (let i = 0; i < n; i++) {
        const rec = await instance.getVaccination.call(petId, i);
        const vaccineName = rec[0];
        const vetName = rec[1];
        const dateUnix = rec[2].toString();
        list.append('<li><strong>' + vaccineName + '</strong> — ' + vetName + ' — ' + dateUnix + '</li>');
      }
    } catch (err) {
      console.log('handleLoadVaccinations error:', err.message);
      alert(err.message);
    }
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});



var debtCalc = require('../frontend/dev/js/debt-calculator.js');
var assert = require("chai").assert;

// helper function to compare arrays of objects with 'amount'
function checkIfAmountsAreEqual(first, second) {
  assert.equal(first.length, second.length, "Arrays have equal length");
  for (var i = 0; i < second.length; i++) {
    assert.equal(first[i].amount, second[i].amount,
      "Amounts at [" + i + "] are the same");
  }
}

describe('Test getDebtlist()', function() {
  it('should warn if unable to equalize givers and receivers', function() {
    // test data
    var givers = [
      {user: "A", amount: 12},
      {user: "B", amount: 7.20}
    ];
    var receivers = [
      {user: "C", amount: 12},
      {user: "D", amount: 7.20},
      {user: "E", amount: 7}
    ];
    var expectedLeftover = {user: "E", amount: 7, type: "receiver"};

    var result = debtCalc.getDebtlist(givers, receivers, []);
    assert.isFalse(result.even, "Detected that amount is not evenly divisible");
    assert.equal(result.leftover.user, expectedLeftover.user, "Leftover user is as expected");
    assert.equal(result.leftover.type, expectedLeftover.type, "Leftover type is as expected");
    assert.equal(result.leftover.amount, expectedLeftover.amount, "Leftover amount is as expected");
  });

  it('should work on legit givers/receivers', function() {
    // test data
    var givers = [
      {user: "A", amount: 12},
      {user: "B", amount: 7.20},
      {user: "C", amount: 6.00},
      {user: "D", amount: 5.70},
      {user: "E", amount: 3.30},
      {user: "F", amount: 1}
    ];
    var receivers = [
      {user: "G", amount: 15},
      {user: "H", amount: 8.50},
      {user: "I", amount: 6.50},
      {user: "J", amount: 5.2}
    ];
    var correctDebtlist = [
      {giver: 'A', receiver: 'G', amount: 12},
      {giver: 'B', receiver: 'H', amount: 7.2},
      {giver: 'C', receiver: 'I', amount: 6},
      {giver: 'D', receiver: 'J', amount: 5.2},
      {giver: 'E', receiver: 'G', amount: 3},
      {giver: 'F', receiver: 'H', amount: 1},
      {giver: 'D', receiver: 'I', amount: 0.5},
      {giver: 'E', receiver: 'H', amount: 0.3}
    ];

    var result = debtCalc.getDebtlist(givers, receivers, []);
    assert.isTrue(result.even, "Total amount was evenly divisible");
    checkIfAmountsAreEqual(result.debtlist, correctDebtlist, "Result appears to be equal to correctDebtlist");
  });
});

describe('Test splitIntoGiversAndReceivers()', function() {
  it('should transform correctly', function() {
    // test data
    var totalSum = 40.8;
    var payersById = {
      a: {user: "A", expense: 23},
      b: {user: "B", expense: 12.50},
      c: {user: "C", expense: 5.30},
      d: {user: "D", expense: 0}
    };
    var correctGivers = [
      {user: "D", amount: 10.20},
      {user: "C", amount: 4.90}
    ];
    var correctReceivers = [
      {user: "A", amount: 12.8},
      {user: "B", amount: 2.3}
    ];

    var result = debtCalc.splitIntoGiversAndReceivers(payersById, totalSum);
    checkIfAmountsAreEqual(result.givers, correctGivers, "Result appears to be equal to correctDebtlist");
    checkIfAmountsAreEqual(result.receivers, correctReceivers, "Result appears to be equal to correctDebtlist");
  });
});

describe('Test whole transformIntoDebtlist()', function() {
  // test data for all tests
  var users = [
    {_id: "a", name: "A"},
    {_id: "b", name: "B"},
    {_id: "c", name: "C"},
    {_id: "d", name: "D"}
  ];
  // only for first two tests
  var correctDebtlist = [
    {giver: users[3], receiver: users[0], amount: 10.2},
    {giver: users[2], receiver: users[0], amount: 2.6},
    {giver: users[2], receiver: users[1], amount: 2.3}
  ];

  it('should work without extra list of participants', function() {
    // test data
    var items = [
      {assigned_to: users[0], cost: 10},
      {assigned_to: users[1], cost: 12},
      {assigned_to: users[1], cost: 0.5},
      {assigned_to: users[2], cost: 5.30},
      {assigned_to: users[0], cost: 13},
      {assigned_to: users[3], cost: 0}
    ];

    var result = debtCalc.transformIntoDebtlist(items);
    var debtlist = result.debtlist;
    assert.isTrue(result.even, "Result is even");
    checkIfAmountsAreEqual(debtlist, correctDebtlist);
    // Stichproben
    assert.equal(debtlist[0].giver.name, correctDebtlist[0].giver.name, "Result appears to be equal to correctDebtlist");
    assert.equal(debtlist[1].receiver.name, correctDebtlist[1].receiver.name, "Result appears to be equal to correctDebtlist");
  });

  it('should work with extra list of participants without any items', function() {
    // test data
    var items = [
      {assigned_to: users[0], cost: 10},
      {assigned_to: users[1], cost: 12},
      {assigned_to: users[1], cost: 0.5},
      {assigned_to: users[2], cost: 5.30},
      {assigned_to: users[0], cost: 13}
    ];

    var result = debtCalc.transformIntoDebtlist(items, users);
    var debtlist = result.debtlist;
    assert.isTrue(result.even, "Result is even");
    checkIfAmountsAreEqual(debtlist, correctDebtlist);
    // Stichproben
    assert.equal(debtlist[0].giver.name, correctDebtlist[0].giver.name, "Result appears to be equal to correctDebtlist");
    assert.equal(debtlist[1].receiver.name, correctDebtlist[1].receiver.name, "Result appears to be equal to correctDebtlist");
  });

  it('should warn if amount is not evenly divisible', function() {
    var items = [
      {assigned_to: users[0], cost: 1},
      {assigned_to: users[0], cost: 1.31}, // total amount is 2.31, divided by 2 = 1.15, leftover: 0.01
    ]
    var participants = [
      users[0],
      users[1]
    ]
    var expectedLeftover = {
      user: "doesn't matter",
      type: "doesn't matter", // either user, either as "paying too much" or "too little"
      amount: 0.01
    }

    var result = debtCalc.transformIntoDebtlist(items, participants);
    assert.isFalse(result.even, "Result is not even");
    assert.isDefined(result.debtlist, "Result has a debtlist");
    assert.isDefined(result.leftover, "Result has a leftover");

    assert.equal(result.leftover.amount, expectedLeftover.amount, "Leftover amount is as expected");
  });
});
